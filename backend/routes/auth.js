// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Read the JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware: authenticateToken
 * Reusable for bookings, availability, etc.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    // userPayload: { userId, isAdmin, iat, exp }
    req.user = userPayload;
    next();
  });
}

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, password, referredByCode } = req.body;
  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: 'Either email or phone number is required',
      });
    }

    // Check if user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      const conflictFields = [];
      if (userExists.email === email) conflictFields.push('email');
      if (userExists.phoneNumber === phoneNumber) conflictFields.push('phone number');
      return res.status(409).json({
        message: `The following already exist: ${conflictFields.join(', ')}`,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
    });
    await newUser.save();

    // Generate a referral code
    const referralCode = `SHELBY-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
    newUser.referralCode = referralCode;

    // If user was referred by someone
    if (referredByCode) {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
        // Optionally give referrer some credit
        referrer.referralCredits = (referrer.referralCredits || 0) + 10;
        await referrer.save();
      }
    }

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Check email uniqueness
router.post('/check-uniqueness', async (req, res) => {
  const { email } = req.body;
  try {
    // If user is phone-only (email === null), skip
    if (email === null) {
      return res.status(200).json({ isUnique: true });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: 'Email is already in use',
      });
    }
    return res.status(200).json({ isUnique: true });
  } catch (err) {
    console.error('Uniqueness Check Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // "identifier" can be email or phone
  try {
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier and password are required' });
    }

    // Find user by email OR phoneNumber
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET USER PROFILE
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE USER PROFILE
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, carInfo, homeAddress } = req.body;
    const updatedData = { name, email, phoneNumber, carInfo, homeAddress };

    // Remove undefined fields
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    const user = await User.findByIdAndUpdate(req.user.userId, updatedData, {
      new: true,
    }).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADMIN-ONLY: Get all users
router.get('/allUsers', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin only' });
    }
    const users = await User.find({});
    res.json(users);
  } catch (err) {
    console.error('allUsers Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /user/pushtoken
 * Store the Expo push token for the current logged-in user
 */
router.post('/pushtoken', authenticateToken, async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) {
    return res.status(400).json({ message: 'Expo push token is required.' });
  }

  try {
    const userDoc = await User.findById(req.user.userId);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found.' });
    }

    userDoc.expoPushToken = expoPushToken;
    await userDoc.save();

    return res.json({ message: 'Expo push token saved successfully.' });
  } catch (error) {
    console.error('Error saving push token:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = {
  router,
  authenticateToken,
};
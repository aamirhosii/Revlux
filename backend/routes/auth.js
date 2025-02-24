// routes/auth.js
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
    // userPayload contains: { userId, isAdmin, iat, exp }
    req.user = userPayload;
    next();
  });
}

// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;
  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: 'Either email or phone number is required',
      });
    }

    // Check if user already exists by email or phoneNumber
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
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/check-uniqueness', async (req, res) => {
  const { email, phoneNumber } = req.body;

  try {
    // If the user is using phoneNumber (so email === null), SKIP the check
    if (email === null) {
      // That means we do NOT enforce phone uniqueness
      return res.status(200).json({ isUnique: true });
    }

    // Otherwise, check if that email is used
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: 'Email is already in use', // or your preferred wording
      });
    }

    // If no user has that email, we're good
    return res.status(200).json({ isUnique: true });
  } catch (err) {
    console.error('Uniqueness Check Error:', err);
    return res
      .status(500)
      .json({ message: 'Server error', error: err.message });
  }
});

// LOGIN
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // "identifier" = email or phone
  try {
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier and password are required' });
    }

    // Find user
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

module.exports = {
  router,
  authenticateToken,
};
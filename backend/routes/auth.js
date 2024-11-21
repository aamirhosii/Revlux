// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract token

  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    req.user = userPayload;
    next();
  });
}

router.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;

  try {
    // Ensure at least one identifier is provided
    if (!email && !phoneNumber) {
      return res.status(400).json({ message: 'Either email or phone number is required' });
    }

    // Check if the user already exists by email or phone number
    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      const conflictFields = [];
      if (userExists.email === email) conflictFields.push('email');
      if (userExists.phoneNumber === phoneNumber) conflictFields.push('phone number');
      return res.status(409).json({
        message: `The following already exist: ${conflictFields.join(', ')}`,
      });
    }

    // Hash password
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
  const { name, email, phoneNumber } = req.body;

  try {
    const userExists = await User.findOne({
      $or: [{ name }, { email }, { phoneNumber }],
    });

    if (userExists) {
      return res.status(409).json({
        message: 'Username, email, or phone number already in use',
      });
    }

    res.status(200).json({ isUnique: true });
  } catch (err) {
    console.error('Uniqueness Check Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // `identifier` can be either email or phoneNumber

  try {
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }

    // Find user by email or phone number
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Compare passwords
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create and assign a token
    const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      token,
      user: { name: user.name, email: user.email, phoneNumber: user.phoneNumber },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Get User Profile
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password'); // Exclude password
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update User Profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, carInfo, homeAddress } = req.body;

    const updatedData = { name, email, phoneNumber, carInfo, homeAddress };

    // Remove undefined fields
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    // Update the user
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      updatedData,
      { new: true }
    ).select('-password');

    res.json(user);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;

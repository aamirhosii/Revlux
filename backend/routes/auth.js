// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'your_jwt_secret_key';

router.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, password } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({
      $or: [{ email }, { phoneNumber }],
    });

    if (userExists) {
      return res.status(409).json({ message: 'User already exists' });
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

// Login Route
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // identifier can be email or phone number

  try {
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
    console.error(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;

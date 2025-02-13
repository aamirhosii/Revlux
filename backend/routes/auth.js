// routes/auth.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your_jwt_secret_key';

// Middleware to authenticate JWT token
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
    req.user = userPayload; // userPayload now contains userId and isAdmin
    next();
  });
}

// -- SIGNUP ROUTE (unchanged) --
router.post('/signup', async (req, res) => {
  // your existing signup code
});

// -- CHECK-UNIQUENESS ROUTE (unchanged) --
router.post('/check-uniqueness', async (req, res) => {
  // your existing code
});

// -- LOGIN ROUTE --
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body;
  try {
    // 1. Validate fields, find user
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Identifier and password are required' });
    }
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 2. Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // 3. Create and assign a token
    //    Now we include isAdmin in the token payload
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 4. Send response
    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin, // also let the frontend know if they're admin
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// -- GET PROFILE ROUTE (unchanged) --
router.get('/profile', authenticateToken, async (req, res) => {
  // existing code
});

// -- UPDATE PROFILE ROUTE (unchanged) --
router.put('/profile', authenticateToken, async (req, res) => {
  // existing code
});

module.exports = {
  router,
  authenticateToken,
};
// routes/giftCards.js
const express = require('express');
const router = express.Router();
const GiftCard = require('../models/GiftCard');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

// Example: to restrict certain routes to admin only
function requireAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: 'Admin only' });
  }
  next();
}

/**
 * POST /giftcards/create
 * Admin can create a gift card for a specific user
 */
router.post('/create', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, amount } = req.body;
    if (!userId || !amount) {
      return res.status(400).json({ message: 'Missing userId or amount' });
    }

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Generate random code
    const randomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const code = `GIFT-${randomCode}`;

    const newGiftCard = new GiftCard({
      code,
      user: userId,
      amount,
    });
    await newGiftCard.save();

    return res.status(201).json({ message: 'Gift card created', giftCard: newGiftCard });
  } catch (error) {
    console.error('Gift card creation error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * POST /giftcards/redeem
 * User redeems a gift card by code
 */
router.post('/redeem', authenticateToken, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ message: 'Gift card code required' });
    }
    const giftCard = await GiftCard.findOne({ code });
    if (!giftCard) {
      return res.status(404).json({ message: 'Gift card not found' });
    }
    // Check ownership
    if (giftCard.user.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'This gift card does not belong to you' });
    }
    if (!giftCard.isActive) {
      return res.status(400).json({ message: 'Gift card already used or inactive' });
    }

    // Mark it used
    giftCard.isActive = false;
    giftCard.usedAt = new Date();
    await giftCard.save();

    return res.json({
      message: 'Gift card redeemed successfully',
      amount: giftCard.amount,
    });
  } catch (error) {
    console.error('Gift card redeem error:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

/**
 * GET /giftcards/my
 * Returns all gift cards belonging to current user
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const cards = await GiftCard.find({ user: req.user.userId });
    res.json(cards);
  } catch (error) {
    console.error('Gift card fetch error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;

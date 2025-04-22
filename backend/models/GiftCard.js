/ models/GiftCard.js
const mongoose = require('mongoose');

const GiftCardSchema = new mongoose.Schema({
  code: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true, default: 100 },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  usedAt: { type: Date },
});

module.exports = mongoose.model('GiftCard', GiftCardSchema);
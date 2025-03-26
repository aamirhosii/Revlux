// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, sparse: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  carInfo: { type: String },
  homeAddress: { type: String },

  // Referral System Fields
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCredits: { type: Number, default: 0 },

  // NEW: Expo push token field
  expoPushToken: { type: String, default: '' },
});

module.exports = mongoose.model('User', UserSchema);
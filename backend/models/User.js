// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },     // Make sure to have sparse index
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  carInfo: { type: String },
  homeAddress: { type: String },
  isAdmin: { type: Boolean, default: false },
});

module.exports = mongoose.model('User', UserSchema);
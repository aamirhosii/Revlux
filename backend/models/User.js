// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true }, // Optional
  phoneNumber: { type: String, unique: true, sparse: true }, // Optional
  password: { type: String, required: true },
  carInfo: { type: String },
  homeAddress: { type: String },
});

module.exports = mongoose.model('User', UserSchema);


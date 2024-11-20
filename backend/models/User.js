// models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  carInfo: { type: String }, // Add this line
  homeAddress: { type: String }, // And this line
});

module.exports = mongoose.model('User', UserSchema);

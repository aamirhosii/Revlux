// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true }, // "CORE", "PRO", "ULTRA", etc.
  appointmentDate: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  status: { type: String, default: 'pending' }, // We'll set to 'confirmed' right away
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
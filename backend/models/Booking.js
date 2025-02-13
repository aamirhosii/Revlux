// models/Booking.js
const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  service: { type: String, required: true }, // e.g. "detailing", "ceramic coating"
  appointmentDate: { type: Date, required: true },
  timeSlot: { type: String, required: true }, // e.g., "10:00 AM - 11:00 AM"
  status: { type: String, default: 'pending' }, // pending, confirmed, cancelled, etc.
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Booking', BookingSchema);
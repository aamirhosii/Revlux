// models/Availability.js
const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [
    {
      slot: { type: String, required: true }, // e.g., "10:00 AM - 11:00 AM"
      isAvailable: { type: Boolean, default: true },
    },
  ],
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
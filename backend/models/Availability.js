// models/Availability.js
const mongoose = require('mongoose');

const TimeSlotSchema = new mongoose.Schema({
  startTime: { type: String, required: true }, // e.g. "10:00"
  endTime: { type: String, required: true },   // e.g. "11:30"
  serviceType: { type: String, required: true }, // e.g. "CORE" or "SAPPHIRE"
  isAvailable: { type: Boolean, default: true },
});

const AvailabilitySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  timeSlots: [TimeSlotSchema],
});

module.exports = mongoose.model('Availability', AvailabilitySchema);
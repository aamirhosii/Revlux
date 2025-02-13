// routes/bookings.js
const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const { authenticateToken } = require('./auth'); // Reuse your JWT middleware

// POST /bookings – Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  const { service, appointmentDate, timeSlot } = req.body;
  if (!service || !appointmentDate || !timeSlot) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // Normalize the date (set hours to 0)
    let dateOnly = new Date(appointmentDate);
    dateOnly.setHours(0, 0, 0, 0);

    // Find availability for the selected date
    let availability = await Availability.findOne({ date: dateOnly });
    if (!availability) {
      return res.status(400).json({ message: 'No available slots on this date.' });
    }

    // Find the requested time slot
    const slot = availability.timeSlots.find((ts) => ts.slot === timeSlot);
    if (!slot || !slot.isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is not available.' });
    }

    // Mark the slot as no longer available
    slot.isAvailable = false;
    await availability.save();

    // Create the booking record
    const booking = new Booking({
      user: req.user.userId,
      service,
      appointmentDate: dateOnly,
      timeSlot,
    });
    await booking.save();

    res.status(201).json({ message: 'Booking created successfully', booking });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET /bookings – Get bookings for the current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
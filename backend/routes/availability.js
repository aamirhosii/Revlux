// routes/availability.js
const express = require('express');
const router = express.Router();
const Availability = require('../models/Availability');

// GET /availability – Get all availability entries
router.get('/', async (req, res) => {
  try {
    const availabilities = await Availability.find({});
    res.json(availabilities);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// POST /availability – (Admin) Create or update availability for a date
router.post('/', async (req, res) => {
  const { date, timeSlots } = req.body; 
  // timeSlots is an array of objects: 
  // e.g. [{ startTime, endTime, serviceType, isAvailable }, ...]

  if (!date || !timeSlots || !Array.isArray(timeSlots)) {
    return res.status(400).json({ message: 'Missing or invalid fields.' });
  }

  try {
    // Normalize the date
    let dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);

    // Find existing availability for this date
    let availability = await Availability.findOne({ date: dateOnly });

    if (!availability) {
      // Create a new doc
      availability = new Availability({
        date: dateOnly,
        timeSlots
      });
    } else {
      // Overwrite or merge the time slots
      // For simplicity, let's just REPLACE them:
      availability.timeSlots = timeSlots;
    }

    await availability.save();
    res.status(201).json({ message: 'Availability updated successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
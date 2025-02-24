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

// POST /availability – (Admin only) Create a new availability entry
// In a production app, add middleware to restrict this endpoint to admins.
router.post('/', async (req, res) => {
  const { date, timeSlots } = req.body;
  if (!date || !timeSlots) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }
  try {
    let dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const availability = new Availability({
      date: dateOnly,
      timeSlots,
    });
    await availability.save();
    res.status(201).json({ message: 'Availability created successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;



/*
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

// POST /availability – Create a new availability entry
// In production, restrict this route (e.g., with admin middleware)
router.post('/', async (req, res) => {
  const { date, timeSlots } = req.body;
  if (!date || !timeSlots) return res.status(400).json({ message: 'Missing required fields.' });
  try {
    let dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    const availability = new Availability({ date: dateOnly, timeSlots });
    await availability.save();
    res.status(201).json({ message: 'Availability created successfully', availability });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
*/
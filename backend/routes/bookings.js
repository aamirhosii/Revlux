// backend/routes/bookings.js

const express = require('express');
const router  = express.Router();
const fetch   = require('node-fetch');
const Booking     = require('../models/Booking');
const Availability= require('../models/Availability');
const User        = require('../models/User');
const { authenticateToken } = require('./auth');

router.post('/', authenticateToken, async (req, res) => {
  const { service, appointmentDate, startTime, endTime } = req.body;
  if (!service||!appointmentDate||!startTime||!endTime) {
    return res.status(400).json({ message:'Missing required fields.' });
  }

  try {
    const dateOnly = new Date(appointmentDate);
    dateOnly.setHours(0,0,0,0);

    const avail = await Availability.findOne({ date: dateOnly });
    if (!avail) return res.status(400).json({ message:'No availability found on this date.' });

    const slot = avail.timeSlots.find(ts =>
      ts.serviceType===service &&
      ts.startTime===startTime &&
      ts.endTime===endTime
    );
    if (!slot) return res.status(400).json({ message:'Slot not found.' });
    if (!slot.isAvailable) return res.status(400).json({ message:'Selected time slot is already booked.' });

    slot.isAvailable = false;
    await avail.save();

    const booking = new Booking({
      user: req.user.userId,
      service,
      appointmentDate: dateOnly,
      startTime,
      endTime,
    });
    await booking.save();

    res.status(201).json({ message:'Booking pending approval', booking });
  } catch(err) {
    console.error('Booking creation error:', err);
    res.status(500).json({ message:'Server error', error: err.message });
  }
});

router.get('/', authenticateToken, async (req, res) => {
  try {
    const filter = {};
    if (!req.user.isAdmin) filter.user = req.user.userId;

    const bookings = await Booking.find(filter)
      .populate('user','name email phoneNumber expoPushToken')
      .sort('-createdAt');

    res.json(bookings);
  } catch(err) {
    console.error('Get bookings error:', err);
    res.status(500).json({ message:'Server error', error: err.message });
  }
});

router.patch('/:id/status', authenticateToken, async (req, res) => {
  if (!req.user.isAdmin) return res.sendStatus(403);
  const { status, cancellationReason } = req.body;
  if (!['confirmed','rejected'].includes(status)) {
    return res.status(400).json({ message:'Invalid status.' });
  }

  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message:'Booking not found.' });

    if (status==='rejected') {
      booking.cancellationReason = cancellationReason;
      const dateOnly = new Date(booking.appointmentDate);
      dateOnly.setHours(0,0,0,0);
      const avail = await Availability.findOne({ date: dateOnly });
      if (avail) {
        const slot = avail.timeSlots.find(ts =>
          ts.serviceType===booking.service &&
          ts.startTime===booking.startTime &&
          ts.endTime===booking.endTime
        );
        if (slot) {
          slot.isAvailable = true;
          await avail.save();
        }
      }
    }

    booking.status = status;
    await booking.save();

    const userDoc = await User.findById(booking.user);
    const notifyText =
      status==='confirmed'
        ? `Your booking on ${booking.appointmentDate.toDateString()} at ${booking.startTime} is CONFIRMED.`
        : `Your booking on ${booking.appointmentDate.toDateString()} at ${booking.startTime} was REJECTED. Reason: ${cancellationReason}`;

    if (userDoc.email) {
      const transporter = require('nodemailer').createTransport({
        service:'gmail',
        auth:{ user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
      });
      transporter.sendMail({
        from: process.env.EMAIL_USER,
        to:   userDoc.email,
        subject:`Booking ${status.toUpperCase()}`,
        text:  notifyText
      });
    }

    if (userDoc.expoPushToken) {
      await fetch('https://exp.host/--/api/v2/push/send',{
        method:'POST',
        headers:{ 'Content-Type':'application/json' },
        body: JSON.stringify({
          to: userDoc.expoPushToken,
          sound:'default',
          title:`Booking ${status}`,
          body: notifyText,
        })
      });
    }

    res.json({ message:`Booking ${status}`, booking });
  } catch(err) {
    console.error('Update booking status error:', err);
    res.status(500).json({ message:'Server error', error: err.message });
  }
});

module.exports = router;
// backend/routes/bookings.js
const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const fetch = require('node-fetch'); // for Expo push
const Booking = require('../models/Booking');
const Availability = require('../models/Availability');
const User = require('../models/User');
const { authenticateToken } = require('./auth');

// Nodemailer transport (example: Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
});

// POST /bookings – Create a new booking
router.post('/', authenticateToken, async (req, res) => {
  const { service, appointmentDate, startTime, endTime } = req.body;
  if (!service || !appointmentDate || !startTime || !endTime) {
    return res.status(400).json({ message: 'Missing required fields.' });
  }

  try {
    // 1) Normalize the date (strip time)
    let dateOnly = new Date(appointmentDate);
    dateOnly.setHours(0, 0, 0, 0);

    // 2) Find availability for that date
    let availability = await Availability.findOne({ date: dateOnly });
    if (!availability) {
      return res.status(400).json({ message: 'No availability found on this date.' });
    }

    // 3) Find the requested slot
    let slot = availability.timeSlots.find(
      (ts) => 
        ts.serviceType === service &&
        ts.startTime === startTime &&
        ts.endTime === endTime
    );

    if (!slot) {
      return res
        .status(400)
        .json({ message: 'Slot not found for this service/date/time range.' });
    }
    if (!slot.isAvailable) {
      return res.status(400).json({ message: 'Selected time slot is already booked.' });
    }

    // 4) Mark the slot as booked
    slot.isAvailable = false;
    await availability.save();

    // 5) Create the booking with status=confirmed
    const booking = new Booking({
      user: req.user.userId,
      service,
      appointmentDate: dateOnly,
      startTime,
      endTime,
      status: 'confirmed',
    });
    await booking.save();

    // 6) Send an email confirmation (optional)
    const userDoc = await User.findById(req.user.userId);
    if (userDoc && userDoc.email) {
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: userDoc.email,
        subject: `Booking Confirmation - ${service}`,
        text:
          `Hi ${userDoc.name},\n\n` +
          `Your booking has been confirmed!\n\n` +
          `Service: ${service}\n` +
          `Date: ${dateOnly.toDateString()}\n` +
          `Time: ${startTime} - ${endTime}\n\n` +
          `Thank you for choosing Shelby Mobile Auto Detailing!`,
      };

      transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
          console.error('Error sending email:', err);
        } else {
          console.log('Email sent:', info.response);
        }
      });
    }

    // 7) Send push notification if user has expoPushToken
    if (userDoc && userDoc.expoPushToken) {
      try {
        const message = {
          to: userDoc.expoPushToken,
          sound: 'default',
          title: `Booking Confirmed - ${service}`,
          body: `Your booking on ${dateOnly.toDateString()} at ${startTime} is confirmed.`,
          data: {
            bookingId: booking._id,
            service,
            date: dateOnly.toISOString(),
            startTime,
            endTime,
          },
        };

        const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-Encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

        const result = await expoResponse.json();
        if (result?.data?.status === 'ok') {
          console.log('Push notification sent successfully');
        } else {
          console.error('Push notification error:', result);
        }
      } catch (pushErr) {
        console.error('Failed to send push notification:', pushErr);
      }
    }

    // 8) Return success
    return res.status(201).json({ message: 'Booking created successfully', booking });
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
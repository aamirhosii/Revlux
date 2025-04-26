// routes/bookings.js
const express = require('express')
const asyncHandler = require('express-async-handler')
const Booking = require('../models/Booking')
const { authenticateToken } = require('./auth')
const { sendNotification } = require('../utils/notifications')

const router = express.Router()

// Simple admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as admin')
  }
}

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking request
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes,
      services,
      addons,
      total,
    } = req.body

    // validation
    if (
      !customerName ||
      !email ||
      !phone ||
      !date ||
      !time ||
      !address ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      res.status(400)
      throw new Error('Please fill in all required fields')
    }

    const booking = new Booking({
      user: req.user.userId, // Note: using userId from JWT payload
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes: notes || '',
      services,
      addons: Array.isArray(addons) ? addons : [],
      total,
      status: 'pending',
    })

    const createdBooking = await booking.save()

    // Notify admin of new booking
    try {
      await sendNotification({
        title: "New Booking Request",
        body: `New booking from ${customerName} for ${date} at ${time}`,
        data: { bookingId: createdBooking._id.toString() }
      }, ['admin']) // Send to admin users
    } catch (error) {
      console.error("Failed to send notification:", error)
      // Continue even if notification fails
    }

    res.status(201).json(createdBooking)
  })
)

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the logged-in user
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.userId }).sort({ createdAt: -1 })
    res.json(bookings)
  })
)

/**
 * @route   GET /api/bookings/admin
 * @desc    Get *all* bookings (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    const allBookings = await Booking.find({}).sort({ createdAt: -1 })
    res.json(allBookings)
  })
)

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }
    
    // Users can only see their own bookings (admins can see all)
    if (booking.user.toString() !== req.user.userId.toString() && !req.user.isAdmin) {
      res.status(401)
      throw new Error('Not authorized')
    }
    
    res.json(booking)
  })
)

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (confirm / reject)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }

    const { status, rejectionReason } = req.body
    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      res.status(400)
      throw new Error('Invalid status')
    }

    booking.status = status
    if (status === 'rejected' && rejectionReason) {
      booking.rejectionReason = rejectionReason
    }

    const updatedBooking = await booking.save()
    
    // Send notification to user about status change
    try {
      let title, body;
      
      if (status === 'confirmed') {
        title = "Booking Confirmed!"
        body = `Your booking for ${booking.date} at ${booking.time} has been confirmed.`
      } else if (status === 'rejected') {
        title = "Booking Update"
        body = `Your booking has been declined. Reason: ${rejectionReason || 'No reason provided'}`
      }
      
      // Only send if we have a title (meaning status is confirmed or rejected)
      if (title) {
        await sendNotification({
          title,
          body,
          data: { bookingId: booking._id.toString() }
        }, [booking.user.toString()])
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      // Continue even if notification fails
    }
    
    res.json(updatedBooking)
  })
)

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking 
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }
    
    // Users can only cancel their own bookings (admins can cancel any)
    if (booking.user.toString() !== req.user.userId.toString() && !req.user.isAdmin) {
      res.status(401)
      throw new Error('Not authorized')
    }
    
    // Only pending bookings can be canceled
    if (booking.status !== 'pending' && !req.user.isAdmin) {
      res.status(400)
      throw new Error('Cannot cancel confirmed bookings')
    }
    
    await Booking.findByIdAndDelete(req.params.id)
    
    // Notify admin of cancellation if user cancels
    if (!req.user.isAdmin) {
      try {
        await sendNotification({
          title: "Booking Cancellation",
          body: `Booking for ${booking.date} at ${booking.time} has been canceled by the customer`,
          data: { bookingId: booking._id.toString() }
        }, ['admin']) // Send to admin users
      } catch (error) {
        console.error("Failed to send notification:", error)
      }
    }
    
    res.status(200).json({ message: 'Booking canceled successfully' })
  })
)

module.exports = router
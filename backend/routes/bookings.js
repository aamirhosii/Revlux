const express = require("express")
const router = express.Router()
const Booking = require("../models/Booking")
const User = require("../models/User")
const { authenticateToken } = require("./auth")
const { sendPushNotification } = require("../utils/notifications")

// Create a new booking
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { customerName, email, phone, date, time, address, notes, services, addons, total } = req.body

    const newBooking = new Booking({
      user: req.user.userId,
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
      status: "pending",
    })

    await newBooking.save()

    // Notify admins about new booking
    const admins = await User.find({ isAdmin: true })
    for (const admin of admins) {
      if (admin.expoPushToken) {
        await sendPushNotification(
          admin.expoPushToken,
          "New Booking Request",
          `${customerName} has requested a booking for ${date} at ${time}`,
        )
      }
    }

    res.status(201).json({
      message: "Booking created successfully",
      booking: newBooking,
    })
  } catch (err) {
    console.error("Create Booking Error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get all bookings (admin only)
router.get("/admin", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" })
    }

    const bookings = await Booking.find().sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    console.error("Get Admin Bookings Error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Get user's bookings
router.get("/user", authenticateToken, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId }).sort({ createdAt: -1 })
    res.json(bookings)
  } catch (err) {
    console.error("Get User Bookings Error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

// Update booking status (admin only)
router.put("/:id/status", authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: "Admin access required" })
    }

    const { status, rejectionReason } = req.body

    if (status === "rejected" && !rejectionReason) {
      return res.status(400).json({ message: "Rejection reason is required" })
    }

    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" })
    }

    booking.status = status
    if (status === "rejected") {
      booking.rejectionReason = rejectionReason
    }

    await booking.save()

    // Notify user about booking status change
    const user = await User.findById(booking.user)
    if (user && user.expoPushToken) {
      let title, body

      if (status === "confirmed") {
        title = "Booking Confirmed"
        body = `Your booking for ${booking.date} at ${booking.time} has been confirmed!`
      } else if (status === "rejected") {
        title = "Booking Rejected"
        body = `Your booking for ${booking.date} at ${booking.time} has been rejected. Reason: ${rejectionReason}`
      }

      await sendPushNotification(user.expoPushToken, title, body)
    }

    res.json({ message: "Booking status updated", booking })
  } catch (err) {
    console.error("Update Booking Status Error:", err)
    res.status(500).json({ message: "Server error", error: err.message })
  }
})

module.exports = router

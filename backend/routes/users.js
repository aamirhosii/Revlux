// backend/routes/users.js
const express = require("express")
const router = express.Router()
const User = require("../models/User")
const { authenticateToken } = require("./auth")

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" })
  }
  next()
}

// Get all users (admin only)
router.get("/", authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Support search query parameter
    const searchQuery = req.query.search || ""
    let query = {}

    if (searchQuery) {
      // Search by name, email, or phone number
      query = {
        $or: [
          { name: { $regex: searchQuery, $options: "i" } },
          { email: { $regex: searchQuery, $options: "i" } },
          { phoneNumber: { $regex: searchQuery, $options: "i" } },
        ],
      }
    }

    // Get users with pagination
    const page = Number.parseInt(req.query.page) || 1
    const limit = Number.parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const users = await User.find(query)
      .select("-password") // Exclude password
      .skip(skip)
      .limit(limit)
      .sort({ name: 1 })

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query)

    res.json({
      users,
      pagination: {
        total: totalUsers,
        page,
        limit,
        pages: Math.ceil(totalUsers / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get a single user by ID (admin only)
router.get("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password")
    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }
    res.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Update a user (admin only)
router.put("/:id", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { name, email, phoneNumber, isAdmin, carInfo, homeAddress, referralCredits } = req.body

    // Create update object with only the fields that are provided
    const updateData = {}
    if (name !== undefined) updateData.name = name
    if (email !== undefined) updateData.email = email
    if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber
    if (isAdmin !== undefined) updateData.isAdmin = isAdmin
    if (carInfo !== undefined) updateData.carInfo = carInfo
    if (homeAddress !== undefined) updateData.homeAddress = homeAddress
    if (referralCredits !== undefined) updateData.referralCredits = referralCredits

    // Find and update the user
    const updatedUser = await User.findByIdAndUpdate(req.params.id, updateData, { new: true }).select("-password")

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json({
      message: "User updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating user:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get user bookings (admin only)
router.get("/:id/bookings", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const Booking = require("../models/Booking")
    const bookings = await Booking.find({ user: req.params.id }).sort({ appointmentDate: -1 })
    res.json(bookings)
  } catch (error) {
    console.error("Error fetching user bookings:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router

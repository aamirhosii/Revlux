// backend/models/Bookings.js
const mongoose = require("mongoose")

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  customerName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  notes: {
    type: String,
  },
  services: [
    {
      type: String,
      required: true,
    },
  ],
  addons: [
    {
      type: String,
    },
  ],
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "confirmed", "rejected", "completed"], // Added 'completed' status
    default: "pending",
  },
  rejectionReason: {
    type: String,
  },
  // New field for assigning employees
  assignedEmployees: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // You might want to add a field for job completion notes by employees
  employeeCompletionNotes: {
    type: String,
  }
})

module.exports = mongoose.model("Booking", BookingSchema)
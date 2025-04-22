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
    enum: ["pending", "confirmed", "rejected"],
    default: "pending",
  },
  rejectionReason: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Booking", BookingSchema)

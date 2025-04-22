// API URL configuration
export const API_URL = "http://localhost:5001" // Change this to your actual backend URL

// Service types
export const SERVICE_TYPES = {
  INTERIOR: "interior",
  EXTERIOR: "exterior",
  CERAMIC: "ceramic",
  ADDONS: "addons",
}

// Booking statuses
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
}

// JWT token storage key
export const TOKEN_STORAGE_KEY = "token"
export const USER_STORAGE_KEY = "user"

// Environment variables
export const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key" // Make sure to set this in your environment

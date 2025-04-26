// config.js — Central configuration file

// Base URL for all REST endpoints (backend routes are all mounted under /api)
export const API_URL = "http://localhost:5001";

// URL for your Socket.io server (no /api prefix)
export const SOCKET_URL = "http://localhost:5001";

// Booking status constants
export const BOOKING_STATUS = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  REJECTED: "rejected",
};

// Service types for tab navigation
export const SERVICE_TYPES = {
  INTERIOR: "interior",
  EXTERIOR: "exterior",
  CERAMIC: "ceramic",
  ADDONS: "addons",
};
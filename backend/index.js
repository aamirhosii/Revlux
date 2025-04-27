// index.js
require('dotenv').config();

// Add near the top with your other imports
const emailConfig = require('./config/emailconfig');

// Log email configuration at startup
emailConfig.logConfig();

// Get appropriate email service based on configuration
const emailService = emailConfig.getEmailService();

// Make it available globally for use in routes
global.emailService = emailService;

const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const bookingRoutes = require('./routes/bookings');
const availabilityRoutes = require('./routes/availability');
const serviceAreasRoutes = require("./routes/service-areas");
const userRoutes = require("./routes/users");
// Add this with your other requires
const contactRoutes = require('./routes/contact');

// If you want Gift Cards:
const giftCardRoutes = require('./routes/giftCards'); // Make sure you created giftCards.js

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount routers
app.use('/auth', authRoutes.router);
app.use('/api/bookings', bookingRoutes);
app.use('/availability', availabilityRoutes);
app.use('/service-areas', serviceAreasRoutes);
app.use('/users', userRoutes);
app.use('/contact', contactRoutes);
app.use('/giftcards', giftCardRoutes);

// Connect to MongoDB
const uri = process.env.MONGODB_URI; // e.g., "mongodb://localhost:27017/shelby"
mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');         
const bookingRoutes = require('./routes/bookings');  
const availabilityRoutes = require('./routes/availability');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the router from authRoutes.router
app.use('/auth', authRoutes.router);
app.use('/bookings', bookingRoutes);
app.use('/availability', availabilityRoutes);

// Connect to MongoDB
const uri = process.env.MONGODB_URI; // e.g., "mongodb+srv://user:pass@cluster0..."

mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Start server
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
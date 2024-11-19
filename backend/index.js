require('dotenv').config();
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Built-in middleware for JSON
app.use(express.urlencoded({ extended: true })); // Built-in middleware for URL-encoded data

// Routes
app.use('/auth', authRoutes);

// Connect to MongoDB Atlas
const uri = process.env.MONGODB_URI;

mongoose
  .connect(uri)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
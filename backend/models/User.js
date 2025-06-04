// backend/models/User.js
const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, sparse: true },
  phoneNumber: { type: String, sparse: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: false },
  isEmployee: { type: Boolean, default: false },
  // Add role field for better role-based access control
  role: { 
    type: String, 
    enum: ['user', 'employee', 'admin'], 
    default: 'user' 
  },
  isVerified: { type: Boolean, default: false },
  carInfo: { type: String },
  homeAddress: { type: String },

  // Referral System Fields
  referralCode: { type: String, unique: true, sparse: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  referralCredits: { type: Number, default: 0 },

  // Push Notification
  expoPushToken: { type: String, default: '' },

  // Password Reset
  resetPasswordOtp: { type: String },
  resetPasswordExpires: { type: Date },
  
  // Signup Verification
  signupVerificationOtp: { type: String },
  signupVerificationExpires: { type: Date },

  // Employee Time Tracking
  isClockedIn: { type: Boolean, default: false },
  lastClockInTime: { type: Date },
  lastClockOutTime: { type: Date }, // Added for tracking last clock-out

  // Enhanced Employee Data
  employeeData: {
    hireDate: { type: Date },
    position: { type: String },
    hourlyRate: { type: Number },
    skills: [String],
    notes: { type: String }
  },
  
  // Employee Stats (calculated periodically)
  stats: {
    totalHoursThisMonth: { type: Number, default: 0 },
    totalJobsCompleted: { type: Number, default: 0 },
    lastPayPeriodHours: { type: Number, default: 0 }
  }
}, {
  timestamps: true // Adds createdAt and updatedAt timestamps
});

// Middleware to synchronize role and isEmployee fields
UserSchema.pre('save', function(next) {
  // If user is an admin, ensure role reflects this
  if (this.isAdmin && this.role !== 'admin') {
    this.role = 'admin';
  }
  
  // Synchronize role and isEmployee fields
  if (this.role === 'employee' && !this.isEmployee) {
    this.isEmployee = true;
  } else if (this.isEmployee && this.role === 'user') {
    this.role = 'employee';
  }
  next();
});

// Add a pre-update middleware to ensure consistency when updating
UserSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate();
  
  // If updating role to employee, also set isEmployee to true
  if (update.role === 'employee' && update.isEmployee === undefined) {
    update.isEmployee = true;
  }
  
  // If updating isEmployee to true, also set role to employee if not admin
  if (update.isEmployee === true && update.role === undefined) {
    update.role = 'employee';
  }
  
  next();
});

// Virtual for employee's full name
UserSchema.virtual('fullName').get(function() {
  return this.name;
});

// Index for faster employee lookups
UserSchema.index({ isEmployee: 1 });
UserSchema.index({ role: 1 }); // Add index for role-based queries

module.exports = mongoose.model('User', UserSchema);
const mongoose = require('mongoose');

const ClockEventSchema = new mongoose.Schema({
  employee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['clock-in', 'clock-out'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  location: {
    // Optional GPS location
    latitude: Number,
    longitude: Number,
  },
  notes: {
    type: String,
    trim: true
  },
  // For linking paired events
  pairedEventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ClockEvent'
  },
  // Client device info (optional)
  deviceInfo: {
    type: String
  }
}, {
  timestamps: true // Adds createdAt and updatedAt
});

// Index for faster querying
ClockEventSchema.index({ employee: 1, timestamp: -1 });
ClockEventSchema.index({ employee: 1, type: 1, timestamp: -1 });

// Helper static method to get current date string in YYYY-MM-DD format
ClockEventSchema.statics.getCurrentDate = function() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

// Helper static method to find an employee's latest clock event
ClockEventSchema.statics.findLatestForEmployee = async function(employeeId) {
  return this.findOne({ employee: employeeId })
    .sort({ timestamp: -1 })
    .exec();
};

// Helper static method to find an employee's latest clock-in without a paired clock-out
ClockEventSchema.statics.findOpenClockIn = async function(employeeId) {
  return this.findOne({ 
    employee: employeeId,
    type: 'clock-in',
    pairedEventId: { $exists: false }
  })
  .sort({ timestamp: -1 })
  .exec();
};

// Helper static method to calculate hours between two timestamps
ClockEventSchema.statics.calculateHours = function(startTime, endTime) {
  const durationMs = endTime - startTime;
  return parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2)); // Hours with 2 decimal places
};

// Helper to get today's clock events for an employee
ClockEventSchema.statics.getTodayEventsForEmployee = async function(employeeId) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  
  return this.find({
    employee: employeeId,
    timestamp: { $gte: startOfToday }
  })
  .sort({ timestamp: 1 })
  .exec();
};

// Helper to get clock event pairs (shifts) for an employee within a date range
ClockEventSchema.statics.getShiftsForEmployee = async function(employeeId, startDate, endDate) {
  // Get all events in the period
  const events = await this.find({
    employee: employeeId,
    timestamp: { 
      $gte: startDate || new Date(0), // Default to epoch start if not provided
      $lte: endDate || new Date() // Default to now if not provided
    }
  }).sort({ timestamp: 1 }).exec();
  
  const shifts = [];
  let currentShift = null;
  
  // Pair events into shifts
  for (const event of events) {
    if (event.type === 'clock-in') {
      currentShift = { clockIn: event, clockOut: null };
    } else if (event.type === 'clock-out' && currentShift && currentShift.clockIn) {
      currentShift.clockOut = event;
      currentShift.duration = this.calculateHours(
        currentShift.clockIn.timestamp,
        currentShift.clockOut.timestamp
      );
      shifts.push(currentShift);
      currentShift = null;
    }
  }
  
  // Add any open shift
  if (currentShift && currentShift.clockIn) {
    shifts.push(currentShift);
  }
  
  return shifts;
};

module.exports = mongoose.model('ClockEvent', ClockEventSchema);
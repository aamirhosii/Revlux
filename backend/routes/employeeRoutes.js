const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ClockEvent = require('../models/ClockEvent');
const { authenticateToken, isEmployee } = require('./auth');

// Apply authentication to all routes, but not employee restriction
router.use(authenticateToken);

// Debug route to check authentication status
router.get('/check-auth', (req, res) => {
  console.log("Auth check - User info:", {
    userId: req.user.userId,
    isAdmin: req.user.isAdmin,
    isEmployee: req.user.isEmployee
  });
  
  res.json({
    userId: req.user.userId,
    isAdmin: !!req.user.isAdmin,
    isEmployee: !!req.user.isEmployee,
    message: "Authentication check successful"
  });
});

/**
 * @route   POST /api/employee/clock-in
 * @desc    Clock in an employee
 * @access  Private - Employee only
 */
router.post('/clock-in', isEmployee, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { notes, location } = req.body;
    
    // Validate user exists and is an employee
    const employee = await User.findById(employeeId);
    if (!employee || !employee.isEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Check if already clocked in
    const openClockIn = await ClockEvent.findOpenClockIn(employeeId);
    if (openClockIn) {
      return res.status(400).json({ 
        message: "You are already clocked in", 
        clockInTime: openClockIn.timestamp
      });
    }
    
    // Create new clock-in event
    const clockInEvent = new ClockEvent({
      employee: employeeId,
      type: 'clock-in',
      timestamp: new Date(),
      notes,
      location: location || undefined,
      deviceInfo: req.headers['user-agent']
    });
    
    await clockInEvent.save();
    
    // Update user status
    employee.isClockedIn = true;
    employee.lastClockEventTime = clockInEvent.timestamp;
    await employee.save();
    
    res.status(200).json({
      message: "Clocked in successfully",
      eventId: clockInEvent._id,
      clockInTime: clockInEvent.timestamp,
      isClockedIn: true
    });
    
  } catch (error) {
    console.error("Clock-in error:", error);
    res.status(500).json({ message: "Server error during clock-in" });
  }
});

/**
 * @route   POST /api/employee/clock-out
 * @desc    Clock out an employee
 * @access  Private - Employee only
 */
router.post('/clock-out', isEmployee, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { notes, location } = req.body;
    
    // Validate user exists and is an employee
    const employee = await User.findById(employeeId);
    if (!employee || !employee.isEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Find the open clock-in event
    const openClockIn = await ClockEvent.findOpenClockIn(employeeId);
    if (!openClockIn) {
      return res.status(400).json({ message: "You are not clocked in" });
    }
    
    // Create new clock-out event
    const clockOutEvent = new ClockEvent({
      employee: employeeId,
      type: 'clock-out',
      timestamp: new Date(),
      notes,
      location: location || undefined,
      pairedEventId: openClockIn._id,
      deviceInfo: req.headers['user-agent']
    });
    
    await clockOutEvent.save();
    
    // Update the clock-in event to reference this clock-out
    openClockIn.pairedEventId = clockOutEvent._id;
    await openClockIn.save();
    
    // Calculate hours worked
    const hoursWorked = ClockEvent.calculateHours(
      openClockIn.timestamp,
      clockOutEvent.timestamp
    );
    
    // Update user status
    employee.isClockedIn = false;
    employee.lastClockEventTime = clockOutEvent.timestamp;
    await employee.save();
    
    res.status(200).json({
      message: "Clocked out successfully",
      eventId: clockOutEvent._id,
      clockOutTime: clockOutEvent.timestamp,
      hoursWorked,
      isClockedIn: false
    });
    
  } catch (error) {
    console.error("Clock-out error:", error);
    res.status(500).json({ message: "Server error during clock-out" });
  }
});

/**
 * @route   GET /api/employee/status
 * @desc    Get employee clock-in status
 * @access  Private - Employee only
 */
router.get('/status', isEmployee, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    
    // Get employee
    const employee = await User.findById(employeeId);
    if (!employee || !employee.isEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Get the latest clock-in event if exists
    const openClockIn = await ClockEvent.findOpenClockIn(employeeId);
    
    // Get today's events for context
    const todayEvents = await ClockEvent.getTodayEventsForEmployee(employeeId);
    
    res.status(200).json({
      isClockedIn: Boolean(openClockIn),
      lastClockInTime: openClockIn ? openClockIn.timestamp : null,
      todayEvents: todayEvents.map(event => ({
        id: event._id,
        type: event.type,
        timestamp: event.timestamp,
        notes: event.notes
      }))
    });
    
  } catch (error) {
    console.error("Error fetching employee status:", error);
    res.status(500).json({ message: "Server error fetching status" });
  }
});

/**
 * @route   GET /api/employee/shifts
 * @desc    Get employee's shift history
 * @access  Private - Employee only
 */
router.get('/shifts', isEmployee, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    const { start, end, limit = 30, page = 1 } = req.query;
    
    // Convert string dates to Date objects if provided
    const startDate = start ? new Date(start) : undefined;
    const endDate = end ? new Date(end) : undefined;
    
    // Validate dates if provided
    if ((startDate && isNaN(startDate.getTime())) || 
        (endDate && isNaN(endDate.getTime()))) {
      return res.status(400).json({ message: "Invalid date format" });
    }
    
    // Get shifts for date range
    const shifts = await ClockEvent.getShiftsForEmployee(
      employeeId, 
      startDate,
      endDate
    );
    
    // Apply pagination
    const paginatedShifts = shifts.slice((page - 1) * limit, page * limit);
    
    // Calculate stats
    const totalHours = shifts.reduce((sum, shift) => 
      sum + (shift.duration || 0), 0);
    
    const completeShifts = shifts.filter(shift => shift.clockOut);
    const openShift = shifts.find(shift => !shift.clockOut);
    
    res.status(200).json({
      shifts: paginatedShifts.map(shift => ({
        id: shift.clockIn._id,
        clockInTime: shift.clockIn.timestamp,
        clockOutTime: shift.clockOut ? shift.clockOut.timestamp : null,
        duration: shift.duration || null,
        notes: {
          clockIn: shift.clockIn.notes,
          clockOut: shift.clockOut ? shift.clockOut.notes : null
        },
        isComplete: Boolean(shift.clockOut)
      })),
      meta: {
        totalShifts: shifts.length,
        totalPages: Math.ceil(shifts.length / limit),
        currentPage: parseInt(page),
        totalHours: parseFloat(totalHours.toFixed(2)),
        hasOpenShift: Boolean(openShift)
      }
    });
    
  } catch (error) {
    console.error("Error fetching shifts:", error);
    res.status(500).json({ message: "Server error fetching shifts" });
  }
});

/**
 * @route   GET /api/employee/assigned-jobs
 * @desc    Get bookings assigned to the logged-in employee
 * @access  Private - Employee only
 */
router.get('/assigned-jobs', isEmployee, async (req, res) => {
  try {
    const employeeId = req.user.userId;
    console.log(`[EMPLOYEE API] Fetching assigned jobs for employee: ${employeeId}`);
    
    // Find bookings where this employee is assigned
    const bookings = await Booking.find({
      assignedEmployees: employeeId,
      status: { $in: ['confirmed', 'pending', 'pending_completion'] }
    })
    .populate('user', 'name email phoneNumber')
    .sort({ date: 1, time: 1 });
    
    console.log(`[EMPLOYEE API] Found ${bookings.length} assigned bookings for employee ${employeeId}`);
    
    if (bookings.length > 0) {
      console.log(`[EMPLOYEE API] First booking assigned: ${bookings[0]._id}`);
      console.log(`[EMPLOYEE API] Assigned employees for first booking: ${bookings[0].assignedEmployees}`);
    }
    
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching employee's assigned jobs:", error);
    res.status(500).json({ message: "Error fetching assigned jobs", error: error.message });
  }
});

/**
 * @route   PUT /api/employee/jobs/:jobId/status
 * @desc    Update job completion status
 * @access  Private - Employee only
 */
router.put('/jobs/:jobId/status', isEmployee, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { status, completionNotes } = req.body;
    const employeeId = req.user.userId;
    
    if (!['pending_completion', 'completed'].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    // Find booking and verify employee is assigned
    const booking = await Booking.findById(jobId);
    if (!booking) {
      return res.status(404).json({ message: "Job not found" });
    }
    
    if (!booking.assignedEmployees.includes(employeeId)) {
      return res.status(403).json({ message: "You are not assigned to this job" });
    }
    
    // Update booking status
    booking.status = status;
    if (status === 'completed') {
      booking.completionDetails = {
        completedBy: employeeId,
        completedAt: new Date(),
        notes: completionNotes
      };
    }
    
    await booking.save();
    
    res.status(200).json({ 
      message: "Job status updated successfully",
      booking
    });
    
  } catch (error) {
    console.error("Error updating job status:", error);
    res.status(500).json({ message: "Server error updating job status" });
  }
});

/**
 * @route   GET /api/employee/timesheets
 * @desc    Get all timesheets (admin only)
 * @access  Private - Admin only
 */
router.get('/timesheets', async (req, res) => {
  try {
    console.log("Timesheets API called by user:", req.user.userId);
    console.log("User admin status:", !!req.user.isAdmin);
    
    // Only admin can access all timesheets
    if (!req.user.isAdmin) {
      console.log("Access denied - non-admin attempted to access timesheets");
      return res.status(403).json({ message: "Access denied - Admin only" });
    }
    
    const { startDate, endDate } = req.query;
    
    // Build query for date filtering
    const query = {};
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    
    console.log("Timesheet query:", JSON.stringify(query));
    
    // Get all clock events, sorted by timestamp desc
    const clockEvents = await ClockEvent.find(query)
      .populate('employee', 'name email')
      .sort({ timestamp: -1 });
    
    console.log(`Found ${clockEvents.length} timesheet entries`);
    res.status(200).json(clockEvents);
    
  } catch (error) {
    console.error("Error fetching all timesheets:", error);
    res.status(500).json({ message: "Server error fetching timesheets" });
  }
});

/**
 * @route   GET /api/employee/timesheets/:employeeId
 * @desc    Get timesheets for a specific employee
 * @access  Private - Admin or Self only
 */
router.get('/timesheets/:employeeId', async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { startDate, endDate } = req.query;
    
    console.log(`Fetching timesheets for employee ID: ${employeeId}`);
    console.log(`Requested by user ID: ${req.user.userId} (isAdmin: ${!!req.user.isAdmin})`);
    
    // Check permissions - only admin or self can access
    if (!req.user.isAdmin && req.user.userId !== employeeId) {
      console.log("Access denied - unauthorized user attempted to access employee timesheets");
      return res.status(403).json({ message: "Access denied" });
    }
    
    // Verify employee exists
    const employee = await User.findById(employeeId);
    if (!employee || !employee.isEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Build query for date filtering
    const query = { employee: employeeId };
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate + 'T23:59:59.999Z');
    }
    
    console.log("Employee timesheet query:", JSON.stringify(query));
    
    // Get clock events for this employee
    const clockEvents = await ClockEvent.find(query)
      .sort({ timestamp: -1 });
    
    console.log(`Found ${clockEvents.length} timesheet entries for employee ${employeeId}`);
    res.status(200).json(clockEvents);
    
  } catch (error) {
    console.error("Error fetching employee timesheets:", error);
    res.status(500).json({ message: "Server error fetching timesheets" });
  }
});

/**
 * @route   PUT /api/employee/timesheet/:id
 * @desc    Update a timesheet entry
 * @access  Private - Admin only
 */
router.put('/timesheet/:id', async (req, res) => {
  try {
    console.log(`Updating timesheet entry ${req.params.id}`);
    console.log(`User ID: ${req.user.userId}, isAdmin: ${!!req.user.isAdmin}`);
    
    // Only admin can update timesheet entries
    if (!req.user.isAdmin) {
      console.log("Access denied - non-admin attempted to update timesheet entry");
      return res.status(403).json({ message: "Access denied - Admin only" });
    }
    
    const { id } = req.params;
    const { timestamp, type, notes } = req.body;
    
    console.log("Update data:", { timestamp, type, notes });
    
    // Find the clock event
    const clockEvent = await ClockEvent.findById(id);
    if (!clockEvent) {
      return res.status(404).json({ message: "Timesheet entry not found" });
    }
    
    // Update fields
    if (timestamp) clockEvent.timestamp = new Date(timestamp);
    if (type && ['clock-in', 'clock-out'].includes(type)) clockEvent.type = type;
    if (notes !== undefined) clockEvent.notes = notes;
    
    // Add audit information
    clockEvent.lastModifiedBy = req.user.userId;
    clockEvent.lastModifiedAt = new Date();
    
    await clockEvent.save();
    console.log(`Timesheet entry ${id} updated successfully`);
    
    // If this is a paired event, may need to update shift calculations
    if (clockEvent.pairedEventId) {
      // Logic to recalculate hours if needed
      // This could be handled by your ClockEvent model
    }
    
    res.status(200).json({
      message: "Timesheet entry updated successfully",
      entry: clockEvent
    });
    
  } catch (error) {
    console.error("Error updating timesheet entry:", error);
    res.status(500).json({ message: "Server error updating timesheet entry" });
  }
});

/**
 * @route   DELETE /api/employee/timesheet/:id
 * @desc    Delete a timesheet entry
 * @access  Private - Admin only
 */
router.delete('/timesheet/:id', async (req, res) => {
  try {
    console.log(`Deleting timesheet entry ${req.params.id}`);
    console.log(`User ID: ${req.user.userId}, isAdmin: ${!!req.user.isAdmin}`);
    
    // Only admin can delete timesheet entries
    if (!req.user.isAdmin) {
      console.log("Access denied - non-admin attempted to delete timesheet entry");
      return res.status(403).json({ message: "Access denied - Admin only" });
    }
    
    const { id } = req.params;
    
    // Find the clock event
    const clockEvent = await ClockEvent.findById(id);
    if (!clockEvent) {
      return res.status(404).json({ message: "Timesheet entry not found" });
    }
    
    // If this event is paired, unlink the pair
    if (clockEvent.pairedEventId) {
      const pairedEvent = await ClockEvent.findById(clockEvent.pairedEventId);
      if (pairedEvent) {
        pairedEvent.pairedEventId = null;
        await pairedEvent.save();
      }
    }
    
    // Delete the event
    await ClockEvent.findByIdAndDelete(id);
    console.log(`Timesheet entry ${id} deleted successfully`);
    
    res.status(200).json({
      message: "Timesheet entry deleted successfully"
    });
    
  } catch (error) {
    console.error("Error deleting timesheet entry:", error);
    res.status(500).json({ message: "Server error deleting timesheet entry" });
  }
});

/**
 * @route   POST /api/employee/timesheet
 * @desc    Create a manual timesheet entry
 * @access  Private - Admin only
 */
router.post('/timesheet', async (req, res) => {
  try {
    console.log("Creating manual timesheet entry");
    console.log(`User ID: ${req.user.userId}, isAdmin: ${!!req.user.isAdmin}`);
    
    // Only admin can create manual entries
    if (!req.user.isAdmin) {
      console.log("Access denied - non-admin attempted to create timesheet entry");
      return res.status(403).json({ message: "Access denied - Admin only" });
    }
    
    const { userId, timestamp, type, notes } = req.body;
    console.log("Entry data:", { userId, timestamp, type, notes });
    
    // Validate required fields
    if (!userId || !timestamp || !type) {
      return res.status(400).json({ message: "Missing required fields" });
    }
    
    // Validate employee exists
    const employee = await User.findById(userId);
    if (!employee || !employee.isEmployee) {
      return res.status(404).json({ message: "Employee not found" });
    }
    
    // Create new clock event
    const clockEvent = new ClockEvent({
      employee: userId,
      type: type,
      timestamp: new Date(timestamp),
      notes: notes || '',
      manuallyAdded: true,
      createdBy: req.user.userId
    });
    
    await clockEvent.save();
    console.log(`Manual timesheet entry created for employee ${userId}`);
    
    // If this is a clock-out event that should be paired with a clock-in
    // Add logic here to find a clock-in to pair with, if needed
    
    res.status(201).json({
      message: "Timesheet entry created successfully",
      entry: clockEvent
    });
    
  } catch (error) {
    console.error("Error creating timesheet entry:", error);
    res.status(500).json({ message: "Server error creating timesheet entry" });
  }
});

module.exports = router;
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = require('../models/User');
const Booking = require('../models/Booking');
const ClockEvent = require('../models/ClockEvent');
const { authenticateToken, isEmployee } = require('./auth');

// Middleware to ensure the user is an employee for all routes in this file
router.use(authenticateToken, isEmployee);

/**
 * @route   POST /api/employee/clock-in
 * @desc    Clock in an employee
 * @access  Private - Employee only
 */
router.post('/clock-in', async (req, res) => {
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
router.post('/clock-out', async (req, res) => {
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
router.get('/status', async (req, res) => {
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
router.get('/shifts', async (req, res) => {
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
router.get('/assigned-jobs', async (req, res) => {
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
router.put('/jobs/:jobId/status', async (req, res) => {
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

module.exports = router;
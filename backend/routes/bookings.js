// routes/bookings.js
const express = require('express')
const asyncHandler = require('express-async-handler')
const Booking = require('../models/Booking')
const User = require('../models/User') // Added User model for employee validation
const { authenticateToken, isAdmin, isEmployee } = require('./auth') // Added isEmployee
const { sendNotification } = require('../utils/notifications')
const { sendEmployeeAssignedEmail, sendBookingConfirmationEmail } = require('../services/emailservices')

const router = express.Router()

// Simple admin middleware
const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next()
  } else {
    res.status(401)
    throw new Error('Not authorized as admin')
  }
}

/**
 * @route   POST /api/bookings
 * @desc    Create a new booking request
 * @access  Private
 */
router.post(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const {
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes,
      services,
      addons,
      total,
    } = req.body

    // validation
    if (
      !customerName ||
      !email ||
      !phone ||
      !date ||
      !time ||
      !address ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      res.status(400)
      throw new Error('Please fill in all required fields')
    }

    const booking = new Booking({
      user: req.user.userId, // Note: using userId from JWT payload
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes: notes || '',
      services,
      addons: Array.isArray(addons) ? addons : [],
      total,
      status: 'pending',
    })

    const createdBooking = await booking.save()

    // Notify admin of new booking
    try {
      await sendNotification({
        title: "New Booking Request",
        body: `New booking from ${customerName} for ${date} at ${time}`,
        data: { bookingId: createdBooking._id.toString() }
      }, ['admin']) // Send to admin users
    } catch (error) {
      console.error("Failed to send notification:", error)
      // Continue even if notification fails
    }

    res.status(201).json(createdBooking)
  })
)

/**
 * @route   GET /api/bookings
 * @desc    Get all bookings for the logged-in user
 * @access  Private
 */
router.get(
  '/',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const bookings = await Booking.find({ user: req.user.userId }).sort({ createdAt: -1 })
    res.json(bookings)
  })
)

/**
 * @route   GET /api/bookings/admin
 * @desc    Get *all* bookings (admin only)
 * @access  Private/Admin
 */
router.get(
  '/admin',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    try {
      // Enhanced admin route to get all bookings with user and employee details
      const allBookings = await Booking.find({})
        .sort({ createdAt: -1 })
        .populate('user', 'name email phoneNumber')
        .populate('assignedEmployees', 'name email'); // Added employee population
      
      console.log(`Admin fetched ${allBookings.length} bookings`);
      res.json(allBookings);
    } catch (error) {
      console.error('Error fetching admin bookings:', error);
      res.status(500).json({ message: 'Failed to fetch bookings', error: error.message });
    }
  })
)

/**
 * @route   GET /api/bookings/:id
 * @desc    Get single booking by ID
 * @access  Private
 */
router.get(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
      .populate('assignedEmployees', 'name email') // Add employee details
    
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }
    
    // Users can only see their own bookings (admins can see all)
    if (booking.user && booking.user.toString() !== req.user.userId.toString() && !req.user.isAdmin) {
      res.status(401)
      throw new Error('Not authorized')
    }
    
    res.json(booking)
  })
)

/**
 * @route   PUT /api/bookings/:id/status
 * @desc    Update booking status (confirm / reject)
 * @access  Private/Admin
 */
router.put(
  '/:id/status',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }

    const { status, rejectionReason } = req.body
    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      res.status(400)
      throw new Error('Invalid status')
    }

    booking.status = status
    if (status === 'rejected') {
      if (rejectionReason) {
        booking.rejectionReason = rejectionReason
      }
      // Clear assigned employees if booking is rejected
      booking.assignedEmployees = []
    } else {
      // Clear rejection reason if status is not rejected
      booking.rejectionReason = undefined
    }

    const updatedBooking = await booking.save()
    
    // Send notification to user about status change
    try {
      let title, body;
      
      if (status === 'confirmed') {
        title = "Booking Confirmed!"
        body = `Your booking for ${booking.date} at ${booking.time} has been confirmed.`
        
        // Send booking confirmation email when status changes to confirmed
        if (booking.email) {
          await sendBookingConfirmationEmail(booking);
        }
      } else if (status === 'rejected') {
        title = "Booking Update"
        body = `Your booking has been declined. Reason: ${rejectionReason || 'No reason provided'}`
      }
      
      // Only send if we have a title (meaning status is confirmed or rejected)
      if (title && booking.user) {
        await sendNotification({
          title,
          body,
          data: { bookingId: booking._id.toString() }
        }, [booking.user.toString()])
      }
    } catch (error) {
      console.error("Failed to send notification:", error)
      // Continue even if notification fails
    }
    
    res.json(updatedBooking)
  })
)

/**
 * @route   PUT /api/bookings/:id/assign-employees
 * @desc    Assign employees to a booking
 * @access  Private/Admin
 */
router.put(
  '/:id/assign-employees',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const { id } = req.params;
      const { employeeIds } = req.body; // Expecting an array of employee User ObjectIds

      if (!Array.isArray(employeeIds)) {
        return res.status(400).json({ message: "employeeIds must be an array." });
      }

      // Validate if employeeIds are actual employees
      const employees = await User.find({ _id: { $in: employeeIds }, isEmployee: true });
      if (employees.length !== employeeIds.length) {
        return res.status(400).json({ message: "One or more provided IDs are not valid employees." });
      }

      const booking = await Booking.findById(id);
      if (!booking) {
        return res.status(404).json({ message: "Booking not found." });
      }
      
      if (booking.status !== 'confirmed') {
        return res.status(400).json({ message: "Booking must be confirmed before assigning employees." });
      }

      // Store previous assignments to determine new assignments
      const previousAssignedEmployees = booking.assignedEmployees 
        ? booking.assignedEmployees.map(id => id.toString()) 
        : [];

      booking.assignedEmployees = employeeIds;
      await booking.save();
      
      // Populate assignedEmployees for the response
      const updatedBooking = await Booking.findById(id)
                                       .populate('user', 'name email')
                                       .populate('assignedEmployees', 'name email');

      // Find newly assigned employees (those who weren't previously assigned)
      const newlyAssignedEmployees = employees.filter(
        emp => !previousAssignedEmployees.includes(emp._id.toString())
      );

      // Notify assigned employees
      for (const employee of newlyAssignedEmployees) {
        // Send email notification
        if (employee.email) {
          try {
            await sendEmployeeAssignedEmail(employee, booking);
            console.log(`Assignment email sent to: ${employee.email} for booking ${booking._id}`);
          } catch (emailError) {
            console.error(`Failed to send email to employee ${employee._id}:`, emailError);
            // Continue despite email failure
          }
        }

        // Send push notification if available
        if (employee.expoPushToken) {
          try {
            await sendNotification({
              title: "New Job Assignment",
              body: `You've been assigned to a job on ${booking.date} at ${booking.time}`,
              data: { bookingId: booking._id.toString() }
            }, [employee._id.toString()]);
          } catch (notifyError) {
            console.error(`Failed to send notification to employee ${employee._id}:`, notifyError);
            // Continue despite notification failure
          }
        }
      }

      res.status(200).json({ 
        message: "Employees assigned successfully.", 
        booking: updatedBooking 
      });
    } catch (error) {
      console.error("Error assigning employees:", error);
      res.status(500).json({ message: "Server error assigning employees." });
    }
  })
)

/**
 * @route   GET /api/bookings/list-employees-for-assignment
 * @desc    Get list of all employees for assignment to bookings
 * @access  Private/Admin
 */
router.get(
  '/list-employees-for-assignment',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    try {
      const employees = await User.find({ isEmployee: true })
                                .select('name email _id')
                                .sort({ name: 1 });
      
      res.json(employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      res.status(500).json({ message: "Server error fetching employees." });
    }
  })
)

/**
 * @route   DELETE /api/bookings/:id
 * @desc    Cancel booking 
 * @access  Private
 */
router.delete(
  '/:id',
  authenticateToken,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id)
    
    if (!booking) {
      res.status(404)
      throw new Error('Booking not found')
    }
    
    // Users can only cancel their own bookings (admins can cancel any)
    if (booking.user && booking.user.toString() !== req.user.userId.toString() && !req.user.isAdmin) {
      res.status(401)
      throw new Error('Not authorized')
    }
    
    // Only pending bookings can be canceled
    if (booking.status !== 'pending' && !req.user.isAdmin) {
      res.status(400)
      throw new Error('Cannot cancel confirmed bookings')
    }
    
    await Booking.findByIdAndDelete(req.params.id)
    
    // Notify admin of cancellation if user cancels
    if (!req.user.isAdmin) {
      try {
        await sendNotification({
          title: "Booking Cancellation",
          body: `Booking for ${booking.date} at ${booking.time} has been canceled by the customer`,
          data: { bookingId: booking._id.toString() }
        }, ['admin']) // Send to admin users
      } catch (error) {
        console.error("Failed to send notification:", error)
      }
    }
    
    res.status(200).json({ message: 'Booking canceled successfully' })
  })
)

/**
 * @route   POST /api/bookings/admin-create
 * @desc    Allow admins to create bookings on behalf of users
 * @access  Private/Admin
 */
router.post(
  '/admin-create',
  authenticateToken,
  admin,
  asyncHandler(async (req, res) => {
    const {
      userId, // Optional - if provided, associate with existing user
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes,
      services,
      addons,
      total,
      status = 'confirmed' // Admin-created bookings are confirmed by default
    } = req.body;

    // validation
    if (
      !customerName ||
      !email ||
      !phone ||
      !date ||
      !time ||
      !address ||
      !Array.isArray(services) ||
      services.length === 0
    ) {
      res.status(400);
      throw new Error('Please fill in all required fields');
    }

    const booking = new Booking({
      user: userId || null, // Associate with user if provided, otherwise null
      customerName,
      email,
      phone,
      date,
      time,
      address,
      notes: notes || '',
      services,
      addons: Array.isArray(addons) ? addons : [],
      total,
      status,
      createdBy: req.user.userId, // Track which admin created this booking
      assignedEmployees: [], // Initialize empty assignedEmployees array
    });

    const createdBooking = await booking.save();
    console.log('Admin created a booking:', createdBooking._id);
    
    // Send confirmation email for admin-created bookings
    if (email && status === 'confirmed') {
      try {
        await sendBookingConfirmationEmail(createdBooking);
      } catch (emailError) {
        console.error("Failed to send booking confirmation email:", emailError);
      }
    }
    
    res.status(201).json(createdBooking);
  })
);

module.exports = router;
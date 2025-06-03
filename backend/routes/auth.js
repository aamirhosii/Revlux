// backend/routes/auth.js
const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // Using bcrypt (not bcryptjs) for consistency
const jwt = require('jsonwebtoken');
const User = require('../models/User');
// Use ONLY production emailService
const emailService = require('../services/emailservices');
// Read the JWT secret from environment
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Middleware: authenticateToken
 * Reusable for bookings, availability, etc.
 */
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; 
  if (!token) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, JWT_SECRET, (err, userPayload) => {
    if (err) {
      return res.sendStatus(403); // Forbidden
    }
    // userPayload: { userId, isAdmin, iat, exp }
    req.user = userPayload;
    next();
  });
}

// SIGNUP
// SIGNUP
router.post('/signup', async (req, res) => {
  const { name, email, phoneNumber, password, referredByCode } = req.body;
  try {
    if (!email && !phoneNumber) {
      return res.status(400).json({
        message: 'Either email or phone number is required',
      });
    }

    // Check if user already exists by email
    const userExists = await User.findOne({ email });
    if (userExists) {
      const conflictFields = [];
      if (userExists.email === email) conflictFields.push('email');
      if (userExists.phoneNumber === phoneNumber) conflictFields.push('phone number');
      return res.status(409).json({
        message: `The following already exist: ${conflictFields.join(', ')}`,
      });
    }

    // Generate a 6-digit OTP for signup verification
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // Debug log

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      name,
      email: email || null,
      phoneNumber: phoneNumber || null,
      password: hashedPassword,
      isVerified: false,
      signupVerificationOtp: otp,
      signupVerificationExpires: Date.now() + 60 * 60 * 1000, // 60 minutes
    });

    // Generate a referral code
    const referralCode = `SHELBY-${Math.random().toString(36).substring(2,8).toUpperCase()}`;
    newUser.referralCode = referralCode;

    // If user was referred by someone
    if (referredByCode) {
      const referrer = await User.findOne({ referralCode: referredByCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
        // Optionally give referrer some credit
        referrer.referralCredits = (referrer.referralCredits || 0) + 10;
        await referrer.save();
      }
    }

    // Save the user first
    await newUser.save();
    console.log(`User created with ID ${newUser._id}, now ensuring OTP is saved...`);
    
    // Now explicitly update the OTP fields again to ensure they are saved
    const otpUpdateResult = await User.findByIdAndUpdate(
      newUser._id,
      { 
        signupVerificationOtp: otp,
        signupVerificationExpires: Date.now() + 60 * 60 * 1000 
      },
      { new: true }
    );
    
    console.log(`OTP update result: OTP=${otpUpdateResult.signupVerificationOtp}`);
    
    // Double check the OTP was saved
    const savedUser = await User.findOne({ email });
    console.log(`Final OTP check - Email: ${email}, OTP: ${savedUser.signupVerificationOtp || 'NOT SAVED!'}`);
    
    // If OTP still not saved properly, force direct update
    if (!savedUser.signupVerificationOtp) {
      console.log('CRITICAL: OTP not saved properly, attempting direct update...');
      await User.updateOne(
        { email },
        { 
          $set: { 
            signupVerificationOtp: otp,
            signupVerificationExpires: Date.now() + 60 * 60 * 1000 
          }
        }
      );
      
      // Final verification
      const finalCheck = await User.findOne({ email });
      console.log(`Emergency update check - OTP now: ${finalCheck.signupVerificationOtp || 'STILL NOT SAVED!'}`);
    }
    
    // Send verification email with OTP if an email was provided
    if (email) {
      try {
        const emailResult = await emailService.sendSignupVerificationEmail(email, otp, name);
        if (emailResult.success) {
          console.log(`Verification email sent successfully to ${email}. OTP: ${otp}`);
        } else {
          console.error(`Failed to send verification email to ${email}:`, emailResult.error);
        }
      } catch (emailError) {
        console.error('Verification email failed:', emailError);
        // Continue with registration even if email fails
      }
    }
    
    res.status(201).json({ 
      message: 'User registered. Please check your email for verification code.',
      requiresVerification: true,
      userId: newUser._id
    });

  } catch (err) {
    console.error('Signup Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// Resend verification OTP with robust update
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }
    
    // Check if already verified
    if (user.isVerified) {
      return res.status(400).json({ message: 'Account is already verified' });
    }

    // Generate a new 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Attempting to save OTP ${otp} for user ${email} (ID: ${user._id})`);

    // Try multiple database update methods to ensure the OTP is saved:
    
    // Method 1: Update through document model
    user.signupVerificationOtp = otp;
    user.signupVerificationExpires = Date.now() + 60 * 60 * 1000; // 60 min
    await user.save();
    
    // Method 2: Direct update operation
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          signupVerificationOtp: otp,
          signupVerificationExpires: Date.now() + 60 * 60 * 1000
        } 
      }
    );
    
    // Method 3: Verify and retry with findByIdAndUpdate if needed
    const verifyUserSave = await User.findOne({ email });
    if (!verifyUserSave.signupVerificationOtp) {
      console.log('OTP still not saved, attempting findByIdAndUpdate...');
      await User.findByIdAndUpdate(
        user._id, 
        {
          signupVerificationOtp: otp,
          signupVerificationExpires: Date.now() + 60 * 60 * 1000
        },
        { new: true }
      );
    }
    
    // Final verification
    const finalCheck = await User.findOne({ email });
    console.log(`Final verification - OTP in DB: ${finalCheck.signupVerificationOtp || 'FAILED TO SAVE'}`);

    // Send OTP via email
    try {
      const emailResult = await emailService.sendSignupVerificationEmail(email, otp, user.name);
      console.log(`Verification email resent to ${email}. OTP:`, otp);
      
      if (!emailResult.success) {
        console.error(`Failed to send verification email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Verification email failed:', emailError);
      // Continue - the OTP is saved even if email fails
    }

    res.status(200).json({ message: 'Verification code resent to your email' });
  } catch (error) {
    console.error('Error in resend-verification:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify signup OTP - single cleaned up implementation
router.post('/verify-signup', async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    console.log('Verifying OTP:', otp, 'for email:', email);
    
    // Find the user
    const userExists = await User.findOne({ email });
    
    if (!userExists) {
      return res.status(400).json({ message: 'User not found with this email' });
    }
    
    // Log diagnostic information
    console.log('User found:', userExists.email);
    console.log('Stored OTP:', userExists.signupVerificationOtp || 'No OTP found');
    console.log('Provided OTP:', otp);
    
    // Check if OTP exists
    if (!userExists.signupVerificationOtp) {
      return res.status(400).json({ 
        message: 'No verification code found for this account. Please request a new one.' 
      });
    }
    
    // Compare OTPs and expiry
    const storedOtp = String(userExists.signupVerificationOtp);
    const submittedOtp = String(otp);
    const otpMatches = storedOtp === submittedOtp;
    const otpNotExpired = userExists.signupVerificationExpires > Date.now();
    
    console.log('OTP matches?', otpMatches);
    console.log('OTP not expired?', otpNotExpired);
    
    if (!otpMatches) {
      return res.status(400).json({ message: 'The verification code is incorrect.' });
    }
    
    if (!otpNotExpired) {
      return res.status(400).json({ message: 'The verification code has expired. Please request a new one.' });
    }

    console.log('OTP verified successfully for:', email);
    
    // Mark user as verified
    userExists.isVerified = true;
    userExists.signupVerificationOtp = undefined;
    userExists.signupVerificationExpires = undefined;
    await userExists.save();
    
    // Send welcome email
    try {
      await emailService.sendWelcomeEmail({ name: userExists.name, email: userExists.email });
    } catch (emailError) {
      console.error('Welcome email failed:', emailError);
      // Continue even if email fails
    }

    // Generate JWT for auto-login
    const token = jwt.sign(
      { userId: userExists._id, isAdmin: userExists.isAdmin },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({ 
      message: 'Account verified successfully',
      token,
      user: {
        name: userExists.name,
        email: userExists.email,
        phoneNumber: userExists.phoneNumber,
        isAdmin: userExists.isAdmin || false,
      }
    });
  } catch (error) {
    console.error('Error in verify-signup:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Check email uniqueness
router.post('/check-uniqueness', async (req, res) => {
  const { email } = req.body;
  console.log('Checking uniqueness with =>', JSON.stringify({ email }));
  try {
    // If user is phone-only (email === null), skip
    if (email === null) {
      return res.status(200).json({ isUnique: true });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(409).json({
        message: 'Email is already in use',
      });
    }
    return res.status(200).json({ isUnique: true });
  } catch (err) {
    console.error('Uniqueness Check Error:', err);
    return res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// LOGIN - FIXED to remove verification requirement
router.post('/login', async (req, res) => {
  const { identifier, password } = req.body; // "identifier" can be email or phone
  try {
    if (!identifier || !password) {
      return res
        .status(400)
        .json({ message: 'Identifier and password are required' });
    }

    // Find user by email OR phoneNumber
    const user = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }],
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // REMOVE THIS BLOCK - Delete these lines
    // if (user.email === identifier && !user.isVerified) {
    //   return res.status(401).json({ 
    //     message: 'Your account needs verification. Please check your email for the verification code.',
    //     requiresVerification: true,
    //     email: user.email
    //   });
    // }

    // Compare password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, isAdmin: user.isAdmin },
      JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.json({
      token,
      user: {
        userId: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin || false,
        isVerified: user.isVerified  // Still include this field for information
      },
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET USER PROFILE
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password -resetPasswordOtp -resetPasswordExpires -signupVerificationOtp -signupVerificationExpires');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Get Profile Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// UPDATE USER PROFILE
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { name, email, phoneNumber, carInfo, homeAddress } = req.body;
    const updatedData = { name, email, phoneNumber, carInfo, homeAddress };

    // Remove undefined fields
    Object.keys(updatedData).forEach(
      (key) => updatedData[key] === undefined && delete updatedData[key]
    );

    const user = await User.findByIdAndUpdate(req.user.userId, updatedData, {
      new: true,
    }).select('-password -resetPasswordOtp -resetPasswordExpires -signupVerificationOtp -signupVerificationExpires');

    res.json(user);
  } catch (err) {
    console.error('Update Profile Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// ADMIN-ONLY: Get all users
router.get('/allUsers', authenticateToken, async (req, res) => {
  try {
    if (!req.user?.isAdmin) {
      return res.status(403).json({ message: 'Admin only' });
    }
    const users = await User.find({}).select('-password -resetPasswordOtp -resetPasswordExpires -signupVerificationOtp -signupVerificationExpires');
    res.json(users);
  } catch (err) {
    console.error('allUsers Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

/**
 * POST /user/pushtoken
 * Store the Expo push token for the current logged-in user
 */
router.post('/pushtoken', authenticateToken, async (req, res) => {
  const { expoPushToken } = req.body;
  if (!expoPushToken) {
    return res.status(400).json({ message: 'Expo push token is required.' });
  }

  try {
    const userDoc = await User.findById(req.user.userId);
    if (!userDoc) {
      return res.status(404).json({ message: 'User not found.' });
    }

    userDoc.expoPushToken = expoPushToken;
    await userDoc.save();

    return res.json({ message: 'Expo push token saved successfully.' });
  } catch (error) {
    console.error('Error saving push token:', error);
    return res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// ---------------------------------------------
// Forgot Password / OTP routes
// ---------------------------------------------

// Request password reset OTP
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found with this email address' });
    }

    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated OTP:', otp); // Debug log

    // Store OTP and expiration (60 minutes)
    user.resetPasswordOtp = otp;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 60 min
    await user.save();

    // Send OTP via email
    try {
      const emailResult = await emailService.sendPasswordResetEmail(email, otp);
      if (emailResult.success) {
        console.log(`Password reset email sent to ${email}. OTP: ${otp}`);
      } else {
        console.error(`Failed to send password reset email to ${email}:`, emailResult.error);
      }
    } catch (emailError) {
      console.error('Password reset email failed:', emailError);
      return res.status(500).json({ message: 'Failed to send reset code email. Please try again.' });
    }

    res.status(200).json({ message: 'Password reset code sent to your email' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Find user with matching OTP and check if still valid
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    console.error('Error in verify-otp:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Find user and check OTP is still valid
    const user = await User.findOne({
      email,
      resetPasswordOtp: otp,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear reset fields
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error in reset-password:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// ---------------------------------------------
// Email Testing Routes
// ---------------------------------------------

// Check email system status
router.get('/email-status', (req, res) => {
  try {
    res.send(`
      <h1>Email System Status</h1>
      <h2>Configuration</h2>
      <ul>
        <li><strong>Provider:</strong> ${process.env.EMAIL_PROVIDER || 'sendgrid'}</li>
        <li><strong>From address:</strong> ${process.env.EMAIL_FROM}</li>
        <li><strong>Admin address:</strong> ${process.env.ADMIN_EMAIL || process.env.EMAIL_FROM}</li>
        <li><strong>SendGrid API Key:</strong> ${process.env.SENDGRID_API_KEY ? '[Set]' : '[Not Set]'}</li>
      </ul>
      
      <h2>Test Email Options</h2>
      <ul>
        <li><a href="/auth/test-welcome">Test Welcome Email</a></li>
        <li><a href="/auth/test-reset">Test Password Reset Email</a></li>
        <li><a href="/auth/test-contact">Test Contact Form Email</a></li>
        <li><a href="/auth/test-booking">Test Booking Confirmation Email</a></li>
        <li><a href="/auth/test-verification">Test Signup Verification Email</a></li>
        <li><a href="/auth/test-sendgrid-direct">Test SendGrid API Directly</a></li>
      </ul>
    `);
  } catch (error) {
    console.error('Error getting email status:', error);
    res.status(500).send(`
      <h1>Error Getting Email Status</h1>
      <p>${error.message}</p>
    `);
  }
});

// Test welcome email
router.get('/test-welcome', async (req, res) => {
  try {
    const result = await emailService.sendWelcomeEmail({
      name: 'Test User',
      email: process.env.EMAIL_FROM
    });
    
    if (result.success) {
      res.send(`
        <h1>Welcome Email Sent!</h1>
        <p>A welcome email has been sent to ${process.env.EMAIL_FROM} using ${process.env.EMAIL_PROVIDER || 'sendgrid'}.</p>
        <p>Message ID: ${result.messageId}</p>
        <p>Check your inbox to verify delivery.</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Email Test Failed</h1>
        <p>Error: ${result.error}</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send(`
      <h1>Email Test Failed</h1>
      <p>Error: ${error.message}</p>
      <p><a href="/auth/email-status">Back to Email Status</a></p>
    `);
  }
});

// Test verification email
router.get('/test-verification', async (req, res) => {
  try {
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await emailService.sendSignupVerificationEmail(
      process.env.EMAIL_FROM,
      testOtp,
      'Test User'
    );
    
    if (result.success) {
      res.send(`
        <h1>Verification Email Sent!</h1>
        <p>A signup verification email with OTP <strong>${testOtp}</strong> has been sent to ${process.env.EMAIL_FROM}.</p>
        <p>Message ID: ${result.messageId}</p>
        <p>Check your inbox to verify delivery.</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Email Test Failed</h1>
        <p>Error: ${result.error}</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send(`
      <h1>Email Test Failed</h1>
      <p>Error: ${error.message}</p>
      <p><a href="/auth/email-status">Back to Email Status</a></p>
    `);
  }
});

// Test password reset email
router.get('/test-reset', async (req, res) => {
  try {
    const testOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const result = await emailService.sendPasswordResetEmail(
      process.env.EMAIL_FROM,
      testOtp
    );
    
    if (result.success) {
      res.send(`
        <h1>Password Reset Email Sent!</h1>
        <p>A password reset email with OTP <strong>${testOtp}</strong> has been sent to ${process.env.EMAIL_FROM}.</p>
        <p>Message ID: ${result.messageId}</p>
        <p>Check your inbox to verify delivery.</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Email Test Failed</h1>
        <p>Error: ${result.error}</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send(`
      <h1>Email Test Failed</h1>
      <p>Error: ${error.message}</p>
      <p><a href="/auth/email-status">Back to Email Status</a></p>
    `);
  }
});

// Test contact form emails
router.get('/test-contact', async (req, res) => {
  try {
    const testFormData = {
      name: 'Test Contact',
      email: process.env.EMAIL_FROM,
      phone: '(123) 456-7890',
      message: 'This is a test message from the email testing system.\nMultiple lines to test formatting.'
    };
    
    const result = await emailService.sendContactFormEmail(testFormData);
    
    if (result.success) {
      res.send(`
        <h1>Contact Form Emails Sent!</h1>
        <p>Two emails have been sent:</p>
        <ul>
          <li>Admin notification (to ${process.env.ADMIN_EMAIL || process.env.EMAIL_FROM})</li>
          <li>User confirmation (to ${process.env.EMAIL_FROM})</li>
        </ul>
        <p>Admin Message ID: ${result.adminMessageId}</p>
        <p>User Message ID: ${result.userMessageId}</p>
        <p>Check your inbox to verify delivery.</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Email Test Failed</h1>
        <p>Error: ${result.error}</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send(`
      <h1>Email Test Failed</h1>
      <p>Error: ${error.message}</p>
      <p><a href="/auth/email-status">Back to Email Status</a></p>
    `);
  }
});

// Test booking confirmation email
router.get('/test-booking', async (req, res) => {
  try {
    const testBooking = {
      customerName: 'Test Customer',
      email: process.env.EMAIL_FROM,
      date: 'May 15, 2025',
      time: '2:00 PM',
      address: '123 Test Street, Toronto, ON',
      services: ['Full Interior Detailing', 'Exterior Wash & Wax'],
      addons: ['Pet Hair Removal', 'Odor Treatment'],
      total: '249.99'
    };
    
    const result = await emailService.sendBookingConfirmationEmail(testBooking);
    
    if (result.success) {
      res.send(`
        <h1>Booking Confirmation Email Sent!</h1>
        <p>A booking confirmation email has been sent to ${process.env.EMAIL_FROM}.</p>
        <p>Message ID: ${result.messageId}</p>
        <p>Check your inbox to verify delivery.</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    } else {
      res.status(500).send(`
        <h1>Email Test Failed</h1>
        <p>Error: ${result.error}</p>
        <p><a href="/auth/email-status">Back to Email Status</a></p>
      `);
    }
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).send(`
      <h1>Email Test Failed</h1>
      <p>Error: ${error.message}</p>
      <p><a href="/auth/email-status">Back to Email Status</a></p>
    `);
  }
});

// Direct SendGrid API test route
const sgMail = require('@sendgrid/mail');

router.get('/test-sendgrid-direct', async (req, res) => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      return res.status(500).send('SendGrid API key not configured');
    }
    
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    
    // Generate test email with timestamp to avoid duplicate filters
    const timestamp = new Date().toISOString();
    const msg = {
      to: process.env.EMAIL_FROM, // Send to the from email as a test
      from: process.env.EMAIL_FROM,
      subject: `SendGrid Direct Test ${timestamp}`,
      text: `This is a direct test of SendGrid API at ${timestamp}`,
      html: `<strong>This is a direct test of SendGrid API at ${timestamp}</strong>`,
    };
    
    console.log('Attempting direct SendGrid send...');
    await sgMail.send(msg);
    console.log('Direct SendGrid send successful');
    
    res.send(`
      <h1>Direct SendGrid Test</h1>
      <p>Test email sent directly via SendGrid API to ${process.env.EMAIL_FROM}</p>
      <p>Check your inbox or spam folder.</p>
      <p><strong>Important:</strong> If this test works but regular emails don't, 
      it confirms that your emailservices.js needs to switch to the SendGrid API method.</p>
    `);
  } catch (error) {
    console.error('SendGrid direct test error:', error);
    res.status(500).send(`
      <h1>SendGrid Direct Test Failed</h1>
      <p>Error: ${error.toString()}</p>
      <p>Response body: ${error.response?.body ? JSON.stringify(error.response.body) : 'No response body'}</p>
    `);
  }
});

module.exports = {
  router,
  authenticateToken
};
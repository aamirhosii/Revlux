// services/emailService.js
const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

// If SendGrid API key is available, configure it
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('Using SendGrid API for email delivery');
}

/**
 * Create a Nodemailer transporter as fallback:
 * - Only used if SendGrid API fails or is not available
 */
const createTransporter = () => {
  if (process.env.EMAIL_FROM && process.env.EMAIL_PASSWORD) {
    console.log('Using Gmail as fallback email provider');
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_FROM,
        pass: process.env.EMAIL_PASSWORD
      }
    });
  }
  
  // For development/testing only - create ethereal test account
  return null; // Will create an Ethereal account on demand if needed
};

const fallbackTransporter = createTransporter();

/**
 * Send email using SendGrid API or fallback to nodemailer
 */
async function sendEmail(mailOptions) {
  try {
    // Try SendGrid API first if configured
    if (process.env.SENDGRID_API_KEY) {
      const msg = {
        to: mailOptions.to,
        from: mailOptions.from,
        subject: mailOptions.subject,
        html: mailOptions.html,
        replyTo: mailOptions.replyTo
      };
      
      await sgMail.send(msg);
      return { success: true, messageId: `sg_${Date.now()}` };
    }
    
    // Fallback to nodemailer/Gmail if SendGrid not configured
    if (fallbackTransporter) {
      const info = await fallbackTransporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    }
    
    // For development only - create test account on demand
    console.log('Creating Ethereal test account for email testing');
    const testAccount = await nodemailer.createTestAccount();
    const testTransporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
    
    const info = await testTransporter.sendMail(mailOptions);
    console.log('Test email URL: %s', nodemailer.getTestMessageUrl(info));
    return { success: true, messageId: info.messageId, testUrl: nodemailer.getTestMessageUrl(info) };
  } catch (error) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send a welcome email to a newly registered user
 */
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: user.email,
      subject: 'Welcome to Shelby Auto Detailing!',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Welcome to Shelby Auto Detailing!</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for joining Shelby Auto Detailing! We're excited to have you on board.</p>
          <p>You can now book our premium detailing services through the app.</p>
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          <p>Best regards,<br>The Shelby Auto Detailing Team</p>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`Welcome email sent to: ${user.email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send signup verification OTP code to user
 */
const sendSignupVerificationEmail = async (email, otp, name) => {
  try {
    const mailOptions = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Verify Your Shelby Auto Detailing Account',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Verify Your Account</h2>
          <p>Hello ${name || ''},</p>
          <p>Please use the verification code below to complete your registration:</p>
          <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:24px;letter-spacing:5px;font-weight:bold;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`Signup verification email sent to: ${email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending signup verification email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset OTP code to user
 */
const sendPasswordResetEmail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'Your Shelby Auto Detailing Password Reset Code',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Shelby Auto Detailing account. Use the code below:</p>
          <div style="background:#f4f4f4;padding:15px;text-align:center;font-size:24px;letter-spacing:5px;font-weight:bold;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`Password reset email sent to: ${email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a notification to the admin about a new contact form submission
 */
const sendContactFormEmail = async (formData) => {
  try {
    const { name, email, message, phone } = formData;
    
    // Email to Admin
    const adminMail = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      replyTo: email,
      subject: 'New Contact Form Submission - Shelby Auto Detailing',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <h3>Message:</h3>
          <p>${message ? message.replace(/\n/g, '<br>') : 'No message provided'}</p>
        </div>
      `
    };
    
    const adminResult = await sendEmail(adminMail);
    if (adminResult.success) {
      console.log(`Contact form notification sent to admin from: ${email}`);
    }

    // Confirmation back to user
    const userConfirm = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: email,
      subject: 'We Received Your Message - Shelby Auto Detailing',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>We Received Your Message</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting Shelby Auto Detailing. We have received your message and will get back to you soon.</p>
          <p>Best regards,<br>The Shelby Auto Detailing Team</p>
        </div>
      `
    };
    
    const userResult = await sendEmail(userConfirm);
    if (userResult.success) {
      console.log(`Contact confirmation sent to: ${email}`);
    }

    return {
      success: adminResult.success && userResult.success,
      adminMessageId: adminResult.messageId,
      userMessageId: userResult.messageId
    };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email to customer
 */
const sendBookingConfirmationEmail = async (booking) => {
  try {
    const mailOptions = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: booking.email,
      subject: 'Your Shelby Auto Detailing Booking Confirmation',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>Your Booking is Confirmed!</h2>
          <p>Hello ${booking.customerName || 'Valued Customer'},</p>
          <p>Your appointment has been confirmed with the following details:</p>
          <div style="background:#f4f4f4;padding:15px;margin:20px 0;">
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Address:</strong> ${booking.address}</p>
          </div>
          <h3>Services:</h3>
          <ul>
            ${(booking.services || []).map(s => `<li>${s}</li>`).join('')}
          </ul>
          <h3>Add-ons:</h3>
          ${(booking.addons && booking.addons.length)
            ? `<ul>${booking.addons.map(a => `<li>${a}</li>`).join('')}</ul>`
            : '<p>None</p>'}
          <p><strong>Total:</strong> $${booking.total}</p>
          <p>If you need to make any changes, please call us at (416) 567-3082.</p>
          <p>Thank you for choosing Shelby Auto Detailing!</p>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`Booking confirmation email sent to: ${booking.email}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking assignment notification to an employee
 */
const sendEmployeeAssignedEmail = async (employee, booking) => {
  try {
    const mailOptions = {
      from: `Shelby Auto Detailing <${process.env.EMAIL_FROM}>`,
      to: employee.email,
      subject: 'New Job Assignment - Shelby Auto Detailing',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
          <h2>New Job Assignment</h2>
          <p>Hello ${employee.name},</p>
          <p>You have been assigned to a new job with the following details:</p>
          <div style="background:#f4f4f4;padding:15px;margin:20px 0;">
            <p><strong>Customer:</strong> ${booking.customerName}</p>
            <p><strong>Date:</strong> ${booking.date}</p>
            <p><strong>Time:</strong> ${booking.time}</p>
            <p><strong>Address:</strong> ${booking.address}</p>
          </div>
          <h3>Services:</h3>
          <ul>
            ${(booking.services || []).map(s => `<li>${s}</li>`).join('')}
          </ul>
          ${(booking.addons && booking.addons.length > 0)
            ? `<h3>Add-ons:</h3><ul>${booking.addons.map(a => `<li>${a}</li>`).join('')}</ul>`
            : ''}
          <p>Please review the details in the app.</p>
          <p>Best regards,<br>The Shelby Auto Detailing Team</p>
        </div>
      `
    };
    
    const result = await sendEmail(mailOptions);
    if (result.success) {
      console.log(`Employee assignment email sent to: ${employee.email} for booking ${booking._id}`);
    }
    return result;
  } catch (error) {
    console.error('Error sending employee assignment email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWelcomeEmail,
  sendSignupVerificationEmail,
  sendPasswordResetEmail,
  sendContactFormEmail,
  sendBookingConfirmationEmail,
  sendEmployeeAssignedEmail // Added the new function to exports
};
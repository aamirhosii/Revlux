const nodemailer = require('nodemailer');

// Global variable to store the test account
let testAccount = null;

/**
 * Create test account and email transport
 */
async function createTestTransport() {
  console.log('Creating Ethereal test account for email testing...');
  
  try {
    // Generate test SMTP service account
    testAccount = await nodemailer.createTestAccount();
    console.log('Ethereal Email test account created:', testAccount.user);
    console.log('Ethereal Email password:', testAccount.pass);
    console.log('Web Interface URL: https://ethereal.email/login');
    console.log('Use the above credentials to log in and view all test emails');

    // Create reusable transporter
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });

    return { transporter, testAccount };
  } catch (error) {
    console.error('Failed to create Ethereal test account:', error);
    throw error;
  }
}

// Create one transporter instance for the module
const transporterPromise = createTestTransport();

/**
 * Send a welcome email to a newly registered user
 * @param {Object} user - User object containing name and email
 * @returns {Promise}
 */
const sendWelcomeEmail = async (user) => {
  try {
    // Wait for the transporter to be created
    const { transporter } = await transporterPromise;
    
    const mailOptions = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: user.email,
      subject: 'Welcome to Shelby Auto Detailing!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Welcome to Shelby Auto Detailing!</h2>
          <p>Hello ${user.name},</p>
          <p>Thank you for joining Shelby Auto Detailing! We're excited to have you on board.</p>
          <p>You can now book our premium detailing services through the app.</p>
          <p>If you have any questions, feel free to reply to this email or contact our support team.</p>
          <p>Best regards,<br>The Shelby Auto Detailing Team</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to: ${user.email}`);
    console.log('Message ID:', info.messageId);
    
    // Generate and log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    
    // Also log the Ethereal account info for direct access
    console.log('To view all emails, log in at https://ethereal.email/login');
    console.log('Username:', testAccount?.user);
    console.log('Password:', testAccount?.pass);
    
    return { 
      success: true, 
      previewUrl, 
      etherealUser: testAccount?.user, 
      etherealPass: testAccount?.pass,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send password reset OTP code to user
 * @param {string} email - User's email address
 * @param {string} otp - One-time password for reset
 * @returns {Promise}
 */
const sendPasswordResetEmail = async (email, otp) => {
  try {
    // Wait for the transporter to be created
    const { transporter } = await transporterPromise;
    
    const mailOptions = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: email,
      subject: 'Your Shelby Auto Detailing Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Shelby Auto Detailing account.</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't request this reset, please ignore this email.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to: ${email}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    console.log('To view all emails, log in at https://ethereal.email/login');
    console.log('Username:', testAccount?.user);
    console.log('Password:', testAccount?.pass);
    
    return { 
      success: true, 
      previewUrl, 
      etherealUser: testAccount?.user, 
      etherealPass: testAccount?.pass,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send a notification to the admin about a new contact form submission
 * @param {Object} formData - Contact form data
 * @returns {Promise}
 */
const sendContactFormEmail = async (formData) => {
  try {
    // Wait for the transporter to be created
    const { transporter } = await transporterPromise;
    
    const { name, email, message, phone } = formData;
    
    const mailOptions = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: 'admin@shelbyauto.com', // This doesn't matter for Ethereal
      replyTo: email,
      subject: 'New Contact Form Submission - Shelby Auto Detailing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone || 'Not provided'}</p>
          <h3>Message:</h3>
          <p>${message ? message.replace(/\n/g, '<br>') : 'No message provided'}</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Contact form submission forwarded from: ${email}`);
    
    const adminPreviewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Admin notification preview URL:', adminPreviewUrl);
    
    // Send confirmation to user
    const confirmationMail = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: email,
      subject: 'We Received Your Message - Shelby Auto Detailing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>We Received Your Message</h2>
          <p>Hi ${name},</p>
          <p>Thank you for contacting Shelby Auto Detailing. We have received your message and will get back to you as soon as possible.</p>
          <p>Best regards,<br>The Shelby Auto Detailing Team</p>
        </div>
      `
    };
    
    const confirmInfo = await transporter.sendMail(confirmationMail);
    console.log(`Confirmation email sent to: ${email}`);
    
    const userPreviewUrl = nodemailer.getTestMessageUrl(confirmInfo);
    console.log('User confirmation preview URL:', userPreviewUrl);
    console.log('To view all emails, log in at https://ethereal.email/login');
    console.log('Username:', testAccount?.user);
    console.log('Password:', testAccount?.pass);
    
    return { 
      success: true, 
      adminPreviewUrl,
      userPreviewUrl,
      etherealUser: testAccount?.user,
      etherealPass: testAccount?.pass,
      adminMessageId: info.messageId,
      userMessageId: confirmInfo.messageId
    };
  } catch (error) {
    console.error('Error sending contact form email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Send booking confirmation email to customer
 * @param {Object} booking - Booking data
 * @param {Object} user - User data
 * @returns {Promise}
 */
const sendBookingConfirmationEmail = async (booking, user) => {
  try {
    // Wait for the transporter to be created
    const { transporter } = await transporterPromise;
    
    const mailOptions = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: booking.email || 'customer@example.com',
      subject: 'Your Shelby Auto Detailing Booking Confirmation',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Your Booking is Confirmed!</h2>
          <p>Hello ${booking.customerName || 'Valued Customer'},</p>
          <p>Your appointment with Shelby Auto Detailing has been confirmed.</p>
          
          <div style="background-color: #f4f4f4; padding: 15px; margin: 20px 0;">
            <p><strong>Date:</strong> ${booking.date || 'As scheduled'}</p>
            <p><strong>Time:</strong> ${booking.time || 'As scheduled'}</p>
            <p><strong>Address:</strong> ${booking.address || 'As provided'}</p>
          </div>
          
          <h3>Services:</h3>
          <ul>
            ${booking.services ? booking.services.map(service => `<li>${service}</li>`).join('') : '<li>Standard service</li>'}
          </ul>
          
          <h3>Add-ons:</h3>
          ${booking.addons && booking.addons.length > 0 
            ? `<ul>${booking.addons.map(addon => `<li>${addon}</li>`).join('')}</ul>`
            : '<p>None</p>'
          }
          
          <p><strong>Total:</strong> $${booking.total || '(As quoted)'}</p>
          
          <p>If you need to make any changes to your booking, please call us at (416) 567-3082.</p>
          <p>Thank you for choosing Shelby Auto Detailing!</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Booking confirmation email sent to: ${booking.email || 'customer@example.com'}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    console.log('To view all emails, log in at https://ethereal.email/login');
    console.log('Username:', testAccount?.user);
    console.log('Password:', testAccount?.pass);
    
    return { 
      success: true, 
      previewUrl,
      etherealUser: testAccount?.user,
      etherealPass: testAccount?.pass,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get the Ethereal email dashboard credentials
 * @returns {Object} Credentials for accessing the Ethereal email dashboard
 */
const getEtherealCredentials = async () => {
  try {
    // Wait for the transporter to be created if it hasn't been created yet
    if (!testAccount) {
      const result = await transporterPromise;
      testAccount = result.testAccount;
    }
    
    return {
      user: testAccount.user,
      pass: testAccount.pass,
      url: 'https://ethereal.email/login'
    };
  } catch (error) {
    console.error('Error getting Ethereal credentials:', error);
    throw error;
  }
};

// Add this new function:

/**
 * Send signup verification OTP code to user
 * @param {string} email - User's email address
 * @param {string} otp - One-time password for verification
 * @param {string} name - User's name
 * @returns {Promise}
 */
const sendSignupVerificationEmail = async (email, otp, name) => {
  try {
    // Wait for the transporter to be created
    const { transporter } = await transporterPromise;
    
    const mailOptions = {
      from: '"Shelby Auto Detailing" <test@shelbyauto.com>',
      to: email,
      subject: 'Verify Your Shelby Auto Detailing Account',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Verify Your Account</h2>
          <p>Hello ${name || ''},</p>
          <p>Thank you for signing up with Shelby Auto Detailing. Please use the verification code below to complete your registration.</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
            ${otp}
          </div>
          <p>This code will expire in 15 minutes.</p>
          <p>If you didn't create an account, please ignore this email.</p>
        </div>
      `
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`Signup verification email sent to: ${email}`);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    console.log('Preview URL:', previewUrl);
    console.log('To view all emails, log in at https://ethereal.email/login');
    console.log('Username:', testAccount?.user);
    console.log('Password:', testAccount?.pass);
    
    return { 
      success: true, 
      previewUrl, 
      etherealUser: testAccount?.user, 
      etherealPass: testAccount?.pass,
      messageId: info.messageId
    };
  } catch (error) {
    console.error('Error sending signup verification email:', error);
    return { success: false, error: error.message };
  }
};



// Don't forget to export this new function
module.exports = {
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendContactFormEmail,
  sendBookingConfirmationEmail,
  sendSignupVerificationEmail,
  getEtherealCredentials
};
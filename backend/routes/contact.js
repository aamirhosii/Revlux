const express = require('express');
const router = express.Router();
const emailService = require('../services/emailservices');

/**
 * POST /contact
 * Submit contact form
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, message, phone } = req.body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email and message are required' });
    }
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Please provide a valid email address' });
    }
    
    // Send the contact form email
    const emailSent = await emailService.sendContactFormEmail({ 
      name, 
      email, 
      message, 
      phone 
    });
    
    if (emailSent) {
      return res.status(200).json({ 
        message: 'Your message has been sent successfully. We will get back to you soon.' 
      });
    } else {
      return res.status(500).json({ 
        message: 'Failed to send your message. Please try again later.' 
      });
    }
    
  } catch (error) {
    console.error('Contact form submission error:', error);
    return res.status(500).json({ 
      message: 'Server error, please try again later' 
    });
  }
});

// Testing route
router.get('/test', (req, res) => {
  res.json({ message: 'Contact route working' });
});

module.exports = router;
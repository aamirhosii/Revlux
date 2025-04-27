/**
 * Email configuration management
 * Centralizes all email-related configuration
 */
const emailConfig = {
    // Which email provider to use - 'sendgrid' or 'gmail'
    provider: process.env.EMAIL_PROVIDER || 'sendgrid',
    
    // Email addresses
    from: process.env.EMAIL_FROM || 'workrevlux@gmail.com',
    adminEmail: process.env.ADMIN_EMAIL || 'workrevlux@gmail.com',
    
    // Email service selection
    useProduction: true,     
    // Log configuration
    logConfig: () => {
      console.log('=========================================');
      console.log('EMAIL CONFIGURATION:');
      console.log(`- Provider: ${emailConfig.provider}`);
      console.log(`- From address: ${emailConfig.from}`);
      console.log(`- Admin address: ${emailConfig.adminEmail}`);
      
      if (emailConfig.useProduction) {
        console.log('- Mode: PRODUCTION (real emails will be sent)');
        
        if (emailConfig.provider === 'sendgrid') {
          console.log('- SendGrid API Key:', process.env.SENDGRID_API_KEY ? '[Set]' : '[Not Set]');
        }
        else if (emailConfig.provider === 'gmail') {
          console.log('- Gmail Password:', process.env.EMAIL_PASSWORD ? '[Set]' : '[Not Set]');
        }
      } else {
        console.log('- Mode: DEVELOPMENT (using Ethereal for testing)');
      }
      console.log('=========================================');
    },
    
    // Get the appropriate email service based on configuration
    getEmailService: () => {
      if (emailConfig.useProduction) {
        return require('../services/emailservices');
      } else {
        return require('../services/alternativeEmailService');
      }
    }
  };
  
  module.exports = emailConfig;
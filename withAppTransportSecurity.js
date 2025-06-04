// withAppTransportSecurity.js
const { withInfoPlist } = require('@expo/config-plugins');

module.exports = function withAppTransportSecurity(config) {
  return withInfoPlist(config, (modConfig) => {
    // Completely disable ATS for development
    modConfig.modResults.NSAppTransportSecurity = {
      // Allow all connections
      NSAllowsArbitraryLoads: true,
      
      // Allow loading arbitrary web content (important for WebViews)
      NSAllowsArbitraryLoadsInWebContent: true,
      
      // Allow local network connections
      NSAllowsLocalNetworking: true,
      
      // Add specific exception domains
      NSExceptionDomains: {
        'localhost': {
          NSExceptionAllowsInsecureHTTPLoads: true,
          NSIncludesSubdomains: true
        },
        '127.0.0.1': {
          NSExceptionAllowsInsecureHTTPLoads: true,
          NSIncludesSubdomains: true
        },
        '100.110.154.135': {
          NSExceptionAllowsInsecureHTTPLoads: true,
          NSIncludesSubdomains: true,
          NSTemporaryExceptionAllowsInsecureHTTPLoads: true
        }
      }
    };

    return modConfig;
  });
};
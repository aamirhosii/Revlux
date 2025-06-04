// filepath: /Users/ridhamshah/Documents/GitHub/Shelby-AutoDetailing-App/metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Block all backend-related files from being bundled with your React Native app
config.resolver.blockList = [
  /\/backend\/.*/,  // Block all backend files
];

module.exports = config;
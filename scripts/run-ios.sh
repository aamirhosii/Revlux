#!/bin/bash

# Navigate to the ios directory
cd ios

# Install CocoaPods dependencies
pod install

# Navigate back to the project root
cd ..

# Run the React Native app on iOS
npx react-native run-ios

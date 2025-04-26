const { Expo } = require('expo-server-sdk')
const User = require('../models/User')

const expo = new Expo()

/**
 * Send push notification to specified users
 * @param {Object} message - The message to send {title, body, data}
 * @param {Array} userIds - Array of user IDs to send to, or 'admin' to send to all admins
 */
async function sendNotification(message, userIds = []) {
  try {
    // Query for users with push tokens 
    let query = {}
    
    // Check if we should send to all admins
    if (userIds.includes('admin')) {
      query = { isAdmin: true, expoPushToken: { $exists: true, $ne: null } }
    } else {
      query = { _id: { $in: userIds }, expoPushToken: { $exists: true, $ne: null } }
    }
    
    const users = await User.find(query)
    
    // Construct notification messages
    const messages = []
    
    for (const user of users) {
      if (!Expo.isExpoPushToken(user.expoPushToken)) {
        console.error(`Invalid Expo push token: ${user.expoPushToken}`)
        continue
      }
      
      messages.push({
        to: user.expoPushToken,
        sound: 'default',
        title: message.title,
        body: message.body,
        data: message.data || {},
      })
    }
    
    // Send notifications in chunks
    const chunks = expo.chunkPushNotifications(messages)
    
    for (const chunk of chunks) {
      await expo.sendPushNotificationsAsync(chunk)
    }
    
    return true
  } catch (error) {
    console.error("Error sending notification:", error)
    throw error
  }
}

module.exports = { sendNotification }
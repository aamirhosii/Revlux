const { Expo } = require("expo-server-sdk")

// Create a new Expo SDK client
const expo = new Expo()

/**
 * Send a push notification to a specific device
 * @param {string} pushToken - The Expo push token
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Optional data to send with the notification
 */
async function sendPushNotification(pushToken, title, body, data = {}) {
  // Check if the push token is valid
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Push token ${pushToken} is not a valid Expo push token`)
    return
  }

  // Create the message
  const message = {
    to: pushToken,
    sound: "default",
    title,
    body,
    data,
  }

  try {
    const tickets = await expo.sendPushNotificationsAsync([message])
    return tickets[0]
  } catch (error) {
    console.error("Error sending push notification:", error)
    throw error
  }
}

module.exports = {
  sendPushNotification,
}

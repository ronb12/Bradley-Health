// functions/index.js - Secure Admin Push Notification Function

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const messaging = admin.messaging();

/**
 * Callable Cloud Function: sendPushToToken
 * Sends a push notification to a specific FCM token.
 * Requires the caller to be authenticated with admin privileges.
 */
exports.sendPushToToken = functions.https.onCall(async (data, context) => {
  // 🔐 Require authenticated user
  if (!context.auth || !context.auth.token.admin) {
    throw new functions.https.HttpsError(
      'permission-denied',
      'Only authenticated admins can send notifications.'
    );
  }

  // 📦 Extract payload data
  const { token, title, body, icon } = data;

  if (!token || !title || !body) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Missing token, title, or body in request.'
    );
  }

  // ✅ Construct the push message
  const message = {
    token,
    notification: {
      title,
      body,
      icon: icon || 'https://yourdomain.com/icon-192-final.png'
    },
    webpush: {
      headers: {
        Urgency: 'high'
      },
      notification: {
        icon: icon || 'https://yourdomain.com/icon-192-final.png',
        click_action: 'https://yourdomain.com/' // change to your app's root URL
      }
    }
  };

  try {
    const response = await messaging.send(message);
    console.log('✅ Notification sent:', response);
    return { success: true, messageId: response };
  } catch (err) {
    console.error('❌ Push error:', err);
    throw new functions.https.HttpsError('internal', 'Push failed: ' + err.message);
  }
});

<!-- Include Firebase Messaging SDK -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js"></script>

<script>
  // Ensure Firebase is already initialized before this point
  const messaging = firebase.messaging();
  const db = firebase.firestore();
  let currentUser;

  // Wait for user to be authenticated
  firebase.auth().onAuthStateChanged(async user => {
    if (user) {
      currentUser = user;
      try {
        await requestNotificationPermission();
      } catch (err) {
        console.error("🔕 Notification permission denied:", err.message);
      }
    }
  });

  // Request permission and get token
  async function requestNotificationPermission() {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission not granted');
    }

    const token = await messaging.getToken({
      vapidKey: 'YOUR_PUBLIC_VAPID_KEY_HERE' // Optional: If using Web Push protocol
    });

    console.log("🔔 FCM Token:", token);

    // Save token to Firestore user profile
    await db.collection("users").doc(currentUser.uid).set({
      pushToken: token
    }, { merge: true });
  }

  // Optional: handle incoming messages while app is in foreground
  messaging.onMessage(payload => {
    console.log("📥 Foreground notification:", payload);

    const { title, body, icon } = payload.notification;

    // Show a native browser notification
    new Notification(title, {
      body: body || "You have a new notification.",
      icon: icon || "/assets/icons/icon.svg"
    });
  });

  const defaultIcon = "assets/icons/icon.svg";

  // Handle incoming messages
  self.addEventListener('push', function(event) {
    if (event.data) {
      const payload = event.data.json();
      const { title, body, icon } = payload.notification;
      
      const options = {
        body: body,
        icon: icon || defaultIcon,
        badge: defaultIcon,
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: 1
        },
        actions: [
          {
            action: 'explore',
            title: 'View Details'
          },
          {
            action: 'close',
            title: 'Close'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(title, options)
      );
    }
  });
</script>

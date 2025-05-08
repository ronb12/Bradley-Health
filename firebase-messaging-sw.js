// Import Firebase scripts needed in the service worker
self.importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js');
self.importScripts('https://www.gstatic.com/firebasejs/9.22.2/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:exampleappid"
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage(payload => {
  console.log('[firebase-messaging-sw.js] Received background message', payload);

  const { title, body, icon } = payload.notification;

  self.registration.showNotification(title, {
    body: body || 'You have a new notification.',
    icon: icon || '/icon-192-final.png'
  });
});

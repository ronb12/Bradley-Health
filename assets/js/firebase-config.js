// Firebase Configuration for Bradley Health
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase services
let auth, db, storage, messaging;
let firebaseInitialized = false;

try {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = firebase.auth();
  
  // Initialize Firestore without settings to avoid warnings
  db = firebase.firestore();

  storage = firebase.storage();
  
  // Initialize messaging only if supported
  try {
    if (firebase.messaging && typeof firebase.messaging === 'function') {
      messaging = firebase.messaging();
    }
  } catch (messagingError) {
    console.log('Firebase messaging not available in this environment');
  }

  firebaseInitialized = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Firebase initialization failed:', error);
  firebaseInitialized = false;
}

// Export Firebase services
if (firebaseInitialized) {
  window.firebaseServices = {
    auth,
    db,
    storage,
    messaging
  };
} else {
  console.error('Firebase services not available');
  window.firebaseServices = {
    auth: null,
    db: null,
    storage: null,
    messaging: null
  };
}

// Global Firebase reference for compatibility
window.firebase = {
  auth: () => window.firebaseServices.auth,
  firestore: () => window.firebaseServices.db,
  messaging: () => window.firebaseServices.messaging
}; 
// Firebase Configuration for Bradley Health
const firebaseConfig = {
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:df003e4c6f2b19c350d9a4",
  measurementId: "G-R5KQLJZNS4"
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
  
  // Completely disable messaging to avoid service worker errors
  messaging = null;

  firebaseInitialized = true;
  console.log('Firebase initialized successfully (messaging disabled)');
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
    messaging: null // Always null to prevent messaging errors
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
  messaging: () => null // Always return null to prevent messaging errors
};

// Add authentication error handler
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User authenticated:', user.email);
    } else {
      console.log('User signed out');
    }
  }, (error) => {
    console.log('Authentication error (non-critical):', error.message);
  });
} 
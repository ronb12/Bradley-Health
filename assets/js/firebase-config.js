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
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
  
  // Initialize Firestore with settings before any other operations
  db = firebase.firestore();
  
  // Set Firestore settings using the newer API
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    merge: true // Use merge to avoid overriding existing settings
  });

  // Enable offline persistence after settings
  db.enablePersistence({
    synchronizeTabs: true
  }).catch((err) => {
    if (err.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.log('Persistence failed - multiple tabs open');
    } else if (err.code === 'unimplemented') {
      // Browser doesn't support persistence
      console.log('Persistence not supported by browser');
    }
  });

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

// Add authentication error handler with better offline handling
if (auth) {
  auth.onAuthStateChanged((user) => {
    if (user) {
      console.log('User authenticated:', user.email);
      // Check if we're online before trying to load profile
      if (navigator.onLine) {
        console.log('Online - can load user profile');
      } else {
        console.log('Offline - will load profile when connection restored');
      }
    } else {
      console.log('User signed out');
    }
  }, (error) => {
    console.log('Authentication error (non-critical):', error.message);
  });
}

// Add network status monitoring
window.addEventListener('online', () => {
  console.log('Network connection restored');
  // Trigger any pending operations
  if (window.authManager && window.authManager.currentUser) {
    console.log('Reloading user profile after connection restored');
    window.authManager.loadUserProfile(window.authManager.currentUser.uid);
  }
});

window.addEventListener('offline', () => {
  console.log('Network connection lost - app will work offline');
}); 
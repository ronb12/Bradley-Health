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
  
  // Set Firestore settings with better error handling and connection management
  db.settings({
    cacheSizeBytes: firebase.firestore.CACHE_SIZE_UNLIMITED,
    merge: true
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
  console.log('Firebase services available');
} else {
  console.error('Firebase services not available');
}

// Global Firebase reference for compatibility
window.firebase = {
  auth: () => window.firebaseServices.auth,
  messaging: () => null, // Always return null to prevent messaging errors
  firestore: () => window.firebaseServices.db
};

// Ensure Firebase services are available globally
if (firebaseInitialized) {
  window.firebaseServices = {
    auth,
    db,
    storage,
    messaging: null
  };
} else {
  // Create fallback services
  window.firebaseServices = {
    auth: null,
    db: null,
    storage: null,
    messaging: null
  };
}

// Add Timestamp class to firebase.firestore for compatibility
if (window.firebaseServices && window.firebaseServices.db) {
  // Create a firestore object that includes both the function and Timestamp
  const firestoreFunction = () => window.firebaseServices.db;
  firestoreFunction.Timestamp = window.firebaseServices.db.Timestamp;
  window.firebase.firestore = firestoreFunction;
}

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

// Add Firestore connection error handling
if (db) {
  // Handle Firestore connection errors
  db.enableNetwork().catch(error => {
    console.log('Firestore network enable error (non-critical):', error.message);
  });
  
  // Add connection state listener with proper error handling
  try {
    const unsubscribe = db.collection('test').onSnapshot(() => {}, (error) => {
      if (error.code === 'unavailable') {
        console.log('Firestore temporarily unavailable - will retry automatically');
      } else if (error.code === 'permission-denied') {
        console.log('Firestore permission denied - user may need to sign in');
      } else {
        console.log('Firestore error (non-critical):', error.message);
      }
    });
  } catch (error) {
    console.log('Firestore snapshot setup error (non-critical):', error.message);
  }
}

// Add network status monitoring
window.addEventListener('online', () => {
  console.log('Network connection restored');
  // Re-enable Firestore network
  if (db) {
    db.enableNetwork().then(() => {
      console.log('Firestore network re-enabled');
    }).catch(error => {
      console.log('Firestore network re-enable error:', error.message);
    });
  }
  // Trigger any pending operations
  if (window.authManager && window.authManager.currentUser) {
    console.log('Reloading user profile after connection restored');
    window.authManager.loadUserProfile(window.authManager.currentUser.uid);
  }
});

window.addEventListener('offline', () => {
  console.log('Network connection lost - app will work offline');
  // Disable Firestore network to prevent connection errors
  if (db) {
    db.disableNetwork().then(() => {
      console.log('Firestore network disabled for offline mode');
    }).catch(error => {
      console.log('Firestore network disable error:', error.message);
    });
  }
});

// Add page visibility change handler to manage Firebase connections
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    // Page is hidden, can disable network to save resources
    if (db) {
      db.disableNetwork().catch(error => {
        console.log('Firestore network disable error:', error.message);
      });
    }
  } else {
    // Page is visible, re-enable network
    if (db && navigator.onLine) {
      db.enableNetwork().catch(error => {
        console.log('Firestore network enable error:', error.message);
      });
    }
  }
}); 
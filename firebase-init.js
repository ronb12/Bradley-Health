// js/firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:exampleappid"
};

// Wait for Firebase SDKs to load
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('Firebase SDKs not loaded. Retrying in 1 second...');
    setTimeout(initializeFirebase, 1000);
    return;
  }

  if (!firebase.apps.length) {
    try {
      firebase.initializeApp(firebaseConfig);
      console.log('✅ Firebase initialized successfully');
    } catch (error) {
      console.error('❌ Firebase initialization error:', error);
    }
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  let currentUser = null;

  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      console.log(user.isAnonymous ? "✅ Anonymous session" : "✅ Signed in:", user.email || user.uid);
    } else {
      console.warn("⚠️ No user session. Awaiting login...");
    }
  });

  // Make auth and db available globally
  window.auth = auth;
  window.db = db;
  window.currentUser = currentUser;
}

// Start initialization
initializeFirebase();

function loginWithEmail(email, password) {
  if (!window.auth) {
    console.error('Auth not initialized');
    return;
  }

  window.auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("✅ Email login successful:", email);
      window.location.href = "dashboard.html";
    })
    .catch(err => {
      console.error("❌ Email login failed:", err.message);
      alert("Login failed: " + err.message);
    });
}

function logout() {
  if (!window.auth) {
    console.error('Auth not initialized');
    return;
  }

  window.auth.signOut().then(() => {
    console.log("🔓 Logged out");
    window.location.href = "login.html";
  });
}

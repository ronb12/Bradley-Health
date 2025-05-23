// js/firebase-init.js
const firebaseConfig = {
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:exampleappid"
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
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
    // Removed anonymous login fallback
  }
});

function loginWithEmail(email, password) {
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      console.log("✅ Email login successful:", email);
      window.location.href = "dashboard.html"; // Change to your landing page
    })
    .catch(err => {
      console.error("❌ Email login failed:", err.message);
      alert("Login failed: " + err.message);
    });
}

function logout() {
  auth.signOut().then(() => {
    console.log("🔓 Logged out");
    window.location.href = "login.html"; // Optional: redirect to login page
  });
}

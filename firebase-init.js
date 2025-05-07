// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:exampleappid" // Replace with your real appId if needed
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
let currentUser = null;

// Enable anonymous Firebase Authentication
firebase.auth().onAuthStateChanged(user => {
  if (user) {
    currentUser = user;
    console.log("✅ Authenticated as:", user.uid);
  } else {
    firebase.auth().signInAnonymously()
      .catch(error => {
        console.error("❌ Auth error:", error.message);
      });
  }
});

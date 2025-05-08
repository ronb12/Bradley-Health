<!-- Include Firebase SDKs -->
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-app-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-auth-compat.js"></script>
<script src="https://www.gstatic.com/firebasejs/9.22.2/firebase-firestore-compat.js"></script>

<script>
  // ✅ Firebase configuration
  const firebaseConfig = {
    apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
    authDomain: "bradley-health.firebaseapp.com",
    projectId: "bradley-health",
    storageBucket: "bradley-health.appspot.com",
    messagingSenderId: "294249919277",
    appId: "1:294249919277:web:exampleappid"
  };

  // ✅ Initialize Firebase only once
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }

  const auth = firebase.auth();
  const db = firebase.firestore();
  let currentUser = null;

  // ✅ Auth listener: tracks email or anonymous user
  auth.onAuthStateChanged(user => {
    if (user) {
      currentUser = user;
      console.log(user.isAnonymous ? "✅ Anonymous session" : "✅ Signed in:", user.email || user.uid);
    } else {
      console.warn("⚠️ No user session found, signing in anonymously...");
      auth.signInAnonymously().catch(err => console.error("❌ Anonymous auth failed:", err.message));
    }
  });

  // ✅ Optional: Login function for email + password
  function loginWithEmail(email, password) {
    auth.signInWithEmailAndPassword(email, password)
      .then(userCred => {
        console.log("✅ Email login successful:", userCred.user.email);
      })
      .catch(err => {
        console.error("❌ Email login failed:", err.message);
        alert("Login failed: " + err.message);
      });
  }

  // ✅ Optional: Logout function
  function logout() {
    auth.signOut().then(() => {
      console.log("🔓 Logged out");
    });
  }
</script>

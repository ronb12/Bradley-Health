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
    console.log(user.isAnonymous ? \"✅ Anonymous session\" : \"✅ Signed in:\", user.email || user.uid);
  } else {
    auth.signInAnonymously().catch(err => console.error(\"❌ Anonymous auth failed:\", err.message));
  }
});

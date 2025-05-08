firebase.auth().onAuthStateChanged(async user => {
  if (user) {
    console.log("✅ User signed in:", user.email || user.uid);
    
    // Store user globally
    currentUser = user;

    // Optional: Check admin claims
    const idTokenResult = await user.getIdTokenResult();
    if (idTokenResult.claims.admin) {
      console.log("🔐 Admin access granted");
      // You can show admin-only UI here
    }

    // Optional: Load user-specific data
    loadDashboard();  // Call your custom function

  } else {
    console.warn("⚠️ No user session. Redirecting to login...");
    window.location.href = "login.html";
  }
});

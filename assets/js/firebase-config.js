// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
    authDomain: "bradley-health.firebaseapp.com",
    projectId: "bradley-health",
    storageBucket: "bradley-health.appspot.com",
    messagingSenderId: "294249919277",
    appId: "1:294249919277:web:df003e4c6f2b19c350d9a4",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    try {
        // Initialize Firebase if not already initialized
        if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        }
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        // Show user-friendly error message
        document.body.innerHTML = `
            <div class="error-message" style="margin: 20px; padding: 20px; border-radius: 8px; background: #fee2e2; color: #991b1b;">
                <h2>Configuration Error</h2>
                <p>${error.message}</p>
                <p>Please contact support or check your Firebase configuration.</p>
            </div>
        `;
    }
} else {
    console.error('❌ Firebase SDK not loaded');
} 
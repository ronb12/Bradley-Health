// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx",
    authDomain: "bradley-health.firebaseapp.com",
    projectId: "bradley-health",
    storageBucket: "bradley-health.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890",
    measurementId: "G-XXXXXXXXXX"
};

// Initialize Firebase
if (typeof firebase !== 'undefined') {
    firebase.initializeApp(firebaseConfig);
    console.log('✅ Firebase initialized successfully');
} else {
    console.error('❌ Firebase SDK not loaded');
} 
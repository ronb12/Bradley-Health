// Firebase SDK loading and initialization
const loadFirebaseSDK = async () => {
    // Check if Firebase is already loaded and initialized
    if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
        console.log('✅ Firebase already initialized');
        return true;
    }
    
    const sdkUrls = [
        'https://www.gstatic.com/firebasejs/9.6.1/firebase-app-compat.js',
        'https://www.gstatic.com/firebasejs/9.6.1/firebase-auth-compat.js',
        'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore-compat.js'
    ];

    const loadScript = (url) => {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.async = true;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load ${url}`));
            document.head.appendChild(script);
        });
    };

    try {
        // Load all Firebase SDKs
        await Promise.all(sdkUrls.map(loadScript));
        console.log('✅ Firebase SDKs loaded successfully');

        // Check if Firebase config is available
        if (typeof firebaseConfig === 'undefined') {
            throw new Error('Firebase configuration is missing');
        }

        // Initialize Firebase if not already initialized
        if (typeof firebase !== 'undefined' && (!firebase.apps || !firebase.apps.length)) {
            firebase.initializeApp(firebaseConfig);
            console.log('✅ Firebase initialized successfully');
        }

        return true;
    } catch (error) {
        console.error('❌ Firebase initialization error:', error);
        throw error;
    }
};

// Export the initialization function
window.initializeFirebase = loadFirebaseSDK; 
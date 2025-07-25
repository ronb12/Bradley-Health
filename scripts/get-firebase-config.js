const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function getFirebaseConfig() {
  try {
    console.log('🔍 Getting Firebase project configuration...');
    
    // Check if service account key exists
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account key not found!');
      return;
    }

    const serviceAccount = require('./serviceAccountKey.json');
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: 'bradley-health'
    });

    console.log('✅ Firebase Admin SDK initialized successfully');

    // Get project information
    const projectId = serviceAccount.project_id;
    const authDomain = `${projectId}.firebaseapp.com`;
    const storageBucket = `${projectId}.appspot.com`;

    console.log('\n📋 Firebase Project Information:');
    console.log(`   Project ID: ${projectId}`);
    console.log(`   Auth Domain: ${authDomain}`);
    console.log(`   Storage Bucket: ${storageBucket}`);

    console.log('\n⚠️  IMPORTANT: You need to get the API key from Firebase Console');
    console.log('📋 Steps to get your API key:');
    console.log('1. Go to https://console.firebase.google.com/');
    console.log('2. Select your project: bradley-health');
    console.log('3. Go to Project Settings (gear icon)');
    console.log('4. Go to General tab');
    console.log('5. Scroll down to "Your apps" section');
    console.log('6. If no web app exists, click "Add app" and choose Web');
    console.log('7. Copy the apiKey from the configuration');

    console.log('\n🔧 Here\'s the updated firebase-config.js template:');
    console.log('```javascript');
    console.log('// Firebase Configuration for Bradley Health');
    console.log('const firebaseConfig = {');
    console.log(`  apiKey: "YOUR_API_KEY_HERE", // Get this from Firebase Console`);
    console.log(`  authDomain: "${authDomain}",`);
    console.log(`  projectId: "${projectId}",`);
    console.log(`  storageBucket: "${storageBucket}",`);
    console.log('  messagingSenderId: "YOUR_SENDER_ID", // Get this from Firebase Console');
    console.log('  appId: "YOUR_APP_ID", // Get this from Firebase Console');
    console.log('  measurementId: "YOUR_MEASUREMENT_ID" // Get this from Firebase Console');
    console.log('};');
    console.log('```');

    // Test authentication
    console.log('\n🧪 Testing authentication...');
    const listUsersResult = await admin.auth().listUsers();
    console.log(`✅ Authentication working - Found ${listUsersResult.users.length} users`);

    // Clean up
    await admin.app().delete();
    
  } catch (error) {
    console.error('❌ Error getting Firebase config:', error.message);
  }
}

// Run the function
getFirebaseConfig(); 
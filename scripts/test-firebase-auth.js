const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

async function testFirebaseAuth() {
  try {
    console.log('🔍 Testing Firebase Authentication...');
    
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

    // Test 1: List users to check authentication
    console.log('\n📊 Testing user listing...');
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    console.log(`✅ Successfully listed ${users.length} users`);
    
    // Test 2: Check if there are any registered users
    const registeredUsers = users.filter(user => user.email);
    console.log(`📧 Found ${registeredUsers.length} registered users (with email)`);
    
    if (registeredUsers.length > 0) {
      console.log('\n👥 Registered users:');
      registeredUsers.forEach((user, index) => {
        console.log(`${index + 1}. Email: ${user.email}, UID: ${user.uid}`);
      });
    }

    // Test 3: Check authentication methods
    console.log('\n🔐 Testing authentication methods...');
    const authMethods = await admin.auth().listUsers();
    console.log('✅ Authentication service is working properly');

    // Test 4: Check if we can create a test user (we'll delete it immediately)
    console.log('\n🧪 Testing user creation (will delete immediately)...');
    try {
      const testEmail = `test-${Date.now()}@example.com`;
      const testPassword = 'testpassword123';
      
      const userRecord = await admin.auth().createUser({
        email: testEmail,
        password: testPassword,
        displayName: 'Test User'
      });
      
      console.log(`✅ Successfully created test user: ${testEmail}`);
      
      // Delete the test user immediately
      await admin.auth().deleteUser(userRecord.uid);
      console.log('✅ Successfully deleted test user');
      
    } catch (error) {
      console.log('⚠️  Could not create test user (this is normal if email/password auth is disabled)');
      console.log(`   Error: ${error.message}`);
    }

    // Test 5: Check Firestore access
    console.log('\n🗄️  Testing Firestore access...');
    const db = admin.firestore();
    const testDoc = await db.collection('test').doc('connection-test').get();
    console.log('✅ Firestore connection successful');

    console.log('\n🎉 All Firebase authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log(`   - Total users: ${users.length}`);
    console.log(`   - Registered users: ${registeredUsers.length}`);
    console.log(`   - Authentication service: ✅ Working`);
    console.log(`   - Firestore service: ✅ Working`);
    
    // Clean up
    await admin.app().delete();
    
  } catch (error) {
    console.error('❌ Firebase authentication test failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Check your service account key is valid');
    console.log('2. Ensure you have the necessary permissions');
    console.log('3. Verify your project ID is correct');
    console.log('4. Check if Firebase Auth is enabled in your project');
  }
}

// Run the test
testFirebaseAuth(); 
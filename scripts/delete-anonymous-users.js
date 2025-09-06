const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Firebase project configuration
const projectId = 'bradley-health';

// Initialize Firebase Admin SDK
// You'll need to download your service account key from Firebase Console
// Go to Project Settings > Service Accounts > Generate New Private Key
// Save it as 'serviceAccountKey.json' in the scripts folder

async function deleteAnonymousUsers() {
  try {
    // Check if service account key exists
    const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
    if (!fs.existsSync(serviceAccountPath)) {
      console.error('❌ Service account key not found!');
      console.log('📋 To get your service account key:');
      console.log('1. Go to Firebase Console > Project Settings > Service Accounts');
      console.log('2. Click "Generate New Private Key"');
      console.log('3. Save the JSON file as "serviceAccountKey.json" in the scripts folder');
      console.log('4. Run this script again');
      return;
    }

    const serviceAccount = require('./serviceAccountKey.json');
    
    // Initialize Firebase Admin SDK
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: projectId
    });

    console.log('🔍 Searching for anonymous users...');
    
    // List all users
    const listUsersResult = await admin.auth().listUsers();
    const users = listUsersResult.users;
    
    // Filter anonymous users (users with no email and no provider data)
    const anonymousUsers = users.filter(user => {
      return !user.email && 
             (!user.providerData || user.providerData.length === 0) &&
             user.providerData.length === 0;
    });

    console.log(`📊 Found ${users.length} total users`);
    console.log(`👤 Found ${anonymousUsers.length} anonymous users`);

    if (anonymousUsers.length === 0) {
      console.log('✅ No anonymous users found to delete');
      return;
    }

    // Display anonymous users before deletion
    console.log('\n🗑️  Anonymous users to be deleted:');
    anonymousUsers.forEach((user, index) => {
      console.log(`${index + 1}. UID: ${user.uid}, Created: ${user.metadata.creationTime}`);
    });

    // Confirm deletion
    console.log('\n⚠️  WARNING: This will permanently delete all anonymous users!');
    console.log('This action cannot be undone.');
    
    // In a real scenario, you might want to add a confirmation prompt here
    // For now, we'll proceed with deletion
    
    // Delete anonymous users in batches (Firebase allows max 1000 per batch)
    const batchSize = 1000;
    let deletedCount = 0;
    
    for (let i = 0; i < anonymousUsers.length; i += batchSize) {
      const batch = anonymousUsers.slice(i, i + batchSize);
      const uids = batch.map(user => user.uid);
      
      try {
        await admin.auth().deleteUsers(uids);
        deletedCount += batch.length;
        console.log(`✅ Deleted batch ${Math.floor(i / batchSize) + 1}: ${batch.length} users`);
      } catch (error) {
        console.error(`❌ Error deleting batch ${Math.floor(i / batchSize) + 1}:`, error.message);
      }
    }

    console.log(`\n🎉 Successfully deleted ${deletedCount} anonymous users!`);
    
    // Clean up
    await admin.app().delete();
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('1. Make sure your service account key is valid');
    console.log('2. Ensure you have the necessary permissions in Firebase');
    console.log('3. Check that your project ID is correct');
  }
}

// Run the function
deleteAnonymousUsers(); 
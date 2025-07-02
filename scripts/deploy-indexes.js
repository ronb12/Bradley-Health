#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin SDK
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'bradley-health'
});

const db = admin.firestore();

async function deployIndexes() {
  try {
    console.log('🚀 Deploying Firestore indexes...');
    
    // Read the indexes configuration
    const indexesPath = path.join(__dirname, '../firestore-indexes.json');
    const indexesConfig = JSON.parse(fs.readFileSync(indexesPath, 'utf8'));
    
    console.log(`📋 Found ${indexesConfig.indexes.length} indexes to deploy`);
    
    // Deploy each index
    for (const index of indexesConfig.indexes) {
      console.log(`📝 Creating index for collection: ${index.collectionGroup}`);
      
      try {
        // Create the index using Firestore Admin SDK
        await db.createIndex(index);
        console.log(`✅ Index created successfully for ${index.collectionGroup}`);
      } catch (error) {
        if (error.code === 6) { // ALREADY_EXISTS
          console.log(`ℹ️  Index already exists for ${index.collectionGroup}`);
        } else {
          console.error(`❌ Error creating index for ${index.collectionGroup}:`, error.message);
        }
      }
    }
    
    console.log('🎉 Index deployment completed!');
    
  } catch (error) {
    console.error('❌ Error deploying indexes:', error);
    process.exit(1);
  }
}

// Run the deployment
deployIndexes().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('❌ Deployment failed:', error);
  process.exit(1);
}); 
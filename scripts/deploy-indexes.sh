#!/bin/bash

echo "🚀 Deploying Firestore indexes for Bradley Health..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI is not installed. Please install it first:"
    echo "npm install -g firebase-tools"
    exit 1
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "❌ Not logged in to Firebase. Please run:"
    echo "firebase login"
    exit 1
fi

# Deploy indexes using Firebase CLI
echo "📋 Deploying indexes from firestore-indexes.json..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Indexes deployed successfully!"
    echo "📊 You can monitor index creation in the Firebase Console:"
    echo "https://console.firebase.google.com/project/bradley-health/firestore/indexes"
else
    echo "❌ Failed to deploy indexes"
    exit 1
fi 
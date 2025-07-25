#!/bin/bash

echo "🚀 Deploying Firebase Rules and Indexes for Bradley Health..."

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

echo "📋 Deploying Firestore rules..."
firebase deploy --only firestore:rules

if [ $? -eq 0 ]; then
    echo "✅ Firestore rules deployed successfully!"
else
    echo "❌ Failed to deploy Firestore rules"
    exit 1
fi

echo "📊 Deploying Firestore indexes..."
firebase deploy --only firestore:indexes

if [ $? -eq 0 ]; then
    echo "✅ Firestore indexes deployed successfully!"
    echo ""
    echo "🎉 Firebase deployment completed!"
    echo ""
    echo "📋 Next steps:"
    echo "1. Wait 2-3 minutes for rules to take effect"
    echo "2. Wait 5-10 minutes for indexes to build"
    echo "3. Test the app features"
    echo ""
    echo "📊 Monitor progress in Firebase Console:"
    echo "https://console.firebase.google.com/project/bradley-health/firestore"
else
    echo "❌ Failed to deploy Firestore indexes"
    exit 1
fi 
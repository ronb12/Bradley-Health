#!/bin/bash

# Bradley Health - Deploy to Firebase Hosting
# This script handles both initial deployment and updates

echo "🚀 Bradley Health - Firebase Deployment Script"
echo "=============================================="

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

# Ensure we're using the correct project
echo "🔧 Setting Firebase project to bradley-health..."
firebase use bradley-health

# Sync files to public directory
echo "📁 Syncing files to public directory..."
./sync-to-public.sh

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Your app is now live at:"
    echo "   https://bradley-health.web.app"
    echo ""
    echo "📊 Firebase Console:"
    echo "   https://console.firebase.google.com/project/bradley-health/hosting"
    echo ""
    echo "🔄 Automatic deployment is now configured!"
    echo "   - Push to 'main' branch → Deploys to live site"
    echo "   - Create pull request → Creates preview"
    echo ""
    echo "📋 Next steps:"
    echo "1. Test your app at the live URL"
    echo "2. Make changes to your code"
    echo "3. Push to GitHub - deployment happens automatically!"
    echo ""
else
    echo "❌ Deployment failed. Please check the error messages above."
    exit 1
fi

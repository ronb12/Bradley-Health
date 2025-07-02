# Firebase Firestore Security Rules Setup

This guide will help you set up the correct Firestore security rules for your Bradley Health app.

## 🔐 Security Rules Overview

Your Bradley Health app uses the following Firestore collections:
- `users` - User profiles and settings
- `bloodPressure` - Blood pressure readings
- `medications` - Medication management
- `moodEntries` - Mood tracking data
- `goals` - Health goals
- `notifications` - Notification settings
- `exports` - Data exports
- `emergencyContacts` - Emergency contact information
- `healthMetrics` - Health metrics data
- `settings` - App settings

## 📋 Setup Instructions

### Step 1: Access Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **bradley-health**
3. In the left sidebar, click **Firestore Database**
4. Click on the **Rules** tab

### Step 2: Choose Your Rules

#### Option A: Secure Production Rules (Recommended)
Copy and paste the contents of `firestore.rules` into the Firebase Console rules editor.

**Features:**
- ✅ Users can only access their own data
- ✅ Secure authentication checks
- ✅ Prevents unauthorized access
- ✅ Supports all app functionality

#### Option B: Testing Rules (For Development)
Copy and paste the contents of `firestore-testing.rules` into the Firebase Console rules editor.

**Features:**
- ✅ Allows all authenticated users to read/write
- ✅ Easy to test and debug
- ⚠️ **Less secure - for testing only**

### Step 3: Publish Rules
1. Click **Publish** to save the rules
2. Wait 1-2 minutes for rules to take effect

## 🧪 Testing the Rules

After publishing the rules, test your app:

### Test 1: Blood Pressure
1. Go to Blood Pressure tab
2. Add a new reading (e.g., 120/80)
3. Should see: "Blood pressure reading saved successfully!"

### Test 2: Profile
1. Go to Profile tab
2. Fill out profile information
3. Click "Update Profile"
4. Should see: "Profile updated successfully!"

### Test 3: Medications
1. Go to Medications tab
2. Add a new medication
3. Should save without permission errors

### Test 4: Mood Tracking
1. Go to Mood tab
2. Track your mood
3. Should save successfully

## 🔧 Troubleshooting

### Error: "Missing or insufficient permissions"
- **Cause**: Rules not published or incorrect
- **Solution**: Check that rules are published and wait 2 minutes

### Error: "Permission denied"
- **Cause**: User not authenticated or rules too restrictive
- **Solution**: Ensure user is logged in and rules allow authenticated access

### Error: "Document does not exist"
- **Cause**: Trying to update a document that doesn't exist
- **Solution**: Use `set()` with merge instead of `update()`

## 📊 Rule Details

### Production Rules (`firestore.rules`)
```javascript
// Users can only access their own data
match /users/{userId} {
  allow read, write, update: if request.auth != null && request.auth.uid == userId;
}

// Blood pressure - users can only access their own readings
match /bloodPressure/{readingId} {
  allow read, write, update, delete: if request.auth != null && 
    request.auth.uid == resource.data.userId;
  allow create: if request.auth != null && 
    request.auth.uid == request.resource.data.userId;
}
```

### Testing Rules (`firestore-testing.rules`)
```javascript
// Allow all authenticated users to read/write
match /{document=**} {
  allow read, write: if request.auth != null;
}
```

## 🚀 Next Steps

1. **Start with testing rules** to ensure everything works
2. **Switch to production rules** once you're confident
3. **Monitor Firebase Console** for any permission errors
4. **Test all app features** to ensure they work with the rules

## 📞 Support

If you encounter issues:
1. Check the Firebase Console for error messages
2. Verify the user is authenticated
3. Ensure rules are published and active
4. Test with the simpler testing rules first

## 🔒 Security Notes

- **Never use testing rules in production**
- **Always require authentication**
- **Users should only access their own data**
- **Monitor Firebase Console for security alerts**
- **Regularly review and update rules as needed**

---

**Your Bradley Health app will work perfectly once these rules are set up!** 🎉 
# Firebase Firestore Indexes Setup Guide

This guide will help you create all the required Firestore indexes for the Bradley Health app.

## Required Indexes

The app requires the following composite indexes for optimal performance:

### 1. Blood Pressure Collection
- **Collection:** `bloodPressure`
- **Fields:**
  - `userId` (Ascending)
  - `timestamp` (Descending)

### 2. Medications Collection
- **Collection:** `medications`
- **Fields:**
  - `userId` (Ascending)
  - `createdAt` (Descending)

### 3. Mood Entries Collection
- **Collection:** `moodEntries`
- **Fields:**
  - `userId` (Ascending)
  - `timestamp` (Descending)

### 4. Goals Collection
- **Collection:** `goals`
- **Fields:**
  - `userId` (Ascending)
  - `createdAt` (Descending)

### 5. Reminders Collection
- **Collection:** `reminders`
- **Fields:**
  - `userId` (Ascending)
  - `scheduledTime` (Ascending)

## How to Create Indexes

### Option 1: Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/project/bradley-health/firestore/indexes

2. **Create Each Index**
   - Click "Create Index"
   - Select the collection name
   - Add the fields in the specified order
   - Set the query scope to "Collection"
   - Click "Create"

### Option 2: Firebase CLI

1. **Install Firebase CLI** (if not already installed):
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**:
   ```bash
   firebase login
   ```

3. **Deploy indexes**:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### Option 3: Automatic Script

1. **Make the script executable**:
   ```bash
   chmod +x scripts/deploy-indexes.sh
   ```

2. **Run the deployment script**:
   ```bash
   ./scripts/deploy-indexes.sh
   ```

## Index Creation Time

- **Simple indexes** (single field): Usually created within a few minutes
- **Composite indexes** (multiple fields): Can take 5-10 minutes to build
- **Large collections**: May take longer depending on data size

## Monitoring Index Creation

1. **Check status in Firebase Console**:
   - Go to Firestore → Indexes
   - Look for "Building" status
   - Wait for "Enabled" status

2. **Check for errors**:
   - If an index fails, you'll see an error message
   - Common issues: field doesn't exist, invalid field type

## Troubleshooting

### "Index already exists" Error
- This is normal if you've already created the index
- The app will work fine with existing indexes

### "Field not found" Error
- Make sure the collection has documents with the specified fields
- Check field names for typos
- Ensure field types match (string, number, timestamp, etc.)

### "Permission denied" Error
- Make sure you're logged in with the correct Firebase account
- Verify you have admin access to the project

## Testing Indexes

After creating indexes, test the app to ensure:

1. **Blood pressure readings** load without errors
2. **Medications** display in correct order
3. **Mood entries** show newest first
4. **Goals** are sorted by creation date
5. **Reminders** work properly

## Performance Benefits

These indexes will improve:
- ✅ **Query performance** - Faster data loading
- ✅ **User experience** - Reduced loading times
- ✅ **App reliability** - Fewer timeout errors
- ✅ **Scalability** - Better performance as data grows

## Support

If you encounter issues:
1. Check the Firebase Console for error messages
2. Verify all field names and types are correct
3. Ensure you have proper Firebase permissions
4. Contact support if problems persist 
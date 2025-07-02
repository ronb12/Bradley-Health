# Firebase User Management Scripts

This directory contains utility scripts for managing Firebase users in the Bradley Health project.

## Delete Anonymous Users Script

The `delete-anonymous-users.js` script allows you to delete all anonymous users from your Firebase project.

### Prerequisites

1. **Node.js** installed on your system
2. **Firebase Admin SDK** service account key

### Setup Instructions

1. **Install Dependencies**
   ```bash
   cd scripts
   npm install
   ```

2. **Get Firebase Service Account Key**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project (bradley-health)
   - Go to **Project Settings** (gear icon) → **Service Accounts**
   - Click **"Generate New Private Key"**
   - Save the downloaded JSON file as `serviceAccountKey.json` in the `scripts` folder

3. **Verify Setup**
   - Make sure `serviceAccountKey.json` is in the `scripts` folder
   - The file should contain your Firebase project credentials

### Running the Script

```bash
# Option 1: Using npm script
npm run delete-anonymous

# Option 2: Direct node execution
node delete-anonymous-users.js
```

### What the Script Does

1. **Searches** for all users in your Firebase project
2. **Identifies** anonymous users (users with no email and no provider data)
3. **Displays** a list of anonymous users before deletion
4. **Deletes** anonymous users in batches of 1000 (Firebase limit)
5. **Reports** the results

### Safety Features

- ✅ Lists all users before deletion
- ✅ Shows exactly which users will be deleted
- ✅ Processes in batches to handle large numbers
- ✅ Provides detailed error reporting
- ✅ Validates service account key exists

### Example Output

```
🔍 Searching for anonymous users...
📊 Found 150 total users
👤 Found 23 anonymous users

🗑️  Anonymous users to be deleted:
1. UID: abc123..., Created: 2024-01-15T10:30:00Z
2. UID: def456..., Created: 2024-01-16T14:20:00Z
...

⚠️  WARNING: This will permanently delete all anonymous users!
This action cannot be undone.

✅ Deleted batch 1: 23 users

🎉 Successfully deleted 23 anonymous users!
```

### Troubleshooting

**Error: Service account key not found**
- Make sure you downloaded the service account key from Firebase Console
- Ensure the file is named `serviceAccountKey.json`
- Verify it's in the `scripts` folder

**Error: Permission denied**
- Check that your service account has the necessary permissions
- Ensure you're using the correct project ID

**Error: Invalid project ID**
- Verify the project ID in the script matches your Firebase project

### Security Notes

- ⚠️ **Never commit** `serviceAccountKey.json` to version control
- ⚠️ **Keep the service account key secure** - it has full admin access
- ⚠️ **This action is irreversible** - deleted users cannot be recovered
- ⚠️ **Test in a development environment** first if possible

### Adding to .gitignore

Make sure to add the service account key to your `.gitignore`:

```
scripts/serviceAccountKey.json
``` 
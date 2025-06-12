# Bradley Health

A comprehensive medical monitoring application designed to help users track their health metrics, medications, and daily activities.

## Features

- Blood Pressure Monitoring
- Medication Tracking
- Wheelchair Movement Tracking
- Mood Tracking
- Daily Health Summaries
- Goal Setting and Progress Tracking
- Secure User Authentication
- Real-time Data Updates
- Offline Support
- Push Notifications

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Firebase account
- Git

## Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bradley-health.git
cd bradley-health
```

2. Install dependencies:
```bash
npm install
```

3. Set up Firebase:
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase configuration to `firebase-init.js`

4. Start the development server:
```bash
npm start
```

## Development

- `npm start` - Start the development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Run linting

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy to Firebase:
```bash
firebase deploy
```

## Security

- All data is encrypted in transit
- User authentication required for all operations
- Role-based access control
- Secure file upload restrictions
- Regular security audits

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@bradleyhealth.com or open an issue in the repository.

## Firebase Setup

To set up Firebase for this project:

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. In Project Settings:
   - Click on the web app icon (</>)
   - Register your app if you haven't already
   - Copy the configuration values

4. Update `assets/js/firebase-config.js` with your Firebase configuration:
```javascript
const firebaseConfig = {
    apiKey: "your_api_key",
    authDomain: "your_project_id.firebaseapp.com",
    projectId: "your_project_id",
    storageBucket: "your_project_id.appspot.com",
    messagingSenderId: "your_sender_id",
    appId: "your_app_id",
    measurementId: "your_measurement_id"
};
```

5. Enable Authentication in Firebase Console:
   - Go to Authentication > Sign-in method
   - Enable Email/Password authentication
   - Enable Google authentication
   - Enable Apple authentication (requires Apple Developer account)

6. Set up Firestore Database:
   - Go to Firestore Database
   - Create database in production mode
   - Start in test mode for development

7. Set up Storage:
   - Go to Storage
   - Initialize storage
   - Set up security rules

## Security Rules

Make sure to set up proper security rules in Firebase Console:

### Firestore Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### Storage Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
``` 
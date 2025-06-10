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
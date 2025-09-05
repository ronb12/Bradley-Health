# Bradley Health - Comprehensive Health Monitoring

A modern web application for comprehensive health monitoring, including blood pressure tracking, medication management, mood tracking, and goal setting.

## 🌟 Features

### 🔐 Authentication & Security
- **Firebase Authentication**: Secure user registration and login
- **User Profiles**: Comprehensive health profiles with emergency contacts
- **Data Privacy**: All health data is encrypted and stored securely
- **Session Management**: Automatic session handling and secure logout

### ❤️ Blood Pressure Monitoring
- **Real-time Tracking**: Log systolic, diastolic, and pulse readings
- **Smart Categorization**: Automatic classification (Normal, Elevated, High)
- **Trend Analysis**: Visual charts showing BP trends over time
- **History Management**: Complete reading history with search and filtering
- **Alerts**: Notifications for abnormal readings

### 💊 Medication Management
- **Medication Tracking**: Add, edit, and manage medications
- **Dosage Reminders**: Customizable medication reminders
- **Adherence Monitoring**: Track medication compliance
- **Refill Alerts**: Automatic refill date notifications
- **Side Effects Logging**: Record and monitor side effects

### 😊 Mood & Mental Health Tracking
- **Daily Mood Logging**: Quick mood check-ins with emoji interface
- **Detailed Tracking**: Comprehensive mood, energy, and stress monitoring
- **Trend Analysis**: Visual mood trends and patterns
- **Mental Health Insights**: AI-powered mood analysis and recommendations
- **Activity Correlation**: Link activities to mood changes

### 🎯 Goal Setting & Achievement
- **Health Goals**: Set and track wellness objectives
- **Progress Monitoring**: Visual progress indicators
- **Goal Categories**: Blood pressure, medication, exercise, diet, mental health
- **Achievement Celebrations**: Milestone recognition and motivation

### 📊 Data Analytics & Insights
- **Interactive Charts**: Chart.js powered visualizations
- **Health Trends**: Comprehensive trend analysis
- **Data Export**: CSV, JSON, and PDF export options
- **Health Reports**: Detailed health summaries and insights

### 🔔 Smart Notifications
- **Push Notifications**: Real-time health reminders
- **Customizable Alerts**: Personalized notification settings
- **Medication Reminders**: Timely medication notifications
- **Health Alerts**: Abnormal reading notifications

### 📱 Progressive Web App (PWA)
- **Offline Support**: Full functionality without internet
- **App-like Experience**: Native app feel on all devices
- **Installable**: Add to home screen on mobile and desktop
- **Background Sync**: Automatic data synchronization
- **Cross-platform**: Works on iOS, Android, Windows, macOS, Linux

### 🔄 Data Management
- **Cloud Storage**: Firebase Firestore for data persistence
- **Offline Storage**: Local caching for offline access
- **Data Export**: Multiple format export options
- **Backup & Restore**: Automatic data backup and recovery

## 🌐 Live Demo

**🚀 Primary URL (Firebase Hosting)**: https://bradley-health.web.app
**📱 Alternative URL (GitHub Pages)**: https://ronb12.github.io/Bradley-Health/

> **Note**: The Firebase-hosted version is the primary deployment with automatic updates. The GitHub Pages version is maintained as a backup.

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Firebase project (for backend services)
- Node.js (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/ronb12/Bradley-Health.git
   cd Bradley-Health
   ```

2. **Set up Firebase**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Cloud Messaging
   - Update `assets/js/firebase-config.js` with your Firebase credentials

3. **Install dependencies** (for development)
   ```bash
   npm install
   ```

4. **Start the development server**
   ```bash
   # Using Python (built-in)
   python3 -m http.server 8000
   
   # Using Node.js
   npm start
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

### Production Deployment

#### 🚀 Automatic Deployment (Recommended)

Bradley Health is configured for **automatic deployment** to Firebase Hosting:

1. **Make changes** to your code
2. **Commit and push** to main branch:
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```
3. **Automatic deployment** happens via GitHub Actions
4. **Live site updates** at https://bradley-health.web.app

#### 🛠️ Manual Deployment

1. **Quick deploy**:
   ```bash
   ./deploy-to-firebase.sh
   ```

2. **Step-by-step**:
   ```bash
   ./sync-to-public.sh
   firebase deploy --only hosting
   ```

#### 📋 Deployment Options

- **Firebase Hosting** (Primary) - https://bradley-health.web.app
- **GitHub Pages** (Backup) - https://ronb12.github.io/Bradley-Health/
- **Local Development** - http://localhost:8000

## 📁 Project Structure

```
bradley-health/
├── assets/                  # Application assets
│   ├── css/                 # Stylesheets
│   │   ├── components.css   # Main component styles
│   │   ├── theme.css        # Theme management
│   │   └── layout.css       # Layout styles
│   ├── js/                  # JavaScript modules
│   │   ├── auth.js          # Authentication system
│   │   ├── dashboard.js     # Main dashboard logic
│   │   ├── blood-pressure.js # BP tracking
│   │   ├── medication-manager.js # Medication management
│   │   ├── mood-tracker.js  # Mood tracking
│   │   ├── nutrition-tracker.js # Nutrition tracking
│   │   ├── weight-loss.js   # Weight management
│   │   ├── charts.js        # Data visualization
│   │   ├── export.js        # Data export
│   │   ├── notifications.js # Push notifications
│   │   └── firebase-config.js # Firebase setup
│   └── icons/               # App icons and images
├── public/                  # Firebase hosting directory
│   ├── index.html          # Main app (deployed version)
│   ├── manifest.json       # PWA manifest
│   ├── service-worker.js   # Service worker
│   ├── offline.html        # Offline page
│   └── assets/             # Copied assets for deployment
├── .github/workflows/       # GitHub Actions
│   ├── firebase-hosting-merge.yml      # Auto-deploy on merge
│   └── firebase-hosting-pull-request.yml # PR previews
├── scripts/                 # Utility scripts
│   ├── package.json        # Script dependencies
│   └── *.js               # Firebase management scripts
├── index.html              # Main app entry point
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker
├── offline.html            # Offline support page
├── firebase.json           # Firebase configuration
├── firestore.rules         # Database security rules
├── firestore-indexes.json  # Database indexes
├── sync-to-public.sh       # File sync script
├── deploy-to-firebase.sh   # Deployment script
├── DEPLOYMENT.md           # Deployment guide
└── README.md              # This file
```

## 🆕 Recent Updates & Improvements

### ✅ Version 1.1.1 - Latest Release

#### 🚀 **Automatic Deployment System**
- **GitHub Actions** configured for automatic deployment
- **Firebase Hosting** integration with live site at https://bradley-health.web.app
- **PR Previews** for testing changes before merging
- **File Sync Scripts** for seamless deployment management

#### 🔧 **Service Worker & PWA Enhancements**
- **Fixed caching issues** for local development and production
- **Offline support** with beautiful offline page
- **Smart path detection** for development vs production environments
- **Improved error handling** and graceful degradation

#### 🔥 **Firebase Integration Improvements**
- **Enhanced error handling** for Firestore connection issues
- **Better offline/online state management**
- **Improved authentication flow** with proper error messages
- **Optimized database queries** and caching

#### 📱 **User Experience Improvements**
- **Fixed service worker caching** for all static assets
- **Improved PWA installation** experience
- **Better error messages** and user feedback
- **Enhanced offline functionality**

### 📊 **Deployment Status**
- **✅ Firebase Hosting**: https://bradley-health.web.app (Primary)
- **✅ GitHub Pages**: https://ronb12.github.io/Bradley-Health/ (Backup)
- **✅ Local Development**: http://localhost:8000
- **✅ Automatic Deployment**: Configured and active

## 🛠️ Technology Stack

### Frontend
- **HTML5**: Semantic markup and accessibility
- **CSS3**: Modern styling with Grid and Flexbox
- **JavaScript (ES6+)**: Modern JavaScript features
- **Chart.js**: Data visualization library
- **Progressive Web App**: Offline-first architecture

### Backend
- **Firebase Authentication**: User management
- **Firestore**: NoSQL database
- **Firebase Cloud Messaging**: Push notifications
- **Firebase Hosting**: Static hosting

### Development Tools
- **GitHub Actions**: Automated deployment
- **Firebase CLI**: Deployment management
- **Service Worker**: Offline functionality
- **Git**: Version control

## 📱 Usage Guide

### First Time Setup
1. **Register Account**: Create a new account with email and password
2. **Complete Profile**: Add your basic health information
3. **Set Preferences**: Configure notification settings
4. **Add Medications**: Enter your current medications
5. **Set Goals**: Define your health objectives

### Daily Usage
1. **Dashboard**: Check your health overview
2. **Blood Pressure**: Log daily readings
3. **Medications**: Mark medications as taken
4. **Mood Check**: Log your daily mood
5. **Review Progress**: Check goal progress

### Data Management
1. **Export Data**: Download your health data
2. **View Trends**: Analyze your health patterns
3. **Set Reminders**: Configure medication reminders
4. **Update Profile**: Keep information current

## 🔧 Configuration

### Firebase Setup
```javascript
// assets/js/firebase-config.js
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Notification Settings
```javascript
// Configure in the app settings
{
  enabled: true,
  bloodPressure: true,
  medications: true,
  mood: true,
  goals: true,
  reminderTime: "08:00"
}
```

## 🧪 Testing

Run the test suite:
```bash
npm test
```

Run tests with coverage:
```bash
npm run test:coverage
```

## 📊 Performance

- **Lighthouse Score**: 95+ across all categories
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔒 Security

- **Data Encryption**: All data encrypted in transit and at rest
- **Authentication**: Secure Firebase Authentication
- **Authorization**: User-based data access control
- **HTTPS**: Secure connections only
- **CSP**: Content Security Policy headers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow the existing code style
- Write tests for new features
- Update documentation
- Ensure accessibility compliance
- Test on multiple devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🚀 Deployment Scripts

### Quick Commands

```bash
# Deploy to Firebase (recommended)
./deploy-to-firebase.sh

# Sync files to public directory
./sync-to-public.sh

# Start local development server
python3 -m http.server 8000
```

### GitHub Actions

- **Automatic Deployment**: Push to `main` branch triggers deployment
- **PR Previews**: Pull requests create preview deployments
- **Status Monitoring**: Check deployment status in GitHub Actions tab

## 🆘 Support

- **Live Demo**: https://bradley-health.web.app
- **GitHub Issues**: [Report Issues](https://github.com/ronb12/Bradley-Health/issues)
- **Firebase Console**: [Monitor Deployment](https://console.firebase.google.com/project/bradley-health/hosting)
- **GitHub Actions**: [Deployment Status](https://github.com/ronb12/Bradley-Health/actions)

## 🙏 Acknowledgments

- **Firebase**: Backend services and hosting
- **Chart.js**: Data visualization library
- **MDN Web Docs**: Web development resources
- **PWA Builder**: PWA optimization tools

## 📈 Roadmap

### Version 1.1
- [ ] Wheelchair movement tracking
- [ ] Advanced analytics dashboard
- [ ] Integration with health devices
- [ ] Family member access

### Version 1.2
- [ ] AI-powered health insights
- [ ] Telemedicine integration
- [ ] Health insurance integration
- [ ] Multi-language support

### Version 1.3
- [ ] Wearable device integration
- [ ] Advanced goal tracking
- [ ] Social features
- [ ] Health challenges

---

**Bradley Health** - Empowering better health through technology.

*Built with ❤️ for better health outcomes*

---

**Note**: This is a health monitoring application. Always consult with healthcare professionals for medical advice. 
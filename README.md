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

### 👩 Women's Health Tracking
- **Menstrual Cycle Tracking**: Complete cycle monitoring with calendar visualization
- **Reproductive Health**: Contraception management and fertility tracking
- **Breast Health**: Self-exam reminders and mammogram tracking
- **Gynecological Health**: Pap smear and STI testing records
- **Hormonal Health**: PCOS and thyroid management tools
- **Preventive Care**: Well-woman exams and vaccination tracking
- **Cycle Predictions**: Smart predictions for periods and ovulation
- **Symptom Tracking**: Comprehensive symptom logging and analysis

### 🦵 Limb Care & Medical Equipment
- **Limb Assessment**: Comprehensive limb health monitoring and tracking
- **Prosthetic Care**: Prosthetic device maintenance and care reminders
- **Pain Tracking**: Detailed pain level monitoring and trend analysis
- **DME Management**: Durable medical equipment tracking and maintenance
- **Care Reminders**: Automated reminders for limb care routines
- **Health Monitoring**: Specialized tracking for mobility-related health

### 🍎 Nutrition & Weight Management
- **Meal Tracking**: Comprehensive nutrition logging and analysis
- **Weight Monitoring**: Weight loss progress tracking and goal setting
- **Cholesterol Tracking**: Cardiovascular health monitoring
- **Nutritional Insights**: AI-powered nutrition recommendations
- **Weight Loss Plans**: Personalized meal and exercise plans
- **Health Metrics**: BMI, body fat, and other health indicators

### 📊 Health Insights & Analytics
- **Advanced Analytics**: AI-powered health trend analysis
- **Predictive Insights**: Health risk assessment and recommendations
- **Data Visualization**: Interactive charts and health reports
- **Medical Reports**: Comprehensive health summaries for healthcare providers
- **Health Trends**: Long-term health pattern analysis
- **Risk Assessment**: Early warning system for health issues

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
│   │   ├── womens-health.js # Women's health tracking
│   │   ├── limb-care.js     # Limb care and assessment
│   │   ├── dme-manager.js   # Durable medical equipment
│   │   ├── nutrition-tracker.js # Nutrition tracking
│   │   ├── weight-loss.js   # Weight management
│   │   ├── health-insights.js # Health analytics and insights
│   │   ├── profile-manager.js # User profile management
│   │   ├── goals-manager.js # Goal setting and tracking
│   │   ├── charts.js        # Data visualization
│   │   ├── export.js        # Data export
│   │   ├── notifications.js # Push notifications
│   │   ├── pwa-update.js    # PWA update management
│   │   ├── theme-manager.js # Theme and UI management
│   │   ├── medical-report.js # Medical report generation
│   │   ├── legal.js         # Legal and compliance
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

### ✅ Version 1.2.0 - Latest Release

#### 👩 **Women's Health Tab - NEW!**
- **Comprehensive Women's Health Tracking**: Complete menstrual cycle, reproductive health, and preventive care
- **Menstrual Cycle Calendar**: Visual calendar with color-coded cycle events and predictions
- **Reproductive Health Management**: Contraception tracking and fertility monitoring
- **Breast Health Monitoring**: Self-exam reminders and mammogram tracking
- **Gynecological Health Records**: Pap smear and STI testing management
- **Hormonal Health Tools**: PCOS and thyroid health tracking
- **Preventive Care Tracking**: Well-woman exams and vaccination records
- **Smart Mood Integration**: Links to existing mood tab for hormonal mood tracking
- **Privacy-Focused Design**: Secure handling of sensitive health information

#### 🔧 **Accessibility Improvements**
- **Fixed Label Associations**: Corrected all form label accessibility issues
- **Enhanced Screen Reader Support**: Improved navigation for assistive technologies
- **WCAG Compliance**: Full compliance with web accessibility guidelines
- **Better Form Structure**: Proper fieldset/legend usage for grouped controls

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
- **Women's Health Collections**: 6 dedicated Firebase collections for comprehensive data storage

#### 📱 **User Experience Improvements**
- **Fixed service worker caching** for all static assets
- **Improved PWA installation** experience
- **Better error messages** and user feedback
- **Enhanced offline functionality**
- **Beautiful UI Components**: Modern, responsive design for all new features

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

### Firebase Collections
The app uses the following Firestore collections:

#### Core Health Data
- `bloodPressure` - Blood pressure readings
- `medications` - Medication tracking
- `moodEntries` - Mood and mental health data
- `goals` - Health goals and objectives
- `users` - User profiles and settings

#### Women's Health Collections
- `womensHealth_cycle` - Menstrual cycle tracking
- `womensHealth_reproductive` - Contraception and fertility data
- `womensHealth_breast` - Breast health and mammogram records
- `womensHealth_gynecological` - Pap smear and STI testing
- `womensHealth_hormonal` - PCOS and thyroid health data
- `womensHealth_preventive` - Well-woman exams and vaccinations

#### Limb Care & Medical Equipment Collections
- `limbAssessments` - Limb assessment data
- `prostheticCare` - Prosthetic care tracking
- `painTracking` - Pain tracking data
- `careReminders` - Care-specific reminders
- `durableMedicalEquipment` - DME tracking

#### Nutrition & Weight Management Collections
- `meals` - Meal tracking and nutrition data
- `cholesterolEntries` - Cholesterol monitoring
- `weightEntries` - Weight tracking data
- `weightGoals` - Weight loss goals
- `weightLossPlans` - AI-generated meal/exercise plans
- `nutritionEntries` - General nutrition tracking

#### Additional Health Collections
- `physicalActivity` - Exercise tracking
- `sleepEntries` - Sleep tracking
- `medicalHistory` - Medical history records
- `immunizations` - Immunization records
- `healthMetrics` - Health metrics data
- `settings` - App settings
- `reminders` - Reminder notifications
- `exports` - Data exports

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

### Version 1.3
- [ ] Advanced women's health analytics
- [ ] Pregnancy tracking features
- [ ] Menopause support tools
- [ ] Advanced cycle predictions with AI

### Version 1.4
- [ ] Wheelchair movement tracking
- [ ] Advanced analytics dashboard
- [ ] Integration with health devices
- [ ] Family member access

### Version 1.5
- [ ] AI-powered health insights
- [ ] Telemedicine integration
- [ ] Health insurance integration
- [ ] Multi-language support

### Version 1.6
- [ ] Wearable device integration
- [ ] Advanced goal tracking
- [ ] Social features
- [ ] Health challenges

---

**Bradley Health** - Empowering better health through technology.

*Built with ❤️ for better health outcomes*

---

**Note**: This is a health monitoring application. Always consult with healthcare professionals for medical advice. 
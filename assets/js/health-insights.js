// Health Insights & AI Recommendations System
class HealthInsights {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.insights = [];
    this.recommendations = [];
    this.init();
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.loadInsights();
        }
      });
    }
  }

  async loadInsights() {
    if (!this.currentUser) return;

    try {
      await this.analyzeHealthData();
      this.displayInsights();
    } catch (error) {
      console.error('Error loading health insights:', error);
    }
  }

  async analyzeHealthData() {
    const userId = this.currentUser.uid;
    this.insights = [];
    this.recommendations = [];

    // Analyze Blood Pressure Trends
    await this.analyzeBloodPressureTrends(userId);
    
    // Analyze Medication Adherence
    await this.analyzeMedicationAdherence(userId);
    
    // Analyze Mood Patterns
    await this.analyzeMoodPatterns(userId);
    
    // Analyze Sleep Patterns
    await this.analyzeSleepPatterns(userId);
    
    // Generate Cross-Correlation Insights
    await this.generateCrossCorrelations(userId);
  }

  async analyzeBloodPressureTrends(userId) {
    try {
      const bpSnapshot = await this.db.collection('bloodPressure')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();

      if (bpSnapshot.empty) return;

      const readings = bpSnapshot.docs.map(doc => doc.data());
      const systolic = readings.map(r => r.systolic);
      const diastolic = readings.map(r => r.diastolic);

      // Calculate trends
      const systolicTrend = this.calculateTrend(systolic);
      const diastolicTrend = this.calculateTrend(diastolic);

      // Generate insights
      if (systolicTrend > 0.5) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'warning',
          title: 'Blood Pressure Trend Detected',
          message: 'Your systolic blood pressure has been trending upward over the past 30 days.',
          recommendation: 'Consider reducing salt intake, increasing exercise, or consulting your doctor.',
          icon: '❤️',
          timestamp: new Date()
        });
      }

      if (diastolicTrend > 0.3) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'info',
          title: 'Diastolic Pressure Increase',
          message: 'Your diastolic pressure has shown a slight increase.',
          recommendation: 'Monitor your stress levels and consider relaxation techniques.',
          icon: '📈',
          timestamp: new Date()
        });
      }

      // Check for high readings
      const highReadings = readings.filter(r => r.systolic > 140 || r.diastolic > 90);
      if (highReadings.length > 3) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'alert',
          title: 'Multiple High Readings',
          message: `You've had ${highReadings.length} high blood pressure readings recently.`,
          recommendation: 'Please consult your healthcare provider immediately.',
          icon: '⚠️',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing blood pressure trends:', error);
    }
  }

  async analyzeMedicationAdherence(userId) {
    try {
      const medSnapshot = await this.db.collection('medications')
        .where('userId', '==', userId)
        .get();

      if (medSnapshot.empty) return;

      const medications = medSnapshot.docs.map(doc => doc.data());
      
      // Check for medications without recent adherence data
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      medications.forEach(med => {
        if (!med.lastTaken || new Date(med.lastTaken.toDate()) < weekAgo) {
          this.insights.push({
            type: 'medication',
            severity: 'warning',
            title: 'Medication Reminder',
            message: `You haven't logged taking ${med.name} recently.`,
            recommendation: 'Please log your medication intake or consult your doctor if you stopped taking it.',
            icon: '💊',
            timestamp: new Date()
          });
        }
      });

    } catch (error) {
      console.error('Error analyzing medication adherence:', error);
    }
  }

  async analyzeMoodPatterns(userId) {
    try {
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(14)
        .get();

      if (moodSnapshot.empty) return;

      const moodEntries = moodSnapshot.docs.map(doc => doc.data());
      const moodLevels = moodEntries.map(entry => entry.mood);
      const stressLevels = moodEntries.map(entry => entry.stress);
      const sleepLevels = moodEntries.map(entry => entry.sleep);

      // Analyze mood trends
      const avgMood = moodLevels.reduce((a, b) => a + b, 0) / moodLevels.length;
      const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
      const avgSleep = sleepLevels.reduce((a, b) => a + b, 0) / sleepLevels.length;

      if (avgMood < 5) {
        this.insights.push({
          type: 'mood',
          severity: 'info',
          title: 'Low Mood Pattern',
          message: 'Your mood has been lower than average over the past 2 weeks.',
          recommendation: 'Consider activities that boost your mood, such as exercise, socializing, or hobbies.',
          icon: '😔',
          timestamp: new Date()
        });
      }

      if (avgStress > 7) {
        this.insights.push({
          type: 'mood',
          severity: 'warning',
          title: 'High Stress Levels',
          message: 'Your stress levels have been consistently high.',
          recommendation: 'Try stress-reduction techniques like meditation, deep breathing, or talking to someone.',
          icon: '😰',
          timestamp: new Date()
        });
      }

      if (avgSleep < 6) {
        this.insights.push({
          type: 'mood',
          severity: 'info',
          title: 'Sleep Quality Concern',
          message: 'Your sleep quality has been below optimal levels.',
          recommendation: 'Improve sleep hygiene: consistent bedtime, reduce screen time, create a relaxing routine.',
          icon: '😴',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
    }
  }

  async analyzeSleepPatterns(userId) {
    try {
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(7)
        .get();

      if (moodSnapshot.empty) return;

      const sleepEntries = moodSnapshot.docs.map(doc => doc.data());
      const sleepLevels = sleepEntries.map(entry => entry.sleep);

      const avgSleep = sleepLevels.reduce((a, b) => a + b, 0) / sleepLevels.length;

      if (avgSleep < 5) {
        this.insights.push({
          type: 'sleep',
          severity: 'warning',
          title: 'Poor Sleep Quality',
          message: 'Your sleep quality has been consistently poor this week.',
          recommendation: 'Consider: avoiding caffeine after 2 PM, creating a dark sleep environment, and establishing a regular sleep schedule.',
          icon: '🌙',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing sleep patterns:', error);
    }
  }

  async generateCrossCorrelations(userId) {
    try {
      // Analyze relationships between different health metrics
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      const bpSnapshot = await this.db.collection('bloodPressure')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      if (!moodSnapshot.empty && !bpSnapshot.empty) {
        const moodEntries = moodSnapshot.docs.map(doc => doc.data());
        const bpEntries = bpSnapshot.docs.map(doc => doc.data());

        // Check for stress-related BP spikes
        const highStressDays = moodEntries.filter(entry => entry.stress > 7);
        if (highStressDays.length > 3) {
          this.insights.push({
            type: 'correlation',
            severity: 'info',
            title: 'Stress-Health Connection',
            message: 'You\'ve had several high-stress days recently.',
            recommendation: 'High stress can affect blood pressure. Consider stress management techniques and monitor your BP during stressful periods.',
            icon: '🧠',
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Error generating cross correlations:', error);
    }
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  displayInsights() {
    const insightsContainer = document.getElementById('insightsList');
    if (!insightsContainer) return;

    // Sort insights by severity (alert > warning > info)
    const severityOrder = { 'alert': 3, 'warning': 2, 'info': 1 };
    this.insights.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    insightsContainer.innerHTML = '';

    if (this.insights.length === 0) {
      insightsContainer.innerHTML = `
        <div class="no-insights">
          <p>No health insights at this time. Keep logging your health data to receive personalized insights!</p>
        </div>
      `;
      return;
    }

    this.insights.forEach(insight => {
      const insightElement = document.createElement('div');
      insightElement.className = `insight-item ${insight.severity}`;
      insightElement.innerHTML = `
        <div class="insight-header">
          <span class="insight-icon">${insight.icon}</span>
          <div class="insight-title">
            <h3>${insight.title}</h3>
            <span class="insight-time">${this.formatTime(insight.timestamp)}</span>
          </div>
        </div>
        <div class="insight-content">
          <p class="insight-message">${insight.message}</p>
          <div class="insight-recommendation">
            <strong>Recommendation:</strong> ${insight.recommendation}
          </div>
        </div>
      `;
      insightsContainer.appendChild(insightElement);
    });
  }

  formatTime(timestamp) {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes} minutes ago`;
    if (hours < 24) return `${hours} hours ago`;
    return `${days} days ago`;
  }

  async refreshInsights() {
    await this.loadInsights();
  }
}

// Initialize Health Insights
window.healthInsights = new HealthInsights(); 
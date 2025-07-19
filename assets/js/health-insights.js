// Health Insights & AI Recommendations System
class HealthInsights {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.insights = [];
      this.recommendations = [];
      this.healthScore = 0;
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.insights = [];
          this.recommendations = [];
          this.healthScore = 0;
          this.init();
        } else {
          console.error('Firebase not available for health insights');
        }
      }, 1000);
    }
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          console.log('Health Insights: User authenticated, loading insights');
          this.loadInsights();
        }
      });
    } else {
      // Fallback: check for user every 2 seconds
      const checkAuth = setInterval(() => {
        if (window.authManager && window.authManager.currentUser) {
          this.currentUser = window.authManager.currentUser;
          console.log('Health Insights: User found via fallback, loading insights');
          this.loadInsights();
          clearInterval(checkAuth);
        }
      }, 2000);
    }
  }

  async loadInsights() {
    if (!this.currentUser) {
      console.log('Health Insights: No current user, skipping load');
      return;
    }

    console.log('Health Insights: Loading insights for user:', this.currentUser.uid);
    
    try {
      // Show loading state
      this.showLoadingState();
      
      await this.analyzeHealthData();
      console.log('Health Insights: Analysis complete, insights count:', this.insights.length);
      
      this.calculateHealthScore();
      this.generateRecommendations();
      
      this.displayInsights();
      this.displayRecommendations();
      this.displayHealthScore();
      
      this.hideLoadingState();
    } catch (error) {
      console.error('Error loading health insights:', error);
      this.hideLoadingState();
      this.showErrorState();
    }
  }

  showLoadingState() {
    const insightsContainer = document.getElementById('insightsList');
    if (insightsContainer) {
      insightsContainer.innerHTML = `
        <div class="loading-insights">
          <div class="loading-spinner"></div>
          <p>Analyzing your health data...</p>
        </div>
      `;
    }
  }

  hideLoadingState() {
    // Loading state will be replaced by actual content
  }

  showErrorState() {
    const insightsContainer = document.getElementById('insightsList');
    if (insightsContainer) {
      insightsContainer.innerHTML = `
        <div class="error-insights">
          <p>Unable to load health insights. Please try again later.</p>
        </div>
      `;
    }
  }

  async analyzeHealthData() {
    const userId = this.currentUser.uid;
    this.insights = [];
    this.recommendations = [];

    console.log('Health Insights: Starting comprehensive health analysis');

    // Analyze all health data types
    await Promise.all([
      this.analyzeBloodPressureTrends(userId),
      this.analyzeMedicationAdherence(userId),
      this.analyzeMoodPatterns(userId),
      this.analyzeSleepPatterns(userId),
      this.analyzeLimbCareData(userId),
      this.analyzeDMEData(userId),
      this.analyzeNutritionData(userId),
      this.analyzeCholesterolData(userId),
      this.generateCrossCorrelations(userId),
      this.analyzeDataCompleteness(userId)
    ]);

    console.log('Health Insights: All analysis complete');
  }

  async analyzeBloodPressureTrends(userId) {
    try {
      console.log('Health Insights: Analyzing blood pressure trends');
      
      const bpSnapshot = await this.db.collection('bloodPressure')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(50)
        .get();

      if (bpSnapshot.empty) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'info',
          title: 'No Blood Pressure Data',
          message: 'You haven\'t logged any blood pressure readings yet.',
          recommendation: 'Start tracking your blood pressure regularly to monitor your cardiovascular health.',
          icon: '❤️',
          timestamp: new Date()
        });
        return;
      }

      const readings = bpSnapshot.docs.map(doc => doc.data());
      const systolic = readings.map(r => r.systolic);
      const diastolic = readings.map(r => r.diastolic);

      // Calculate trends
      const systolicTrend = this.calculateTrend(systolic);
      const diastolicTrend = this.calculateTrend(diastolic);

      // Calculate averages
      const avgSystolic = systolic.reduce((a, b) => a + b, 0) / systolic.length;
      const avgDiastolic = diastolic.reduce((a, b) => a + b, 0) / diastolic.length;

      // Generate insights based on trends and averages
      if (systolicTrend > 0.5) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'warning',
          title: 'Rising Blood Pressure Trend',
          message: `Your systolic blood pressure has been trending upward (${systolicTrend.toFixed(1)} points per reading).`,
          recommendation: 'Consider reducing salt intake, increasing exercise, managing stress, or consulting your doctor.',
          icon: '📈',
          timestamp: new Date()
        });
      }

      if (diastolicTrend > 0.3) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'warning',
          title: 'Diastolic Pressure Increase',
          message: `Your diastolic pressure has shown a concerning increase (${diastolicTrend.toFixed(1)} points per reading).`,
          recommendation: 'Monitor your stress levels, reduce caffeine, and consider relaxation techniques.',
          icon: '📊',
          timestamp: new Date()
        });
      }

      // Check for high readings
      const highReadings = readings.filter(r => r.systolic > 140 || r.diastolic > 90);
      if (highReadings.length > 3) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'alert',
          title: 'Multiple High Blood Pressure Readings',
          message: `You've had ${highReadings.length} high blood pressure readings recently (systolic >140 or diastolic >90).`,
          recommendation: 'Please consult your healthcare provider immediately. High blood pressure can lead to serious health complications.',
          icon: '⚠️',
          timestamp: new Date()
        });
      }

      // Check for optimal readings
      const optimalReadings = readings.filter(r => r.systolic < 120 && r.diastolic < 80);
      if (optimalReadings.length > readings.length * 0.7) {
        this.insights.push({
          type: 'blood-pressure',
          severity: 'success',
          title: 'Excellent Blood Pressure Control',
          message: 'Your blood pressure readings are consistently in the optimal range!',
          recommendation: 'Keep up the great work! Continue your healthy lifestyle habits.',
          icon: '✅',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing blood pressure trends:', error);
    }
  }

  async analyzeMedicationAdherence(userId) {
    try {
      console.log('Health Insights: Analyzing medication adherence');
      
      const medSnapshot = await this.db.collection('medications')
        .where('userId', '==', userId)
        .get();

      if (medSnapshot.empty) {
        this.insights.push({
          type: 'medication',
          severity: 'info',
          title: 'No Medications Logged',
          message: 'You haven\'t logged any medications yet.',
          recommendation: 'If you take medications, add them to your profile to track adherence and receive reminders.',
          icon: '💊',
          timestamp: new Date()
        });
        return;
      }

      const medications = medSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // Check for medications without recent adherence data
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

      medications.forEach(med => {
        if (!med.lastTaken) {
          this.insights.push({
            type: 'medication',
            severity: 'warning',
            title: 'Medication Tracking Needed',
            message: `You haven't logged taking ${med.name} yet.`,
            recommendation: 'Start tracking your medication intake to ensure proper adherence and identify any patterns.',
            icon: '💊',
            timestamp: new Date()
          });
        } else {
          // Handle both Firestore Timestamp and Date objects
          let lastTakenDate;
          if (med.lastTaken.toDate) {
            lastTakenDate = med.lastTaken.toDate();
          } else if (med.lastTaken instanceof Date) {
            lastTakenDate = med.lastTaken;
          } else {
            lastTakenDate = new Date(med.lastTaken);
          }

          if (lastTakenDate < weekAgo) {
            this.insights.push({
              type: 'medication',
              severity: 'warning',
              title: 'Medication Reminder',
              message: `You haven't logged taking ${med.name} recently (last logged: ${lastTakenDate.toLocaleDateString()}).`,
              recommendation: 'Please log your medication intake or consult your doctor if you stopped taking it.',
              icon: '⏰',
              timestamp: new Date()
            });
          }
        }
      });

    } catch (error) {
      console.error('Error analyzing medication adherence:', error);
    }
  }

  async analyzeMoodPatterns(userId) {
    try {
      console.log('Health Insights: Analyzing mood patterns');
      
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();

      if (moodSnapshot.empty) {
        this.insights.push({
          type: 'mood',
          severity: 'info',
          title: 'No Mood Data',
          message: 'You haven\'t logged any mood entries yet.',
          recommendation: 'Start tracking your mood daily to identify patterns and improve your mental well-being.',
          icon: '😊',
          timestamp: new Date()
        });
        return;
      }

      const moodEntries = moodSnapshot.docs.map(doc => doc.data());
      const moodLevels = moodEntries.map(entry => entry.mood);
      const stressLevels = moodEntries.map(entry => entry.stress);
      const sleepLevels = moodEntries.map(entry => entry.sleep);
      const energyLevels = moodEntries.map(entry => entry.energy);

      // Calculate averages
      const avgMood = moodLevels.reduce((a, b) => a + b, 0) / moodLevels.length;
      const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
      const avgSleep = sleepLevels.reduce((a, b) => a + b, 0) / sleepLevels.length;
      const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;

      // Analyze mood trends
      const moodTrend = this.calculateTrend(moodLevels);
      const stressTrend = this.calculateTrend(stressLevels);

      // Generate insights
      if (avgMood < 5) {
        this.insights.push({
          type: 'mood',
          severity: 'warning',
          title: 'Low Mood Pattern Detected',
          message: `Your average mood has been low (${avgMood.toFixed(1)}/10) over the past ${moodEntries.length} days.`,
          recommendation: 'Consider activities that boost your mood: exercise, socializing, hobbies, or talking to a mental health professional.',
          icon: '😔',
          timestamp: new Date()
        });
      }

      if (avgStress > 7) {
        this.insights.push({
          type: 'mood',
          severity: 'warning',
          title: 'High Stress Levels',
          message: `Your stress levels have been consistently high (${avgStress.toFixed(1)}/10).`,
          recommendation: 'Try stress-reduction techniques: meditation, deep breathing, exercise, or talking to someone you trust.',
          icon: '😰',
          timestamp: new Date()
        });
      }

      if (avgSleep < 6) {
        this.insights.push({
          type: 'mood',
          severity: 'warning',
          title: 'Sleep Quality Concern',
          message: `Your sleep quality has been below optimal (${avgSleep.toFixed(1)}/10).`,
          recommendation: 'Improve sleep hygiene: consistent bedtime, reduce screen time, create a relaxing routine, and avoid caffeine late in the day.',
          icon: '😴',
          timestamp: new Date()
        });
      }

      if (avgEnergy < 5) {
        this.insights.push({
          type: 'mood',
          severity: 'info',
          title: 'Low Energy Levels',
          message: `Your energy levels have been consistently low (${avgEnergy.toFixed(1)}/10).`,
          recommendation: 'Consider: improving sleep quality, regular exercise, balanced nutrition, and managing stress levels.',
          icon: '🔋',
          timestamp: new Date()
        });
      }

      // Positive insights
      if (avgMood > 7 && moodTrend > 0) {
        this.insights.push({
          type: 'mood',
          severity: 'success',
          title: 'Improving Mood Trend',
          message: 'Your mood has been improving and is consistently positive!',
          recommendation: 'Keep up the great work! Continue the activities that are boosting your mood.',
          icon: '😊',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing mood patterns:', error);
    }
  }

  async analyzeSleepPatterns(userId) {
    try {
      console.log('Health Insights: Analyzing sleep patterns');
      
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(14)
        .get();

      if (moodSnapshot.empty) return;

      const sleepEntries = moodSnapshot.docs.map(doc => doc.data());
      const sleepLevels = sleepEntries.map(entry => entry.sleep);

      const avgSleep = sleepLevels.reduce((a, b) => a + b, 0) / sleepLevels.length;
      const sleepTrend = this.calculateTrend(sleepLevels);

      if (avgSleep < 5) {
        this.insights.push({
          type: 'sleep',
          severity: 'warning',
          title: 'Poor Sleep Quality',
          message: `Your sleep quality has been consistently poor (${avgSleep.toFixed(1)}/10) this week.`,
          recommendation: 'Consider: avoiding caffeine after 2 PM, creating a dark sleep environment, establishing a regular sleep schedule, and limiting screen time before bed.',
          icon: '🌙',
          timestamp: new Date()
        });
      }

      if (sleepTrend < -0.5) {
        this.insights.push({
          type: 'sleep',
          severity: 'warning',
          title: 'Declining Sleep Quality',
          message: 'Your sleep quality has been declining recently.',
          recommendation: 'Review your sleep habits and consider consulting a sleep specialist if the trend continues.',
          icon: '📉',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing sleep patterns:', error);
    }
  }

  async analyzeLimbCareData(userId) {
    try {
      console.log('Health Insights: Analyzing limb care data');
      
      const limbSnapshot = await this.db.collection('limbAssessments')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(10)
        .get();

      if (limbSnapshot.empty) {
        this.insights.push({
          type: 'limb-care',
          severity: 'info',
          title: 'Limb Care Assessment Needed',
          message: 'You haven\'t completed any limb care assessments yet.',
          recommendation: 'Regular limb assessments help prevent complications. Consider scheduling your first assessment.',
          icon: '🦵',
          timestamp: new Date()
        });
        return;
      }

      const assessments = limbSnapshot.docs.map(doc => doc.data());
      const recentAssessment = assessments[0];

      // Check for concerning findings
      if (recentAssessment) {
        const issues = [];
        if (recentAssessment.skinIssues && recentAssessment.skinIssues.length > 0) {
          issues.push('skin issues');
        }
        if (recentAssessment.painLevel > 5) {
          issues.push('high pain levels');
        }
        if (recentAssessment.swelling) {
          issues.push('swelling');
        }

        if (issues.length > 0) {
          this.insights.push({
            type: 'limb-care',
            severity: 'warning',
            title: 'Limb Care Concerns',
            message: `Your recent limb assessment shows: ${issues.join(', ')}.`,
            recommendation: 'Monitor these issues closely and contact your healthcare provider if they worsen or persist.',
            icon: '⚠️',
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Error analyzing limb care data:', error);
    }
  }

  async analyzeDMEData(userId) {
    try {
      console.log('Health Insights: Analyzing DME data');
      
      const dmeSnapshot = await this.db.collection('durableMedicalEquipment')
        .where('userId', '==', userId)
        .get();

      if (dmeSnapshot.empty) {
        this.insights.push({
          type: 'dme',
          severity: 'info',
          title: 'No Equipment Logged',
          message: 'You haven\'t logged any medical equipment yet.',
          recommendation: 'If you use medical equipment, add it to your profile to track maintenance and status.',
          icon: '🦽',
          timestamp: new Date()
        });
        return;
      }

      const equipment = dmeSnapshot.docs.map(doc => doc.data());
      const needsAttention = equipment.filter(item => 
        item.status === 'needs-repair' || item.status === 'broken'
      );

      if (needsAttention.length > 0) {
        this.insights.push({
          type: 'dme',
          severity: 'warning',
          title: 'Equipment Needs Attention',
          message: `${needsAttention.length} piece(s) of equipment need repair or replacement.`,
          recommendation: 'Contact your equipment provider to schedule maintenance or repairs.',
          icon: '🔧',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing DME data:', error);
    }
  }

  async generateCrossCorrelations(userId) {
    try {
      console.log('Health Insights: Generating cross correlations');
      
      // Analyze relationships between different health metrics
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      const bpSnapshot = await this.db.collection('bloodPressure')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      if (!moodSnapshot.empty && !bpSnapshot.empty) {
        const moodEntries = moodSnapshot.docs.map(doc => doc.data());
        const bpEntries = bpSnapshot.docs.map(doc => doc.data());

        // Check for stress-related BP spikes
        const highStressDays = moodEntries.filter(entry => entry.stress > 7);
        if (highStressDays.length > 5) {
          this.insights.push({
            type: 'correlation',
            severity: 'info',
            title: 'Stress-Health Connection',
            message: 'You\'ve had several high-stress days recently.',
            recommendation: 'High stress can affect blood pressure and overall health. Consider stress management techniques and monitor your BP during stressful periods.',
            icon: '🧠',
            timestamp: new Date()
          });
        }

        // Check for mood-sleep correlation
        const lowMoodLowSleep = moodEntries.filter(entry => entry.mood < 5 && entry.sleep < 5);
        if (lowMoodLowSleep.length > 3) {
          this.insights.push({
            type: 'correlation',
            severity: 'info',
            title: 'Mood-Sleep Connection',
            message: 'You\'ve had several days with both low mood and poor sleep.',
            recommendation: 'Poor sleep can affect mood and vice versa. Focus on improving sleep hygiene to break this cycle.',
            icon: '😴',
            timestamp: new Date()
          });
        }
      }

    } catch (error) {
      console.error('Error generating cross correlations:', error);
    }
  }

  async analyzeNutritionData(userId) {
    try {
      console.log('Health Insights: Analyzing nutrition data');
      
      const mealsSnapshot = await this.db.collection('meals')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();

      if (mealsSnapshot.empty) {
        this.insights.push({
          type: 'nutrition',
          severity: 'info',
          title: 'No Nutrition Data',
          message: 'You haven\'t logged any meals yet.',
          recommendation: 'Start tracking your meals to monitor your nutrition and identify dietary patterns.',
          icon: '🥗',
          timestamp: new Date()
        });
        return;
      }

      const meals = mealsSnapshot.docs.map(doc => doc.data());
      const mealTypes = meals.map(meal => meal.type);
      
      // Analyze meal patterns
      const mealCounts = {};
      mealTypes.forEach(type => {
        mealCounts[type] = (mealCounts[type] || 0) + 1;
      });

      // Check for meal variety
      const uniqueMealTypes = Object.keys(mealCounts).length;
      if (uniqueMealTypes < 3) {
        this.insights.push({
          type: 'nutrition',
          severity: 'info',
          title: 'Limited Meal Variety',
          message: `You've logged ${uniqueMealTypes} different meal types recently.`,
          recommendation: 'Consider adding more variety to your meals for better nutrition and dietary balance.',
          icon: '🍽️',
          timestamp: new Date()
        });
      }

      // Check for regular meal logging
      if (meals.length < 7) {
        this.insights.push({
          type: 'nutrition',
          severity: 'info',
          title: 'Intermittent Meal Tracking',
          message: `You've logged ${meals.length} meals recently.`,
          recommendation: 'Try to log your meals consistently to better understand your eating patterns and nutrition.',
          icon: '📝',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing nutrition data:', error);
    }
  }

  async analyzeCholesterolData(userId) {
    try {
      console.log('Health Insights: Analyzing cholesterol data');
      
      const cholesterolSnapshot = await this.db.collection('cholesterolEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(20)
        .get();

      if (cholesterolSnapshot.empty) {
        this.insights.push({
          type: 'cholesterol',
          severity: 'info',
          title: 'No Cholesterol Data',
          message: 'You haven\'t logged any cholesterol readings yet.',
          recommendation: 'Start monitoring your cholesterol levels regularly, especially if you have cardiovascular concerns.',
          icon: '🧀',
          timestamp: new Date()
        });
        return;
      }

      const cholesterolEntries = cholesterolSnapshot.docs.map(doc => doc.data());
      const values = cholesterolEntries.map(entry => entry.value);
      
      // Calculate average and trends
      const avgCholesterol = values.reduce((a, b) => a + b, 0) / values.length;
      const cholesterolTrend = this.calculateTrend(values);

      // Analyze cholesterol levels
      if (avgCholesterol >= 240) {
        this.insights.push({
          type: 'cholesterol',
          severity: 'alert',
          title: 'High Cholesterol Levels',
          message: `Your average cholesterol level is ${avgCholesterol.toFixed(1)} mg/dL, which is above the recommended range.`,
          recommendation: 'Consult your healthcare provider immediately. Consider dietary changes, exercise, and possibly medication.',
          icon: '⚠️',
          timestamp: new Date()
        });
      } else if (avgCholesterol >= 200) {
        this.insights.push({
          type: 'cholesterol',
          severity: 'warning',
          title: 'Borderline High Cholesterol',
          message: `Your average cholesterol level is ${avgCholesterol.toFixed(1)} mg/dL, which is borderline high.`,
          recommendation: 'Monitor your cholesterol regularly and consider lifestyle changes to lower it.',
          icon: '📊',
          timestamp: new Date()
        });
      } else {
        this.insights.push({
          type: 'cholesterol',
          severity: 'success',
          title: 'Healthy Cholesterol Levels',
          message: `Your average cholesterol level is ${avgCholesterol.toFixed(1)} mg/dL, which is in the optimal range.`,
          recommendation: 'Keep up the great work! Continue your healthy lifestyle habits.',
          icon: '✅',
          timestamp: new Date()
        });
      }

      // Check for trends
      if (cholesterolTrend > 5) {
        this.insights.push({
          type: 'cholesterol',
          severity: 'warning',
          title: 'Rising Cholesterol Trend',
          message: 'Your cholesterol levels have been trending upward recently.',
          recommendation: 'Consider dietary changes, increased exercise, and consult your healthcare provider.',
          icon: '📈',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing cholesterol data:', error);
    }
  }

  async analyzeDataCompleteness(userId) {
    try {
      console.log('Health Insights: Analyzing data completeness');
      
      // Check how much data the user has logged
      const collections = ['bloodPressure', 'moodEntries', 'medications', 'limbAssessments', 'durableMedicalEquipment', 'meals', 'cholesterolEntries'];
      const dataCounts = {};

      for (const collection of collections) {
        const snapshot = await this.db.collection(collection)
          .where('userId', '==', userId)
          .get();
        dataCounts[collection] = snapshot.size;
      }

      const totalDataPoints = Object.values(dataCounts).reduce((a, b) => a + b, 0);
      
      if (totalDataPoints === 0) {
        this.insights.push({
          type: 'data',
          severity: 'info',
          title: 'Welcome to Health Tracking!',
          message: 'You\'re just getting started with health tracking.',
          recommendation: 'Begin by logging your blood pressure, mood, medications, or nutrition. The more data you provide, the better insights we can offer.',
          icon: '🎯',
          timestamp: new Date()
        });
      } else if (totalDataPoints < 10) {
        this.insights.push({
          type: 'data',
          severity: 'info',
          title: 'Building Your Health Profile',
          message: `You've logged ${totalDataPoints} health data points so far.`,
          recommendation: 'Continue logging regularly to get more personalized insights and recommendations.',
          icon: '📊',
          timestamp: new Date()
        });
      } else {
        this.insights.push({
          type: 'data',
          severity: 'success',
          title: 'Comprehensive Health Tracking',
          message: `Great job! You've logged ${totalDataPoints} health data points.`,
          recommendation: 'Your consistent tracking is providing valuable insights. Keep up the excellent work!',
          icon: '🏆',
          timestamp: new Date()
        });
      }

    } catch (error) {
      console.error('Error analyzing data completeness:', error);
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

  calculateHealthScore() {
    // Calculate overall health score based on insights
    let score = 100;
    let deductions = 0;

    this.insights.forEach(insight => {
      switch (insight.severity) {
        case 'alert':
          deductions += 20;
          break;
        case 'warning':
          deductions += 10;
          break;
        case 'info':
          deductions += 5;
          break;
        case 'success':
          deductions -= 5; // Bonus for positive insights
          break;
      }
    });

    this.healthScore = Math.max(0, Math.min(100, score - deductions));
    console.log('Health Insights: Calculated health score:', this.healthScore);
  }

  generateRecommendations() {
    this.recommendations = [];
    
    console.log('Health Insights: Generating AI-driven personalized recommendations');

    // Analyze specific patterns from insights to generate targeted recommendations
    this.analyzeInsightPatterns();
    
    // Generate data-driven recommendations based on actual health metrics
    this.generateDataDrivenRecommendations();
    
    // Add contextual recommendations based on user's health profile
    this.generateContextualRecommendations();
    
    // Sort recommendations by priority and relevance
    this.sortRecommendations();
    
    console.log('Health Insights: Generated', this.recommendations.length, 'personalized recommendations');
  }

  analyzeInsightPatterns() {
    // Analyze blood pressure patterns
    const bpInsights = this.insights.filter(i => i.type === 'blood-pressure');
    if (bpInsights.length > 0) {
      const hasHighReadings = bpInsights.some(i => i.severity === 'alert');
      const hasTrendingUp = bpInsights.some(i => i.title.includes('Trending') || i.title.includes('Rising'));
      const hasOptimalControl = bpInsights.some(i => i.severity === 'success');

      if (hasHighReadings) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Immediate Blood Pressure Management',
          description: 'Your blood pressure readings are consistently high. Consider: reducing salt intake to <2,300mg daily, increasing physical activity, managing stress through meditation or deep breathing, and consulting your healthcare provider.',
          priority: 'high',
          dataDriven: true,
          metric: 'blood-pressure',
          severity: 'alert'
        });
      } else if (hasTrendingUp) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Preventive Blood Pressure Care',
          description: 'Your blood pressure is trending upward. Focus on: daily monitoring, DASH diet principles, 30 minutes of moderate exercise, and stress reduction techniques.',
          priority: 'high',
          dataDriven: true,
          metric: 'blood-pressure',
          severity: 'warning'
        });
      } else if (hasOptimalControl) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Maintain Excellent BP Control',
          description: 'Your blood pressure is well-controlled! Continue your healthy habits and consider sharing your success strategies with your healthcare team.',
          priority: 'low',
          dataDriven: true,
          metric: 'blood-pressure',
          severity: 'success'
        });
      }
    }

    // Analyze mood and mental health patterns
    const moodInsights = this.insights.filter(i => i.type === 'mood');
    if (moodInsights.length > 0) {
      const hasLowMood = moodInsights.some(i => i.title.includes('Low Mood'));
      const hasHighStress = moodInsights.some(i => i.title.includes('High Stress'));
      const hasPoorSleep = moodInsights.some(i => i.title.includes('Sleep'));
      const hasLowEnergy = moodInsights.some(i => i.title.includes('Energy'));

      if (hasLowMood) {
        this.recommendations.push({
          category: 'Mental Health',
          title: 'Mood Enhancement Strategy',
          description: 'Your mood has been consistently low. Try: daily gratitude journaling, social activities with friends/family, regular exercise (releases endorphins), and consider talking to a mental health professional.',
          priority: 'high',
          dataDriven: true,
          metric: 'mood',
          severity: 'warning'
        });
      }

      if (hasHighStress) {
        this.recommendations.push({
          category: 'Mental Health',
          title: 'Stress Management Plan',
          description: 'High stress levels detected. Implement: daily 10-minute meditation, progressive muscle relaxation, regular exercise, time management techniques, and consider stress-reduction apps.',
          priority: 'high',
          dataDriven: true,
          metric: 'stress',
          severity: 'warning'
        });
      }

      if (hasPoorSleep) {
        this.recommendations.push({
          category: 'Sleep Hygiene',
          title: 'Sleep Quality Improvement',
          description: 'Poor sleep quality affects overall health. Establish: consistent 8-hour sleep schedule, screen-free hour before bed, cool/dark bedroom environment, and avoid caffeine after 2 PM.',
          priority: 'medium',
          dataDriven: true,
          metric: 'sleep',
          severity: 'warning'
        });
      }

      if (hasLowEnergy) {
        this.recommendations.push({
          category: 'Energy Management',
          title: 'Boost Energy Levels',
          description: 'Low energy levels detected. Focus on: improving sleep quality, regular exercise, balanced nutrition with protein, staying hydrated, and managing stress levels.',
          priority: 'medium',
          dataDriven: true,
          metric: 'energy',
          severity: 'info'
        });
      }
    }

    // Analyze medication patterns
    const medInsights = this.insights.filter(i => i.type === 'medication');
    if (medInsights.length > 0) {
      const hasAdherenceIssues = medInsights.some(i => i.severity === 'warning');
      
      if (hasAdherenceIssues) {
        this.recommendations.push({
          category: 'Medication Management',
          title: 'Improve Medication Adherence',
          description: 'Medication tracking gaps detected. Set up: daily reminders, pill organizer, routine medication times, and track any side effects to discuss with your doctor.',
          priority: 'high',
          dataDriven: true,
          metric: 'medication',
          severity: 'warning'
        });
      }
    }

    // Analyze limb care patterns
    const limbInsights = this.insights.filter(i => i.type === 'limb-care');
    if (limbInsights.length > 0) {
      const hasIssues = limbInsights.some(i => i.severity === 'warning');
      
      if (hasIssues) {
        this.recommendations.push({
          category: 'Limb Care',
          title: 'Limb Health Monitoring',
          description: 'Limb care concerns detected. Schedule: regular assessments, monitor for skin changes, maintain proper fit of prosthetics/orthotics, and contact your provider for any worsening symptoms.',
          priority: 'high',
          dataDriven: true,
          metric: 'limb-care',
          severity: 'warning'
        });
      }
    }

    // Analyze DME patterns
    const dmeInsights = this.insights.filter(i => i.type === 'dme');
    if (dmeInsights.length > 0) {
      const hasEquipmentIssues = dmeInsights.some(i => i.severity === 'warning');
      
      if (hasEquipmentIssues) {
        this.recommendations.push({
          category: 'Equipment Management',
          title: 'Equipment Maintenance',
          description: 'Equipment needs attention. Contact: your equipment provider for repairs, schedule regular maintenance, and keep backup equipment if possible.',
          priority: 'medium',
          dataDriven: true,
          metric: 'dme',
          severity: 'warning'
        });
      }
    }

    // Analyze nutrition patterns
    const nutritionInsights = this.insights.filter(i => i.type === 'nutrition');
    if (nutritionInsights.length > 0) {
      const hasLimitedVariety = nutritionInsights.some(i => i.title.includes('Limited Meal Variety'));
      const hasIntermittentTracking = nutritionInsights.some(i => i.title.includes('Intermittent Meal Tracking'));
      
      if (hasLimitedVariety) {
        this.recommendations.push({
          category: 'Nutrition',
          title: 'Improve Meal Variety',
          description: 'Your meal variety is limited. Consider: adding more fruits and vegetables, trying new recipes, incorporating different protein sources, and consulting a nutritionist for personalized advice.',
          priority: 'medium',
          dataDriven: true,
          metric: 'nutrition',
          severity: 'info'
        });
      }

      if (hasIntermittentTracking) {
        this.recommendations.push({
          category: 'Nutrition',
          title: 'Consistent Meal Tracking',
          description: 'Start tracking your meals regularly to better understand your eating patterns and identify areas for improvement.',
          priority: 'medium',
          dataDriven: true,
          metric: 'nutrition',
          severity: 'info'
        });
      }
    }

    // Analyze cholesterol patterns
    const cholesterolInsights = this.insights.filter(i => i.type === 'cholesterol');
    if (cholesterolInsights.length > 0) {
      const hasHighCholesterol = cholesterolInsights.some(i => i.severity === 'alert');
      const hasBorderlineCholesterol = cholesterolInsights.some(i => i.severity === 'warning');
      const hasRisingTrend = cholesterolInsights.some(i => i.title.includes('Rising Cholesterol'));
      
      if (hasHighCholesterol) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Manage High Cholesterol',
          description: 'Your cholesterol levels are high. Immediate actions: reduce saturated and trans fats, increase fiber intake, exercise regularly, and consult your healthcare provider for medication options.',
          priority: 'high',
          dataDriven: true,
          metric: 'cholesterol',
          severity: 'alert'
        });
      } else if (hasBorderlineCholesterol) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Monitor Cholesterol Levels',
          description: 'Your cholesterol is borderline high. Focus on: heart-healthy diet, regular exercise, weight management, and regular cholesterol monitoring.',
          priority: 'medium',
          dataDriven: true,
          metric: 'cholesterol',
          severity: 'warning'
        });
      }

      if (hasRisingTrend) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: 'Address Rising Cholesterol',
          description: 'Your cholesterol levels are trending upward. Consider: dietary changes, increased physical activity, stress management, and regular monitoring.',
          priority: 'high',
          dataDriven: true,
          metric: 'cholesterol',
          severity: 'warning'
        });
      }
    }
  }

  generateDataDrivenRecommendations() {
    // Calculate specific metrics for personalized recommendations
    const bpInsights = this.insights.filter(i => i.type === 'blood-pressure');
    const moodInsights = this.insights.filter(i => i.type === 'mood');
    const sleepInsights = this.insights.filter(i => i.type === 'sleep');
    
    // Blood pressure specific recommendations
    if (bpInsights.length > 0) {
      const highReadings = bpInsights.filter(i => i.severity === 'alert').length;
      if (highReadings > 0) {
        this.recommendations.push({
          category: 'Cardiovascular Health',
          title: `Address ${highReadings} High BP Readings`,
          description: `You've had ${highReadings} high blood pressure readings recently. Immediate actions: reduce sodium intake, increase potassium-rich foods, practice daily relaxation, and schedule a doctor visit within 1 week.`,
          priority: 'high',
          dataDriven: true,
          metric: 'blood-pressure',
          severity: 'alert',
          specificCount: highReadings
        });
      }
    }

    // Sleep quality recommendations
    if (sleepInsights.length > 0) {
      const poorSleepDays = sleepInsights.filter(i => i.severity === 'warning').length;
      if (poorSleepDays > 0) {
        this.recommendations.push({
          category: 'Sleep Hygiene',
          title: `Improve Sleep Quality (${poorSleepDays} poor nights)`,
          description: `You've had ${poorSleepDays} nights of poor sleep quality. Create: a relaxing bedtime routine, optimal sleep environment (65-68°F, dark, quiet), and avoid screens 1 hour before bed.`,
          priority: 'medium',
          dataDriven: true,
          metric: 'sleep',
          severity: 'warning',
          specificCount: poorSleepDays
        });
      }
    }

    // Stress management recommendations
    if (moodInsights.length > 0) {
      const highStressDays = moodInsights.filter(i => i.title.includes('High Stress')).length;
      if (highStressDays > 0) {
        this.recommendations.push({
          category: 'Mental Health',
          title: `Manage High Stress (${highStressDays} days)`,
          description: `You've experienced ${highStressDays} high-stress days recently. Techniques: deep breathing exercises, progressive muscle relaxation, regular physical activity, and consider stress management counseling.`,
          priority: 'medium',
          dataDriven: true,
          metric: 'stress',
          severity: 'warning',
          specificCount: highStressDays
        });
      }
    }
  }

  generateContextualRecommendations() {
    // Add recommendations based on overall health profile and patterns
    
    // Calculate overall health trends
    const alertCount = this.insights.filter(i => i.severity === 'alert').length;
    const warningCount = this.insights.filter(i => i.severity === 'warning').length;
    const successCount = this.insights.filter(i => i.severity === 'success').length;

    // Health score based recommendations
    if (this.healthScore < 40) {
      this.recommendations.push({
        category: 'Overall Health',
        title: 'Comprehensive Health Review',
        description: `Your health score is ${this.healthScore}/100, indicating multiple areas need attention. Consider: scheduling a comprehensive health checkup, working with a health coach, and developing a multi-faceted wellness plan.`,
        priority: 'high',
        dataDriven: true,
        metric: 'health-score',
        severity: 'alert'
      });
    } else if (this.healthScore < 60) {
      this.recommendations.push({
        category: 'Overall Health',
        title: 'Health Improvement Plan',
        description: `Your health score is ${this.healthScore}/100. Focus on: addressing the ${warningCount} warning areas identified, establishing healthy routines, and regular health monitoring.`,
        priority: 'medium',
        dataDriven: true,
        metric: 'health-score',
        severity: 'warning'
      });
    } else if (this.healthScore >= 80) {
      this.recommendations.push({
        category: 'Overall Health',
        title: 'Maintain Excellent Health',
        description: `Excellent health score of ${this.healthScore}/100! Continue your healthy habits and consider: sharing your strategies with others, setting new wellness goals, and regular health maintenance.`,
        priority: 'low',
        dataDriven: true,
        metric: 'health-score',
        severity: 'success'
      });
    }

    // Data completeness recommendations
    const dataInsights = this.insights.filter(i => i.type === 'data');
    if (dataInsights.length > 0 && dataInsights[0].severity === 'info') {
      this.recommendations.push({
        category: 'Health Tracking',
        title: 'Expand Health Data Collection',
        description: 'Start tracking more health metrics to get better insights. Begin with: daily mood entries, weekly blood pressure readings, and medication adherence logging.',
        priority: 'medium',
        dataDriven: true,
        metric: 'data-completeness',
        severity: 'info'
      });
    }

    // Cross-correlation recommendations
    const correlationInsights = this.insights.filter(i => i.type === 'correlation');
    if (correlationInsights.length > 0) {
      correlationInsights.forEach(insight => {
        if (insight.title.includes('Stress-Health')) {
          this.recommendations.push({
            category: 'Stress Management',
            title: 'Stress-Health Connection',
            description: 'High stress is affecting your health metrics. Implement: daily stress monitoring, relaxation techniques, and stress-reduction activities to protect your overall health.',
            priority: 'high',
            dataDriven: true,
            metric: 'stress-correlation',
            severity: 'warning'
          });
        }
      });
    }

    // Add preventive recommendations based on patterns
    if (alertCount > 0) {
      this.recommendations.push({
        category: 'Preventive Care',
        title: 'Address Health Alerts',
        description: `You have ${alertCount} health alerts requiring immediate attention. Prioritize: addressing the most critical issues first, consulting healthcare providers, and implementing recommended interventions.`,
        priority: 'high',
        dataDriven: true,
        metric: 'alerts',
        severity: 'alert',
        specificCount: alertCount
      });
    }

    // Success reinforcement
    if (successCount > 0) {
      this.recommendations.push({
        category: 'Wellness',
        title: 'Celebrate Health Successes',
        description: `You have ${successCount} positive health indicators! Continue: your successful strategies, share what's working with your healthcare team, and set new wellness goals.`,
        priority: 'low',
        dataDriven: true,
        metric: 'successes',
        severity: 'success',
        specificCount: successCount
      });
    }
  }

  sortRecommendations() {
    // Sort recommendations by priority and relevance
    const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
    const severityOrder = { 'alert': 4, 'warning': 3, 'info': 2, 'success': 1 };
    
    this.recommendations.sort((a, b) => {
      // First by priority
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Then by severity
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      
      // Then by data-driven vs general
      if (a.dataDriven && !b.dataDriven) return -1;
      if (!a.dataDriven && b.dataDriven) return 1;
      
      return 0;
    });

    // Limit to top 8 most relevant recommendations
    this.recommendations = this.recommendations.slice(0, 8);
  }

  displayInsights() {
    const insightsContainer = document.getElementById('insightsList');
    if (!insightsContainer) {
      console.log('Health Insights: insightsList container not found');
      return;
    }
    
    console.log('Health Insights: Displaying insights, count:', this.insights.length);

    // Sort insights by severity (alert > warning > info > success)
    const severityOrder = { 'alert': 4, 'warning': 3, 'info': 2, 'success': 1 };
    this.insights.sort((a, b) => severityOrder[b.severity] - severityOrder[a.severity]);

    insightsContainer.innerHTML = '';

    if (this.insights.length === 0) {
      insightsContainer.innerHTML = `
        <div class="no-insights">
          <div class="no-insights-icon">📊</div>
          <h3>No Health Insights Yet</h3>
          <p>Keep logging your health data to receive personalized insights and recommendations!</p>
          <div class="insights-tips">
            <p><strong>Start by logging:</strong></p>
            <ul>
              <li>Blood pressure readings</li>
              <li>Daily mood and energy levels</li>
              <li>Medication intake</li>
              <li>Limb care assessments</li>
            </ul>
          </div>
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
          <span class="insight-severity ${insight.severity}">${insight.severity.toUpperCase()}</span>
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

  displayRecommendations() {
    const recommendationsContainer = document.getElementById('recommendationsList');
    if (!recommendationsContainer) return;

    recommendationsContainer.innerHTML = '';

    if (this.recommendations.length === 0) {
      recommendationsContainer.innerHTML = `
        <div class="no-recommendations">
          <p>No specific recommendations at this time.</p>
        </div>
      `;
      return;
    }

    // Add AI-driven header
    const aiHeader = document.createElement('div');
    aiHeader.className = 'ai-recommendations-header';
    aiHeader.innerHTML = `
      <div class="ai-header-content">
        <span class="ai-icon">🤖</span>
        <div class="ai-header-text">
          <h4>AI-Powered Recommendations</h4>
          <p>Personalized suggestions based on your health data patterns</p>
        </div>
      </div>
    `;
    recommendationsContainer.appendChild(aiHeader);

    this.recommendations.forEach((rec, index) => {
      const recElement = document.createElement('div');
      recElement.className = `recommendation-item ${rec.priority} ${rec.dataDriven ? 'data-driven' : 'general'}`;
      
      const aiBadge = rec.dataDriven ? '<span class="ai-badge">AI</span>' : '';
      const metricIcon = this.getMetricIcon(rec.metric);
      const specificCount = rec.specificCount ? ` (${rec.specificCount})` : '';
      
      recElement.innerHTML = `
        <div class="recommendation-header">
          <div class="recommendation-meta">
            <span class="recommendation-category">${rec.category}</span>
            ${aiBadge}
          </div>
          <div class="recommendation-indicators">
            <span class="metric-icon">${metricIcon}</span>
            <span class="recommendation-priority ${rec.priority}">${rec.priority}</span>
          </div>
        </div>
        <h4>${rec.title}${specificCount}</h4>
        <p>${rec.description}</p>
        ${rec.dataDriven ? '<div class="data-source">Based on your health data analysis</div>' : ''}
      `;
      recommendationsContainer.appendChild(recElement);
    });
  }

  getMetricIcon(metric) {
    const icons = {
      'blood-pressure': '❤️',
      'mood': '😊',
      'stress': '😰',
      'sleep': '😴',
      'energy': '🔋',
      'medication': '💊',
      'limb-care': '🦵',
      'dme': '🦽',
      'nutrition': '🥗',
      'cholesterol': '🧀',
      'health-score': '📊',
      'data-completeness': '📈',
      'stress-correlation': '🧠',
      'alerts': '⚠️',
      'successes': '🏆'
    };
    return icons[metric] || '📋';
  }

  displayHealthScore() {
    const scoreElement = document.getElementById('healthScoreValue');
    if (!scoreElement) return;

    scoreElement.textContent = this.healthScore;
    
    // Add color coding based on score
    const scoreContainer = scoreElement.closest('.score-circle');
    if (scoreContainer) {
      scoreContainer.className = 'score-circle';
      if (this.healthScore >= 80) {
        scoreContainer.classList.add('excellent');
      } else if (this.healthScore >= 60) {
        scoreContainer.classList.add('good');
      } else if (this.healthScore >= 40) {
        scoreContainer.classList.add('fair');
      } else {
        scoreContainer.classList.add('poor');
      }
    }
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
    console.log('Health Insights: Refreshing insights');
    await this.loadInsights();
  }
}

// Initialize Health Insights
window.healthInsights = new HealthInsights(); 
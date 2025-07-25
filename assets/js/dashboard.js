// Dashboard and Tab Management for Bradley Health
class DashboardManager {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentTab = 'dashboard';
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentTab = 'dashboard';
          this.init();
        } else {
          console.error('Firebase not available for dashboard manager');
        }
      }, 1000);
    }
  }

  init() {
    this.setupTabNavigation();
    this.setupAuthTabs();
    this.setupQuickActions();
    this.loadDashboardData();
  }

  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
      button.addEventListener('click', () => {
        const targetTab = button.getAttribute('data-tab');
        this.switchToTab(targetTab);
      });
    });
  }

  setupAuthTabs() {
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');

    authTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetForm = tab.getAttribute('data-tab');
        
        // Update active tab
        authTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        
        // Show target form
        authForms.forEach(form => {
          form.classList.remove('active');
          if (form.id === `${targetForm}Form`) {
            form.classList.add('active');
          }
        });
      });
    });
  }

  setupQuickActions() {
    // Quick action buttons are handled by onclick attributes in HTML
    // This function can be used for additional quick action setup
  }

  switchToTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    // Update active tab button
    tabButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-tab') === tabName) {
        btn.classList.add('active');
      }
    });

    // Show target tab content
    tabContents.forEach(content => {
      content.classList.remove('active');
      if (content.id === tabName) {
        content.classList.add('active');
      }
    });

    this.currentTab = tabName;
    
    // Load tab-specific data
    this.loadTabData(tabName);
  }

  loadTabData(tabName) {
    // Check if user is authenticated
    const userId = window.authManager?.getUserId();
    if (!userId) {
      console.log('User not authenticated yet, will retry loading tab data');
      // Only retry a few times to avoid infinite loops
      if (!this.tabRetryCount) {
        this.tabRetryCount = 0;
      }
      if (this.tabRetryCount < 3) {
        this.tabRetryCount++;
        setTimeout(() => this.loadTabData(tabName), 1000);
      } else {
        console.log('Max tab data retries reached, stopping tab load');
        this.tabRetryCount = 0;
      }
      return;
    }
    
    // Reset retry count on successful authentication
    this.tabRetryCount = 0;
    
    console.log('Loading data for tab:', tabName);
    
    switch (tabName) {
      case 'dashboard':
        this.loadDashboardData();
        break;
      case 'blood-pressure':
        this.loadBloodPressureData();
        break;
      case 'medications':
        this.loadMedicationData();
        break;
      case 'mood':
        this.loadMoodData();
        break;
      case 'goals':
        this.loadGoalsData();
        break;
      case 'limb-care':
        this.loadLimbCareData();
        break;
      case 'health-insights':
        this.loadHealthInsightsData();
        break;
      case 'profile':
        this.loadProfileData();
        break;
    }
  }

  async loadDashboardData() {
    // Wait for user to be fully authenticated
    const userId = window.authManager?.getUserId();
    if (!userId) {
      console.log('Waiting for user authentication...');
      // Only retry a few times to avoid infinite loops
      if (!this.authRetryCount) {
        this.authRetryCount = 0;
      }
      if (this.authRetryCount < 5) {
        this.authRetryCount++;
        setTimeout(() => this.loadDashboardData(), 1000);
      } else {
        console.log('Max authentication retries reached, stopping dashboard load');
        this.authRetryCount = 0;
      }
      return;
    }
    
    // Reset retry count on successful authentication
    this.authRetryCount = 0;

    console.log('Loading dashboard data for user:', userId);
    
    try {
      await this.updateHealthOverview();
      await this.loadAlerts();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async updateHealthOverview() {
    const userId = window.authManager?.getUserId();
    if (!userId) return;

    try {
      // Get latest blood pressure reading
      const bpSnapshot = await this.db
        .collection('bloodPressure')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!bpSnapshot.empty) {
        const latestBP = bpSnapshot.docs[0].data();
        const bpOverview = document.getElementById('bpOverview');
        if (bpOverview) {
          bpOverview.textContent = `${latestBP.systolic}/${latestBP.diastolic}`;
        }
      }

      // Get medication count
      const medSnapshot = await this.db
        .collection('medications')
        .where('userId', '==', userId)
        .get();

      const medOverview = document.getElementById('medOverview');
      if (medOverview) {
        medOverview.textContent = medSnapshot.size;
      }

      // Get latest mood
      const moodSnapshot = await this.db
        .collection('moodEntries')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!moodSnapshot.empty) {
        const latestMood = moodSnapshot.docs[0].data();
        const moodOverview = document.getElementById('moodOverview');
        if (moodOverview) {
          moodOverview.textContent = latestMood.mood;
        }
      }

      // Get latest limb assessment
      const limbSnapshot = await this.db
        .collection('limbAssessments')
        .where('userId', '==', userId)
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!limbSnapshot.empty) {
        const latestLimb = limbSnapshot.docs[0].data();
        const limbOverview = document.getElementById('limbOverview');
        if (limbOverview) {
          // Determine overall limb health status for multiple limbs
          let overallStatus = 'Good';
          let hasConcerning = false;
          let hasFair = false;
          
          if (latestLimb.limbs && latestLimb.limbs.length > 0) {
            latestLimb.limbs.forEach(limb => {
              if (limb.skinCondition === 'concerning' || limb.skinCondition === 'poor') {
                hasConcerning = true;
              } else if (limb.skinCondition === 'fair') {
                hasFair = true;
              }
            });
            
            if (hasConcerning) {
              overallStatus = '⚠️';
            } else if (hasFair) {
              overallStatus = 'Fair';
            }
          }
          
          limbOverview.textContent = overallStatus;
        }
      }
    } catch (error) {
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
        // Set default values for new users
        const bpOverview = document.getElementById('bpOverview');
        const medOverview = document.getElementById('medOverview');
        const moodOverview = document.getElementById('moodOverview');
        
        if (bpOverview) bpOverview.textContent = '--/--';
        if (medOverview) medOverview.textContent = '0';
        if (moodOverview) moodOverview.textContent = '--';
      } else {
        console.error('Error updating health overview:', error);
      }
    }
  }

  async loadAlerts() {
    const alertsList = document.getElementById('alertsList');
    if (!alertsList) return;

    const alerts = [];

            // Check for high blood pressure
        const userId = window.authManager?.getUserId();
        if (userId) {
          try {
            const bpSnapshot = await this.db
              .collection('bloodPressure')
              .where('userId', '==', userId)
              .orderBy('timestamp', 'desc')
              .limit(1)
              .get();

            if (!bpSnapshot.empty) {
              const latestBP = bpSnapshot.docs[0].data();
              if (latestBP.systolic > 130 || latestBP.diastolic > 80) {
                alerts.push({
                  type: 'warning',
                  icon: '⚠️',
                  text: 'Your latest blood pressure reading is elevated'
                });
              }
            }

            // Check for missed medications
            const medSnapshot = await this.db
              .collection('medications')
              .where('userId', '==', userId)
              .get();

            if (medSnapshot.size > 0) {
              alerts.push({
                type: 'info',
                icon: '💊',
                text: `You have ${medSnapshot.size} active medications`
              });
            }
      } catch (error) {
        // Handle Firestore permissions error gracefully
        if (error.code === 'permission-denied') {
          console.log('Firestore permissions not set up yet - this is normal for new users');
        } else {
          console.error('Error loading alerts:', error);
        }
      }
    }

    // Render alerts
    if (alerts.length === 0) {
      alertsList.innerHTML = `
        <div class="alert-item success">
          <span class="alert-icon">✅</span>
          <span class="alert-text">All systems normal</span>
        </div>
      `;
    } else {
      alertsList.innerHTML = alerts.map(alert => `
        <div class="alert-item ${alert.type}">
          <span class="alert-icon">${alert.icon}</span>
          <span class="alert-text">${alert.text}</span>
        </div>
      `).join('');
    }
  }

  loadBloodPressureData() {
    // This will be handled by the blood-pressure.js module
    if (window.bpManager) {
      window.bpManager.loadReadings();
    }
  }

  loadMedicationData() {
    // Check if user is authenticated before loading data
    const userId = window.authManager?.getUserId();
    if (!userId) {
      console.log('User not authenticated yet, skipping medication data load');
      return;
    }
    
    // This will be handled by the medication-manager.js module
    if (window.medicationManager) {
      window.medicationManager.loadMedications();
    }
  }

  loadMoodData() {
    // Check if user is authenticated before loading data
    const userId = window.authManager?.getUserId();
    if (!userId) {
      console.log('User not authenticated yet, skipping mood data load');
      return;
    }
    
    // This will be handled by the mood-tracker.js module
    if (window.moodTracker) {
      // Reset event listeners to ensure they work correctly
      window.moodTracker.resetEventListeners();
      window.moodTracker.loadMoodEntries();
    }
  }

  loadGoalsData() {
    // Load goals data
    const userId = window.authManager?.getUserId();
    if (!userId) return;

    // This would load goals from Firestore
    console.log('Loading goals data...');
  }

  loadLimbCareData() {
    // Limb care data loading is handled by LimbCareManager
    if (window.limbCareManager) {
      window.limbCareManager.loadLimbHistory();
    }
  }

  loadProfileData() {
    // Load profile data
    const userId = window.authManager?.getUserId();
    if (!userId) return;

    // This would load profile from Firestore
    console.log('Loading profile data...');
  }

  loadHealthInsightsData() {
    // Load health insights data only when on health insights tab
    if (window.healthInsights) {
      window.healthInsights.refreshInsights();
    }
  }

  // Global function for switching tabs
  static switchToTab(tabName) {
    if (window.dashboardManager) {
      window.dashboardManager.switchToTab(tabName);
    }
  }
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardManager = new DashboardManager();
});

// Global function for tab switching
window.switchToTab = function(tabName) {
  DashboardManager.switchToTab(tabName);
}; 
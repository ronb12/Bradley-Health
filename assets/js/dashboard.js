// Dashboard and Tab Management for Bradley Health
class DashboardManager {
  constructor() {
    this.currentTab = 'dashboard';
    this.init();
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
      case 'profile':
        this.loadProfileData();
        break;
    }
  }

  async loadDashboardData() {
    try {
      // Load health overview data
      await this.updateHealthOverview();
      
      // Load alerts
      await this.loadAlerts();
      
      // Initialize charts
      if (window.chartManager) {
        window.chartManager.createHealthChart();
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  async updateHealthOverview() {
    const userId = window.authManager?.getUserId();
    if (!userId) return;

    try {
      // Get latest blood pressure reading
      const bpSnapshot = await firebase.firestore()
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
      const medSnapshot = await firebase.firestore()
        .collection('medications')
        .where('userId', '==', userId)
        .get();

      const medOverview = document.getElementById('medOverview');
      if (medOverview) {
        medOverview.textContent = medSnapshot.size;
      }

      // Get latest mood
      const moodSnapshot = await firebase.firestore()
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
    } catch (error) {
      console.error('Error updating health overview:', error);
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
        const bpSnapshot = await firebase.firestore()
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
        const medSnapshot = await firebase.firestore()
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
        console.error('Error loading alerts:', error);
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

  loadProfileData() {
    // Load profile data
    const userId = window.authManager?.getUserId();
    if (!userId) return;

    // This would load profile from Firestore
    console.log('Loading profile data...');
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
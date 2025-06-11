class DashboardManager {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.insightsManager = new HealthInsightsManager();
    this.medicationReminder = new MedicationReminder();
    this.chartManager = new ChartManager();
    this.exportManager = new ExportManager();
  }

  async init() {
    this.auth.onAuthStateChanged(user => {
      if (!user) {
        window.location.href = 'login.html';
      } else {
        this.loadUserData(user);
        this.loadActivityFeed(user);
        this.loadUpcomingReminders(user);
        this.initializeHealthChart(user);
      }
    });
  }

  async loadUserData(user) {
    try {
      const doc = await this.db.collection('users').doc(user.uid).get();
      if (doc.exists) {
        const data = doc.data();
        document.getElementById('userName').textContent = data.displayName || 'User';
        document.getElementById('displayName').value = data.displayName || '';
        document.getElementById('email').value = user.email;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.showToast('Error loading user data', 'error');
    }
  }

  async loadActivityFeed(user) {
    const activityList = document.getElementById('activityList');
    
    try {
      const snapshot = await this.db.collection('users').doc(user.uid)
        .collection('activity')
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();
      
      if (snapshot.empty) {
        activityList.innerHTML = '<p>No recent activity</p>';
        return;
      }

      activityList.innerHTML = '';
      snapshot.forEach(doc => {
        const activity = doc.data();
        const item = this.createActivityItem(activity);
        activityList.appendChild(item);
      });
    } catch (error) {
      console.error('Error loading activity feed:', error);
      this.showToast('Error loading activity feed', 'error');
    }
  }

  createActivityItem(activity) {
    const div = document.createElement('div');
    div.className = 'activity-item';
    div.innerHTML = `
      <div class="activity-icon">${activity.icon || '📝'}</div>
      <div class="activity-info">
        <div class="activity-name">${activity.type}</div>
        <div class="activity-details">${activity.details}</div>
      </div>
      <div class="activity-time">${this.formatTime(activity.timestamp)}</div>
    `;
    return div;
  }

  async loadUpcomingReminders(user) {
    const upcomingList = document.getElementById('upcomingList');
    
    try {
      const reminders = this.medicationReminder.getUpcomingReminders();
      if (reminders.length === 0) {
        upcomingList.innerHTML = '<p>No upcoming reminders</p>';
        return;
      }

      upcomingList.innerHTML = '';
      reminders.forEach(reminder => {
        const item = this.createUpcomingItem(reminder);
        upcomingList.appendChild(item);
      });
    } catch (error) {
      console.error('Error loading upcoming reminders:', error);
      this.showToast('Error loading upcoming reminders', 'error');
    }
  }

  createUpcomingItem(reminder) {
    const div = document.createElement('div');
    div.className = 'upcoming-item';
    div.innerHTML = `
      <div class="upcoming-icon">💊</div>
      <div class="upcoming-info">
        <div class="upcoming-name">${reminder.name}</div>
        <div class="upcoming-details">${this.medicationReminder.formatTime(reminder.nextDose)}</div>
      </div>
      <div class="upcoming-status">${this.getTimeUntil(reminder.nextDose)}</div>
    `;
    return div;
  }

  async initializeHealthChart(user) {
    try {
      const snapshot = await this.db.collection('users').doc(user.uid)
        .collection('bloodPressure')
        .orderBy('timestamp', 'desc')
        .limit(30)
        .get();

      const readings = [];
      snapshot.forEach(doc => {
        readings.push(doc.data());
      });

      const ctx = document.getElementById('healthChart').getContext('2d');
      const chart = this.chartManager.createLineChart(ctx, {
        labels: readings.map(r => this.formatDate(r.timestamp)),
        datasets: [
          {
            label: 'Systolic',
            data: readings.map(r => r.systolic),
            borderColor: '#1a56db',
            tension: 0.4
          },
          {
            label: 'Diastolic',
            data: readings.map(r => r.diastolic),
            borderColor: '#059669',
            tension: 0.4
          }
        ]
      });
    } catch (error) {
      console.error('Error initializing health chart:', error);
      this.showToast('Error loading health data', 'error');
    }
  }

  async exportHealthData() {
    try {
      const user = this.auth.currentUser;
      const snapshot = await this.db.collection('users').doc(user.uid)
        .collection('bloodPressure')
        .orderBy('timestamp', 'desc')
        .get();

      const readings = [];
      snapshot.forEach(doc => {
        readings.push(doc.data());
      });

      const formattedData = this.exportManager.formatDataForExport(readings, {
        dateFormat: 'MM/DD/YYYY',
        numberFormat: '0',
        excludeFields: ['userId']
      });

      await this.exportManager.exportData(formattedData, 'csv', 'health-data');
      this.showToast('Data exported successfully', 'success');
    } catch (error) {
      console.error('Error exporting data:', error);
      this.showToast('Error exporting data', 'error');
    }
  }

  formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit'
    });
  }

  formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  getTimeUntil(date) {
    const now = new Date();
    const diff = new Date(date) - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 24) {
      return `In ${hours} hours`;
    } else if (hours < 48) {
      return 'Tomorrow';
    } else {
      return this.formatDate(date);
    }
  }

  showToast(message, type = 'info') {
    const toast = document.getElementById('mobile-toast');
    toast.textContent = message;
    toast.className = `mobile-toast mobile-toast-${type}`;
    toast.style.display = 'block';
    
    setTimeout(() => {
      toast.style.display = 'none';
    }, 3000);
  }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const dashboard = new DashboardManager();
  dashboard.init();
}); 
// Notification System for Bradley Health
class NotificationManager {
  constructor() {
    this.db = firebase.firestore();
    this.messaging = firebase.messaging();
    this.currentUser = null;
    this.permission = 'default';
    this.init();
  }

  init() {
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
    }
    
    this.checkPermission();
    this.setupEventListeners();
    this.requestNotificationPermission();
  }

  async checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  async requestNotificationPermission() {
    if ('Notification' in window && this.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        this.permission = permission;
        
        if (permission === 'granted') {
          this.setupPushNotifications();
        }
      } catch (error) {
        console.error('Error requesting notification permission:', error);
      }
    }
  }

  async setupPushNotifications() {
    try {
      // Get FCM token
      const token = await this.messaging.getToken();
      
      if (token && this.currentUser) {
        // Save token to user's profile
        await this.db.collection('users').doc(this.currentUser.uid).update({
          fcmToken: token,
          notificationSettings: {
            enabled: true,
            bloodPressure: true,
            medications: true,
            mood: true,
            goals: true
          }
        });
      }

      // Handle incoming messages
      this.messaging.onMessage((payload) => {
        this.showNotification(payload.notification.title, payload.notification.body);
      });

      // Handle token refresh
      this.messaging.onTokenRefresh(() => {
        this.setupPushNotifications();
      });
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  setupEventListeners() {
    // Notification settings form
    const notificationForm = document.getElementById('notificationForm');
    if (notificationForm) {
      notificationForm.addEventListener('submit', (e) => this.updateNotificationSettings(e));
    }

    // Test notification button
    const testNotificationBtn = document.getElementById('testNotification');
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener('click', () => this.sendTestNotification());
    }
  }

  async updateNotificationSettings(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const settings = {
      enabled: formData.get('enabled') === 'on',
      bloodPressure: formData.get('bloodPressure') === 'on',
      medications: formData.get('medications') === 'on',
      mood: formData.get('mood') === 'on',
      goals: formData.get('goals') === 'on',
      reminderTime: formData.get('reminderTime'),
      updatedAt: new Date()
    };

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        notificationSettings: settings
      });
      this.showToast('Notification settings updated!', 'success');
    } catch (error) {
      this.showToast('Error updating notification settings', 'error');
    }
  }

  showNotification(title, body, options = {}) {
    if (this.permission !== 'granted') return;

    const defaultOptions = {
      icon: '/assets/favicon.svg',
      badge: '/assets/favicon.svg',
      tag: 'bradley-health',
      requireInteraction: false,
      actions: [
        {
          action: 'view',
          title: 'View'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ]
    };

    const notification = new Notification(title, { ...defaultOptions, ...options });
    
    notification.onclick = (event) => {
      event.preventDefault();
      window.focus();
      notification.close();
      
      // Handle notification click
      if (event.action === 'view') {
        this.handleNotificationClick(notification.tag);
      }
    };

    return notification;
  }

  handleNotificationClick(tag) {
    // Navigate based on notification type
    switch (tag) {
      case 'blood-pressure-reminder':
        this.switchToTab('blood-pressure');
        break;
      case 'medication-reminder':
        this.switchToTab('medications');
        break;
      case 'mood-reminder':
        this.switchToTab('mood');
        break;
      default:
        // Default to dashboard
        this.switchToTab('dashboard');
    }
  }

  switchToTab(tabName) {
    // Use existing tab switching functionality
    if (window.switchToTab) {
      window.switchToTab(tabName);
    } else {
      // Fallback tab switching
      const tabButtons = document.querySelectorAll('.tab-button');
      const tabContents = document.querySelectorAll('.tab-content');
      
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
      const targetContent = document.getElementById(tabName);
      
      if (targetButton) targetButton.classList.add('active');
      if (targetContent) targetContent.classList.add('active');
    }
  }

  // Blood Pressure Reminders
  async scheduleBPReminder() {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'blood-pressure',
        title: 'Blood Pressure Check',
        body: 'Time to check your blood pressure',
        scheduledTime: new Date(),
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
    } catch (error) {
      console.error('Error scheduling BP reminder:', error);
    }
  }

  // Medication Reminders
  async scheduleMedicationReminder(medication, time) {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'medication',
        medicationId: medication.id,
        medicationName: medication.name,
        title: 'Medication Reminder',
        body: `Time to take ${medication.name} - ${medication.dosage}`,
        scheduledTime: time,
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
    } catch (error) {
      console.error('Error scheduling medication reminder:', error);
    }
  }

  // Mood Tracking Reminders
  async scheduleMoodReminder() {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'mood',
        title: 'Mood Check-in',
        body: 'How are you feeling today? Take a moment to log your mood',
        scheduledTime: new Date(),
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
    } catch (error) {
      console.error('Error scheduling mood reminder:', error);
    }
  }

  // Goal Reminders
  async scheduleGoalReminder(goal) {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'goal',
        goalId: goal.id,
        goalTitle: goal.title,
        title: 'Goal Reminder',
        body: `Don't forget about your goal: ${goal.title}`,
        scheduledTime: new Date(),
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
    } catch (error) {
      console.error('Error scheduling goal reminder:', error);
    }
  }

  // Send test notification
  sendTestNotification() {
    this.showNotification(
      'Bradley Health',
      'This is a test notification from Bradley Health!',
      {
        tag: 'test-notification',
        requireInteraction: true
      }
    );
  }

  // Show toast notification
  showToast(message, type = 'info', duration = 5000) {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <span class="toast-message">${message}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

    toastContainer.appendChild(toast);

    // Auto remove after duration
    setTimeout(() => {
      if (toast.parentElement) {
        toast.remove();
      }
    }, duration);
  }

  // Check for due reminders
  async checkReminders() {
    if (!this.currentUser) return;

    try {
      const now = new Date();
      const snapshot = await this.db
        .collection('reminders')
        .where('userId', '==', this.currentUser.uid)
        .where('scheduledTime', '<=', now)
        .where('completed', '==', false)
        .get();

      snapshot.docs.forEach(doc => {
        const reminder = doc.data();
        this.showReminderNotification(reminder);
        
        // Mark as completed
        this.db.collection('reminders').doc(doc.id).update({
          completed: true,
          completedAt: new Date()
        });
      });
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  showReminderNotification(reminder) {
    this.showNotification(reminder.title, reminder.body, {
      tag: `${reminder.type}-reminder`,
      requireInteraction: true,
      data: reminder
    });
  }

  // Send push notification to user
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      const userData = userDoc.data();
      
      if (userData && userData.fcmToken) {
        // This would typically be done through a Cloud Function
        // For now, we'll just show a local notification
        this.showNotification(title, body, { data });
      }
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get notification settings
  async getNotificationSettings() {
    if (!this.currentUser) return null;

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      const userData = doc.data();
      return userData?.notificationSettings || null;
    } catch (error) {
      console.error('Error getting notification settings:', error);
      return null;
    }
  }

  // Update notification settings
  async updateSettings(settings) {
    if (!this.currentUser) return;

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        notificationSettings: {
          ...settings,
          updatedAt: new Date()
        }
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
    }
  }
}

// Initialize notification manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
  
  // Check for reminders every minute
  setInterval(() => {
    if (window.notificationManager) {
      window.notificationManager.checkReminders();
    }
  }, 60000);
});

// Global function for showing toasts
window.showToast = function(message, type = 'info') {
  if (window.notificationManager) {
    window.notificationManager.showToast(message, type);
  } else {
    console.log(`${type.toUpperCase()}: ${message}`);
  }
}; 
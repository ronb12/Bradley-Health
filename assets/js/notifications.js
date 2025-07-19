// Notification Management System
class NotificationManager {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.notifications = [];
      this.reminders = [];
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.notifications = [];
          this.reminders = [];
          this.init();
        } else {
          console.error('Firebase not available for notification manager');
        }
      }, 1000);
    }
  }

  init() {
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
    }
    
    this.checkPermission();
    this.setupEventListeners();
    this.requestNotificationPermission();
    this.setupMessaging();
  }

  setupMessaging() {
    // Disable Firebase messaging for now to avoid service worker errors
    console.log('Firebase messaging disabled - using local notifications only');
    this.messaging = null;
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
    if (!this.messaging) {
      console.log('Messaging not available, skipping push notification setup');
      return;
    }

    try {
      // Check if we're in a supported environment for FCM
      if (!('serviceWorker' in navigator)) {
        console.log('Service workers not supported, skipping push notification setup');
        return;
      }

      // Get FCM token with error handling
      let token;
      try {
        token = await this.messaging.getToken({
          vapidKey: 'YOUR_VAPID_KEY_HERE' // Replace with actual VAPID key
        });
      } catch (tokenError) {
        console.log('FCM token not available:', tokenError.message);
        return;
      }
      
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
      console.log('Error setting up push notifications:', error.message);
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
      this.showToast('Blood pressure reminder scheduled!', 'success');
    } catch (error) {
      this.showToast('Error scheduling reminder', 'error');
    }
  }

  // Medication Reminders
  async scheduleMedicationReminder(medication, time) {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'medication',
        title: 'Medication Reminder',
        body: `Time to take ${medication.name} - ${medication.dosage}`,
        scheduledTime: time,
        medicationId: medication.id,
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
      this.showToast('Medication reminder scheduled!', 'success');
    } catch (error) {
      this.showToast('Error scheduling medication reminder', 'error');
    }
  }

  // Mood Reminders
  async scheduleMoodReminder() {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'mood',
        title: 'Mood Check-in',
        body: 'How are you feeling today? Take a moment to log your mood.',
        scheduledTime: new Date(),
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
      this.showToast('Mood reminder scheduled!', 'success');
    } catch (error) {
      this.showToast('Error scheduling mood reminder', 'error');
    }
  }

  // Goal Reminders
  async scheduleGoalReminder(goal) {
    if (!this.currentUser) return;

    try {
      const reminder = {
        type: 'goal',
        title: 'Goal Check-in',
        body: `Don't forget about your goal: ${goal.title}`,
        scheduledTime: new Date(),
        goalId: goal.id,
        userId: this.currentUser.uid,
        createdAt: new Date()
      };

      await this.db.collection('reminders').add(reminder);
      this.showToast('Goal reminder scheduled!', 'success');
    } catch (error) {
      this.showToast('Error scheduling goal reminder', 'error');
    }
  }

  sendTestNotification() {
    this.showNotification(
      'Bradley Health',
      'This is a test notification! Your notification system is working.',
      { tag: 'test-notification' }
    );
    this.showToast('Test notification sent!', 'success');
  }

  showToast(message, type = 'info', duration = 5000) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after duration
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, duration);

    // Also remove on click
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
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
        .get();

      snapshot.docs.forEach(doc => {
        const reminder = { id: doc.id, ...doc.data() };
        this.showReminderNotification(reminder);
        
        // Delete the reminder after showing it
        this.db.collection('reminders').doc(doc.id).delete();
      });
    } catch (error) {
      console.error('Error checking reminders:', error);
    }
  }

  showReminderNotification(reminder) {
    this.showNotification(reminder.title, reminder.body, {
      tag: `${reminder.type}-reminder`,
      requireInteraction: true
    });
  }

  // Send push notification to specific user
  async sendPushNotification(userId, title, body, data = {}) {
    try {
      // This would typically send to Firebase Cloud Functions
      // For now, just show a local notification
      this.showNotification(title, body, data);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get notification settings for current user
  async getNotificationSettings() {
    if (!this.currentUser) return null;

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (doc.exists) {
        return doc.data().notificationSettings || {};
      }
    } catch (error) {
      console.error('Error getting notification settings:', error);
    }
    return null;
  }

  // Update notification settings
  async updateSettings(settings) {
    if (!this.currentUser) return;

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        notificationSettings: settings
      });
      this.showToast('Settings updated successfully!', 'success');
    } catch (error) {
      this.showToast('Error updating settings', 'error');
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
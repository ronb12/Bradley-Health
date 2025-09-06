// Enhanced Notification Manager for Bradley Health
if (typeof NotificationManager === 'undefined') {
class NotificationManager {
  constructor() {
    this.permission = 'default';
    this.init();
  }

  async init() {
    await this.requestPermission();
    this.setupNotificationHandlers();
    this.scheduleNotifications();
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      this.permission = await Notification.requestPermission();
      console.log('Notification permission:', this.permission);
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  }

  setupNotificationHandlers() {
    // Handle notification clicks
    self.addEventListener('notificationclick', (event) => {
      event.notification.close();
      
      const action = event.action;
      const data = event.notification.data;
      
      switch(action) {
        case 'medication':
          this.openTab('medications');
          break;
        case 'blood-pressure':
          this.openTab('blood-pressure');
          break;
        case 'mood':
          this.openTab('mood');
          break;
        case 'appointment':
          this.openTab('health-insights');
          break;
        default:
          this.openApp();
      }
    });

    // Handle notification close
    self.addEventListener('notificationclose', (event) => {
      console.log('Notification closed:', event.notification.tag);
    });
  }

  openTab(tabName) {
    clients.matchAll().then(clients => {
      clients.forEach(client => {
        client.postMessage({
          type: 'OPEN_TAB',
          tab: tabName
        });
      });
    });
  }

  openApp() {
    clients.matchAll().then(clients => {
      if (clients.length > 0) {
        clients[0].focus();
      } else {
        clients.openWindow('/');
      }
    });
  }

  scheduleNotifications() {
    // Schedule medication reminders
    this.scheduleMedicationReminders();
    
    // Schedule health check reminders
    this.scheduleHealthCheckReminders();
    
    // Schedule mood check reminders
    this.scheduleMoodCheckReminders();
  }

  scheduleMedicationReminders() {
    // Get user's medication schedule from Firebase
    if (window.firebaseServices && window.firebaseServices.db) {
      window.firebaseServices.db.collection('medications')
        .where('userId', '==', window.authManager?.getUserId())
        .get()
        .then(snapshot => {
          snapshot.forEach(doc => {
            const medication = doc.data();
            if (medication.timeOfDay) {
              this.scheduleMedicationNotification(medication);
            }
          });
        });
    }
  }

  scheduleMedicationNotification(medication) {
    const [hours, minutes] = medication.timeOfDay.split(':');
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    
    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showNotification(
        'Medication Reminder',
        `Time to take ${medication.name} (${medication.dosage})`,
        'medication',
        {
          medicationId: medication.id,
          medicationName: medication.name
        }
      );
    }, timeUntilNotification);
  }

  scheduleHealthCheckReminders() {
    // Schedule daily health check reminder at 9 AM
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(9, 0, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showNotification(
        'Daily Health Check',
        'Time for your daily health check-in. Log your blood pressure, mood, and medications.',
        'health-check',
        { type: 'daily_reminder' }
      );
    }, timeUntilNotification);
  }

  scheduleMoodCheckReminders() {
    // Schedule mood check reminder at 6 PM
    const now = new Date();
    const scheduledTime = new Date();
    scheduledTime.setHours(18, 0, 0, 0);
    
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1);
    }
    
    const timeUntilNotification = scheduledTime.getTime() - now.getTime();
    
    setTimeout(() => {
      this.showNotification(
        'Mood Check-in',
        'How are you feeling today? Take a moment to log your mood and energy levels.',
        'mood',
        { type: 'mood_reminder' }
      );
    }, timeUntilNotification);
  }

  showNotification(title, body, action = 'default', data = {}) {
    if (this.permission !== 'granted') {
      console.log('Notification permission not granted');
      return;
    }

    const notification = new Notification(title, {
      body: body,
      icon: '/assets/icon-192.png',
      badge: '/assets/icon-72.png',
      tag: action,
      data: data,
      actions: [
        {
          action: action,
          title: 'Open',
          icon: '/assets/icon-72.png'
        },
        {
          action: 'dismiss',
          title: 'Dismiss'
        }
      ],
      requireInteraction: true,
      silent: false
    });

    // Auto-close after 10 seconds if not interacted with
    setTimeout(() => {
      notification.close();
    }, 10000);

    return notification;
  }

  // Show immediate notification
  showImmediateNotification(title, body, type = 'info') {
    const iconMap = {
      'info': '/assets/icon-192.png',
      'success': '/assets/icon-192.png',
      'warning': '/assets/icon-192.png',
      'error': '/assets/icon-192.png'
    };

    return this.showNotification(title, body, type, { type: type });
  }

  // Schedule custom notification
  scheduleCustomNotification(title, body, delay, action = 'default', data = {}) {
    setTimeout(() => {
      this.showNotification(title, body, action, data);
    }, delay);
  }

  // Cancel all notifications
  cancelAllNotifications() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        registration.getNotifications().then(notifications => {
          notifications.forEach(notification => {
            notification.close();
          });
        });
      });
    }
  }

  // Update notification settings
  updateNotificationSettings(settings) {
    localStorage.setItem('notificationSettings', JSON.stringify(settings));
    this.scheduleNotifications(); // Reschedule with new settings
  }

  // Get notification settings
  getNotificationSettings() {
    const defaultSettings = {
      medicationReminders: true,
      healthCheckReminders: true,
      moodCheckReminders: true,
      appointmentReminders: true,
      quietHours: {
        enabled: false,
        start: '22:00',
        end: '08:00'
      }
    };

    const stored = localStorage.getItem('notificationSettings');
    return stored ? { ...defaultSettings, ...JSON.parse(stored) } : defaultSettings;
  }
}

// Initialize notification manager
document.addEventListener('DOMContentLoaded', () => {
  window.notificationManager = new NotificationManager();
});
}

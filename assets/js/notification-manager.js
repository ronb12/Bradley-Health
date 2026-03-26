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
    // Only query Firebase if the user is authenticated
    const userId = window.authManager?.getUserId();
    if (!userId || !window.firebaseServices?.db) return;

    window.firebaseServices.db.collection('medications')
      .where('userId', '==', userId)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          const medication = doc.data();
          if (medication.timeOfDay) {
            this.scheduleMedicationNotification(medication);
          }
        });
      })
      .catch(err => console.log('Medication reminders:', err.message));
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

  // Called from a user gesture (bell button) — requests permission and gives feedback
  async requestPermissionFromUserGesture() {
    if (!('Notification' in window)) {
      window.authManager?.showToast('Notifications are not supported in this browser', 'error');
      return;
    }

    if (this.permission === 'granted') {
      window.authManager?.showToast('Notifications are already enabled', 'success');
      return;
    }

    if (this.permission === 'denied') {
      window.authManager?.showToast('Notifications are blocked. Please enable them in your browser settings.', 'error');
      return;
    }

    try {
      this.permission = await Notification.requestPermission();
      if (this.permission === 'granted') {
        window.authManager?.showToast('Notifications enabled!', 'success');
        this.scheduleNotifications();
      } else {
        window.authManager?.showToast('Notification permission denied', 'error');
      }
    } catch (error) {
      window.authManager?.showToast('Could not enable notifications', 'error');
    }
  }

  // ===== NOTIFICATIONS PANEL =====

  openPanel() {
    if (!document.getElementById('notificationsPanel')) {
      this.createPanel();
    }
    const panel = document.getElementById('notificationsPanel');
    if (panel.classList.contains('open')) {
      this.closePanel();
    } else {
      panel.classList.add('open');
      this.loadNotifications();
    }
  }

  closePanel() {
    const panel = document.getElementById('notificationsPanel');
    if (panel) panel.classList.remove('open');
  }

  createPanel() {
    const panel = document.createElement('div');
    panel.id = 'notificationsPanel';
    panel.className = 'notifications-panel';
    panel.innerHTML = `
      <div class="notifications-panel-header">
        <h3><i class="fas fa-bell"></i> Notifications</h3>
        <button class="notifications-close-btn" aria-label="Close"><i class="fas fa-times"></i></button>
      </div>
      <div id="notificationsList" class="notifications-list"></div>
      <div class="notifications-panel-footer">
        <button class="btn-link" id="markAllReadBtn">Mark all as read</button>
      </div>
    `;
    document.body.appendChild(panel);

    panel.querySelector('.notifications-close-btn').addEventListener('click', () => this.closePanel());
    panel.querySelector('#markAllReadBtn').addEventListener('click', () => this.markAllRead());

    document.addEventListener('click', (e) => {
      const p = document.getElementById('notificationsPanel');
      const bell = document.getElementById('notificationBtn');
      if (p && p.classList.contains('open') && !p.contains(e.target) && (!bell || !bell.contains(e.target))) {
        this.closePanel();
      }
    });
  }

  async loadNotifications() {
    const userId = window.authManager?.getUserId();
    const listEl = document.getElementById('notificationsList');
    if (!listEl) return;

    listEl.innerHTML = '<div class="notifications-loading"><i class="fas fa-spinner fa-spin"></i> Loading...</div>';

    if (!userId || !window.firebaseServices?.db) {
      this.renderNotifications([]);
      return;
    }

    try {
      const snapshot = await window.firebaseServices.db
        .collection('notifications')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(30)
        .get();

      const items = [];
      snapshot.forEach(doc => items.push({ id: doc.id, ...doc.data() }));
      this.renderNotifications(items);
      this._markOpenedAsRead(snapshot);
    } catch (err) {
      console.log('Load notifications:', err.message);
      this.renderNotifications([]);
    }
  }

  renderNotifications(items) {
    const listEl = document.getElementById('notificationsList');
    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = `
        <div class="notifications-empty">
          <i class="fas fa-bell-slash"></i>
          <p>No notifications yet</p>
          <p class="notifications-empty-sub">Medication reminders and health alerts will appear here</p>
        </div>`;
      return;
    }

    const typeIcons = {
      medication: 'fa-pills', 'blood-pressure': 'fa-heart-pulse',
      mood: 'fa-face-smile', health: 'fa-stethoscope',
      goal: 'fa-bullseye', general: 'fa-bell'
    };
    const typeColors = {
      medication: 'green', 'blood-pressure': 'red',
      mood: 'amber', health: 'blue', goal: 'purple', general: 'blue'
    };

    listEl.innerHTML = items.map(n => {
      const icon = typeIcons[n.type] || 'fa-bell';
      const color = typeColors[n.type] || 'blue';
      return `
        <div class="notification-item${n.read ? '' : ' unread'}">
          <div class="notification-icon notification-icon--${color}">
            <i class="fas ${icon}"></i>
          </div>
          <div class="notification-content">
            <p class="notification-title">${n.title}</p>
            <p class="notification-body">${n.body}</p>
            <p class="notification-time">${this._formatTime(n.createdAt)}</p>
          </div>
          ${!n.read ? '<span class="notification-dot"></span>' : ''}
        </div>`;
    }).join('');
  }

  _formatTime(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    return `${days}d ago`;
  }

  async _markOpenedAsRead(snapshot) {
    try {
      const unread = snapshot.docs.filter(d => !d.data().read);
      if (!unread.length) return;
      const batch = window.firebaseServices.db.batch();
      unread.forEach(doc => batch.update(doc.ref, { read: true }));
      await batch.commit();
      this.updateBadge(0);
    } catch (err) {
      console.log('Auto mark read:', err.message);
    }
  }

  async markAllRead() {
    const userId = window.authManager?.getUserId();
    if (!userId || !window.firebaseServices?.db) return;
    try {
      const snapshot = await window.firebaseServices.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();
      if (snapshot.empty) return;
      const batch = window.firebaseServices.db.batch();
      snapshot.forEach(doc => batch.update(doc.ref, { read: true }));
      await batch.commit();
      this.loadNotifications();
      this.updateBadge(0);
    } catch (err) {
      console.log('Mark all read:', err.message);
    }
  }

  updateBadge(count) {
    const bell = document.getElementById('notificationBtn');
    if (!bell) return;
    let badge = bell.querySelector('.notification-badge');
    if (count > 0) {
      if (!badge) {
        badge = document.createElement('span');
        badge.className = 'notification-badge';
        bell.appendChild(badge);
      }
      badge.textContent = count > 9 ? '9+' : count;
    } else if (badge) {
      badge.remove();
    }
  }

  async checkUnreadCount() {
    const userId = window.authManager?.getUserId();
    if (!userId || !window.firebaseServices?.db) return;
    try {
      const snapshot = await window.firebaseServices.db
        .collection('notifications')
        .where('userId', '==', userId)
        .where('read', '==', false)
        .get();
      this.updateBadge(snapshot.size);
    } catch (err) {
      console.log('Badge count:', err.message);
    }
  }

  async saveNotification(title, body, type = 'general') {
    const userId = window.authManager?.getUserId();
    if (!userId || !window.firebaseServices?.db) return;
    try {
      await window.firebaseServices.db.collection('notifications').add({
        userId, title, body, type, read: false, createdAt: new Date()
      });
      this.checkUnreadCount();
    } catch (err) {
      console.log('Save notification:', err.message);
    }
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

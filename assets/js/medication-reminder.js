// Medication Reminder System
class MedicationReminder {
  constructor() {
    this.reminders = [];
    this.notifications = [];
    this.checkInterval = null;
  }

  init() {
    this.loadReminders();
    this.startChecking();
    this.requestNotificationPermission();
  }

  async requestNotificationPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    if (Notification.permission !== 'granted') {
      await Notification.requestPermission();
    }
  }

  loadReminders() {
    const savedReminders = localStorage.getItem('medicationReminders');
    if (savedReminders) {
      this.reminders = JSON.parse(savedReminders);
    }
  }

  saveReminders() {
    localStorage.setItem('medicationReminders', JSON.stringify(this.reminders));
  }

  addReminder(medication) {
    const reminder = {
      id: Date.now().toString(),
      ...medication,
      nextDose: this.calculateNextDose(medication),
      lastTaken: null
    };

    this.reminders.push(reminder);
    this.saveReminders();
    this.scheduleNotification(reminder);
  }

  calculateNextDose(medication) {
    const now = new Date();
    const { frequency, time } = medication;

    switch (frequency) {
      case 'daily':
        return this.setTimeForDate(now, time);
      case 'twice-daily':
        const [morning, evening] = time.split(',');
        const nextTime = now.getHours() < 12 ? morning : evening;
        return this.setTimeForDate(now, nextTime);
      case 'weekly':
        const days = time.split(',').map(d => parseInt(d));
        const nextDay = days.find(d => d > now.getDay()) || days[0];
        const daysUntilNext = (nextDay - now.getDay() + 7) % 7;
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + daysUntilNext);
        return this.setTimeForDate(nextDate, '09:00');
      default:
        return now;
    }
  }

  setTimeForDate(date, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  scheduleNotification(reminder) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const now = new Date();
    const timeUntilNext = reminder.nextDose.getTime() - now.getTime();

    if (timeUntilNext > 0) {
      setTimeout(() => {
        this.showNotification(reminder);
      }, timeUntilNext);
    }
  }

  showNotification(reminder) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    const notification = new Notification('Medication Reminder', {
      body: `Time to take ${reminder.name}`,
      icon: '/assets/icons/medication.png'
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    this.notifications.push(notification);
  }

  markAsTaken(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (reminder) {
      reminder.lastTaken = new Date();
      reminder.nextDose = this.calculateNextDose(reminder);
      this.saveReminders();
      this.scheduleNotification(reminder);
    }
  }

  startChecking() {
    this.checkInterval = setInterval(() => {
      this.checkReminders();
    }, 60000); // Check every minute
  }

  checkReminders() {
    const now = new Date();
    this.reminders.forEach(reminder => {
      if (reminder.nextDose <= now) {
        this.showNotification(reminder);
      }
    });
  }

  getUpcomingReminders() {
    const now = new Date();
    return this.reminders
      .filter(reminder => reminder.nextDose > now)
      .sort((a, b) => a.nextDose - b.nextDose);
  }

  getMissedReminders() {
    const now = new Date();
    return this.reminders
      .filter(reminder => {
        const lastTaken = reminder.lastTaken ? new Date(reminder.lastTaken) : null;
        return !lastTaken || (now - lastTaken) > 24 * 60 * 60 * 1000;
      })
      .sort((a, b) => a.nextDose - b.nextDose);
  }

  formatTime(date) {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  }
}

// Initialize medication reminder system
const medicationReminder = new MedicationReminder(); 
// Blood Pressure Tracker JavaScript

class BloodPressureTracker {
  constructor() {
    this.readings = this.loadReadings();
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDashboard();
    this.loadHistory();
    this.setupFormValidation();
  }

  setupEventListeners() {
    // Form submission
    const bpForm = document.getElementById('bpForm');
    if (bpForm) {
      bpForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    // Cancel button
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => this.resetForm());
    }

    // History filter
    const timeFilter = document.getElementById('timeFilter');
    if (timeFilter) {
      timeFilter.addEventListener('change', () => this.loadHistory());
    }

    // Export data
    const exportBtn = document.getElementById('exportData');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }

    // Settings
    const enableReminders = document.getElementById('enableReminders');
    if (enableReminders) {
      enableReminders.addEventListener('change', (e) => this.toggleReminders(e));
    }
  }

  setupFormValidation() {
    const systolic = document.getElementById('systolic');
    const diastolic = document.getElementById('diastolic');
    const pulse = document.getElementById('pulse');

    // Real-time validation
    if (systolic) {
      systolic.addEventListener('input', () => this.validateBPInput(systolic, 70, 200));
    }
    if (diastolic) {
      diastolic.addEventListener('input', () => this.validateBPInput(diastolic, 40, 130));
    }
    if (pulse) {
      pulse.addEventListener('input', () => this.validateBPInput(pulse, 40, 200));
    }
  }

  validateBPInput(input, min, max) {
    const value = parseInt(input.value);
    if (value < min || value > max) {
      input.style.borderColor = '#dc3545';
      input.setCustomValidity(`Value must be between ${min} and ${max}`);
    } else {
      input.style.borderColor = '#28a745';
      input.setCustomValidity('');
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const reading = {
      systolic: parseInt(formData.get('systolic')),
      diastolic: parseInt(formData.get('diastolic')),
      pulse: formData.get('pulse') ? parseInt(formData.get('pulse')) : null,
      notes: formData.get('notes') || '',
      timestamp: new Date().toISOString(),
      id: Date.now()
    };

    // Validate reading
    if (!this.isValidReading(reading)) {
      this.showToast('Please enter valid blood pressure values', 'error');
      return;
    }

    // Add reading
    this.addReading(reading);
    
    // Reset form and show success message
    this.resetForm();
    this.showToast('Blood pressure reading saved successfully!', 'success');
    
    // Update dashboard and history
    this.updateDashboard();
    this.loadHistory();
    
    // Switch to dashboard tab
    this.switchToTab('dashboard');
  }

  isValidReading(reading) {
    return reading.systolic >= 70 && reading.systolic <= 200 &&
           reading.diastolic >= 40 && reading.diastolic <= 130 &&
           reading.systolic > reading.diastolic;
  }

  addReading(reading) {
    this.readings.unshift(reading);
    this.saveReadings();
  }

  getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'normal';
    if (systolic < 130 && diastolic < 80) return 'elevated';
    if (systolic >= 130 || diastolic >= 80) return 'high';
    return 'normal';
  }

  getStatusColor(status) {
    const colors = {
      normal: '#28a745',
      elevated: '#ffc107',
      high: '#dc3545'
    };
    return colors[status] || '#28a745';
  }

  updateDashboard() {
    if (this.readings.length === 0) return;

    const latest = this.readings[0];
    const status = this.getBPStatus(latest.systolic, latest.diastolic);
    
    // Update current reading display
    const systolicEl = document.querySelector('.systolic');
    const diastolicEl = document.querySelector('.diastolic');
    const statusEl = document.querySelector('.bp-status');
    const timeEl = document.querySelector('.reading-time');

    if (systolicEl) systolicEl.textContent = latest.systolic;
    if (diastolicEl) diastolicEl.textContent = latest.diastolic;
    if (statusEl) {
      statusEl.textContent = status.charAt(0).toUpperCase() + status.slice(1);
      statusEl.className = `bp-status ${status}`;
    }
    if (timeEl) {
      timeEl.textContent = `Last updated: ${this.formatTime(latest.timestamp)}`;
    }

    // Update stats
    this.updateStats();
    
    // Update alerts
    this.updateAlerts();
  }

  updateStats() {
    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    const todayReadings = this.readings.filter(r => 
      new Date(r.timestamp).toDateString() === today
    );
    
    const weekReadings = this.readings.filter(r => 
      new Date(r.timestamp) >= weekAgo
    );

    const avgSystolic = Math.round(
      this.readings.slice(0, 10).reduce((sum, r) => sum + r.systolic, 0) / 
      Math.min(this.readings.length, 10)
    );
    const avgDiastolic = Math.round(
      this.readings.slice(0, 10).reduce((sum, r) => sum + r.diastolic, 0) / 
      Math.min(this.readings.length, 10)
    );

    // Update stats display
    const statElements = document.querySelectorAll('.stat-value');
    if (statElements.length >= 3) {
      statElements[0].textContent = `${todayReadings.length} readings`;
      statElements[1].textContent = `${weekReadings.length} readings`;
      statElements[2].textContent = `${avgSystolic}/${avgDiastolic}`;
    }
  }

  updateAlerts() {
    const alertList = document.querySelector('.alert-list');
    if (!alertList) return;

    const recentReadings = this.readings.slice(0, 5);
    const highReadings = recentReadings.filter(r => 
      this.getBPStatus(r.systolic, r.diastolic) === 'high'
    );

    if (highReadings.length > 0) {
      alertList.innerHTML = `
        <div class="alert-item danger">
          <span class="alert-icon">⚠️</span>
          <span class="alert-text">High blood pressure detected in recent readings</span>
        </div>
      `;
    } else {
      alertList.innerHTML = `
        <div class="alert-item normal">
          <span class="alert-icon">✅</span>
          <span class="alert-text">All readings within normal range</span>
        </div>
      `;
    }
  }

  loadHistory() {
    const readingsList = document.getElementById('readingsList');
    if (!readingsList) return;

    const timeFilter = document.getElementById('timeFilter');
    const days = timeFilter ? parseInt(timeFilter.value) : 7;
    
    let filteredReadings = this.readings;
    if (days !== 'all') {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      filteredReadings = this.readings.filter(r => new Date(r.timestamp) >= cutoffDate);
    }

    readingsList.innerHTML = filteredReadings.map(reading => {
      const status = this.getBPStatus(reading.systolic, reading.diastolic);
      return `
        <div class="reading-item">
          <div class="reading-info">
            <div class="reading-bp">${reading.systolic}/${reading.diastolic} mmHg</div>
            <div class="reading-time">${this.formatTime(reading.timestamp)}</div>
            ${reading.notes ? `<div class="reading-notes">${reading.notes}</div>` : ''}
          </div>
          <div class="reading-status ${status}">${status}</div>
        </div>
      `;
    }).join('');
  }

  resetForm() {
    const form = document.getElementById('bpForm');
    if (form) {
      form.reset();
      // Reset validation styles
      const inputs = form.querySelectorAll('input, textarea');
      inputs.forEach(input => {
        input.style.borderColor = '#e1e5e9';
        input.setCustomValidity('');
      });
    }
  }

  switchToTab(tabName) {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabContents.forEach(tc => tc.classList.remove('active'));

    const targetButton = document.querySelector(`[data-tab="${tabName}"]`);
    const targetContent = document.getElementById(tabName);

    if (targetButton) targetButton.classList.add('active');
    if (targetContent) targetContent.classList.add('active');
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  showToast(message, type = 'success') {
    const toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-header">
        <span class="toast-title">${type === 'success' ? 'Success' : 'Error'}</span>
        <button class="toast-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
      <div class="toast-message">${message}</div>
    `;

    toastContainer.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('show'), 100);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  exportData() {
    const dataStr = JSON.stringify(this.readings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `blood-pressure-data-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
    this.showToast('Data exported successfully!', 'success');
  }

  toggleReminders(e) {
    if (e.target.checked) {
      this.showToast('Reminders enabled', 'success');
    } else {
      this.showToast('Reminders disabled', 'success');
    }
  }

  loadReadings() {
    const saved = localStorage.getItem('bpReadings');
    return saved ? JSON.parse(saved) : [];
  }

  saveReadings() {
    localStorage.setItem('bpReadings', JSON.stringify(this.readings));
  }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BloodPressureTracker();
}); 
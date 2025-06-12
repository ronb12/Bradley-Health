class BloodPressureManager {
  constructor(notificationManager, exportManager) {
    // Check if Firebase is initialized
    if (!firebase.apps.length) {
      throw new Error('Firebase must be initialized before creating BloodPressureManager');
    }

    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.notificationManager = notificationManager;
    this.exportManager = exportManager;
    this.currentUser = null;
    this.readings = [];
    this.chart = null;
    this.currentRange = 7; // Default to 7 days
    
    // BP Categories
    this.bpCategories = {
      normal: { min: 0, max: 120, color: '#51cf66', label: 'Normal' },
      elevated: { min: 121, max: 129, color: '#ffd43b', label: 'Elevated' },
      hypertension1: { min: 130, max: 139, color: '#ff922b', label: 'Stage 1' },
      hypertension2: { min: 140, max: 180, color: '#fa5252', label: 'Stage 2' },
      crisis: { min: 181, max: 999, color: '#e03131', label: 'Crisis' }
    };

    // Health Goals
    this.healthGoals = {
      systolic: { target: 120, range: 10 },
      diastolic: { target: 80, range: 10 },
      pulse: { target: 72, range: 15 }
    };
  }

  async init() {
    try {
      // Wait for authentication state
      await new Promise((resolve, reject) => {
        const unsubscribe = this.auth.onAuthStateChanged(user => {
          unsubscribe();
          if (user) {
            this.currentUser = user;
            resolve();
          } else {
            reject(new Error('User not authenticated'));
          }
        });
      });

      // Load readings and set up event listeners
      await this.loadReadings();
      this.setupEventListeners();
      this.updateStats();
      this.initializeChart();
    } catch (error) {
      console.error('Failed to initialize BloodPressureManager:', error);
      this.notificationManager.showToast('Failed to initialize blood pressure tracking', 'error');
      throw error;
    }
  }

  setupEventListeners() {
    // Form submission
    document.getElementById('bpForm').addEventListener('submit', (e) => {
      e.preventDefault();
      this.saveReading();
    });

    // Time range selection
    document.querySelectorAll('.time-range button').forEach(button => {
      button.addEventListener('click', (e) => {
        document.querySelector('.time-range button.active').classList.remove('active');
        e.target.classList.add('active');
        this.currentRange = parseInt(e.target.dataset.range);
        this.loadReadings();
      });
    });

    // Export button
    document.querySelector('.export-btn').addEventListener('click', () => {
      this.exportData();
    });

    // Measurement guide
    document.querySelector('.measurement-guide').addEventListener('click', () => {
      this.showMeasurementGuide();
    });
  }

  async loadReadings() {
    if (!this.currentUser) {
      console.log('Waiting for user authentication...');
      return;
    }

    this.showLoading();
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - this.currentRange);

      const snapshot = await this.db
        .collection('users')
        .doc(this.currentUser.uid)
        .collection('bloodPressure')
        .where('timestamp', '>=', startDate)
        .orderBy('timestamp', 'desc')
        .get();

      const readings = [];
      snapshot.forEach(doc => {
        readings.push({ id: doc.id, ...doc.data() });
      });

      this.updateReadingsList(readings);
      this.updateStatistics(readings);
      this.updateChart(readings);
      this.updateCurrentStatus(readings[0]);

    } catch (error) {
      console.error('Error loading readings:', error);
      this.notificationManager.showToast('Error loading readings', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async saveReading() {
    const systolic = parseInt(document.getElementById('systolic').value);
    const diastolic = parseInt(document.getElementById('diastolic').value);
    const pulse = parseInt(document.getElementById('pulse').value);
    const notes = document.getElementById('notes').value;

    if (!this.validateReading(systolic, diastolic, pulse)) {
      return;
    }

    this.showLoading();
    try {
      const user = this.auth.currentUser;
      const reading = {
        systolic,
        diastolic,
        pulse,
        notes,
        timestamp: firebase.firestore.FieldValue.serverTimestamp()
      };

      await this.db
        .collection('users')
        .doc(user.uid)
        .collection('bloodPressure')
        .add(reading);

      document.getElementById('bpForm').reset();
      this.loadReadings();
      this.checkHighBP(systolic, diastolic);
      this.notificationManager.showToast('Reading saved successfully');

    } catch (error) {
      console.error('Error saving reading:', error);
      this.notificationManager.showToast('Error saving reading', 'error');
    } finally {
      this.hideLoading();
    }
  }

  validateReading(systolic, diastolic, pulse) {
    if (systolic < 60 || systolic > 250) {
      this.notificationManager.showToast('Invalid systolic value', 'error');
      return false;
    }
    if (diastolic < 40 || diastolic > 150) {
      this.notificationManager.showToast('Invalid diastolic value', 'error');
      return false;
    }
    if (pulse < 40 || pulse > 200) {
      this.notificationManager.showToast('Invalid pulse value', 'error');
      return false;
    }
    return true;
  }

  updateReadingsList(readings) {
    const list = document.getElementById('readingsList');
    list.innerHTML = '';

    readings.forEach(reading => {
      const item = document.createElement('div');
      item.className = 'reading-item';
      item.innerHTML = `
        <div class="reading-info">
          <div class="reading-values">
            <span class="reading-bp">${reading.systolic}/${reading.diastolic}</span>
            <span class="reading-pulse">${reading.pulse} bpm</span>
          </div>
          <div class="reading-time">${this.formatTime(reading.timestamp)}</div>
        </div>
        <div class="reading-actions">
          <button class="edit-btn" onclick="bloodPressureManager.editReading('${reading.id}')">
            <i class="fas fa-edit"></i>
          </button>
          <button class="delete-btn" onclick="bloodPressureManager.deleteReading('${reading.id}')">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
      list.appendChild(item);
    });
  }

  updateStatistics(readings) {
    if (readings.length === 0) {
      document.getElementById('avgBP').textContent = '--/--';
      document.getElementById('avgPulse').textContent = '--';
      document.getElementById('readingsToday').textContent = '0';
      return;
    }

    const today = new Date().setHours(0, 0, 0, 0);
    const readingsToday = readings.filter(r => 
      r.timestamp.toDate().setHours(0, 0, 0, 0) === today
    ).length;

    const avgSystolic = Math.round(readings.reduce((sum, r) => sum + r.systolic, 0) / readings.length);
    const avgDiastolic = Math.round(readings.reduce((sum, r) => sum + r.diastolic, 0) / readings.length);
    const avgPulse = Math.round(readings.reduce((sum, r) => sum + r.pulse, 0) / readings.length);

    document.getElementById('avgBP').textContent = `${avgSystolic}/${avgDiastolic}`;
    document.getElementById('avgPulse').textContent = avgPulse;
    document.getElementById('readingsToday').textContent = readingsToday;
  }

  updateChart(readings) {
    const ctx = document.getElementById('bpChart').getContext('2d');
    
    if (this.chart) {
      this.chart.destroy();
    }

    const labels = readings.map(r => this.formatDate(r.timestamp));
    const systolicData = readings.map(r => r.systolic);
    const diastolicData = readings.map(r => r.diastolic);
    const pulseData = readings.map(r => r.pulse);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Systolic',
            data: systolicData,
            borderColor: '#ff6b6b',
            tension: 0.4
          },
          {
            label: 'Diastolic',
            data: diastolicData,
            borderColor: '#4dabf7',
            tension: 0.4
          },
          {
            label: 'Pulse',
            data: pulseData,
            borderColor: '#51cf66',
            tension: 0.4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top'
          }
        },
        scales: {
          y: {
            beginAtZero: false
          }
        }
      }
    });
  }

  updateCurrentStatus(latestReading) {
    if (!latestReading) {
      document.querySelector('.systolic').textContent = '--';
      document.querySelector('.diastolic').textContent = '--';
      document.querySelector('.pulse-value').textContent = '--';
      document.querySelector('.bp-timestamp').textContent = 'Last reading: --';
      return;
    }

    document.querySelector('.systolic').textContent = latestReading.systolic;
    document.querySelector('.diastolic').textContent = latestReading.diastolic;
    document.querySelector('.pulse-value').textContent = latestReading.pulse;
    document.querySelector('.bp-timestamp').textContent = 
      `Last reading: ${this.formatTime(latestReading.timestamp)}`;
  }

  async editReading(id) {
    const user = this.auth.currentUser;
    const doc = await this.db
      .collection('users')
      .doc(user.uid)
      .collection('bloodPressure')
      .doc(id)
      .get();

    if (!doc.exists) {
      this.notificationManager.showToast('Reading not found', 'error');
      return;
    }

    const reading = doc.data();
    document.getElementById('systolic').value = reading.systolic;
    document.getElementById('diastolic').value = reading.diastolic;
    document.getElementById('pulse').value = reading.pulse;
    document.getElementById('notes').value = reading.notes || '';

    // Scroll to form
    document.querySelector('.add-reading').scrollIntoView({ behavior: 'smooth' });
  }

  async deleteReading(id) {
    if (!confirm('Are you sure you want to delete this reading?')) {
      return;
    }

    this.showLoading();
    try {
      const user = this.auth.currentUser;
      await this.db
        .collection('users')
        .doc(user.uid)
        .collection('bloodPressure')
        .doc(id)
        .delete();

      this.loadReadings();
      this.notificationManager.showToast('Reading deleted successfully');

    } catch (error) {
      console.error('Error deleting reading:', error);
      this.notificationManager.showToast('Error deleting reading', 'error');
    } finally {
      this.hideLoading();
    }
  }

  checkHighBP(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) {
      this.notificationManager.showToast(
        'Warning: Your blood pressure is very high. Please seek medical attention.',
        'warning'
      );
    } else if (systolic >= 140 || diastolic >= 90) {
      this.notificationManager.showToast(
        'Warning: Your blood pressure is high. Consider consulting your doctor.',
        'warning'
      );
    }
  }

  async exportData() {
    this.showLoading();
    try {
      const user = this.auth.currentUser;
      const snapshot = await this.db
        .collection('users')
        .doc(user.uid)
        .collection('bloodPressure')
        .orderBy('timestamp', 'desc')
        .get();

      const readings = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        readings.push({
          Date: this.formatDate(data.timestamp),
          Time: this.formatTime(data.timestamp),
          Systolic: data.systolic,
          Diastolic: data.diastolic,
          Pulse: data.pulse,
          Notes: data.notes || ''
        });
      });

      this.exportManager.exportToCSV(readings, 'blood-pressure-readings');

    } catch (error) {
      console.error('Error exporting data:', error);
      this.notificationManager.showToast('Error exporting data', 'error');
    } finally {
      this.hideLoading();
    }
  }

  showMeasurementGuide() {
    // Scroll to guide section
    document.querySelector('.measurement-guide').scrollIntoView({ behavior: 'smooth' });
  }

  formatTime(timestamp) {
    if (!timestamp) return '--';
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(timestamp) {
    if (!timestamp) return '--';
    const date = timestamp.toDate();
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  showLoading() {
    document.getElementById('loadingOverlay').style.display = 'flex';
  }

  hideLoading() {
    document.getElementById('loadingOverlay').style.display = 'none';
  }

  getBPCategory(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) return 'crisis';
    if (systolic >= 140 || diastolic >= 90) return 'hypertension2';
    if (systolic >= 130 || diastolic >= 80) return 'hypertension1';
    if (systolic >= 120 && diastolic < 80) return 'elevated';
    return 'normal';
  }

  getBPColor(systolic, diastolic) {
    const category = this.getBPCategory(systolic, diastolic);
    return this.bpCategories[category].color;
  }

  async setReminder(time, frequency) {
    try {
      await this.db
        .collection('users')
        .doc(this.currentUser.uid)
        .collection('reminders')
        .add({
          time,
          frequency,
          type: 'bloodPressure',
          active: true,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

      this.notificationManager.showToast('Reminder set successfully');
    } catch (error) {
      console.error('Error setting reminder:', error);
      this.notificationManager.showToast('Error setting reminder', 'error');
    }
  }

  calculateHealthScore(readings) {
    if (readings.length === 0) return 0;

    const recentReadings = readings.slice(0, 7); // Last 7 readings
    let score = 100;

    recentReadings.forEach(reading => {
      const category = this.getBPCategory(reading.systolic, reading.diastolic);
      switch (category) {
        case 'crisis': score -= 20; break;
        case 'hypertension2': score -= 15; break;
        case 'hypertension1': score -= 10; break;
        case 'elevated': score -= 5; break;
      }
    });

    return Math.max(0, Math.round(score / recentReadings.length));
  }

  async generateDoctorReport() {
    const readings = await this.getReadingsForReport();
    const stats = this.calculateDetailedStats(readings);
    const trends = this.analyzeTrends(readings);
    
    return {
      patientInfo: {
        name: this.currentUser.displayName,
        email: this.currentUser.email,
        lastUpdated: new Date().toISOString()
      },
      readings: readings,
      statistics: stats,
      trends: trends,
      recommendations: this.generateRecommendations(stats, trends)
    };
  }

  calculateDetailedStats(readings) {
    if (readings.length === 0) return null;

    const morningReadings = readings.filter(r => {
      const hour = r.timestamp.toDate().getHours();
      return hour >= 6 && hour < 12;
    });

    const eveningReadings = readings.filter(r => {
      const hour = r.timestamp.toDate().getHours();
      return hour >= 18 && hour < 22;
    });

    return {
      overall: {
        systolic: this.calculateAverage(readings.map(r => r.systolic)),
        diastolic: this.calculateAverage(readings.map(r => r.diastolic)),
        pulse: this.calculateAverage(readings.map(r => r.pulse))
      },
      morning: {
        systolic: this.calculateAverage(morningReadings.map(r => r.systolic)),
        diastolic: this.calculateAverage(morningReadings.map(r => r.diastolic)),
        pulse: this.calculateAverage(morningReadings.map(r => r.pulse))
      },
      evening: {
        systolic: this.calculateAverage(eveningReadings.map(r => r.systolic)),
        diastolic: this.calculateAverage(eveningReadings.map(r => r.diastolic)),
        pulse: this.calculateAverage(eveningReadings.map(r => r.pulse))
      }
    };
  }

  analyzeTrends(readings) {
    if (readings.length < 2) return null;

    const sortedReadings = [...readings].sort((a, b) => 
      a.timestamp.toDate() - b.timestamp.toDate()
    );

    return {
      systolic: this.calculateTrend(sortedReadings.map(r => r.systolic)),
      diastolic: this.calculateTrend(sortedReadings.map(r => r.diastolic)),
      pulse: this.calculateTrend(sortedReadings.map(r => r.pulse))
    };
  }

  calculateTrend(values) {
    const n = values.length;
    const sumX = (n * (n - 1)) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = (n * (n - 1) * (2 * n - 1)) / 6;

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return {
      direction: slope > 0 ? 'increasing' : slope < 0 ? 'decreasing' : 'stable',
      rate: Math.abs(slope)
    };
  }

  generateRecommendations(stats, trends) {
    const recommendations = [];

    // Check overall BP
    if (stats.overall.systolic > 140 || stats.overall.diastolic > 90) {
      recommendations.push({
        type: 'warning',
        message: 'Your blood pressure is consistently high. Please consult your doctor.'
      });
    }

    // Check morning-evening difference
    const morningEveningDiff = {
      systolic: Math.abs(stats.morning.systolic - stats.evening.systolic),
      diastolic: Math.abs(stats.morning.diastolic - stats.evening.diastolic)
    };

    if (morningEveningDiff.systolic > 20 || morningEveningDiff.diastolic > 10) {
      recommendations.push({
        type: 'info',
        message: 'Consider taking readings at the same time each day for more consistent results.'
      });
    }

    // Check trends
    if (trends.systolic.direction === 'increasing' && trends.systolic.rate > 5) {
      recommendations.push({
        type: 'warning',
        message: 'Your systolic pressure is trending upward. Consider lifestyle changes.'
      });
    }

    return recommendations;
  }
}

// Initialize blood pressure manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bloodPressureManager = new BloodPressureManager();
  bloodPressureManager.init();
}); 
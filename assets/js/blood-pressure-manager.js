class BloodPressureManager {
  constructor(notificationManager, exportManager) {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.notificationManager = notificationManager;
    this.exportManager = exportManager;
    this.chart = null;
    this.currentRange = 7; // Default to 7 days
  }

  init() {
    this.auth.onAuthStateChanged(user => {
      if (user) {
        this.loadReadings();
        this.setupEventListeners();
      } else {
        window.location.href = 'login.html';
      }
    });
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
    this.showLoading();
    try {
      const user = this.auth.currentUser;
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - this.currentRange);

      const snapshot = await this.db
        .collection('users')
        .doc(user.uid)
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
}

// Initialize blood pressure manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bloodPressureManager = new BloodPressureManager();
  bloodPressureManager.init();
}); 
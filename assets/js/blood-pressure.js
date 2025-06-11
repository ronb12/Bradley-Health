// Blood Pressure Management
class BloodPressureManager {
  constructor() {
    this.readings = [];
    this.chart = null;
  }

  init() {
    this.loadReadings();
    this.setupEventListeners();
  }

  async loadReadings() {
    try {
      const snapshot = await db.collection("bloodPressure")
        .where("uid", "==", currentUser.uid)
        .orderBy("timestamp", "desc")
        .limit(30)
        .get();

      this.readings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.updateDisplay();
      this.updateChart();
    } catch (error) {
      console.error('Error loading readings:', error);
      notificationSystem.show('Failed to load blood pressure readings', 'error');
    }
  }

  updateDisplay() {
    if (!this.readings || this.readings.length === 0) return;
    
    const latest = this.readings[0];
    const systolic = document.querySelector('.systolic');
    const diastolic = document.querySelector('.diastolic');
    const pulse = document.querySelector('.pulse-value');
    const timestamp = document.querySelector('.bp-timestamp');
    const status = document.querySelector('.status-badge');
    
    if (systolic) systolic.textContent = latest.systolic;
    if (diastolic) diastolic.textContent = latest.diastolic;
    if (pulse) pulse.textContent = latest.pulse || '--';
    if (timestamp) {
      const date = new Date(latest.timestamp);
      timestamp.textContent = `Last reading: ${date.toLocaleString()}`;
    }
    
    // Update status badge
    if (status) {
      let statusClass = 'status-normal';
      let statusText = 'Normal';
      
      if (latest.systolic >= 140 || latest.diastolic >= 90) {
        statusClass = 'status-danger';
        statusText = 'High';
      } else if (latest.systolic >= 120 || latest.diastolic >= 80) {
        statusClass = 'status-warning';
        statusText = 'Elevated';
      } else if (latest.systolic < 90 || latest.diastolic < 60) {
        statusClass = 'status-warning';
        statusText = 'Low';
      }
      
      status.className = `status-badge ${statusClass}`;
      status.textContent = statusText;
    }
  }

  updateChart() {
    const ctx = document.getElementById('bpChart')?.getContext('2d');
    if (!ctx) return;

    if (this.chart) {
      this.chart.destroy();
    }

    const data = this.readings.slice().reverse();
    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(r => new Date(r.timestamp).toLocaleDateString()),
        datasets: [
          {
            label: 'Systolic',
            data: data.map(r => r.systolic),
            borderColor: '#1a56db',
            tension: 0.4
          },
          {
            label: 'Diastolic',
            data: data.map(r => r.diastolic),
            borderColor: '#059669',
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

  setupEventListeners() {
    const form = document.getElementById('bpForm');
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await this.saveReading();
      });
    }

    const timeRange = document.getElementById('timeRange');
    if (timeRange) {
      timeRange.addEventListener('change', () => {
        this.updateChart();
      });
    }
  }

  async saveReading() {
    const form = document.getElementById('bpForm');
    if (!form) return;

    const formData = new FormData(form);
    const reading = {
      systolic: parseInt(formData.get('systolic')),
      diastolic: parseInt(formData.get('diastolic')),
      pulse: parseInt(formData.get('pulse')) || null,
      notes: formData.get('notes'),
      timestamp: new Date().toISOString(),
      uid: currentUser.uid
    };

    try {
      await db.collection('bloodPressure').add(reading);
      notificationSystem.show('Blood pressure reading saved successfully', 'success');
      form.reset();
      await this.loadReadings();
    } catch (error) {
      console.error('Error saving reading:', error);
      notificationSystem.show('Failed to save reading', 'error');
    }
  }
}

// Initialize blood pressure manager
document.addEventListener('DOMContentLoaded', () => {
  const bpManager = new BloodPressureManager();
  bpManager.init();
}); 
// Charts and Data Visualization System
class ChartManager {
  constructor() {
    this.charts = {};
    this.init();
  }

  init() {
    this.setupCharts();
  }

  setupCharts() {
    // Health Overview Chart
    this.createHealthChart();
    
    // Mood Chart
    this.createMoodChart();
    
    // Blood Pressure Chart
    this.createBPChart();
    
    // Medication Adherence Chart
    this.createMedicationChart();
  }

  createHealthChart() {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;

    this.charts.health = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Blood Pressure (Systolic)',
          data: [120, 118, 122, 119, 121, 117, 120],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: 'Blood Pressure (Diastolic)',
          data: [80, 78, 82, 79, 81, 77, 80],
          borderColor: '#764ba2',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          tension: 0.4,
          yAxisID: 'y'
        }, {
          label: 'Mood Level',
          data: [7, 8, 6, 9, 7, 8, 7],
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        scales: {
          x: {
            display: true,
            title: {
              display: true,
              text: 'Date'
            }
          },
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Blood Pressure (mmHg)'
            },
            min: 60,
            max: 140
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Mood Level (1-10)'
            },
            min: 0,
            max: 10,
            grid: {
              drawOnChartArea: false,
            },
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Health Overview - Last 7 Days'
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  createMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    this.charts.mood = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Mood',
          data: [7, 8, 6, 9, 7, 8, 7],
          borderColor: '#f093fb',
          backgroundColor: 'rgba(240, 147, 251, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Energy',
          data: [6, 7, 5, 8, 6, 7, 6],
          borderColor: '#f5576c',
          backgroundColor: 'rgba(245, 87, 108, 0.1)',
          tension: 0.4,
          fill: true
        }, {
          label: 'Stress',
          data: [4, 3, 6, 2, 4, 3, 4],
          borderColor: '#4facfe',
          backgroundColor: 'rgba(79, 172, 254, 0.1)',
          tension: 0.4,
          fill: true
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 10,
            title: {
              display: true,
              text: 'Level (1-10)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Mood Trends - Last 7 Days'
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  createBPChart() {
    const ctx = document.getElementById('bpChart');
    if (!ctx) return;

    this.charts.bp = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.getLast7Days(),
        datasets: [{
          label: 'Systolic',
          data: [120, 118, 122, 119, 121, 117, 120],
          borderColor: '#667eea',
          backgroundColor: 'rgba(102, 126, 234, 0.1)',
          tension: 0.4
        }, {
          label: 'Diastolic',
          data: [80, 78, 82, 79, 81, 77, 80],
          borderColor: '#764ba2',
          backgroundColor: 'rgba(118, 75, 162, 0.1)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: false,
            min: 60,
            max: 140,
            title: {
              display: true,
              text: 'Blood Pressure (mmHg)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Blood Pressure Trends - Last 7 Days'
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  createMedicationChart() {
    const ctx = document.getElementById('medicationChart');
    if (!ctx) return;

    this.charts.medication = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Taken', 'Missed', 'Skipped'],
        datasets: [{
          data: [85, 10, 5],
          backgroundColor: [
            '#10b981',
            '#ef4444',
            '#f59e0b'
          ],
          borderWidth: 2,
          borderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Medication Adherence - This Week'
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }

  getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    }
    return dates;
  }

  updateHealthChart(data) {
    if (!this.charts.health) return;

    this.charts.health.data.datasets[0].data = data.systolic || [];
    this.charts.health.data.datasets[1].data = data.diastolic || [];
    this.charts.health.data.datasets[2].data = data.mood || [];
    this.charts.health.update();
  }

  updateMoodChart(data) {
    if (!this.charts.mood) return;

    this.charts.mood.data.datasets[0].data = data.mood || [];
    this.charts.mood.data.datasets[1].data = data.energy || [];
    this.charts.mood.data.datasets[2].data = data.stress || [];
    this.charts.mood.update();
  }

  updateBPChart(data) {
    if (!this.charts.bp) return;

    this.charts.bp.data.datasets[0].data = data.systolic || [];
    this.charts.bp.data.datasets[1].data = data.diastolic || [];
    this.charts.bp.update();
  }

  updateMedicationChart(data) {
    if (!this.charts.medication) return;

    this.charts.medication.data.datasets[0].data = [
      data.taken || 0,
      data.missed || 0,
      data.skipped || 0
    ];
    this.charts.medication.update();
  }

  // Create a new chart dynamically
  createChart(elementId, config) {
    const ctx = document.getElementById(elementId);
    if (!ctx) return null;

    const chart = new Chart(ctx, config);
    this.charts[elementId] = chart;
    return chart;
  }

  // Destroy a chart
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      this.charts[chartId].destroy();
      delete this.charts[chartId];
    }
  }

  // Export chart as image
  exportChart(chartId, format = 'png') {
    if (this.charts[chartId]) {
      return this.charts[chartId].toBase64Image();
    }
    return null;
  }

  // Get chart data
  getChartData(chartId) {
    if (this.charts[chartId]) {
      return this.charts[chartId].data;
    }
    return null;
  }
}

// Initialize chart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.chartManager = new ChartManager();
}); 
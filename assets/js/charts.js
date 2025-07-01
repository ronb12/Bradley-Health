// Charts and Data Visualization System
class ChartManager {
  constructor() {
    this.charts = {};
    this.initialized = false;
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    this.setupCharts();
  }

  setupCharts() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.createCharts());
    } else {
      // Small delay to ensure all elements are rendered
      setTimeout(() => this.createCharts(), 300);
    }
  }

  createCharts() {
    // Destroy any existing charts first
    this.destroyAllCharts();
    
    // Wait a bit more to ensure DOM is fully ready
    setTimeout(() => {
      // Create health overview chart
      this.createHealthChart();
      
      // Create mood chart
      this.createMoodChart();
      
      // Create blood pressure chart
      this.createBPChart();
      
      // Create medication chart
      this.createMedicationChart();
    }, 200);
  }

  createHealthChart() {
    const ctx = document.getElementById('healthChart');
    if (!ctx) return;

    // Check if canvas is already in use
    if (ctx.chart) {
      try {
        ctx.chart.destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      ctx.chart = null;
    }

    // Destroy existing chart if it exists
    if (this.charts.health) {
      try {
        this.charts.health.destroy();
      } catch (e) {
        console.log('Health chart already destroyed');
      }
      this.charts.health = null;
    }

    try {
      this.charts.health = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7Days(),
          datasets: [{
            label: 'Systolic',
            data: [120, 118, 122, 119, 121, 117, 120],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4
          }, {
            label: 'Diastolic',
            data: [80, 78, 82, 79, 81, 77, 80],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            tension: 0.4
          }, {
            label: 'Mood',
            data: [7, 8, 6, 9, 7, 8, 7],
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              max: 140,
              title: {
                display: true,
                text: 'Values'
              }
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
      
      // Store reference on canvas
      ctx.chart = this.charts.health;
    } catch (error) {
      console.error('Error creating health chart:', error);
    }
  }

  createMoodChart() {
    const ctx = document.getElementById('moodChart');
    if (!ctx) return;

    // Check if canvas is already in use
    if (ctx.chart) {
      try {
        ctx.chart.destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      ctx.chart = null;
    }

    // Destroy existing chart if it exists
    if (this.charts.mood) {
      try {
        this.charts.mood.destroy();
      } catch (e) {
        console.log('Mood chart already destroyed');
      }
      this.charts.mood = null;
    }

    try {
      this.charts.mood = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7Days(),
          datasets: [{
            label: 'Mood',
            data: [7, 8, 6, 9, 7, 8, 7],
            borderColor: '#ec4899',
            backgroundColor: 'rgba(236, 72, 153, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Energy',
            data: [6, 7, 5, 8, 6, 7, 6],
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            tension: 0.4,
            fill: true
          }, {
            label: 'Stress',
            data: [4, 3, 6, 2, 4, 3, 4],
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4,
            fill: true
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
      
      // Store reference on canvas
      ctx.chart = this.charts.mood;
    } catch (error) {
      console.error('Error creating mood chart:', error);
    }
  }

  createBPChart() {
    const ctx = document.getElementById('bpChart');
    if (!ctx) return;

    // Check if canvas is already in use
    if (ctx.chart) {
      try {
        ctx.chart.destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      ctx.chart = null;
    }

    // Destroy existing chart if it exists
    if (this.charts.bp) {
      try {
        this.charts.bp.destroy();
      } catch (e) {
        console.log('BP chart already destroyed');
      }
      this.charts.bp = null;
    }

    try {
      this.charts.bp = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7Days(),
          datasets: [{
            label: 'Systolic',
            data: [120, 118, 122, 119, 121, 117, 120],
            borderColor: '#4f46e5',
            backgroundColor: 'rgba(79, 70, 229, 0.1)',
            tension: 0.4
          }, {
            label: 'Diastolic',
            data: [80, 78, 82, 79, 81, 77, 80],
            borderColor: '#7c3aed',
            backgroundColor: 'rgba(124, 58, 237, 0.1)',
            tension: 0.4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
      
      // Store reference on canvas
      ctx.chart = this.charts.bp;
    } catch (error) {
      console.error('Error creating BP chart:', error);
    }
  }

  createMedicationChart() {
    const ctx = document.getElementById('medicationChart');
    if (!ctx) return;

    // Check if canvas is already in use
    if (ctx.chart) {
      try {
        ctx.chart.destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      ctx.chart = null;
    }

    // Destroy existing chart if it exists
    if (this.charts.medication) {
      try {
        this.charts.medication.destroy();
      } catch (e) {
        console.log('Medication chart already destroyed');
      }
      this.charts.medication = null;
    }

    try {
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
          maintainAspectRatio: false,
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
      
      // Store reference on canvas
      ctx.chart = this.charts.medication;
    } catch (error) {
      console.error('Error creating medication chart:', error);
    }
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

    // Check if canvas is already in use
    if (ctx.chart) {
      try {
        ctx.chart.destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      ctx.chart = null;
    }

    // Destroy existing chart if it exists
    if (this.charts[elementId]) {
      try {
        this.charts[elementId].destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      this.charts[elementId] = null;
    }

    try {
      const chart = new Chart(ctx, config);
      this.charts[elementId] = chart;
      ctx.chart = chart;
      return chart;
    } catch (error) {
      console.error(`Error creating chart ${elementId}:`, error);
      return null;
    }
  }

  // Destroy a chart
  destroyChart(chartId) {
    if (this.charts[chartId]) {
      try {
        this.charts[chartId].destroy();
      } catch (e) {
        console.log('Chart already destroyed');
      }
      this.charts[chartId] = null;
    }
    
    // Also clear canvas reference
    const ctx = document.getElementById(chartId);
    if (ctx && ctx.chart) {
      ctx.chart = null;
    }
  }

  // Destroy all charts
  destroyAllCharts() {
    Object.keys(this.charts).forEach(chartId => {
      this.destroyChart(chartId);
    });
    
    // Clear all canvas references
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      if (canvas.chart) {
        canvas.chart = null;
      }
    });
  }

  // Export chart as image
  exportChart(chartId, format = 'png') {
    if (!this.charts[chartId]) return null;
    return this.charts[chartId].toBase64Image();
  }

  // Get chart data
  getChartData(chartId) {
    if (!this.charts[chartId]) return null;
    return this.charts[chartId].data;
  }
}

// Initialize chart manager when DOM is loaded
let chartManagerInstance = null;
document.addEventListener('DOMContentLoaded', () => {
  if (!chartManagerInstance) {
    chartManagerInstance = new ChartManager();
    window.chartManager = chartManagerInstance;
  }
}); 
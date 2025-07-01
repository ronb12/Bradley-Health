// Chart Manager for Bradley Health
class ChartManager {
  constructor() {
    this.charts = new Map();
    this.initialized = false;
    this.chartCounter = 0;
    this.init();
  }

  init() {
    if (this.initialized) return;
    this.initialized = true;
    
    // Wait for DOM to be completely ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => this.initializeCharts(), 1500);
      });
    } else {
      setTimeout(() => this.initializeCharts(), 1500);
    }
  }

  initializeCharts() {
    console.log('Initializing charts...');
    
    // First, destroy all existing charts
    this.destroyAllCharts();
    
    // Wait for complete cleanup
    setTimeout(() => {
      this.createChartsSequentially();
    }, 800);
  }

  createChartsSequentially() {
    const charts = [
      { id: 'healthChart', method: 'createHealthOverviewChart' },
      { id: 'moodChart', method: 'createMoodTrendsChart' },
      { id: 'bpChart', method: 'createBloodPressureChart' },
      { id: 'medicationChart', method: 'createMedicationAdherenceChart' }
    ];

    let index = 0;
    const createNextChart = () => {
      if (index >= charts.length) {
        console.log('All charts initialized successfully');
        return;
      }

      const chart = charts[index];
      const canvas = document.getElementById(chart.id);
      
      if (canvas) {
        console.log(`Creating ${chart.id}...`);
        this[chart.method]();
      } else {
        console.log(`Canvas ${chart.id} not found, skipping...`);
      }
      
      index++;
      setTimeout(createNextChart, 300);
    };

    createNextChart();
  }

  createHealthOverviewChart() {
    const canvas = document.getElementById('healthChart');
    if (!canvas) return;

    // Destroy existing chart
    this.destroyChart('healthChart');
    
    // Clear canvas and reset dimensions
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    try {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7Days(),
          datasets: [
            {
              label: 'Systolic BP',
              data: [120, 118, 122, 119, 121, 117, 120],
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              tension: 0.4,
              yAxisID: 'y',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Diastolic BP',
              data: [80, 78, 82, 79, 81, 77, 80],
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              tension: 0.4,
              yAxisID: 'y',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Mood Score',
              data: [7, 8, 6, 9, 7, 8, 7],
              borderColor: '#ec4899',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              tension: 0.4,
              yAxisID: 'y1',
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
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
              },
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
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
              max: 140,
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
              }
            },
            y1: {
              type: 'linear',
              display: true,
              position: 'right',
              title: {
                display: true,
                text: 'Mood Score (1-10)'
              },
              min: 0,
              max: 10,
              grid: {
                drawOnChartArea: false,
                color: 'rgba(0,0,0,0.1)'
              },
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Health Overview - Last 7 Days',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });

      this.charts.set('healthChart', chart);
      console.log('Health chart created successfully');
    } catch (error) {
      console.error('Error creating health overview chart:', error);
    }
  }

  createMoodTrendsChart() {
    const canvas = document.getElementById('moodChart');
    if (!canvas) return;

    // Destroy existing chart
    this.destroyChart('moodChart');
    
    // Clear canvas and reset dimensions
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Force clear any existing Chart.js instances on this canvas
    if (Chart.instances) {
      Chart.instances.forEach((chart, key) => {
        if (chart.ctx && chart.ctx.canvas && chart.ctx.canvas.id === 'moodChart') {
          try {
            chart.destroy();
          } catch (e) {
            // Ignore errors
          }
        }
      });
    }
    
    // Additional delay to ensure cleanup
    setTimeout(() => {
      try {
        const chart = new Chart(ctx, {
          type: 'line',
          data: {
            labels: this.getLast7Days(),
            datasets: [
              {
                label: 'Mood',
                data: [7, 8, 6, 9, 7, 8, 7],
                borderColor: '#ec4899',
                backgroundColor: 'rgba(236, 72, 153, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: 'Energy',
                data: [6, 7, 5, 8, 6, 7, 6],
                borderColor: '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              },
              {
                label: 'Stress',
                data: [4, 3, 6, 2, 4, 3, 4],
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.2)',
                tension: 0.4,
                fill: true,
                borderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
              }
            ]
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
                },
                grid: {
                  display: true,
                  color: 'rgba(0,0,0,0.1)'
                }
              },
              x: {
                grid: {
                  display: true,
                  color: 'rgba(0,0,0,0.1)'
                }
              }
            },
            plugins: {
              title: {
                display: true,
                text: 'Mood Trends - Last 7 Days',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              },
              legend: {
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                mode: 'index',
                intersect: false
              }
            }
          }
        });

        this.charts.set('moodChart', chart);
        console.log('Mood chart created successfully');
      } catch (error) {
        console.error('Error creating mood trends chart:', error);
      }
    }, 100);
  }

  createBloodPressureChart() {
    const canvas = document.getElementById('bpChart');
    if (!canvas) return;

    // Destroy existing chart
    this.destroyChart('bpChart');
    
    // Clear canvas and reset dimensions
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    try {
      const chart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: this.getLast7Days(),
          datasets: [
            {
              label: 'Systolic',
              data: [120, 118, 122, 119, 121, 117, 120],
              borderColor: '#4f46e5',
              backgroundColor: 'rgba(79, 70, 229, 0.1)',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            },
            {
              label: 'Diastolic',
              data: [80, 78, 82, 79, 81, 77, 80],
              borderColor: '#7c3aed',
              backgroundColor: 'rgba(124, 58, 237, 0.1)',
              tension: 0.4,
              borderWidth: 2,
              pointRadius: 4,
              pointHoverRadius: 6
            }
          ]
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
              },
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
              }
            },
            x: {
              grid: {
                display: true,
                color: 'rgba(0,0,0,0.1)'
              }
            }
          },
          plugins: {
            title: {
              display: true,
              text: 'Blood Pressure Trends - Last 7 Days',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'top',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false
            }
          }
        }
      });

      this.charts.set('bpChart', chart);
      console.log('Blood pressure chart created successfully');
    } catch (error) {
      console.error('Error creating blood pressure chart:', error);
    }
  }

  createMedicationAdherenceChart() {
    const canvas = document.getElementById('medicationChart');
    if (!canvas) return;

    // Destroy existing chart
    this.destroyChart('medicationChart');
    
    // Clear canvas and reset dimensions
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    try {
      const chart = new Chart(ctx, {
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
            borderColor: '#ffffff',
            hoverOffset: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Medication Adherence - This Week',
              font: {
                size: 16,
                weight: 'bold'
              }
            },
            legend: {
              position: 'bottom',
              labels: {
                usePointStyle: true,
                padding: 20
              }
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const label = context.label || '';
                  const value = context.parsed;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = ((value / total) * 100).toFixed(1);
                  return `${label}: ${value} (${percentage}%)`;
                }
              }
            }
          }
        }
      });

      this.charts.set('medicationChart', chart);
      console.log('Medication chart created successfully');
    } catch (error) {
      console.error('Error creating medication adherence chart:', error);
    }
  }

  getLast7Days() {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }));
    }
    return dates;
  }

  // Update chart data
  updateChart(chartId, newData) {
    const chart = this.charts.get(chartId);
    if (!chart) return;

    try {
      if (newData.datasets) {
        chart.data.datasets = newData.datasets;
      }
      if (newData.labels) {
        chart.data.labels = newData.labels;
      }
      chart.update();
    } catch (error) {
      console.error(`Error updating chart ${chartId}:`, error);
    }
  }

  // Update specific chart data
  updateHealthChart(data) {
    const chart = this.charts.get('healthChart');
    if (!chart) return;

    try {
      if (data.systolic) {
        chart.data.datasets[0].data = data.systolic;
      }
      if (data.diastolic) {
        chart.data.datasets[1].data = data.diastolic;
      }
      if (data.mood) {
        chart.data.datasets[2].data = data.mood;
      }
      chart.update();
    } catch (error) {
      console.error('Error updating health chart:', error);
    }
  }

  updateMoodChart(data) {
    const chart = this.charts.get('moodChart');
    if (!chart) return;

    try {
      if (data.mood) {
        chart.data.datasets[0].data = data.mood;
      }
      if (data.energy) {
        chart.data.datasets[1].data = data.energy;
      }
      if (data.stress) {
        chart.data.datasets[2].data = data.stress;
      }
      chart.update();
    } catch (error) {
      console.error('Error updating mood chart:', error);
    }
  }

  updateBPChart(data) {
    const chart = this.charts.get('bpChart');
    if (!chart) return;

    try {
      if (data.systolic) {
        chart.data.datasets[0].data = data.systolic;
      }
      if (data.diastolic) {
        chart.data.datasets[1].data = data.diastolic;
      }
      chart.update();
    } catch (error) {
      console.error('Error updating BP chart:', error);
    }
  }

  updateMedicationChart(data) {
    const chart = this.charts.get('medicationChart');
    if (!chart) return;

    try {
      chart.data.datasets[0].data = [
        data.taken || 0,
        data.missed || 0,
        data.skipped || 0
      ];
      chart.update();
    } catch (error) {
      console.error('Error updating medication chart:', error);
    }
  }

  // Destroy a specific chart
  destroyChart(chartId) {
    const chart = this.charts.get(chartId);
    if (chart) {
      try {
        chart.destroy();
      } catch (error) {
        // Chart already destroyed
      }
      this.charts.delete(chartId);
    }
    
    // Also clear the canvas
    const canvas = document.getElementById(chartId);
    if (canvas) {
      try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        // Canvas already cleared
      }
    }
  }

  // Destroy all charts
  destroyAllCharts() {
    console.log('Destroying all charts...');
    
    // Destroy our tracked charts
    this.charts.forEach((chart, chartId) => {
      try {
        chart.destroy();
      } catch (error) {
        // Chart already destroyed
      }
    });
    this.charts.clear();
    
    // Destroy all Chart.js instances globally
    if (Chart.instances) {
      Chart.instances.forEach((chart, key) => {
        try {
          chart.destroy();
        } catch (error) {
          // Chart already destroyed
        }
      });
    }
    
    // Clear all canvases
    const canvases = document.querySelectorAll('canvas');
    canvases.forEach(canvas => {
      try {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      } catch (error) {
        // Canvas already cleared
      }
    });
    console.log('All charts destroyed');
  }

  // Export chart as image
  exportChart(chartId, format = 'png') {
    const chart = this.charts.get(chartId);
    if (!chart) return null;
    
    try {
      return chart.toBase64Image();
    } catch (error) {
      console.error(`Error exporting chart ${chartId}:`, error);
      return null;
    }
  }

  // Get chart data
  getChartData(chartId) {
    const chart = this.charts.get(chartId);
    if (!chart) return null;
    
    try {
      return chart.data;
    } catch (error) {
      console.error(`Error getting chart data for ${chartId}:`, error);
      return null;
    }
  }

  // Refresh all charts
  refreshCharts() {
    this.initializeCharts();
  }

  // Check if chart exists
  hasChart(chartId) {
    return this.charts.has(chartId);
  }

  // Get chart instance
  getChart(chartId) {
    return this.charts.get(chartId);
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

// Export for global access
window.ChartManager = ChartManager; 
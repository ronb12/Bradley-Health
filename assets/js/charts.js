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
        console.log(`Canvas ${chart.id} not found, will retry...`);
        // Retry after a short delay
        setTimeout(() => {
          const retryCanvas = document.getElementById(chart.id);
          if (retryCanvas) {
            console.log(`Canvas ${chart.id} found on retry, creating...`);
            this[chart.method]();
          } else {
            console.log(`Canvas ${chart.id} still not found, skipping...`);
          }
          index++;
          setTimeout(createNextChart, 100);
        }, 500);
        return;
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

    // Hide the canvas and create a mood insights dashboard instead
    canvas.style.display = 'none';
    
    // Get the parent container
    const parent = canvas.parentElement;
    
    // Create mood insights dashboard
    const moodDashboard = document.createElement('div');
    moodDashboard.id = 'moodInsightsDashboard';
    moodDashboard.className = 'mood-insights-dashboard';
    moodDashboard.innerHTML = `
      <div class="mood-overview">
        <h3>Mood Overview</h3>
        <div class="mood-stats-grid">
          <div class="mood-stat-card">
            <div class="stat-icon">😊</div>
            <div class="stat-label">Average Mood</div>
            <div class="stat-value" id="avgMoodValue">7.2</div>
            <div class="stat-trend positive">+0.3</div>
          </div>
          <div class="mood-stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-label">Energy Level</div>
            <div class="stat-value" id="avgEnergyValue">6.8</div>
            <div class="stat-trend neutral">0.0</div>
          </div>
          <div class="mood-stat-card">
            <div class="stat-icon">😰</div>
            <div class="stat-label">Stress Level</div>
            <div class="stat-value" id="avgStressValue">3.5</div>
            <div class="stat-trend negative">-0.2</div>
          </div>
        </div>
      </div>
      
      <div class="mood-progress">
        <h3>Weekly Progress</h3>
        <div class="progress-bars">
          <div class="progress-item">
            <div class="progress-label">Mood Stability</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 85%"></div>
            </div>
            <div class="progress-value">85%</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Positive Days</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 71%"></div>
            </div>
            <div class="progress-value">5/7 days</div>
          </div>
          <div class="progress-item">
            <div class="progress-label">Goal Achievement</div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 60%"></div>
            </div>
            <div class="progress-value">60%</div>
          </div>
        </div>
      </div>
      
      <div class="mood-insights">
        <h3>Insights</h3>
        <div class="insights-list">
          <div class="insight-item positive">
            <span class="insight-icon">📈</span>
            <span class="insight-text">Your mood has improved by 15% this week</span>
          </div>
          <div class="insight-item info">
            <span class="insight-icon">💡</span>
            <span class="insight-text">Exercise days show 20% better mood scores</span>
          </div>
          <div class="insight-item warning">
            <span class="insight-icon">⚠️</span>
            <span class="insight-text">Stress tends to spike on Mondays</span>
          </div>
        </div>
      </div>
    `;
    
    // Add the dashboard to the parent container
    parent.appendChild(moodDashboard);
    
    // Add CSS styles for the mood dashboard
    this.addMoodDashboardStyles();
    
    console.log('Mood insights dashboard created successfully');
  }

  addMoodDashboardStyles() {
    // Check if styles already exist
    if (document.getElementById('moodDashboardStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'moodDashboardStyles';
    style.textContent = `
      .mood-insights-dashboard {
        padding: 20px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      }
      
      .mood-overview h3, .mood-progress h3, .mood-insights h3 {
        margin: 0 0 20px 0;
        color: #374151;
        font-size: 18px;
        font-weight: 600;
      }
      
      .mood-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      .mood-stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 20px;
        border-radius: 12px;
        text-align: center;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
      }
      
      .stat-icon {
        font-size: 32px;
        margin-bottom: 10px;
      }
      
      .stat-label {
        font-size: 14px;
        opacity: 0.9;
        margin-bottom: 8px;
      }
      
      .stat-value {
        font-size: 28px;
        font-weight: bold;
        margin-bottom: 5px;
      }
      
      .stat-trend {
        font-size: 12px;
        padding: 4px 8px;
        border-radius: 12px;
        display: inline-block;
      }
      
      .stat-trend.positive {
        background: rgba(34, 197, 94, 0.2);
        color: #22c55e;
      }
      
      .stat-trend.negative {
        background: rgba(239, 68, 68, 0.2);
        color: #ef4444;
      }
      
      .stat-trend.neutral {
        background: rgba(107, 114, 128, 0.2);
        color: #6b7280;
      }
      
      .progress-bars {
        margin-bottom: 30px;
      }
      
      .progress-item {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
        gap: 15px;
      }
      
      .progress-label {
        flex: 1;
        font-size: 14px;
        color: #374151;
        font-weight: 500;
      }
      
      .progress-bar {
        flex: 2;
        height: 8px;
        background: #e5e7eb;
        border-radius: 4px;
        overflow: hidden;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 4px;
        transition: width 0.3s ease;
      }
      
      .progress-value {
        flex: 0 0 60px;
        text-align: right;
        font-size: 14px;
        font-weight: 600;
        color: #374151;
      }
      
      .insights-list {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      
      .insight-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
      }
      
      .insight-item.positive {
        background: rgba(34, 197, 94, 0.1);
        border-left: 4px solid #22c55e;
      }
      
      .insight-item.info {
        background: rgba(59, 130, 246, 0.1);
        border-left: 4px solid #3b82f6;
      }
      
      .insight-item.warning {
        background: rgba(245, 158, 11, 0.1);
        border-left: 4px solid #f59e0b;
      }
      
      .insight-icon {
        font-size: 18px;
      }
      
      .insight-text {
        flex: 1;
        color: #374151;
      }
    `;
    
    document.head.appendChild(style);
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
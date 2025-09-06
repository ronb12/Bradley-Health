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
      <div class="dashboard-header">
        <h2>📊 Your Mood Summary</h2>
        <p class="dashboard-subtitle">Here's how you've been feeling this week</p>
      </div>
      
      <div class="mood-overview">
        <h3>🎯 Key Metrics</h3>
        <div class="mood-stats-grid">
          <div class="mood-stat-card">
            <div class="stat-icon">😊</div>
            <div class="stat-label">Overall Mood</div>
            <div class="stat-value" id="avgMoodValue">7.2</div>
            <div class="stat-scale">out of 10</div>
            <div class="stat-trend positive">↗️ +0.3 from last week</div>
          </div>
          <div class="mood-stat-card">
            <div class="stat-icon">⚡</div>
            <div class="stat-label">Energy Level</div>
            <div class="stat-value" id="avgEnergyValue">6.8</div>
            <div class="stat-scale">out of 10</div>
            <div class="stat-trend neutral">→ Same as last week</div>
          </div>
          <div class="mood-stat-card">
            <div class="stat-icon">😰</div>
            <div class="stat-label">Stress Level</div>
            <div class="stat-value" id="avgStressValue">3.5</div>
            <div class="stat-scale">out of 10</div>
            <div class="stat-trend negative">↘️ -0.2 from last week</div>
          </div>
        </div>
      </div>
      
      <div class="mood-progress">
        <h3>📈 Weekly Progress</h3>
        <p class="section-description">How you're doing compared to your goals</p>
        <div class="progress-bars">
          <div class="progress-item">
            <div class="progress-info">
              <div class="progress-label">Mood Consistency</div>
              <div class="progress-description">How stable your mood has been</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 85%"></div>
            </div>
            <div class="progress-value">85%</div>
          </div>
          <div class="progress-item">
            <div class="progress-info">
              <div class="progress-label">Good Days</div>
              <div class="progress-description">Days you felt positive</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 71%"></div>
            </div>
            <div class="progress-value">5 of 7 days</div>
          </div>
          <div class="progress-item">
            <div class="progress-info">
              <div class="progress-label">Goal Progress</div>
              <div class="progress-description">Working towards your targets</div>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: 60%"></div>
            </div>
            <div class="progress-value">60%</div>
          </div>
        </div>
      </div>
      
      <div class="mood-insights">
        <h3>💡 What This Means</h3>
        <p class="section-description">Insights to help you understand your patterns</p>
        <div class="insights-list">
          <div class="insight-item positive">
            <span class="insight-icon">📈</span>
            <div class="insight-content">
              <span class="insight-title">Great Progress!</span>
              <span class="insight-text">Your mood has improved by 15% this week. Keep up the good work!</span>
            </div>
          </div>
          <div class="insight-item info">
            <span class="insight-icon">💪</span>
            <div class="insight-content">
              <span class="insight-title">Exercise Helps</span>
              <span class="insight-text">On days when you exercise, your mood scores are 20% higher.</span>
            </div>
          </div>
          <div class="insight-item warning">
            <span class="insight-icon">⚠️</span>
            <div class="insight-content">
              <span class="insight-title">Monday Blues</span>
              <span class="insight-text">Stress tends to be higher on Mondays. Try starting your week with something you enjoy.</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="quick-tips">
        <h3>💭 Quick Tips</h3>
        <div class="tips-grid">
          <div class="tip-card">
            <span class="tip-icon">🌅</span>
            <span class="tip-text">Start your day with 5 minutes of gratitude</span>
          </div>
          <div class="tip-card">
            <span class="tip-icon">🚶</span>
            <span class="tip-text">Take a 10-minute walk when stressed</span>
          </div>
          <div class="tip-card">
            <span class="tip-icon">📱</span>
            <span class="tip-text">Limit social media to 30 minutes daily</span>
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
        padding: 24px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.08);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      }
      
      .dashboard-header {
        text-align: center;
        margin-bottom: 32px;
        padding-bottom: 20px;
        border-bottom: 2px solid #f3f4f6;
      }
      
      .dashboard-header h2 {
        margin: 0 0 8px 0;
        color: #1f2937;
        font-size: 24px;
        font-weight: 700;
      }
      
      .dashboard-subtitle {
        margin: 0;
        color: #6b7280;
        font-size: 16px;
      }
      
      .mood-overview h3, .mood-progress h3, .mood-insights h3, .quick-tips h3 {
        margin: 0 0 12px 0;
        color: #1f2937;
        font-size: 20px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .section-description {
        margin: 0 0 20px 0;
        color: #6b7280;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .mood-stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 20px;
        margin-bottom: 32px;
      }
      
      .mood-stat-card {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 24px 20px;
        border-radius: 16px;
        text-align: center;
        box-shadow: 0 8px 25px rgba(102, 126, 234, 0.25);
        transition: transform 0.2s ease;
      }
      
      .mood-stat-card:hover {
        transform: translateY(-2px);
      }
      
      .stat-icon {
        font-size: 36px;
        margin-bottom: 12px;
        display: block;
      }
      
      .stat-label {
        font-size: 16px;
        opacity: 0.95;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .stat-value {
        font-size: 32px;
        font-weight: 800;
        margin-bottom: 4px;
      }
      
      .stat-scale {
        font-size: 12px;
        opacity: 0.8;
        margin-bottom: 8px;
      }
      
      .stat-trend {
        font-size: 13px;
        padding: 6px 12px;
        border-radius: 20px;
        display: inline-block;
        font-weight: 500;
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
        margin-bottom: 32px;
      }
      
      .progress-item {
        display: flex;
        align-items: center;
        margin-bottom: 20px;
        gap: 16px;
        padding: 16px;
        background: #f9fafb;
        border-radius: 12px;
      }
      
      .progress-info {
        flex: 1;
        min-width: 0;
      }
      
      .progress-label {
        font-size: 16px;
        color: #1f2937;
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .progress-description {
        font-size: 13px;
        color: #6b7280;
        line-height: 1.4;
      }
      
      .progress-bar {
        flex: 1;
        height: 12px;
        background: #e5e7eb;
        border-radius: 6px;
        overflow: hidden;
        min-width: 120px;
      }
      
      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
        border-radius: 6px;
        transition: width 0.6s ease;
      }
      
      .progress-value {
        flex: 0 0 80px;
        text-align: right;
        font-size: 16px;
        font-weight: 700;
        color: #1f2937;
      }
      
      .insights-list {
        display: flex;
        flex-direction: column;
        gap: 16px;
        margin-bottom: 32px;
      }
      
      .insight-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
        padding: 20px;
        border-radius: 12px;
        font-size: 14px;
        line-height: 1.5;
      }
      
      .insight-item.positive {
        background: rgba(34, 197, 94, 0.08);
        border-left: 4px solid #22c55e;
      }
      
      .insight-item.info {
        background: rgba(59, 130, 246, 0.08);
        border-left: 4px solid #3b82f6;
      }
      
      .insight-item.warning {
        background: rgba(245, 158, 11, 0.08);
        border-left: 4px solid #f59e0b;
      }
      
      .insight-icon {
        font-size: 24px;
        flex-shrink: 0;
        margin-top: 2px;
      }
      
      .insight-content {
        flex: 1;
      }
      
      .insight-title {
        display: block;
        font-weight: 600;
        color: #1f2937;
        margin-bottom: 4px;
        font-size: 15px;
      }
      
      .insight-text {
        color: #4b5563;
        line-height: 1.5;
      }
      
      .tips-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 16px;
      }
      
      .tip-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 16px;
        background: #f8fafc;
        border-radius: 12px;
        border: 1px solid #e2e8f0;
        transition: all 0.2s ease;
      }
      
      .tip-card:hover {
        background: #f1f5f9;
        transform: translateY(-1px);
      }
      
      .tip-icon {
        font-size: 20px;
        flex-shrink: 0;
      }
      
      .tip-text {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
        line-height: 1.4;
      }
      
      @media (max-width: 768px) {
        .mood-insights-dashboard {
          padding: 16px;
        }
        
        .mood-stats-grid {
          grid-template-columns: 1fr;
          gap: 16px;
        }
        
        .progress-item {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        
        .progress-value {
          text-align: left;
          flex: none;
        }
        
        .tips-grid {
          grid-template-columns: 1fr;
        }
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
// Enhanced Chart Management
class ChartManager {
  constructor() {
    this.charts = new Map();
    this.defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            font: {
              family: 'Inter'
            }
          }
        },
        tooltip: {
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          padding: 12,
          titleFont: {
            family: 'Inter',
            size: 14
          },
          bodyFont: {
            family: 'Inter',
            size: 13
          }
        }
      }
    };
  }

  createLineChart(ctx, data, options = {}) {
    const chartOptions = {
      ...this.defaultOptions,
      ...options,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: false,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    };

    return new Chart(ctx, {
      type: 'line',
      data: data,
      options: chartOptions
    });
  }

  createBarChart(ctx, data, options = {}) {
    const chartOptions = {
      ...this.defaultOptions,
      ...options,
      scales: {
        x: {
          grid: {
            display: false
          }
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    };

    return new Chart(ctx, {
      type: 'bar',
      data: data,
      options: chartOptions
    });
  }

  createPieChart(ctx, data, options = {}) {
    const chartOptions = {
      ...this.defaultOptions,
      ...options,
      plugins: {
        ...this.defaultOptions.plugins,
        legend: {
          position: 'right'
        }
      }
    };

    return new Chart(ctx, {
      type: 'pie',
      data: data,
      options: chartOptions
    });
  }

  updateChart(chartId, newData) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.data = newData;
      chart.update();
    }
  }

  destroyChart(chartId) {
    const chart = this.charts.get(chartId);
    if (chart) {
      chart.destroy();
      this.charts.delete(chartId);
    }
  }

  // Helper method to format dates for charts
  formatDate(date) {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }

  // Helper method to generate gradient
  createGradient(ctx, startColor, endColor) {
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, startColor);
    gradient.addColorStop(1, endColor);
    return gradient;
  }
}

// Initialize chart manager
const chartManager = new ChartManager(); 
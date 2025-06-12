// Health Insights Manager
class HealthInsightsManager {
  constructor() {
    this.insights = [];
    this.thresholds = {
      bloodPressure: {
        normal: { systolic: [90, 120], diastolic: [60, 80] },
        elevated: { systolic: [120, 129], diastolic: [60, 80] },
        high: { systolic: [130, 180], diastolic: [80, 120] }
      },
      heartRate: {
        normal: [60, 100],
        elevated: [100, 120],
        high: [120, 200]
      }
    };
  }

  analyzeBloodPressure(readings) {
    if (!readings || readings.length === 0) return [];

    const insights = [];
    const latestReading = readings[0];
    const { systolic, diastolic } = latestReading;

    // Check current status
    const status = this.getBloodPressureStatus(systolic, diastolic);
    insights.push({
      type: 'status',
      message: `Current blood pressure is ${status}`,
      severity: this.getSeverityLevel(status)
    });

    // Analyze trends
    if (readings.length >= 3) {
      const trend = this.analyzeTrend(readings);
      if (trend) {
        insights.push({
          type: 'trend',
          message: trend.message,
          severity: trend.severity
        });
      }
    }

    // Check for significant changes
    const significantChange = this.checkSignificantChange(readings);
    if (significantChange) {
      insights.push({
        type: 'change',
        message: significantChange.message,
        severity: significantChange.severity
      });
    }

    return insights;
  }

  getBloodPressureStatus(systolic, diastolic) {
    if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
    if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
    if (systolic >= 130 || diastolic >= 80) return 'Stage 1 Hypertension';
    if (systolic >= 120 && diastolic < 80) return 'Elevated';
    return 'Normal';
  }

  getSeverityLevel(status) {
    switch (status) {
      case 'Hypertensive Crisis':
        return 'critical';
      case 'Stage 2 Hypertension':
        return 'high';
      case 'Stage 1 Hypertension':
        return 'moderate';
      case 'Elevated':
        return 'low';
      default:
        return 'normal';
    }
  }

  analyzeTrend(readings) {
    const recentReadings = readings.slice(0, 3);
    const systolicTrend = this.calculateTrend(recentReadings.map(r => r.systolic));
    const diastolicTrend = this.calculateTrend(recentReadings.map(r => r.diastolic));

    if (systolicTrend > 10 || diastolicTrend > 10) {
      return {
        message: 'Blood pressure is trending upward significantly',
        severity: 'high'
      };
    } else if (systolicTrend < -10 || diastolicTrend < -10) {
      return {
        message: 'Blood pressure is trending downward significantly',
        severity: 'moderate'
      };
    }

    return null;
  }

  calculateTrend(values) {
    if (values.length < 2) return 0;
    const changes = [];
    for (let i = 1; i < values.length; i++) {
      changes.push(values[i] - values[i - 1]);
    }
    return changes.reduce((a, b) => a + b, 0) / changes.length;
  }

  checkSignificantChange(readings) {
    if (readings.length < 2) return null;

    const latest = readings[0];
    const previous = readings[1];
    const systolicChange = Math.abs(latest.systolic - previous.systolic);
    const diastolicChange = Math.abs(latest.diastolic - previous.diastolic);

    if (systolicChange > 20 || diastolicChange > 10) {
      return {
        message: `Significant change detected: ${systolicChange > 20 ? 'Systolic' : 'Diastolic'} pressure changed by ${systolicChange > 20 ? systolicChange : diastolicChange} points`,
        severity: 'high'
      };
    }

    return null;
  }

  generateRecommendations(insights) {
    const recommendations = [];

    insights.forEach(insight => {
      switch (insight.severity) {
        case 'critical':
          recommendations.push({
            message: 'Seek immediate medical attention',
            priority: 'high'
          });
          break;
        case 'high':
          recommendations.push({
            message: 'Schedule a doctor appointment soon',
            priority: 'high'
          });
          break;
        case 'moderate':
          recommendations.push({
            message: 'Monitor your blood pressure more frequently',
            priority: 'medium'
          });
          break;
        case 'low':
          recommendations.push({
            message: 'Continue monitoring as usual',
            priority: 'low'
          });
          break;
      }
    });

    return recommendations;
  }

  formatInsightMessage(insight) {
    const icons = {
      status: '📊',
      trend: '📈',
      change: '⚠️'
    };

    return `${icons[insight.type] || 'ℹ️'} ${insight.message}`;
  }
}

// Initialize insights manager
const insightsManager = new HealthInsightsManager(); 
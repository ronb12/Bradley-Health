// Comprehensive Medical Report Generator
class MedicalReportGenerator {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.reportData = {};
    this.init();
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
      });
    }
  }

  async generateComprehensiveReport(dateRange = '30days') {
    if (!this.currentUser) {
      throw new Error('User not authenticated');
    }

    const userId = this.currentUser.uid;
    const reportDate = new Date();
    
    // Calculate date range
    const endDate = new Date();
    const startDate = this.calculateStartDate(dateRange);

    try {
      // Collect all health data
      await this.collectProfileData(userId);
      await this.collectBloodPressureData(userId, startDate, endDate);
      await this.collectMedicationData(userId);
      await this.collectMoodData(userId, startDate, endDate);
      await this.collectGoalsData(userId);
      await this.collectLimbCareData(userId, startDate, endDate);
      await this.collectHealthInsights(userId);

      // Generate the report
      const report = this.formatReport(reportDate, startDate, endDate);
      
      return report;
    } catch (error) {
      console.error('Error generating medical report:', error);
      throw error;
    }
  }

  calculateStartDate(range) {
    const now = new Date();
    switch (range) {
      case '7days':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30days':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case '90days':
        return new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      case '1year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  async collectProfileData(userId) {
    try {
      const userDoc = await this.db.collection('users').doc(userId).get();
      if (userDoc.exists) {
        this.reportData.profile = userDoc.data();
      }
    } catch (error) {
      console.error('Error collecting profile data:', error);
    }
  }

  async collectBloodPressureData(userId, startDate, endDate) {
    try {
      const bpSnapshot = await this.db.collection('bloodPressure')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .orderBy('timestamp', 'desc')
        .get();

      const readings = bpSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      this.reportData.bloodPressure = {
        readings: readings,
        summary: this.analyzeBloodPressure(readings),
        trends: this.calculateBPTrends(readings)
      };
    } catch (error) {
      console.error('Error collecting blood pressure data:', error);
    }
  }

  async collectMedicationData(userId) {
    try {
      const medSnapshot = await this.db.collection('medications')
        .where('userId', '==', userId)
        .get();

      const medications = medSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.reportData.medications = {
        current: medications,
        summary: this.analyzeMedications(medications)
      };
    } catch (error) {
      console.error('Error collecting medication data:', error);
    }
  }

  async collectMoodData(userId, startDate, endDate) {
    try {
      const moodSnapshot = await this.db.collection('moodEntries')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .orderBy('timestamp', 'desc')
        .get();

      const moodEntries = moodSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      this.reportData.mood = {
        entries: moodEntries,
        summary: this.analyzeMoodData(moodEntries),
        trends: this.calculateMoodTrends(moodEntries)
      };
    } catch (error) {
      console.error('Error collecting mood data:', error);
    }
  }

  async collectGoalsData(userId) {
    try {
      const goalsSnapshot = await this.db.collection('goals')
        .where('userId', '==', userId)
        .get();

      const goals = goalsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.reportData.goals = {
        all: goals,
        summary: this.analyzeGoals(goals)
      };
    } catch (error) {
      console.error('Error collecting goals data:', error);
    }
  }

  async collectLimbCareData(userId, startDate, endDate) {
    try {
      const limbSnapshot = await this.db.collection('limbAssessments')
        .where('userId', '==', userId)
        .where('timestamp', '>=', startDate)
        .where('timestamp', '<=', endDate)
        .orderBy('timestamp', 'desc')
        .get();

      const assessments = limbSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp.toDate()
      }));

      this.reportData.limbCare = {
        assessments: assessments,
        summary: this.analyzeLimbCare(assessments)
      };
    } catch (error) {
      console.error('Error collecting limb care data:', error);
    }
  }

  async collectHealthInsights(userId) {
    try {
      if (window.healthInsights) {
        await window.healthInsights.analyzeHealthData();
        this.reportData.insights = window.healthInsights.insights;
      }
    } catch (error) {
      console.error('Error collecting health insights:', error);
    }
  }

  analyzeBloodPressure(readings) {
    if (!readings || readings.length === 0) {
      return { message: 'No blood pressure readings available' };
    }

    const systolic = readings.map(r => r.systolic);
    const diastolic = readings.map(r => r.diastolic);
    const pulse = readings.map(r => r.pulse).filter(p => p);

    const avgSystolic = systolic.reduce((a, b) => a + b, 0) / systolic.length;
    const avgDiastolic = diastolic.reduce((a, b) => a + b, 0) / diastolic.length;
    const avgPulse = pulse.length > 0 ? pulse.reduce((a, b) => a + b, 0) / pulse.length : null;

    const highReadings = readings.filter(r => r.systolic > 140 || r.diastolic > 90);
    const normalReadings = readings.filter(r => r.systolic <= 140 && r.diastolic <= 90);

    return {
      totalReadings: readings.length,
      averageSystolic: Math.round(avgSystolic),
      averageDiastolic: Math.round(avgDiastolic),
      averagePulse: avgPulse ? Math.round(avgPulse) : null,
      highReadings: highReadings.length,
      normalReadings: normalReadings.length,
      highReadingsPercentage: Math.round((highReadings.length / readings.length) * 100),
      latestReading: readings[0],
      category: this.categorizeBP(avgSystolic, avgDiastolic)
    };
  }

  analyzeMedications(medications) {
    if (!medications || medications.length === 0) {
      return { message: 'No medications recorded' };
    }

    const activeMeds = medications.filter(med => !med.discontinued);
    const discontinuedMeds = medications.filter(med => med.discontinued);

    return {
      totalMedications: medications.length,
      activeMedications: activeMeds.length,
      discontinuedMedications: discontinuedMeds.length,
      medications: activeMeds.map(med => ({
        name: med.name,
        dosage: med.dosage,
        frequency: med.frequency,
        instructions: med.instructions,
        timeOfDay: med.timeOfDay
      }))
    };
  }

  analyzeMoodData(entries) {
    if (!entries || entries.length === 0) {
      return { message: 'No mood entries available' };
    }

    const moodLevels = entries.map(e => e.mood);
    const stressLevels = entries.map(e => e.stress);
    const energyLevels = entries.map(e => e.energy);
    const sleepLevels = entries.map(e => e.sleep);

    const avgMood = moodLevels.reduce((a, b) => a + b, 0) / moodLevels.length;
    const avgStress = stressLevels.reduce((a, b) => a + b, 0) / stressLevels.length;
    const avgEnergy = energyLevels.reduce((a, b) => a + b, 0) / energyLevels.length;
    const avgSleep = sleepLevels.reduce((a, b) => a + b, 0) / sleepLevels.length;

    return {
      totalEntries: entries.length,
      averageMood: Math.round(avgMood * 10) / 10,
      averageStress: Math.round(avgStress * 10) / 10,
      averageEnergy: Math.round(avgEnergy * 10) / 10,
      averageSleep: Math.round(avgSleep * 10) / 10,
      moodTrend: this.calculateTrend(moodLevels),
      stressTrend: this.calculateTrend(stressLevels),
      recentEntries: entries.slice(0, 5)
    };
  }

  analyzeGoals(goals) {
    if (!goals || goals.length === 0) {
      return { message: 'No goals set' };
    }

    const activeGoals = goals.filter(goal => !goal.completed);
    const completedGoals = goals.filter(goal => goal.completed);
    const overdueGoals = goals.filter(goal => !goal.completed && new Date(goal.deadline) < new Date());

    return {
      totalGoals: goals.length,
      activeGoals: activeGoals.length,
      completedGoals: completedGoals.length,
      overdueGoals: overdueGoals.length,
      completionRate: Math.round((completedGoals.length / goals.length) * 100),
      goalsByCategory: this.groupGoalsByCategory(goals)
    };
  }

  analyzeLimbCare(assessments) {
    if (!assessments || assessments.length === 0) {
      return { message: 'No limb care assessments available' };
    }

    const recentAssessments = assessments.slice(0, 7); // Last 7 assessments
    const painLevels = recentAssessments.map(a => a.painLevel).filter(p => p);
    const avgPain = painLevels.length > 0 ? painLevels.reduce((a, b) => a + b, 0) / painLevels.length : null;

    return {
      totalAssessments: assessments.length,
      recentAssessments: recentAssessments.length,
      averagePainLevel: avgPain ? Math.round(avgPain * 10) / 10 : null,
      latestAssessment: assessments[0],
      painTrend: this.calculateTrend(painLevels)
    };
  }

  categorizeBP(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic >= 130 || diastolic >= 80) return 'High';
    return 'Unknown';
  }

  calculateTrend(values) {
    if (values.length < 2) return 'insufficient data';
    
    const n = values.length;
    const x = Array.from({length: n}, (_, i) => i);
    const y = values;

    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    
    if (slope > 0.1) return 'increasing';
    if (slope < -0.1) return 'decreasing';
    return 'stable';
  }

  groupGoalsByCategory(goals) {
    const categories = {};
    goals.forEach(goal => {
      if (!categories[goal.category]) {
        categories[goal.category] = [];
      }
      categories[goal.category].push(goal);
    });
    return categories;
  }

  formatReport(reportDate, startDate, endDate) {
    const profile = this.reportData.profile || {};
    const bp = this.reportData.bloodPressure || {};
    const meds = this.reportData.medications || {};
    const mood = this.reportData.mood || {};
    const goals = this.reportData.goals || {};
    const limbCare = this.reportData.limbCare || {};
    const insights = this.reportData.insights || [];

    const report = {
      reportInfo: {
        generatedDate: reportDate.toISOString(),
        dateRange: {
          start: startDate.toISOString(),
          end: endDate.toISOString()
        },
        patientName: profile.name || 'Not provided',
        patientAge: profile.age || 'Not provided'
      },
      
      executiveSummary: this.generateExecutiveSummary(bp, meds, mood, goals, insights),
      
      patientDemographics: {
        name: profile.name,
        age: profile.age,
        weight: profile.weight ? `${profile.weight} lbs` : 'Not provided',
        height: profile.height ? this.formatHeight(profile.height) : 'Not provided',
        medicalConditions: profile.medicalConditions || 'None reported',
        allergies: profile.allergies || 'None reported',
        emergencyContact: profile.emergencyContact || 'Not provided'
      },
      
      bloodPressure: {
        summary: bp.summary,
        recentReadings: bp.readings ? bp.readings.slice(0, 10) : [],
        trends: bp.trends
      },
      
      medications: {
        summary: meds.summary,
        currentMedications: meds.current || []
      },
      
      mentalHealth: {
        summary: mood.summary,
        recentEntries: mood.entries ? mood.entries.slice(0, 10) : [],
        trends: mood.trends
      },
      
      goals: {
        summary: goals.summary,
        activeGoals: goals.all ? goals.all.filter(g => !g.completed) : []
      },
      
      limbCare: {
        summary: limbCare.summary,
        recentAssessments: limbCare.assessments ? limbCare.assessments.slice(0, 5) : []
      },
      
      healthInsights: insights,
      
      recommendations: this.generateRecommendations(bp, meds, mood, goals, insights)
    };

    return report;
  }

  generateExecutiveSummary(bp, meds, mood, goals, insights) {
    const summary = {
      overallHealthStatus: 'Good',
      keyFindings: [],
      criticalAlerts: [],
      recommendations: []
    };

    // Blood Pressure Analysis
    if (bp.summary && bp.summary.highReadingsPercentage > 20) {
      summary.keyFindings.push(`Blood pressure readings show ${bp.summary.highReadingsPercentage}% high readings`);
      if (bp.summary.highReadingsPercentage > 50) {
        summary.criticalAlerts.push('Multiple high blood pressure readings detected');
      }
    }

    // Medication Analysis
    if (meds.summary && meds.summary.activeMedications > 0) {
      summary.keyFindings.push(`Currently taking ${meds.summary.activeMedications} medications`);
    }

    // Mood Analysis
    if (mood.summary && mood.summary.averageMood < 5) {
      summary.keyFindings.push('Mood has been below average');
      summary.recommendations.push('Consider mental health support or stress management techniques');
    }

    if (mood.summary && mood.summary.averageStress > 7) {
      summary.keyFindings.push('Stress levels have been consistently high');
      summary.recommendations.push('Implement stress reduction strategies');
    }

    // Goals Analysis
    if (goals.summary && goals.summary.overdueGoals > 0) {
      summary.keyFindings.push(`${goals.summary.overdueGoals} health goals are overdue`);
    }

    // Insights Analysis
    insights.forEach(insight => {
      if (insight.severity === 'alert') {
        summary.criticalAlerts.push(insight.title);
      }
      summary.recommendations.push(insight.recommendation);
    });

    return summary;
  }

  generateRecommendations(bp, meds, mood, goals, insights) {
    const recommendations = [];

    // Blood Pressure Recommendations
    if (bp.summary && bp.summary.highReadingsPercentage > 20) {
      recommendations.push({
        category: 'Blood Pressure',
        priority: 'High',
        recommendation: 'Consider lifestyle modifications: reduce salt intake, increase physical activity, manage stress'
      });
    }

    // Medication Recommendations
    if (meds.summary && meds.summary.activeMedications > 5) {
      recommendations.push({
        category: 'Medications',
        priority: 'Medium',
        recommendation: 'Review medication list with healthcare provider to ensure no interactions'
      });
    }

    // Mental Health Recommendations
    if (mood.summary && mood.summary.averageStress > 7) {
      recommendations.push({
        category: 'Mental Health',
        priority: 'High',
        recommendation: 'Implement stress management techniques: meditation, exercise, counseling'
      });
    }

    // Add insights-based recommendations
    insights.forEach(insight => {
      recommendations.push({
        category: insight.type.charAt(0).toUpperCase() + insight.type.slice(1),
        priority: insight.severity === 'alert' ? 'High' : insight.severity === 'warning' ? 'Medium' : 'Low',
        recommendation: insight.recommendation
      });
    });

    return recommendations;
  }

  formatHeight(heightInInches) {
    const feet = Math.floor(heightInInches / 12);
    const inches = heightInInches % 12;
    return `${feet}'${inches}"`;
  }

  async exportReportAsPDF() {
    const report = await this.generateComprehensiveReport();
    
    // Create a formatted HTML report
    const htmlReport = this.createHTMLReport(report);
    
    // Use browser's print functionality to save as PDF
    const printWindow = window.open('', '_blank');
    printWindow.document.write(htmlReport);
    printWindow.document.close();
    printWindow.print();
  }

  createHTMLReport(report) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Medical Report - ${report.reportInfo.patientName}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; }
          .section { margin: 20px 0; }
          .section h2 { color: #2c5aa0; border-bottom: 1px solid #ccc; }
          .summary-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
          .alert { background: #ffebee; border-left: 4px solid #f44336; padding: 10px; }
          .warning { background: #fff3e0; border-left: 4px solid #ff9800; padding: 10px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Comprehensive Medical Report</h1>
          <p>Patient: ${report.reportInfo.patientName}</p>
          <p>Report Date: ${new Date(report.reportInfo.generatedDate).toLocaleDateString()}</p>
          <p>Date Range: ${new Date(report.reportInfo.dateRange.start).toLocaleDateString()} - ${new Date(report.reportInfo.dateRange.end).toLocaleDateString()}</p>
        </div>

        <div class="section">
          <h2>Executive Summary</h2>
          <div class="summary-box">
            <h3>Overall Health Status: ${report.executiveSummary.overallHealthStatus}</h3>
            <h4>Key Findings:</h4>
            <ul>${report.executiveSummary.keyFindings.map(finding => `<li>${finding}</li>`).join('')}</ul>
            ${report.executiveSummary.criticalAlerts.length > 0 ? `
              <h4>Critical Alerts:</h4>
              <ul>${report.executiveSummary.criticalAlerts.map(alert => `<li class="alert">${alert}</li>`).join('')}</ul>
            ` : ''}
          </div>
        </div>

        <div class="section">
          <h2>Patient Demographics</h2>
          <table>
            <tr><th>Name</th><td>${report.patientDemographics.name || 'Not provided'}</td></tr>
            <tr><th>Age</th><td>${report.patientDemographics.age || 'Not provided'}</td></tr>
            <tr><th>Weight</th><td>${report.patientDemographics.weight}</td></tr>
            <tr><th>Height</th><td>${report.patientDemographics.height}</td></tr>
            <tr><th>Medical Conditions</th><td>${report.patientDemographics.medicalConditions}</td></tr>
            <tr><th>Allergies</th><td>${report.patientDemographics.allergies}</td></tr>
          </table>
        </div>

        <div class="section">
          <h2>Blood Pressure Summary</h2>
          ${report.bloodPressure.summary.message ? 
            `<p>${report.bloodPressure.summary.message}</p>` :
            `<div class="summary-box">
              <p><strong>Average BP:</strong> ${report.bloodPressure.summary.averageSystolic}/${report.bloodPressure.summary.averageDiastolic} mmHg</p>
              <p><strong>Readings:</strong> ${report.bloodPressure.summary.totalReadings} total, ${report.bloodPressure.summary.highReadings} high</p>
              <p><strong>Category:</strong> ${report.bloodPressure.summary.category}</p>
            </div>`
          }
        </div>

        <div class="section">
          <h2>Medications</h2>
          ${report.medications.summary.message ? 
            `<p>${report.medications.summary.message}</p>` :
            `<div class="summary-box">
              <p><strong>Active Medications:</strong> ${report.medications.summary.activeMedications}</p>
            </div>
            <table>
              <tr><th>Medication</th><th>Dosage</th><th>Frequency</th><th>Instructions</th></tr>
              ${report.medications.currentMedications.map(med => 
                `<tr><td>${med.name}</td><td>${med.dosage}</td><td>${med.frequency}</td><td>${med.instructions || ''}</td></tr>`
              ).join('')}
            </table>`
          }
        </div>

        <div class="section">
          <h2>Mental Health Summary</h2>
          ${report.mentalHealth.summary.message ? 
            `<p>${report.mentalHealth.summary.message}</p>` :
            `<div class="summary-box">
              <p><strong>Average Mood:</strong> ${report.mentalHealth.summary.averageMood}/10</p>
              <p><strong>Average Stress:</strong> ${report.mentalHealth.summary.averageStress}/10</p>
              <p><strong>Entries:</strong> ${report.mentalHealth.summary.totalEntries}</p>
            </div>`
          }
        </div>

        <div class="section">
          <h2>Health Goals</h2>
          ${report.goals.summary.message ? 
            `<p>${report.goals.summary.message}</p>` :
            `<div class="summary-box">
              <p><strong>Total Goals:</strong> ${report.goals.summary.totalGoals}</p>
              <p><strong>Completed:</strong> ${report.goals.summary.completedGoals}</p>
              <p><strong>Active:</strong> ${report.goals.summary.activeGoals}</p>
              <p><strong>Overdue:</strong> ${report.goals.summary.overdueGoals}</p>
            </div>`
          }
        </div>

        <div class="section">
          <h2>Recommendations</h2>
          <table>
            <tr><th>Category</th><th>Priority</th><th>Recommendation</th></tr>
            ${report.recommendations.map(rec => 
              `<tr><td>${rec.category}</td><td>${rec.priority}</td><td>${rec.recommendation}</td></tr>`
            ).join('')}
          </table>
        </div>
      </body>
      </html>
    `;
  }
}

// Initialize Medical Report Generator
window.medicalReportGenerator = new MedicalReportGenerator(); 
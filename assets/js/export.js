// Data Export System
class ExportManager {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.init();
  }

  init() {
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
    }
  }

  async exportAllData() {
    try {
      this.showLoading('Preparing data export...');
      
      const data = await this.gatherAllData();
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      const filename = `bradley-health-data-${timestamp}`;
      
      // Create ZIP file with all data
      const zip = new JSZip();
      
      // Add JSON export
      zip.file(`${filename}.json`, JSON.stringify(data, null, 2));
      
      // Add CSV exports
      zip.file(`${filename}-blood-pressure.csv`, this.convertToCSV(data.bloodPressure, 'blood-pressure'));
      zip.file(`${filename}-medications.csv`, this.convertToCSV(data.medications, 'medications'));
      zip.file(`${filename}-mood.csv`, this.convertToCSV(data.moodEntries, 'mood'));
      
      // Add PDF report
      const pdfBlob = await this.generatePDFReport(data);
      zip.file(`${filename}-report.pdf`, pdfBlob);
      
      // Download ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      this.downloadFile(zipBlob, `${filename}.zip`);
      
      this.showToast('Data export completed successfully!', 'success');
    } catch (error) {
      console.error('Export error:', error);
      this.showToast('Error exporting data', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async gatherAllData() {
    const userId = this.currentUser.uid;
    
    // Gather all data from Firestore
    const [bpSnapshot, medSnapshot, moodSnapshot, profileSnapshot] = await Promise.all([
      this.db.collection('bloodPressure').where('userId', '==', userId).get(),
      this.db.collection('medications').where('userId', '==', userId).get(),
      this.db.collection('moodEntries').where('userId', '==', userId).get(),
      this.db.collection('users').doc(userId).get()
    ]);

    return {
      profile: profileSnapshot.exists ? profileSnapshot.data() : null,
      bloodPressure: bpSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      medications: medSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      moodEntries: moodSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
      exportDate: new Date().toISOString(),
      exportVersion: '1.0'
    };
  }

  convertToCSV(data, type) {
    if (!data || data.length === 0) return 'No data available';

    let headers = [];
    let rows = [];

    switch (type) {
      case 'blood-pressure':
        headers = ['Date', 'Systolic', 'Diastolic', 'Pulse', 'Status', 'Notes'];
        rows = data.map(item => [
          new Date(item.timestamp).toLocaleDateString(),
          item.systolic,
          item.diastolic,
          item.pulse || '',
          this.getBPStatus(item.systolic, item.diastolic),
          item.notes || ''
        ]);
        break;
      
      case 'medications':
        headers = ['Name', 'Dosage', 'Frequency', 'Start Date', 'End Date', 'Prescribed By', 'Pharmacy'];
        rows = data.map(item => [
          item.name,
          item.dosage,
          item.frequency,
          item.startDate ? new Date(item.startDate).toLocaleDateString() : '',
          item.endDate ? new Date(item.endDate).toLocaleDateString() : '',
          item.prescribedBy || '',
          item.pharmacy || ''
        ]);
        break;
      
      case 'mood':
        headers = ['Date', 'Mood', 'Energy', 'Stress', 'Sleep', 'Notes'];
        rows = data.map(item => [
          new Date(item.timestamp).toLocaleDateString(),
          item.mood,
          item.energy,
          item.stress,
          item.sleep,
          item.notes || ''
        ]);
        break;
    }

    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
  }

  getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic >= 130 || diastolic >= 80) return 'High';
    return 'Unknown';
  }

  async generatePDFReport(data) {
    // This would require a PDF library like jsPDF
    // For now, we'll create a simple text report
    const report = this.generateTextReport(data);
    return new Blob([report], { type: 'text/plain' });
  }

  generateTextReport(data) {
    const report = [];
    report.push('BRADLEY HEALTH - DATA EXPORT REPORT');
    report.push('=====================================');
    report.push(`Generated: ${new Date().toLocaleString()}`);
    report.push('');

    // Profile Summary
    if (data.profile) {
      report.push('PROFILE SUMMARY');
      report.push('---------------');
      report.push(`Name: ${data.profile.name || 'Not provided'}`);
      report.push(`Age: ${data.profile.age || 'Not provided'}`);
      report.push(`Weight: ${data.profile.weight || 'Not provided'} kg`);
      report.push(`Height: ${data.profile.height || 'Not provided'} cm`);
      report.push('');
    }

    // Blood Pressure Summary
    if (data.bloodPressure && data.bloodPressure.length > 0) {
      report.push('BLOOD PRESSURE SUMMARY');
      report.push('----------------------');
      report.push(`Total readings: ${data.bloodPressure.length}`);
      
      const avgSystolic = data.bloodPressure.reduce((sum, bp) => sum + bp.systolic, 0) / data.bloodPressure.length;
      const avgDiastolic = data.bloodPressure.reduce((sum, bp) => sum + bp.diastolic, 0) / data.bloodPressure.length;
      
      report.push(`Average BP: ${avgSystolic.toFixed(1)}/${avgDiastolic.toFixed(1)} mmHg`);
      report.push(`Date range: ${new Date(data.bloodPressure[0].timestamp).toLocaleDateString()} - ${new Date(data.bloodPressure[data.bloodPressure.length - 1].timestamp).toLocaleDateString()}`);
      report.push('');
    }

    // Medication Summary
    if (data.medications && data.medications.length > 0) {
      report.push('MEDICATION SUMMARY');
      report.push('------------------');
      report.push(`Total medications: ${data.medications.length}`);
      report.push('Current medications:');
      data.medications.forEach(med => {
        report.push(`  - ${med.name}: ${med.dosage} (${med.frequency})`);
      });
      report.push('');
    }

    // Mood Summary
    if (data.moodEntries && data.moodEntries.length > 0) {
      report.push('MOOD SUMMARY');
      report.push('-------------');
      report.push(`Total entries: ${data.moodEntries.length}`);
      
      const avgMood = data.moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / data.moodEntries.length;
      const avgEnergy = data.moodEntries.reduce((sum, entry) => sum + entry.energy, 0) / data.moodEntries.length;
      
      report.push(`Average mood: ${avgMood.toFixed(1)}/10`);
      report.push(`Average energy: ${avgEnergy.toFixed(1)}/10`);
      report.push('');
    }

    return report.join('\n');
  }

  downloadFile(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Export specific data types
  async exportBloodPressure() {
    try {
      const userId = this.currentUser.uid;
      const snapshot = await this.db.collection('bloodPressure').where('userId', '==', userId).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const csv = this.convertToCSV(data, 'blood-pressure');
      const blob = new Blob([csv], { type: 'text/csv' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      this.downloadFile(blob, `blood-pressure-${timestamp}.csv`);
      this.showToast('Blood pressure data exported!', 'success');
    } catch (error) {
      this.showToast('Error exporting blood pressure data', 'error');
    }
  }

  async exportMedications() {
    try {
      const userId = this.currentUser.uid;
      const snapshot = await this.db.collection('medications').where('userId', '==', userId).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const csv = this.convertToCSV(data, 'medications');
      const blob = new Blob([csv], { type: 'text/csv' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      this.downloadFile(blob, `medications-${timestamp}.csv`);
      this.showToast('Medication data exported!', 'success');
    } catch (error) {
      this.showToast('Error exporting medication data', 'error');
    }
  }

  async exportMoodData() {
    try {
      const userId = this.currentUser.uid;
      const snapshot = await this.db.collection('moodEntries').where('userId', '==', userId).get();
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      const csv = this.convertToCSV(data, 'mood');
      const blob = new Blob([csv], { type: 'text/csv' });
      const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
      
      this.downloadFile(blob, `mood-data-${timestamp}.csv`);
      this.showToast('Mood data exported!', 'success');
    } catch (error) {
      this.showToast('Error exporting mood data', 'error');
    }
  }

  // Export chart as image
  exportChartAsImage(chartId, filename) {
    if (window.chartManager) {
      const imageData = window.chartManager.exportChart(chartId);
      if (imageData) {
        const link = document.createElement('a');
        link.download = filename || `${chartId}-chart.png`;
        link.href = imageData;
        link.click();
        this.showToast('Chart exported successfully!', 'success');
      }
    }
  }

  showLoading(message) {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.textContent = message;
      loadingEl.style.display = 'block';
    }
  }

  hideLoading() {
    const loadingEl = document.getElementById('loading');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize export manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.exportManager = new ExportManager();
}); 
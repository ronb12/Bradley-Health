/**
 * Women's Health Manager
 * Comprehensive women's health tracking and management
 */

class WomensHealthManager {
  constructor() {
    this.userId = null;
    this.db = null;
    this.cycleData = [];
    this.reproductiveHealth = [];
    this.breastHealth = [];
    this.gynecologicalHealth = [];
    this.hormonalHealth = [];
    this.preventiveCare = [];
    
    this.init();
  }

  async init() {
    try {
      // Wait for Firebase services to be ready
      if (window.firebaseServices && window.firebaseServices.db && window.authManager) {
        this.userId = window.authManager.getUserId();
        this.db = window.firebaseServices.db;
        
        if (this.userId) {
          await this.loadWomensHealthData();
          this.setupEventListeners();
          this.updateOverview();
        }
      } else {
        // Wait for Firebase services to be ready
        setTimeout(() => this.init(), 1000);
      }
    } catch (error) {
      console.error('Error initializing Women\'s Health Manager:', error);
    }
  }

  async loadWomensHealthData() {
    try {
      if (!this.userId || !this.db) return;

      // Load all women's health data
      const collections = [
        'womensHealth_cycle',
        'womensHealth_reproductive',
        'womensHealth_breast',
        'womensHealth_gynecological',
        'womensHealth_hormonal',
        'womensHealth_preventive'
      ];

      for (const collection of collections) {
        const snapshot = await this.db.collection(collection)
          .where('userId', '==', this.userId)
          .orderBy('date', 'desc')
          .get();

        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        switch (collection) {
          case 'womensHealth_cycle':
            this.cycleData = data;
            break;
          case 'womensHealth_reproductive':
            this.reproductiveHealth = data;
            break;
          case 'womensHealth_breast':
            this.breastHealth = data;
            break;
          case 'womensHealth_gynecological':
            this.gynecologicalHealth = data;
            break;
          case 'womensHealth_hormonal':
            this.hormonalHealth = data;
            break;
          case 'womensHealth_preventive':
            this.preventiveCare = data;
            break;
        }
      }

      this.updateHistoryDisplay();
      this.updateCycleCalendar();
      console.log('Women\'s health data loaded successfully:', {
        cycleData: this.cycleData.length,
        reproductiveHealth: this.reproductiveHealth.length,
        breastHealth: this.breastHealth.length,
        gynecologicalHealth: this.gynecologicalHealth.length,
        hormonalHealth: this.hormonalHealth.length,
        preventiveCare: this.preventiveCare.length
      });
    } catch (error) {
      console.error('Error loading women\'s health data:', error);
    }
  }

  setupEventListeners() {
    // Menstrual cycle form
    const menstrualForm = document.getElementById('menstrualForm');
    if (menstrualForm) {
      menstrualForm.addEventListener('submit', (e) => this.handleMenstrualSubmit(e));
    }

    // Contraception form
    const contraceptionForm = document.getElementById('contraceptionForm');
    if (contraceptionForm) {
      contraceptionForm.addEventListener('submit', (e) => this.handleContraceptionSubmit(e));
    }

    // Fertility form
    const fertilityForm = document.getElementById('fertilityForm');
    if (fertilityForm) {
      fertilityForm.addEventListener('submit', (e) => this.handleFertilitySubmit(e));
    }

    // Mammogram form
    const mammogramForm = document.getElementById('mammogramForm');
    if (mammogramForm) {
      mammogramForm.addEventListener('submit', (e) => this.handleMammogramSubmit(e));
    }

    // Pap smear form
    const papSmearForm = document.getElementById('papSmearForm');
    if (papSmearForm) {
      papSmearForm.addEventListener('submit', (e) => this.handlePapSmearSubmit(e));
    }

    // STI test form
    const stiTestForm = document.getElementById('stiTestForm');
    if (stiTestForm) {
      stiTestForm.addEventListener('submit', (e) => this.handleSTITestSubmit(e));
    }

    // PCOS form
    const pcosForm = document.getElementById('pcosForm');
    if (pcosForm) {
      pcosForm.addEventListener('submit', (e) => this.handlePCOSSubmit(e));
    }

    // Thyroid form
    const thyroidForm = document.getElementById('thyroidForm');
    if (thyroidForm) {
      thyroidForm.addEventListener('submit', (e) => this.handleThyroidSubmit(e));
    }

    // Well-woman form
    const wellWomanForm = document.getElementById('wellWomanForm');
    if (wellWomanForm) {
      wellWomanForm.addEventListener('submit', (e) => this.handleWellWomanSubmit(e));
    }

    // Vaccination form
    const vaccinationForm = document.getElementById('vaccinationForm');
    if (vaccinationForm) {
      vaccinationForm.addEventListener('submit', (e) => this.handleVaccinationSubmit(e));
    }
  }

  async handleMenstrualSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date'),
        type: formData.get('type'),
        flowIntensity: formData.get('flowIntensity'),
        symptoms: formData.getAll('symptoms'),
        notes: formData.get('notes'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_cycle').add(data);
      console.log('Menstrual cycle data saved to Firebase:', data);
      await this.loadWomensHealthData();
      this.showToast('Cycle event logged successfully!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving menstrual data:', error);
      this.showToast('Error saving cycle data', 'error');
    }
  }

  async handleContraceptionSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        type: formData.get('type'),
        startDate: formData.get('startDate'),
        notes: formData.get('notes'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_reproductive').add(data);
      await this.loadWomensHealthData();
      this.showToast('Contraception information saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving contraception data:', error);
      this.showToast('Error saving contraception data', 'error');
    }
  }

  async handleFertilitySubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date') || new Date().toISOString().split('T')[0],
        basalTemp: parseFloat(formData.get('basalTemp')),
        cervicalMucus: formData.get('cervicalMucus'),
        ovulationTest: formData.get('ovulationTest'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_reproductive').add(data);
      await this.loadWomensHealthData();
      this.showToast('Fertility data logged!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving fertility data:', error);
      this.showToast('Error saving fertility data', 'error');
    }
  }

  async handleMammogramSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date'),
        result: formData.get('result'),
        notes: formData.get('notes'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_breast').add(data);
      await this.loadWomensHealthData();
      this.showToast('Mammogram information saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving mammogram data:', error);
      this.showToast('Error saving mammogram data', 'error');
    }
  }

  async handlePapSmearSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date'),
        result: formData.get('result'),
        notes: formData.get('notes'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_gynecological').add(data);
      await this.loadWomensHealthData();
      this.showToast('Pap smear information saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving pap smear data:', error);
      this.showToast('Error saving pap smear data', 'error');
    }
  }

  async handleSTITestSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date'),
        testType: formData.get('testType'),
        result: formData.get('result'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_gynecological').add(data);
      await this.loadWomensHealthData();
      this.showToast('STI test information saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving STI test data:', error);
      this.showToast('Error saving STI test data', 'error');
    }
  }

  async handlePCOSSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: new Date().toISOString().split('T')[0],
        weight: parseFloat(formData.get('weight')),
        insulinResistance: formData.get('insulinResistance'),
        symptoms: formData.getAll('pcosSymptoms'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_hormonal').add(data);
      await this.loadWomensHealthData();
      this.showToast('PCOS data logged!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving PCOS data:', error);
      this.showToast('Error saving PCOS data', 'error');
    }
  }

  async handleThyroidSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: new Date().toISOString().split('T')[0],
        tsh: parseFloat(formData.get('tsh')),
        t4: parseFloat(formData.get('t4')),
        symptoms: formData.getAll('thyroidSymptoms'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_hormonal').add(data);
      await this.loadWomensHealthData();
      this.showToast('Thyroid data logged!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving thyroid data:', error);
      this.showToast('Error saving thyroid data', 'error');
    }
  }

  async handleWellWomanSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        date: formData.get('date'),
        provider: formData.get('provider'),
        notes: formData.get('notes'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_preventive').add(data);
      await this.loadWomensHealthData();
      this.showToast('Well-woman exam saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving well-woman exam data:', error);
      this.showToast('Error saving exam data', 'error');
    }
  }

  async handleVaccinationSubmit(e) {
    e.preventDefault();
    try {
      const formData = new FormData(e.target);
      const data = {
        userId: this.userId,
        type: formData.get('type'),
        date: formData.get('date'),
        nextDue: formData.get('nextDue'),
        timestamp: new Date().toISOString()
      };

      await this.db.collection('womensHealth_preventive').add(data);
      await this.loadWomensHealthData();
      this.showToast('Vaccination information saved!', 'success');
      e.target.reset();
    } catch (error) {
      console.error('Error saving vaccination data:', error);
      this.showToast('Error saving vaccination data', 'error');
    }
  }

  updateOverview() {
    try {
      // Update cycle day
      const cycleDayElement = document.getElementById('cycleDay');
      if (cycleDayElement) {
        const cycleDay = this.calculateCycleDay();
        cycleDayElement.textContent = cycleDay || '--';
      }

      // Update next period
      const nextPeriodElement = document.getElementById('nextPeriod');
      if (nextPeriodElement) {
        const nextPeriod = this.calculateNextPeriod();
        nextPeriodElement.textContent = nextPeriod || '--';
      }

      // Update ovulation day
      const ovulationElement = document.getElementById('ovulationDay');
      if (ovulationElement) {
        const ovulation = this.calculateOvulationDay();
        ovulationElement.textContent = ovulation || '--';
      }

      // Update next checkup
      const nextCheckupElement = document.getElementById('nextCheckup');
      if (nextCheckupElement) {
        const nextCheckup = this.calculateNextCheckup();
        nextCheckupElement.textContent = nextCheckup || '--';
      }
    } catch (error) {
      console.error('Error updating overview:', error);
    }
  }

  calculateCycleDay() {
    if (this.cycleData.length === 0) return null;

    const lastPeriod = this.cycleData.find(entry => entry.type === 'period-start');
    if (!lastPeriod) return null;

    const lastPeriodDate = new Date(lastPeriod.date);
    const today = new Date();
    const diffTime = today - lastPeriodDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays > 0 ? diffDays : null;
  }

  calculateNextPeriod() {
    if (this.cycleData.length === 0) return null;

    const lastPeriod = this.cycleData.find(entry => entry.type === 'period-start');
    if (!lastPeriod) return null;

    const lastPeriodDate = new Date(lastPeriod.date);
    const averageCycleLength = this.calculateAverageCycleLength();
    const nextPeriodDate = new Date(lastPeriodDate);
    nextPeriodDate.setDate(nextPeriodDate.getDate() + averageCycleLength);

    return nextPeriodDate.toLocaleDateString();
  }

  calculateOvulationDay() {
    if (this.cycleData.length === 0) return null;

    const lastPeriod = this.cycleData.find(entry => entry.type === 'period-start');
    if (!lastPeriod) return null;

    const lastPeriodDate = new Date(lastPeriod.date);
    const averageCycleLength = this.calculateAverageCycleLength();
    const ovulationDate = new Date(lastPeriodDate);
    ovulationDate.setDate(ovulationDate.getDate() + (averageCycleLength - 14));

    return ovulationDate.toLocaleDateString();
  }

  calculateAverageCycleLength() {
    if (this.cycleData.length < 2) return 28; // Default cycle length

    const periods = this.cycleData.filter(entry => entry.type === 'period-start');
    if (periods.length < 2) return 28;

    let totalDays = 0;
    for (let i = 1; i < periods.length; i++) {
      const prevDate = new Date(periods[i - 1].date);
      const currDate = new Date(periods[i].date);
      const diffTime = currDate - prevDate;
      const diffDays = diffTime / (1000 * 60 * 60 * 24);
      totalDays += diffDays;
    }

    return Math.round(totalDays / (periods.length - 1));
  }

  calculateNextCheckup() {
    if (this.preventiveCare.length === 0) return null;

    const lastCheckup = this.preventiveCare.find(entry => entry.type === 'well-woman');
    if (!lastCheckup) return null;

    const lastCheckupDate = new Date(lastCheckup.date);
    const nextCheckupDate = new Date(lastCheckupDate);
    nextCheckupDate.setFullYear(nextCheckupDate.getFullYear() + 1);

    return nextCheckupDate.toLocaleDateString();
  }

  updateCycleCalendar() {
    const calendarElement = document.getElementById('cycleCalendar');
    if (!calendarElement) return;

    // Simple calendar implementation
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    let calendarHTML = '<div class="calendar-grid">';
    
    // Add day headers
    const dayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayHeaders.forEach(day => {
      calendarHTML += `<div class="calendar-header">${day}</div>`;
    });

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      calendarHTML += '<div class="calendar-day empty"></div>';
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateString = date.toISOString().split('T')[0];
      
      // Check if this day has cycle data
      const cycleEvent = this.cycleData.find(entry => entry.date === dateString);
      let dayClass = 'calendar-day';
      let dayContent = day.toString();

      if (cycleEvent) {
        dayClass += ` cycle-${cycleEvent.type}`;
        dayContent += `<span class="cycle-indicator">${this.getCycleIcon(cycleEvent.type)}</span>`;
      }

      if (dateString === today.toISOString().split('T')[0]) {
        dayClass += ' today';
      }

      calendarHTML += `<div class="${dayClass}">${dayContent}</div>`;
    }

    calendarHTML += '</div>';
    calendarElement.innerHTML = calendarHTML;
  }

  getCycleIcon(type) {
    const icons = {
      'period-start': '🩸',
      'period-end': '🩸',
      'ovulation': '🥚',
      'spotting': '🔴'
    };
    return icons[type] || '•';
  }

  updateHistoryDisplay() {
    const historyElement = document.getElementById('womensHealthHistoryList');
    if (!historyElement) return;

    // Combine all health data and sort by date
    const allHealthData = [
      ...this.cycleData.map(item => ({ ...item, category: 'Cycle' })),
      ...this.reproductiveHealth.map(item => ({ ...item, category: 'Reproductive' })),
      ...this.breastHealth.map(item => ({ ...item, category: 'Breast Health' })),
      ...this.gynecologicalHealth.map(item => ({ ...item, category: 'Gynecological' })),
      ...this.hormonalHealth.map(item => ({ ...item, category: 'Hormonal' })),
      ...this.preventiveCare.map(item => ({ ...item, category: 'Preventive' }))
    ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    if (allHealthData.length === 0) {
      historyElement.innerHTML = '<p class="no-data">No health data recorded yet.</p>';
      return;
    }

    const historyHTML = allHealthData.map(item => {
      const date = new Date(item.timestamp).toLocaleDateString();
      return `
        <div class="history-item">
          <div class="history-header">
            <span class="history-category">${item.category}</span>
            <span class="history-date">${date}</span>
          </div>
          <div class="history-content">
            ${this.formatHistoryContent(item)}
          </div>
        </div>
      `;
    }).join('');

    historyElement.innerHTML = historyHTML;
  }

  formatHistoryContent(item) {
    switch (item.category) {
      case 'Cycle':
        return `
          <div class="cycle-event">
            <strong>${this.formatCycleType(item.type)}</strong>
            ${item.flowIntensity ? `<span class="flow-intensity">${item.flowIntensity}</span>` : ''}
            ${item.symptoms && item.symptoms.length > 0 ? `<div class="symptoms">Symptoms: ${item.symptoms.join(', ')}</div>` : ''}
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        `;
      case 'Reproductive':
        return `
          <div class="reproductive-event">
            <strong>${item.type || 'Contraception'}</strong>
            ${item.basalTemp ? `<span class="basal-temp">BBT: ${item.basalTemp}°F</span>` : ''}
            ${item.cervicalMucus ? `<span class="cervical-mucus">CM: ${item.cervicalMucus}</span>` : ''}
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        `;
      case 'Breast Health':
        return `
          <div class="breast-event">
            <strong>Mammogram</strong>
            <span class="result">Result: ${item.result}</span>
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        `;
      case 'Gynecological':
        return `
          <div class="gyn-event">
            <strong>${item.testType || 'Pap Smear'}</strong>
            <span class="result">Result: ${item.result}</span>
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        `;
      case 'Hormonal':
        return `
          <div class="hormonal-event">
            <strong>${item.weight ? 'PCOS' : 'Thyroid'}</strong>
            ${item.weight ? `<span class="weight">Weight: ${item.weight} lbs</span>` : ''}
            ${item.tsh ? `<span class="tsh">TSH: ${item.tsh}</span>` : ''}
            ${item.symptoms && item.symptoms.length > 0 ? `<div class="symptoms">Symptoms: ${item.symptoms.join(', ')}</div>` : ''}
          </div>
        `;
      case 'Preventive':
        return `
          <div class="preventive-event">
            <strong>${item.type || 'Well-Woman Exam'}</strong>
            ${item.provider ? `<span class="provider">Provider: ${item.provider}</span>` : ''}
            ${item.nextDue ? `<span class="next-due">Next Due: ${new Date(item.nextDue).toLocaleDateString()}</span>` : ''}
            ${item.notes ? `<div class="notes">${item.notes}</div>` : ''}
          </div>
        `;
      default:
        return `<div class="generic-event">${JSON.stringify(item)}</div>`;
    }
  }

  formatCycleType(type) {
    const types = {
      'period-start': 'Period Started',
      'period-end': 'Period Ended',
      'ovulation': 'Ovulation',
      'spotting': 'Spotting'
    };
    return types[type] || type;
  }

  // Breast exam reminder functions
  setBreastExamReminder() {
    // Set a monthly reminder for breast self-exam
    this.showToast('Monthly breast exam reminder set!', 'success');
    // In a real app, this would integrate with the device's notification system
  }

  markBreastExamDone() {
    // Mark breast exam as completed
    this.showToast('Breast exam marked as completed!', 'success');
    // In a real app, this would log the completion and set the next reminder
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`${type.toUpperCase()}: ${message}`);
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.womensHealthManager = new WomensHealthManager();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WomensHealthManager;
}

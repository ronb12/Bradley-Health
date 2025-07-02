// Limb Care Manager
class LimbCareManager {
  constructor() {
    this.db = null;
    this.userId = null;
    this.init();
  }

  async init() {
    // Wait for Firebase to be ready
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      this.db = firebase.firestore();
      this.currentUser = null;
      this.setupEventListeners();
      this.setupPainLevelSlider();
      this.setupAuthListener();
    } else {
      console.log('LimbCareManager: Waiting for Firebase...');
      setTimeout(() => this.init(), 1000);
    }
  }

  setupAuthListener() {
    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
      this.currentUser = user;
      if (user) {
        console.log('LimbCareManager: User authenticated, loading data...');
        this.loadLimbHistory();
      } else {
        console.log('LimbCareManager: User signed out, clearing data...');
        // Clear any cached data if needed
      }
    });
  }

  setupEventListeners() {
    // Limb Assessment Form
    const limbAssessmentForm = document.getElementById('limbAssessmentForm');
    if (limbAssessmentForm) {
      limbAssessmentForm.addEventListener('submit', (e) => this.handleLimbAssessment(e));
    }

    // Prosthetic Care Form
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
      prostheticForm.addEventListener('submit', (e) => this.handleProstheticCare(e));
    }

    // Pain Tracking Form
    const painForm = document.getElementById('painForm');
    if (painForm) {
      painForm.addEventListener('submit', (e) => this.handlePainTracking(e));
    }

    // Care Reminders Form
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
      reminderForm.addEventListener('submit', (e) => this.handleCareReminder(e));
    }

    // Set default date and time
    this.setDefaultDateTime();
  }

  setupPainLevelSlider() {
    const painSlider = document.getElementById('painLevel');
    const painValue = document.getElementById('painLevelValue');
    
    if (painSlider && painValue) {
      painSlider.addEventListener('input', (e) => {
        painValue.textContent = e.target.value;
      });
    }
  }

  setDefaultDateTime() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);

    const assessmentDate = document.getElementById('assessmentDate');
    const assessmentTime = document.getElementById('assessmentTime');
    
    if (assessmentDate) assessmentDate.value = dateStr;
    if (assessmentTime) assessmentTime.value = timeStr;
  }

  async handleLimbAssessment(event) {
    event.preventDefault();
    
    if (!this.db || !this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save limb assessments', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const assessment = {
      date: formData.get('date'),
      time: formData.get('time'),
      leftLimb: {
        skinCondition: formData.get('leftSkinCondition'),
        sensation: formData.get('leftSensation'),
        notes: formData.get('leftNotes')
      },
      rightLimb: {
        skinCondition: formData.get('rightSkinCondition'),
        sensation: formData.get('rightSensation'),
        notes: formData.get('rightNotes')
      },
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('limbAssessments').add(assessment);
      this.showToast('Limb assessment saved successfully', 'success');
      event.target.reset();
      this.setDefaultDateTime();
      this.loadLimbHistory();
    } catch (error) {
      console.error('Error saving limb assessment:', error);
      this.showToast('Error saving limb assessment', 'error');
    }
  }

  async handleProstheticCare(event) {
    event.preventDefault();
    
    if (!this.db || !this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save prosthetic care', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const prostheticCare = {
      type: formData.get('type'),
      fit: formData.get('fit'),
      wearTime: parseFloat(formData.get('wearTime')) || 0,
      cleaningDone: formData.get('cleaningDone'),
      notes: formData.get('notes'),
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('prostheticCare').add(prostheticCare);
      this.showToast('Prosthetic care logged successfully', 'success');
      event.target.reset();
      this.loadLimbHistory();
    } catch (error) {
      console.error('Error saving prosthetic care:', error);
      this.showToast('Error saving prosthetic care', 'error');
    }
  }

  async handlePainTracking(event) {
    event.preventDefault();
    
    if (!this.db || !this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save pain tracking', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const painEntry = {
      painLevel: parseInt(formData.get('painLevel')),
      painType: formData.get('painType'),
      painLocation: formData.get('painLocation'),
      notes: formData.get('notes'),
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('painTracking').add(painEntry);
      this.showToast('Pain entry logged successfully', 'success');
      event.target.reset();
      this.setDefaultDateTime();
      this.loadLimbHistory();
    } catch (error) {
      console.error('Error saving pain entry:', error);
      this.showToast('Error saving pain entry', 'error');
    }
  }

  async handleCareReminder(event) {
    event.preventDefault();
    
    if (!this.db || !this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to set reminders', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const reminder = {
      type: formData.get('type'),
      frequency: formData.get('frequency'),
      time: formData.get('time'),
      notes: formData.get('notes'),
      active: true,
      createdAt: new Date(),
      userId: this.currentUser.uid
    };

    try {
      await this.db.collection('careReminders').add(reminder);
      this.showToast('Care reminder set successfully', 'success');
      event.target.reset();
      this.loadLimbHistory();
    } catch (error) {
      console.error('Error setting reminder:', error);
      this.showToast('Error setting reminder', 'error');
    }
  }

  async loadLimbHistory() {
    if (!this.db || !this.currentUser || !this.currentUser.uid) return;

    try {
      const historyList = document.getElementById('limbHistoryList');
      if (!historyList) return;

      // Get recent assessments
      const assessmentsSnapshot = await this.db
        .collection('limbAssessments')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      // Get recent prosthetic care
      const prostheticSnapshot = await this.db
        .collection('prostheticCare')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      // Get recent pain entries
      const painSnapshot = await this.db
        .collection('painTracking')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .limit(5)
        .get();

      // Combine and sort all entries
      const allEntries = [];
      
      assessmentsSnapshot.forEach(doc => {
        allEntries.push({
          type: 'assessment',
          data: doc.data(),
          id: doc.id,
          timestamp: doc.data().timestamp
        });
      });

      prostheticSnapshot.forEach(doc => {
        allEntries.push({
          type: 'prosthetic',
          data: doc.data(),
          id: doc.id,
          timestamp: doc.data().timestamp
        });
      });

      painSnapshot.forEach(doc => {
        allEntries.push({
          type: 'pain',
          data: doc.data(),
          id: doc.id,
          timestamp: doc.data().timestamp
        });
      });

      // Sort by timestamp
      allEntries.sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate());

      // Display history
      this.displayLimbHistory(allEntries);
    } catch (error) {
      console.error('Error loading limb history:', error);
    }
  }

  displayLimbHistory(entries) {
    const historyList = document.getElementById('limbHistoryList');
    if (!historyList) return;

    if (entries.length === 0) {
      historyList.innerHTML = '<p class="no-data">No limb care history yet</p>';
      return;
    }

    const historyHTML = entries.map(entry => {
      const date = entry.timestamp.toDate().toLocaleDateString();
      const time = entry.timestamp.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      switch (entry.type) {
        case 'assessment':
          return `
            <div class="history-item assessment">
              <div class="history-header">
                <span class="history-type">🦵 Limb Assessment</span>
                <span class="history-date">${date} at ${time}</span>
              </div>
              <div class="history-content">
                <div class="limb-summary">
                  <strong>Left:</strong> ${entry.data.leftLimb.skinCondition} skin, ${entry.data.leftLimb.sensation} sensation
                  ${entry.data.leftLimb.notes ? `<br><em>${entry.data.leftLimb.notes}</em>` : ''}
                </div>
                <div class="limb-summary">
                  <strong>Right:</strong> ${entry.data.rightLimb.skinCondition} skin, ${entry.data.rightLimb.sensation} sensation
                  ${entry.data.rightLimb.notes ? `<br><em>${entry.data.rightLimb.notes}</em>` : ''}
                </div>
              </div>
            </div>
          `;

        case 'prosthetic':
          return `
            <div class="history-item prosthetic">
              <div class="history-header">
                <span class="history-type">🦿 Prosthetic Care</span>
                <span class="history-date">${date} at ${time}</span>
              </div>
              <div class="history-content">
                <div><strong>Type:</strong> ${entry.data.type}</div>
                <div><strong>Fit:</strong> ${entry.data.fit}</div>
                ${entry.data.wearTime ? `<div><strong>Wear Time:</strong> ${entry.data.wearTime} hours</div>` : ''}
                ${entry.data.cleaningDone ? `<div><strong>Cleaning:</strong> ${entry.data.cleaningDone}</div>` : ''}
                ${entry.data.notes ? `<div><em>${entry.data.notes}</em></div>` : ''}
              </div>
            </div>
          `;

        case 'pain':
          return `
            <div class="history-item pain">
              <div class="history-header">
                <span class="history-type">😣 Pain Entry</span>
                <span class="history-date">${date} at ${time}</span>
              </div>
              <div class="history-content">
                <div><strong>Level:</strong> ${entry.data.painLevel}/10</div>
                ${entry.data.painType ? `<div><strong>Type:</strong> ${entry.data.painType}</div>` : ''}
                ${entry.data.painLocation ? `<div><strong>Location:</strong> ${entry.data.painLocation}</div>` : ''}
                ${entry.data.notes ? `<div><em>${entry.data.notes}</em></div>` : ''}
              </div>
            </div>
          `;

        default:
          return '';
      }
    }).join('');

    historyList.innerHTML = historyHTML;
  }



  showToast(message, type = 'info') {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`Toast (${type}): ${message}`);
    }
  }
}

// Initialize Limb Care Manager
let limbCareManager;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  limbCareManager = new LimbCareManager();
});

// Export for global access
window.limbCareManager = limbCareManager; 
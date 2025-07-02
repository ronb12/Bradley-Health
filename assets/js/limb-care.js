// Limb Care Manager
class LimbCareManager {
  constructor() {
    this.db = null;
    this.currentUser = null;
    this.userLimbs = []; // Store user's limb configuration
    this.init();
  }

  async init() {
    // Wait for Firebase to be ready
    if (typeof firebase !== 'undefined' && firebase.firestore) {
      this.db = firebase.firestore();
      this.currentUser = null;
      this.setupAuthListener();
      
      // Wait a bit for DOM to be ready, then setup event listeners
      setTimeout(() => {
        this.setupEventListeners();
        this.setupPainLevelSlider();
      }, 100);
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
        this.loadUserLimbConfiguration();
        this.loadLimbHistory();
      } else {
        console.log('LimbCareManager: User signed out, clearing data...');
        this.userLimbs = [];
        this.clearForms();
      }
    });
  }

  setupEventListeners() {
    // Limb Assessment Form
    const limbAssessmentForm = document.getElementById('limbAssessmentForm');
    if (limbAssessmentForm) {
      limbAssessmentForm.addEventListener('submit', (e) => this.handleLimbAssessment(e));
    }

    // Limb count selector
    const limbCountSelect = document.getElementById('limbCount');
    if (limbCountSelect) {
      limbCountSelect.addEventListener('change', (e) => this.handleLimbCountChange(e));
    }

    // Prosthetic Care Form
    const prostheticForm = document.getElementById('prostheticForm');
    if (prostheticForm) {
      prostheticForm.addEventListener('submit', (e) => this.handleProstheticCare(e));
    }

    // Prosthetic limb dropdown change
    const prostheticLimbSelect = document.getElementById('prostheticLimb');
    if (prostheticLimbSelect) {
      prostheticLimbSelect.addEventListener('change', (e) => {
        console.log('Prosthetic limb selected:', e.target.value, 'Options:', e.target.options);
      });
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

  async loadUserLimbConfiguration() {
    if (!this.db || !this.currentUser || !this.currentUser.uid) return;

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (doc.exists) {
        const userData = doc.data();
        this.userLimbs = userData.limbs || [];
        
        // Update limb count selector
        const limbCountSelect = document.getElementById('limbCount');
        if (limbCountSelect && this.userLimbs.length > 0) {
          limbCountSelect.value = this.userLimbs.length;
          this.handleLimbCountChange({ target: { value: this.userLimbs.length } });
        }
        
        // Update prosthetic limb options
        this.updateProstheticLimbOptions();
      }
    } catch (error) {
      console.error('Error loading user limb configuration:', error);
      
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
        // User will need to configure their limbs for the first time
      }
    }
  }

  async saveUserLimbConfiguration() {
    if (!this.db || !this.currentUser || !this.currentUser.uid) return;

    try {
      await this.db.collection('users').doc(this.currentUser.uid).update({
        limbs: this.userLimbs
      });
    } catch (error) {
      console.error('Error saving user limb configuration:', error);
    }
  }

  handleLimbCountChange(event) {
    const count = parseInt(event.target.value);
    const limbTypesContainer = document.getElementById('limbTypesContainer');
    const limbAssessmentsContainer = document.getElementById('limbAssessmentsContainer');
    
    if (count > 0) {
      // Show limb types configuration
      limbTypesContainer.style.display = 'block';
      this.generateLimbTypesForm(count);
      
      // Generate assessment forms
      this.generateLimbAssessmentForms(count);
      
      // Initialize userLimbs array if needed
      while (this.userLimbs.length < count) {
        this.userLimbs.push({});
      }
      
      // Update prosthetic limb options
      this.updateProstheticLimbOptions();
    } else {
      limbTypesContainer.style.display = 'none';
      limbAssessmentsContainer.innerHTML = '';
      this.userLimbs = [];
      this.updateProstheticLimbOptions();
    }
  }

  generateLimbTypesForm(count) {
    const container = document.getElementById('limbTypesContainer');
    const limbTypes = ['left-lower', 'right-lower', 'left-upper', 'right-upper'];
    
    let html = '<div class="limb-types-grid">';
    for (let i = 0; i < count; i++) {
      const currentType = this.userLimbs[i]?.type || '';
      html += `
        <div class="form-group">
          <label for="limbType${i}">Limb ${i + 1} Type</label>
          <select id="limbType${i}" name="limbType${i}" required onchange="limbCareManager.updateLimbConfiguration(${i}, this.value)">
            <option value="">Select type</option>
            ${limbTypes.map(type => `<option value="${type}" ${type === currentType ? 'selected' : ''}>${this.formatLimbType(type)}</option>`).join('')}
          </select>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  }

  generateLimbAssessmentForms(count) {
    const container = document.getElementById('limbAssessmentsContainer');
    
    let html = '';
    for (let i = 0; i < count; i++) {
      const limbName = this.userLimbs[i]?.name || `Limb ${i + 1}`;
      html += `
        <div class="limb-section" id="limbSection${i}">
          <h3>${limbName} Assessment</h3>
          <div class="form-row">
            <div class="form-group">
              <label for="skinCondition${i}">Skin Condition</label>
              <select id="skinCondition${i}" name="skinCondition${i}" required>
                <option value="">Select condition</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
                <option value="concerning">Concerning</option>
              </select>
            </div>
            <div class="form-group">
              <label for="sensation${i}">Sensation</label>
              <select id="sensation${i}" name="sensation${i}" required>
                <option value="">Select sensation</option>
                <option value="normal">Normal</option>
                <option value="tingling">Tingling</option>
                <option value="numbness">Numbness</option>
                <option value="phantom-pain">Phantom Pain</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div class="form-group">
            <label for="notes${i}">Notes</label>
            <textarea id="notes${i}" name="notes${i}" rows="2" placeholder="Describe any issues, pain, or observations"></textarea>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  updateLimbConfiguration(index, limbType) {
    if (!this.userLimbs[index]) {
      this.userLimbs[index] = {};
    }
    this.userLimbs[index].type = limbType;
    this.userLimbs[index].name = this.formatLimbType(limbType);
    
    // Update section title
    const section = document.getElementById(`limbSection${index}`);
    if (section) {
      const title = section.querySelector('h3');
      if (title) {
        title.textContent = `${this.formatLimbType(limbType)} Assessment`;
      }
    }
    
    // Update prosthetic limb options
    this.updateProstheticLimbOptions();
    
    // Save configuration
    this.saveUserLimbConfiguration();
  }

  updateProstheticLimbOptions() {
    const prostheticLimbSelect = document.getElementById('prostheticLimb');
    const prostheticForm = document.getElementById('prostheticForm');
    const prostheticSetupMessage = document.getElementById('prostheticSetupMessage');
    
    if (!prostheticLimbSelect) return;
    
    prostheticLimbSelect.innerHTML = '<option value="">Select limb</option>';
    
    console.log('Updating prosthetic limb options:', this.userLimbs);
    
    // Add configured limbs
    this.userLimbs.forEach((limb, index) => {
      if (limb.type) {
        const option = `<option value="${index}">${limb.name}</option>`;
        prostheticLimbSelect.innerHTML += option;
        console.log(`Added option: ${option}`);
      }
    });
    
    // Check if any limbs are configured
    const hasConfiguredLimbs = this.userLimbs.length > 0 && this.userLimbs.some(limb => limb.type);
    
    console.log('Has configured limbs:', hasConfiguredLimbs);
    
    // Show/hide setup message and form
    if (prostheticSetupMessage) {
      prostheticSetupMessage.style.display = hasConfiguredLimbs ? 'none' : 'block';
    }
    if (prostheticForm) {
      prostheticForm.style.display = hasConfiguredLimbs ? 'block' : 'none';
    }
    
    // If no limbs are configured, add a message to dropdown
    if (!hasConfiguredLimbs) {
      prostheticLimbSelect.innerHTML += '<option value="" disabled>Please configure your limbs first</option>';
    }
  }

  formatLimbType(type) {
    const types = {
      'left-lower': 'Left Lower Limb',
      'right-lower': 'Right Lower Limb',
      'left-upper': 'Left Upper Limb',
      'right-upper': 'Right Upper Limb'
    };
    return types[type] || type;
  }

  clearForms() {
    const limbTypesContainer = document.getElementById('limbTypesContainer');
    const limbAssessmentsContainer = document.getElementById('limbAssessmentsContainer');
    
    if (limbTypesContainer) limbTypesContainer.style.display = 'none';
    if (limbAssessmentsContainer) limbAssessmentsContainer.innerHTML = '';
  }

  resetAssessmentFieldsOnly() {
    // Reset only the assessment fields, not the limb configuration
    const limbCount = this.userLimbs.length;
    
    for (let i = 0; i < limbCount; i++) {
      const skinConditionSelect = document.getElementById(`skinCondition${i}`);
      const sensationSelect = document.getElementById(`sensation${i}`);
      const notesTextarea = document.getElementById(`notes${i}`);
      
      if (skinConditionSelect) skinConditionSelect.value = '';
      if (sensationSelect) sensationSelect.value = '';
      if (notesTextarea) notesTextarea.value = '';
    }
  }

  async handleLimbAssessment(event) {
    event.preventDefault();
    
    if (!this.db || !this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to save limb assessments', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const limbCount = parseInt(formData.get('limbCount'));
    
    if (!limbCount || limbCount === 0) {
      this.showToast('Please select the number of limbs', 'error');
      return;
    }

    // Validate that all limbs are configured
    const configuredLimbs = this.userLimbs.filter(limb => limb.type);
    if (configuredLimbs.length !== limbCount) {
      this.showToast(`Please configure all ${limbCount} limbs before saving assessment`, 'error');
      return;
    }

    // Validate required fields for each limb
    for (let i = 0; i < limbCount; i++) {
      const skinCondition = formData.get(`skinCondition${i}`);
      const sensation = formData.get(`sensation${i}`);
      
      if (!skinCondition || !sensation) {
        this.showToast(`Please fill in all required fields for ${this.userLimbs[i]?.name || `Limb ${i + 1}`}`, 'error');
        return;
      }
    }

    const assessment = {
      date: formData.get('date'),
      time: formData.get('time'),
      limbCount: limbCount,
      limbs: [],
      timestamp: new Date(),
      userId: this.currentUser.uid
    };

    // Collect data for each limb
    for (let i = 0; i < limbCount; i++) {
      const limbData = {
        index: i,
        type: this.userLimbs[i]?.type || `limb-${i}`,
        name: this.userLimbs[i]?.name || `Limb ${i + 1}`,
        skinCondition: formData.get(`skinCondition${i}`),
        sensation: formData.get(`sensation${i}`),
        notes: formData.get(`notes${i}`)
      };
      assessment.limbs.push(limbData);
    }

    try {
      await this.db.collection('limbAssessments').add(assessment);
      this.showToast('Limb assessment saved successfully', 'success');
      
      // Don't reset the form - keep the limb configuration
      // Only reset the assessment fields, not the configuration
      this.resetAssessmentFieldsOnly();
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

    // Check if limbs are configured
    if (this.userLimbs.length === 0 || !this.userLimbs.some(limb => limb.type)) {
      this.showToast('Please configure your limbs first in the Daily Assessment section', 'error');
      return;
    }

    const formData = new FormData(event.target);
    const limbValue = formData.get('limb');
    const limbIndex = parseInt(limbValue);
    
    console.log('Prosthetic care form data:', {
      limbValue,
      limbIndex,
      userLimbs: this.userLimbs,
      selectedLimb: this.userLimbs[limbIndex]
    });
    
    if (limbValue === '' || limbValue === null) {
      this.showToast('Please select a limb', 'error');
      return;
    }
    
    if (isNaN(limbIndex) || limbIndex < 0 || limbIndex >= this.userLimbs.length) {
      this.showToast('Please select a valid limb', 'error');
      return;
    }
    
    if (!this.userLimbs[limbIndex] || !this.userLimbs[limbIndex].type) {
      this.showToast('Selected limb is not properly configured', 'error');
      return;
    }

    // Validate other required fields
    const fit = formData.get('fit');
    if (!fit) {
      this.showToast('Please select fit quality', 'error');
      return;
    }

    const prostheticCare = {
      limbIndex: limbIndex,
      limbType: this.userLimbs[limbIndex].type,
      limbName: this.userLimbs[limbIndex].name,
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
      
      // Reset form but keep the limb selection
      const prostheticForm = event.target;
      const selectedLimb = prostheticForm.querySelector('#prostheticLimb').value;
      
      prostheticForm.reset();
      
      // Restore the limb selection
      if (selectedLimb) {
        prostheticForm.querySelector('#prostheticLimb').value = selectedLimb;
      }
      
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
      
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
        const historyList = document.getElementById('limbHistoryList');
        if (historyList) {
          historyList.innerHTML = '<p class="no-data">No limb care history yet. Start by configuring your limbs and adding your first assessment!</p>';
        }
      }
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
                <span class="history-type">🦵 Limb Assessment (${entry.data.limbCount} limbs)</span>
                <span class="history-date">${date} at ${time}</span>
              </div>
              <div class="history-content">
                ${entry.data.limbs.map(limb => `
                  <div class="limb-summary">
                    <strong>${limb.name}:</strong> ${limb.skinCondition} skin, ${limb.sensation} sensation
                    ${limb.notes ? `<br><em>${limb.notes}</em>` : ''}
                  </div>
                `).join('')}
              </div>
            </div>
          `;

        case 'prosthetic':
          return `
            <div class="history-item prosthetic">
              <div class="history-header">
                <span class="history-type">🦿 ${entry.data.limbName} Prosthetic</span>
                <span class="history-date">${date} at ${time}</span>
              </div>
              <div class="history-content">
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
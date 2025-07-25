// Medication Management System
class MedicationManager {
  constructor() {
      this.currentUser = null;
      this.medications = [];
      this.reminders = [];
    this.initialized = false;
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
          this.init();
    }
  }

  init() {
    console.log('Medication Manager: Initializing...');
    
    // Prevent multiple initializations
    if (this.initialized) {
      console.log('Medication Manager: Already initialized, skipping...');
      return;
    }

    const checkFirebase = () => {
      if (window.firebaseServices && window.firebaseServices.db) {
        this.db = window.firebaseServices.db;
        console.log('Medication Manager: Firebase found, setting up...');
        this.setupAuthListener();
        this.setupEventListeners();
        this.initialized = true;
      } else {
        console.log('Medication Manager: Firebase not ready, retrying...');
        setTimeout(checkFirebase, 100);
      }
    };
    
    checkFirebase();
  }

  setupAuthListener() {
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          console.log('Medication Manager: User authenticated, loading data');
          this.loadMedications();
          this.loadReminders();
        } else {
          console.log('Medication Manager: User signed out, clearing data');
          this.medications = [];
          this.reminders = [];
          this.renderMedicationList();
          this.renderReminders();
        }
      });
      
      // Get initial user state
      this.currentUser = window.authManager.getCurrentUser();
      if (this.currentUser) {
        console.log('Medication Manager: User already authenticated, loading data');
        this.loadMedications();
        this.loadReminders();
      }
    }
  }

  setupEventListeners() {
    // Add medication form
    const addMedForm = document.getElementById('addMedicationForm');
    if (addMedForm) {
      addMedForm.addEventListener('submit', (e) => this.addMedication(e));
    }

    // Setup medication name auto-complete
    this.setupMedicationAutoComplete();

    // Medication list
    const medList = document.getElementById('medicationList');
    if (medList) {
      this.renderMedicationList();
    }

    // Reminder settings
    const reminderForm = document.getElementById('reminderForm');
    if (reminderForm) {
      reminderForm.addEventListener('submit', (e) => this.setupReminder(e));
    }
  }

  setupMedicationAutoComplete() {
    const medNameInput = document.getElementById('medName');
    if (!medNameInput) {
      console.log('Medication Manager: medName input not found');
      return;
    }

    console.log('Medication Manager: Setting up medication dropdown');

    // Create dropdown container
    const dropdownContainer = document.createElement('div');
    dropdownContainer.id = 'medicationDropdown';
    dropdownContainer.className = 'medication-dropdown';
    dropdownContainer.style.display = 'none';
    medNameInput.parentNode.appendChild(dropdownContainer);

    // Show dropdown when input is focused
    medNameInput.addEventListener('focus', () => {
      this.showMedicationDropdown(dropdownContainer, medNameInput);
    });

    // Hide dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!medNameInput.contains(e.target) && !dropdownContainer.contains(e.target)) {
        dropdownContainer.style.display = 'none';
      }
    });

    // Handle keyboard navigation
    medNameInput.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter') {
        e.preventDefault();
        this.handleDropdownNavigation(e.key, dropdownContainer, medNameInput);
      }
    });
  }

  showMedicationDropdown(container, input) {
    if (!window.medicationDatabase) {
      console.log('Medication Manager: Database not available');
      return;
    }

    const medications = window.medicationDatabase.medications;
    container.innerHTML = '';

    // Group medications by category
    const groupedMeds = {};
    medications.forEach(med => {
      if (!groupedMeds[med.category]) {
        groupedMeds[med.category] = [];
      }
      groupedMeds[med.category].push(med);
    });

    // Create dropdown content
    Object.keys(groupedMeds).forEach(category => {
      const categoryDiv = document.createElement('div');
      categoryDiv.className = 'dropdown-category';
      
      const categoryHeader = document.createElement('div');
      categoryHeader.className = 'dropdown-category-header';
      categoryHeader.textContent = category;
      categoryDiv.appendChild(categoryHeader);

      groupedMeds[category].forEach(med => {
        const item = document.createElement('div');
        item.className = 'dropdown-item';
        item.innerHTML = `
          <div class="med-name">${med.name}</div>
          <div class="med-dosage">${med.dosage}</div>
        `;
        
        item.addEventListener('click', () => {
          this.selectMedicationFromDropdown(med, input, container);
        });
        
        categoryDiv.appendChild(item);
      });

      container.appendChild(categoryDiv);
    });

    container.style.display = 'block';
  }

  selectMedicationFromDropdown(medication, input, container) {
    input.value = medication.name;
    
    // Auto-fill dosage if available
    const dosageInput = document.getElementById('medDosage');
    if (dosageInput && medication.dosage) {
      const firstDosage = medication.dosage.split(',')[0].trim();
      dosageInput.value = firstDosage;
    }
    
    container.style.display = 'none';
    console.log('Medication Manager: Selected', medication.name);
  }

  handleDropdownNavigation(key, container, input) {
    const items = container.querySelectorAll('.dropdown-item');
    const currentActive = container.querySelector('.dropdown-item.active');
    
    if (key === 'Enter' && currentActive) {
      const medName = currentActive.querySelector('.med-name').textContent;
      const medDosage = currentActive.querySelector('.med-dosage').textContent;
      this.selectMedicationFromDropdown({ name: medName, dosage: medDosage }, input, container);
      return;
    }

    let nextIndex = 0;
    if (currentActive) {
      const currentIndex = Array.from(items).indexOf(currentActive);
      if (key === 'ArrowDown') {
        nextIndex = (currentIndex + 1) % items.length;
      } else if (key === 'ArrowUp') {
        nextIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
      }
    }

    items.forEach(item => item.classList.remove('active'));
    if (items[nextIndex]) {
      items[nextIndex].classList.add('active');
    }
  }

  addActive(items, currentFocus) {
    if (!items) return false;
    
    this.removeActive(items);
    if (currentFocus >= items.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (items.length - 1);
    
    items[currentFocus].classList.add('auto-complete-active');
  }

  removeActive(items) {
    for (let i = 0; i < items.length; i++) {
      items[i].classList.remove('auto-complete-active');
    }
  }

  async addMedication(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to add medications', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    const medication = {
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      frequency: formData.get('frequency'),
      timeOfDay: formData.get('timeOfDay'),
      instructions: formData.get('instructions'),
      createdAt: new Date(),
      userId: this.currentUser.uid,
      active: true
    };

    try {
      this.showLoading('Adding medication...');
      await this.db.collection('medications').add(medication);
      // Update UI
      this.renderMedicationList();
      
      // Reset form
      e.target.reset();
    } catch (error) {
      console.error('Error adding medication:', error);
      this.showToast('Error adding medication: ' + error.message, 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadMedications() {
    if (!this.currentUser || !this.currentUser.uid) return;
    
    try {
      const snapshot = await this.db.collection('medications')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      this.medications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderMedicationList();
    } catch (error) {
      console.error('Error loading medications:', error);
      this.showToast('Error loading medications', 'error');
    }
  }

  formatTimeTo12Hour(timeString) {
    if (!timeString) return '';
    
    // Handle different time formats
    let time = timeString;
    
    // If it's already in 12-hour format with AM/PM, return as is
    if (timeString.toLowerCase().includes('am') || timeString.toLowerCase().includes('pm')) {
      return timeString;
    }
    
    // If it's a time input value (HH:MM format)
    if (timeString.includes(':')) {
      const [hours, minutes] = timeString.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    }
    
    // If it's just a number (hour only)
    if (!isNaN(timeString)) {
      const hour = parseInt(timeString);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:00 ${ampm}`;
    }
    
    return timeString; // Return original if we can't parse it
  }

  renderMedicationList() {
    const medList = document.getElementById('medicationList');
    if (!medList) return;

    if (this.medications.length === 0) {
      medList.innerHTML = '<p class="no-data">No medications added yet. Add your first medication above.</p>';
      return;
    }

    medList.innerHTML = this.medications.map(med => `
      <div class="medication-item" data-id="${med.id}">
        <div class="med-info">
          <h4>${med.name}</h4>
          <p><strong>Dosage:</strong> ${med.dosage}</p>
          <p><strong>Frequency:</strong> ${med.frequency}</p>
          ${med.timeOfDay ? `<p><strong>Time:</strong> ${this.formatTimeTo12Hour(med.timeOfDay)}</p>` : ''}
          ${med.instructions ? `<p><strong>Instructions:</strong> ${med.instructions}</p>` : ''}
        </div>
        <div class="med-actions">
          <button onclick="window.medicationManager.editMedication('${med.id}')" class="btn btn-secondary">Edit</button>
          <button onclick="window.medicationManager.deleteMedication('${med.id}')" class="btn btn-danger">Delete</button>
        </div>
      </div>
    `).join('');
  }

  getMedicationStatus(medication) {
    // Simple status check - can be enhanced
    return medication.active ? 'Active' : 'Inactive';
  }

  async deleteMedication(medId) {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      await this.db.collection('medications').doc(medId).delete();
      this.showToast('Medication deleted successfully', 'success');
      this.loadMedications();
    } catch (error) {
      console.error('Error deleting medication:', error);
      this.showToast('Error deleting medication', 'error');
    }
  }

  async editMedication(medId) {
    const medication = this.medications.find(m => m.id === medId);
    if (!medication) return;

    // Populate form for editing
    const form = document.getElementById('addMedicationForm');
    if (form) {
      form.querySelector('#medName').value = medication.name;
      form.querySelector('#medDosage').value = medication.dosage;
      form.querySelector('#medFrequency').value = medication.frequency;
      form.querySelector('#medTime').value = medication.timeOfDay || '';
      form.querySelector('#medInstructions').value = medication.instructions || '';
      
      // Change form to update mode
      form.dataset.editId = medId;
      form.querySelector('button[type="submit"]').textContent = 'Update Medication';
    }
  }

  async updateMedication(e) {
    e.preventDefault();
    
    const editId = e.target.dataset.editId;
    if (!editId) return;
    
    const formData = new FormData(e.target);
    
    const medication = {
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      frequency: formData.get('frequency'),
      timeOfDay: formData.get('timeOfDay'),
      instructions: formData.get('instructions'),
      updatedAt: new Date()
    };

    try {
      this.showLoading('Updating medication...');
      await this.db.collection('medications').doc(editId).update(medication);
      this.showToast('Medication updated successfully!', 'success');
      this.loadMedications();
      this.closeEditModal();
    } catch (error) {
      console.error('Error updating medication:', error);
      this.showToast('Error updating medication', 'error');
    } finally {
      this.hideLoading();
    }
  }

  closeEditModal() {
    const form = document.getElementById('addMedicationForm');
    if (form) {
      delete form.dataset.editId;
      form.reset();
      form.querySelector('button[type="submit"]').textContent = 'Add Medication';
    }
  }

  async setupReminder(e) {
    e.preventDefault();
    
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to set reminders', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
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
      this.showLoading('Setting up reminder...');
      await this.db.collection('reminders').add(reminder);
      this.showToast('Reminder set successfully!', 'success');
      this.loadReminders();
      e.target.reset();
    } catch (error) {
      console.error('Error setting reminder:', error);
      this.showToast('Error setting reminder', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadReminders() {
    if (!this.currentUser || !this.currentUser.uid) return;
    
    try {
      const snapshot = await this.db.collection('reminders')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('createdAt', 'desc')
        .get();

      this.reminders = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderReminders();
    } catch (error) {
      console.error('Error loading reminders:', error);
    }
  }

  renderReminders() {
    const reminderList = document.getElementById('reminderList');
    if (!reminderList) return;

    if (this.reminders.length === 0) {
      reminderList.innerHTML = '<p class="no-data">No reminders set yet.</p>';
      return;
    }

    reminderList.innerHTML = this.reminders.map(reminder => `
        <div class="reminder-item" data-id="${reminder.id}">
          <div class="reminder-info">
          <h4>${reminder.type}</h4>
          <p><strong>Frequency:</strong> ${reminder.frequency}</p>
          <p><strong>Time:</strong> ${reminder.time}</p>
          ${reminder.notes ? `<p><strong>Notes:</strong> ${reminder.notes}</p>` : ''}
          </div>
          <div class="reminder-actions">
          <button onclick="window.medicationManager.toggleReminder('${reminder.id}')" class="btn btn-secondary">
            ${reminder.active ? 'Disable' : 'Enable'}
            </button>
          <button onclick="window.medicationManager.deleteReminder('${reminder.id}')" class="btn btn-danger">Delete</button>
        </div>
      </div>
    `).join('');
  }

  async toggleReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    try {
      await this.db.collection('reminders').doc(reminderId).update({
        active: !reminder.active
      });
      this.showToast(`Reminder ${reminder.active ? 'disabled' : 'enabled'}`, 'success');
      this.loadReminders();
    } catch (error) {
      console.error('Error toggling reminder:', error);
      this.showToast('Error updating reminder', 'error');
    }
  }

  async deleteReminder(reminderId) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await this.db.collection('reminders').doc(reminderId).delete();
      this.showToast('Reminder deleted successfully', 'success');
      this.loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      this.showToast('Error deleting reminder', 'error');
    }
  }

  checkDueMedications() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    this.medications.forEach(med => {
      if (med.timeOfDay && med.active) {
        const [hours, minutes] = med.timeOfDay.split(':').map(Number);
        const medTime = hours * 60 + minutes;
        
        // Check if medication is due (within 30 minutes)
        if (Math.abs(currentTime - medTime) <= 30) {
          this.showMedicationReminder(med);
        }
      }
    });
  }

  showMedicationReminder(medication) {
    // Create notification for medication reminder
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${medication.name} - ${medication.dosage}`,
        icon: '/assets/favicon.svg'
      });
    }

    this.showToast(`Reminder: Take ${medication.name}`, 'info');
  }

  showLoading(message) {
    const loading = document.getElementById('loading');
    const loadingMessage = document.getElementById('loadingMessage');
    if (loading && loadingMessage) {
      loadingMessage.textContent = message;
      loading.style.display = 'flex';
    }
  }

  hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
      loading.style.display = 'none';
    }
  }

  showToast(message, type = 'info') {
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`[${type.toUpperCase()}] ${message}`);
    }
  }
}

// Initialize medication manager
  window.medicationManager = new MedicationManager();
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
      this.showToast('Medication added successfully!', 'success');
      this.loadMedications();
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
          ${med.timeOfDay ? `<p><strong>Time:</strong> ${med.timeOfDay}</p>` : ''}
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
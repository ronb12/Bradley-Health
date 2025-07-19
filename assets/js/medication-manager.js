// Medication Management System
class MedicationManager {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.medications = [];
      this.reminders = [];
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.medications = [];
          this.reminders = [];
          this.init();
        } else {
          console.error('Firebase not available for medication manager');
        }
      }, 1000);
    }
  }

  init() {
    // Get current user from auth manager
    if (window.authManager) {
      this.currentUser = window.authManager.getCurrentUser();
      if (this.currentUser) {
        this.loadMedications();
        this.loadReminders();
      }
    }

    this.setupEventListeners();
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
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      instructions: formData.get('instructions'),
      prescribedBy: formData.get('prescribedBy'),
      pharmacy: formData.get('pharmacy'),
      refillDate: formData.get('refillDate'),
      sideEffects: formData.get('sideEffects'),
      notes: formData.get('notes'),
      createdAt: new Date(),
      userId: this.currentUser.uid
    };

    try {
      this.showLoading('Adding medication...');
      await this.db.collection('medications').add(medication);
      this.showToast('Medication added successfully!', 'success');
      this.loadMedications();
      e.target.reset();
    } catch (error) {
      this.showToast('Error adding medication', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadMedications() {
    try {
      // Check if user is authenticated
      if (!this.currentUser || !this.currentUser.uid) {
        console.log('User not authenticated yet, skipping medication load');
        return;
      }

      const snapshot = await this.db
        .collection('medications')
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
    }
  }

  renderMedicationList() {
    const medList = document.getElementById('medicationList');
    if (!medList) return;

    if (this.medications.length === 0) {
      medList.innerHTML = '<p class="no-data">No medications added yet.</p>';
      return;
    }

    medList.innerHTML = this.medications.map(med => `
      <div class="medication-item" data-id="${med.id}">
        <div class="med-header">
          <h3>${med.name}</h3>
          <div class="med-actions">
            <button class="btn btn-small" onclick="medicationManager.editMedication('${med.id}')">Edit</button>
            <button class="btn btn-small btn-danger" onclick="medicationManager.deleteMedication('${med.id}')">Delete</button>
          </div>
        </div>
        <div class="med-details">
          <p><strong>Dosage:</strong> ${med.dosage}</p>
          <p><strong>Frequency:</strong> ${med.frequency}</p>
          <p><strong>Time:</strong> ${med.timeOfDay}</p>
          ${med.instructions ? `<p><strong>Instructions:</strong> ${med.instructions}</p>` : ''}
          ${med.prescribedBy ? `<p><strong>Prescribed by:</strong> ${med.prescribedBy}</p>` : ''}
          ${med.pharmacy ? `<p><strong>Pharmacy:</strong> ${med.pharmacy}</p>` : ''}
          ${med.refillDate ? `<p><strong>Refill Date:</strong> ${new Date(med.refillDate).toLocaleDateString()}</p>` : ''}
        </div>
        <div class="med-status">
          <span class="status-badge ${this.getMedicationStatus(med)}">${this.getMedicationStatus(med)}</span>
        </div>
      </div>
    `).join('');
  }

  getMedicationStatus(medication) {
    const today = new Date();
    const startDate = new Date(medication.startDate);
    const endDate = medication.endDate ? new Date(medication.endDate) : null;

    if (today < startDate) return 'pending';
    if (endDate && today > endDate) return 'completed';
    return 'active';
  }

  async deleteMedication(medId) {
    if (!confirm('Are you sure you want to delete this medication?')) return;

    try {
      this.showLoading('Deleting medication...');
      await this.db.collection('medications').doc(medId).delete();
      this.showToast('Medication deleted successfully!', 'success');
      this.loadMedications();
    } catch (error) {
      this.showToast('Error deleting medication', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async editMedication(medId) {
    const medication = this.medications.find(med => med.id === medId);
    if (!medication) return;

    // Populate edit form
    const form = document.getElementById('editMedicationForm');
    if (form) {
      Object.keys(medication).forEach(key => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input && key !== 'id' && key !== 'userId' && key !== 'createdAt') {
          input.value = medication[key];
        }
      });
      
      // Show edit modal
      const modal = document.getElementById('editMedicationModal');
      if (modal) modal.style.display = 'block';
    }
  }

  async updateMedication(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const medId = formData.get('medId');
    
    const updateData = {
      name: formData.get('name'),
      dosage: formData.get('dosage'),
      frequency: formData.get('frequency'),
      timeOfDay: formData.get('timeOfDay'),
      startDate: formData.get('startDate'),
      endDate: formData.get('endDate') || null,
      instructions: formData.get('instructions'),
      prescribedBy: formData.get('prescribedBy'),
      pharmacy: formData.get('pharmacy'),
      refillDate: formData.get('refillDate'),
      sideEffects: formData.get('sideEffects'),
      notes: formData.get('notes'),
      updatedAt: new Date()
    };

    try {
      this.showLoading('Updating medication...');
      await this.db.collection('medications').doc(medId).update(updateData);
      this.showToast('Medication updated successfully!', 'success');
      this.loadMedications();
      this.closeEditModal();
    } catch (error) {
      this.showToast('Error updating medication', 'error');
    } finally {
      this.hideLoading();
    }
  }

  closeEditModal() {
    const modal = document.getElementById('editMedicationModal');
    if (modal) modal.style.display = 'none';
  }

  async setupReminder(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const reminder = {
      medicationId: formData.get('medicationId'),
      time: formData.get('time'),
      days: formData.get('days').split(','),
      enabled: true,
      createdAt: new Date(),
      userId: this.currentUser.uid
    };

    try {
      this.showLoading('Setting up reminder...');
      await this.db.collection('reminders').add(reminder);
      this.showToast('Reminder set up successfully!', 'success');
      this.loadReminders();
      e.target.reset();
    } catch (error) {
      this.showToast('Error setting up reminder', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadReminders() {
    try {
      const snapshot = await this.db
        .collection('reminders')
        .where('userId', '==', this.currentUser.uid)
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
      reminderList.innerHTML = '<p class="no-data">No reminders set up.</p>';
      return;
    }

    reminderList.innerHTML = this.reminders.map(reminder => {
      const medication = this.medications.find(med => med.id === reminder.medicationId);
      return `
        <div class="reminder-item" data-id="${reminder.id}">
          <div class="reminder-info">
            <h4>${medication ? medication.name : 'Unknown Medication'}</h4>
            <p>Time: ${reminder.time}</p>
            <p>Days: ${reminder.days.join(', ')}</p>
          </div>
          <div class="reminder-actions">
            <button class="btn btn-small" onclick="medicationManager.toggleReminder('${reminder.id}')">
              ${reminder.enabled ? 'Disable' : 'Enable'}
            </button>
            <button class="btn btn-small btn-danger" onclick="medicationManager.deleteReminder('${reminder.id}')">Delete</button>
          </div>
        </div>
      `;
    }).join('');
  }

  async toggleReminder(reminderId) {
    const reminder = this.reminders.find(r => r.id === reminderId);
    if (!reminder) return;

    try {
      await this.db.collection('reminders').doc(reminderId).update({
        enabled: !reminder.enabled
      });
      this.showToast(`Reminder ${reminder.enabled ? 'disabled' : 'enabled'}!`, 'success');
      this.loadReminders();
    } catch (error) {
      this.showToast('Error updating reminder', 'error');
    }
  }

  async deleteReminder(reminderId) {
    if (!confirm('Are you sure you want to delete this reminder?')) return;

    try {
      await this.db.collection('reminders').doc(reminderId).delete();
      this.showToast('Reminder deleted successfully!', 'success');
      this.loadReminders();
    } catch (error) {
      this.showToast('Error deleting reminder', 'error');
    }
  }

  // Check for due medications
  checkDueMedications() {
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    this.reminders.forEach(reminder => {
      if (reminder.enabled && 
          reminder.time === currentTime && 
          reminder.days.includes(currentDay)) {
        this.showMedicationReminder(reminder);
      }
    });
  }

  showMedicationReminder(reminder) {
    const medication = this.medications.find(med => med.id === reminder.medicationId);
    if (!medication) return;

    // Show notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Medication Reminder', {
        body: `Time to take ${medication.name} - ${medication.dosage}`,
        icon: '/assets/favicon.svg'
      });
    }

    // Show toast
    this.showToast(`Time to take ${medication.name}!`, 'warning');
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

// Initialize medication manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.medicationManager = new MedicationManager();
  
  // Check for due medications every minute
  setInterval(() => {
    if (window.medicationManager) {
      window.medicationManager.checkDueMedications();
    }
  }, 60000);
}); 
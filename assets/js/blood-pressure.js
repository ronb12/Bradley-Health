// Blood Pressure Management System
class BloodPressureManager {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.readings = [];
    this.init();
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.setupEventListeners();
          this.loadReadings();
        }
      });
    }
  }

  setupEventListeners() {
    // Blood pressure form
    const bpForm = document.getElementById('bpForm');
    if (bpForm) {
      bpForm.addEventListener('submit', (e) => this.addReading(e));
    }

    // Quick mood buttons (if they exist in blood pressure context)
    const moodButtons = document.querySelectorAll('.mood-btn');
    moodButtons.forEach(button => {
      button.addEventListener('click', (e) => this.quickMoodEntry(e));
    });
  }

  async addReading(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const reading = {
      systolic: parseInt(formData.get('systolic')),
      diastolic: parseInt(formData.get('diastolic')),
      pulse: formData.get('pulse') ? parseInt(formData.get('pulse')) : null,
      notes: formData.get('notes'),
      timestamp: new Date(),
      userId: this.currentUser.uid,
      status: this.getBPStatus(parseInt(formData.get('systolic')), parseInt(formData.get('diastolic')))
    };

    try {
      this.showLoading('Saving blood pressure reading...');
      await this.db.collection('bloodPressure').add(reading);
      this.showToast('Blood pressure reading saved successfully!', 'success');
      this.loadReadings();
      e.target.reset();
    } catch (error) {
      console.error('Error saving blood pressure reading:', error);
      this.showToast('Error saving blood pressure reading', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async loadReadings() {
    if (!this.currentUser) {
      console.log('User not authenticated yet, skipping blood pressure load');
      return;
    }

    try {
      const snapshot = await this.db
        .collection('bloodPressure')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('timestamp', 'desc')
        .get();

      this.readings = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      this.renderReadings();
      this.updateCurrentReading();
    } catch (error) {
      console.error('Error loading blood pressure readings:', error);
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
        this.renderEmptyState();
      }
    }
  }

  renderReadings() {
    const historyList = document.getElementById('bpHistoryList');
    if (!historyList) return;

    if (this.readings.length === 0) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>No blood pressure readings yet</p>
          <p>Add your first reading to get started!</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = this.readings.map(reading => `
      <div class="history-item ${reading.status.toLowerCase()}">
        <div class="reading-values">
          <span class="systolic">${reading.systolic}</span>
          <span class="separator">/</span>
          <span class="diastolic">${reading.diastolic}</span>
          <span class="unit">mmHg</span>
          ${reading.pulse ? `<span class="pulse">Pulse: ${reading.pulse}</span>` : ''}
        </div>
        <div class="reading-details">
          <span class="status ${reading.status.toLowerCase()}">${reading.status}</span>
          <span class="date">${new Date(reading.timestamp).toLocaleDateString()}</span>
          <span class="time">${new Date(reading.timestamp).toLocaleTimeString()}</span>
        </div>
        ${reading.notes ? `<div class="notes">${reading.notes}</div>` : ''}
        <div class="actions">
          <button class="btn btn-small" onclick="window.bpManager.editReading('${reading.id}')">Edit</button>
          <button class="btn btn-small btn-danger" onclick="window.bpManager.deleteReading('${reading.id}')">Delete</button>
        </div>
      </div>
    `).join('');
  }

  updateCurrentReading() {
    if (this.readings.length === 0) {
      const currentSystolic = document.getElementById('currentSystolic');
      const currentDiastolic = document.getElementById('currentDiastolic');
      const currentStatus = document.getElementById('currentStatus');
      const lastReadingTime = document.getElementById('lastReadingTime');
      
      if (currentSystolic) currentSystolic.textContent = '--';
      if (currentDiastolic) currentDiastolic.textContent = '--';
      if (currentStatus) currentStatus.textContent = '--';
      if (lastReadingTime) lastReadingTime.textContent = 'No readings yet';
      return;
    }

    const latest = this.readings[0];
    const currentSystolic = document.getElementById('currentSystolic');
    const currentDiastolic = document.getElementById('currentDiastolic');
    const currentStatus = document.getElementById('currentStatus');
    const lastReadingTime = document.getElementById('lastReadingTime');
    
    if (currentSystolic) currentSystolic.textContent = latest.systolic;
    if (currentDiastolic) currentDiastolic.textContent = latest.diastolic;
    if (currentStatus) currentStatus.textContent = latest.status;
    if (lastReadingTime) {
      lastReadingTime.textContent = `Last reading: ${new Date(latest.timestamp).toLocaleDateString()} at ${new Date(latest.timestamp).toLocaleTimeString()}`;
    }
  }

  renderEmptyState() {
    const historyList = document.getElementById('bpHistoryList');
    if (historyList) {
      historyList.innerHTML = `
        <div class="empty-state">
          <p>Welcome to Bradley Health!</p>
          <p>Add your first blood pressure reading to get started.</p>
        </div>
      `;
    }
  }

  async editReading(readingId) {
    const reading = this.readings.find(r => r.id === readingId);
    if (!reading) return;

    // Create edit modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <h3>Edit Blood Pressure Reading</h3>
        <form id="editBPForm">
          <input type="hidden" name="readingId" value="${reading.id}">
          <div class="form-row">
            <div class="form-group">
              <label for="editSystolic">Systolic</label>
              <input type="number" id="editSystolic" name="systolic" value="${reading.systolic}" min="70" max="200" required>
            </div>
            <div class="form-group">
              <label for="editDiastolic">Diastolic</label>
              <input type="number" id="editDiastolic" name="diastolic" value="${reading.diastolic}" min="40" max="130" required>
            </div>
          </div>
          <div class="form-group">
            <label for="editPulse">Pulse Rate</label>
            <input type="number" id="editPulse" name="pulse" value="${reading.pulse || ''}" min="40" max="200">
          </div>
          <div class="form-group">
            <label for="editNotes">Notes</label>
            <textarea id="editNotes" name="notes" rows="3">${reading.notes || ''}</textarea>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn btn-primary">Update Reading</button>
            <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">Cancel</button>
          </div>
        </form>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#editBPForm');
    form.addEventListener('submit', (e) => this.updateReading(e));
  }

  async updateReading(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const readingId = formData.get('readingId');
    
    const updateData = {
      systolic: parseInt(formData.get('systolic')),
      diastolic: parseInt(formData.get('diastolic')),
      pulse: formData.get('pulse') ? parseInt(formData.get('pulse')) : null,
      notes: formData.get('notes'),
      updatedAt: new Date(),
      status: this.getBPStatus(parseInt(formData.get('systolic')), parseInt(formData.get('diastolic')))
    };

    try {
      this.showLoading('Updating blood pressure reading...');
      await this.db.collection('bloodPressure').doc(readingId).update(updateData);
      this.showToast('Blood pressure reading updated successfully!', 'success');
      this.loadReadings();
      e.target.closest('.modal').remove();
    } catch (error) {
      console.error('Error updating blood pressure reading:', error);
      this.showToast('Error updating blood pressure reading', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async deleteReading(readingId) {
    if (!confirm('Are you sure you want to delete this reading?')) return;

    try {
      this.showLoading('Deleting blood pressure reading...');
      await this.db.collection('bloodPressure').doc(readingId).delete();
      this.showToast('Blood pressure reading deleted successfully!', 'success');
      this.loadReadings();
    } catch (error) {
      console.error('Error deleting blood pressure reading:', error);
      this.showToast('Error deleting blood pressure reading', 'error');
    } finally {
      this.hideLoading();
    }
  }

  getBPStatus(systolic, diastolic) {
    if (systolic < 120 && diastolic < 80) return 'Normal';
    if (systolic < 130 && diastolic < 80) return 'Elevated';
    if (systolic >= 130 || diastolic >= 80) return 'High';
    return 'Unknown';
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
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toastContainer';
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after 5 seconds
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 5000);

    // Also remove on click
    toast.addEventListener('click', () => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    });
  }
}

// Initialize blood pressure manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.bpManager = new BloodPressureManager();
}); 
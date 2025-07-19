// Profile Management System
class ProfileManager {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.userProfile = null;
    this.init();
  }

  init() {
    // Wait for authentication
    if (window.authManager) {
      window.authManager.auth.onAuthStateChanged((user) => {
        this.currentUser = user;
        if (user) {
          this.setupEventListeners();
          this.loadProfile();
        }
      });
    }
  }

  setupEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.updateProfile(e));
    }

    // Emergency contact form
    const emergencyForm = document.getElementById('emergencyForm');
    if (emergencyForm) {
      emergencyForm.addEventListener('submit', (e) => this.updateEmergencyContact(e));
    }

    // Settings
    const enableNotifications = document.getElementById('enableNotifications');
    if (enableNotifications) {
      enableNotifications.addEventListener('change', (e) => this.updateNotificationSettings(e));
    }

    const reminderTime = document.getElementById('reminderTime');
    if (reminderTime) {
      reminderTime.addEventListener('change', (e) => this.updateReminderTime(e));
    }

    // Export data button
    const exportDataBtn = document.getElementById('exportData');
    if (exportDataBtn) {
      exportDataBtn.addEventListener('click', () => this.exportData());
    }
  }

  async loadProfile() {
    if (!this.currentUser) {
      return;
    }

    try {
      const doc = await this.db.collection('users').doc(this.currentUser.uid).get();
      if (doc.exists) {
        this.userProfile = doc.data();
        this.populateProfileForms();
        this.updateProfileDisplay();
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      // Handle Firestore permissions error gracefully
      if (error.code === 'permission-denied') {
        console.log('Firestore permissions not set up yet - this is normal for new users');
      }
    }
  }

  populateProfileForms() {
    if (!this.userProfile) return;

    // Populate profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      const nameInput = profileForm.querySelector('[name="name"]');
      const ageInput = profileForm.querySelector('[name="age"]');
      const weightInput = profileForm.querySelector('[name="weight"]');
      const heightFeetInput = profileForm.querySelector('[name="heightFeet"]');
      const heightInchesInput = profileForm.querySelector('[name="heightInches"]');
      const conditionsInput = profileForm.querySelector('[name="medicalConditions"]');

      if (nameInput) nameInput.value = this.userProfile.name || '';
      if (ageInput) ageInput.value = this.userProfile.age || '';
      if (weightInput) weightInput.value = this.userProfile.weight || '';
      
      // Handle height - convert from stored format to feet and inches
      if (this.userProfile.height) {
        const heightInInches = this.userProfile.height;
        const feet = Math.floor(heightInInches / 12);
        const inches = heightInInches % 12;
        
        if (heightFeetInput) heightFeetInput.value = feet;
        if (heightInchesInput) heightInchesInput.value = inches;
      } else {
        if (heightFeetInput) heightFeetInput.value = '';
        if (heightInchesInput) heightInchesInput.value = '';
      }
      
      if (conditionsInput) conditionsInput.value = this.userProfile.medicalConditions || '';
    }

    // Populate emergency contact form
    const emergencyForm = document.getElementById('emergencyForm');
    if (emergencyForm && this.userProfile.emergencyContact) {
      const emergencyNameInput = emergencyForm.querySelector('[name="emergencyName"]');
      const emergencyPhoneInput = emergencyForm.querySelector('[name="emergencyPhone"]');
      const emergencyRelationshipInput = emergencyForm.querySelector('[name="emergencyRelationship"]');

      if (emergencyNameInput) emergencyNameInput.value = this.userProfile.emergencyContact.name || '';
      if (emergencyPhoneInput) emergencyPhoneInput.value = this.userProfile.emergencyContact.phone || '';
      if (emergencyRelationshipInput) emergencyRelationshipInput.value = this.userProfile.emergencyContact.relationship || '';
    }

    // Populate settings
    const enableNotifications = document.getElementById('enableNotifications');
    const reminderTime = document.getElementById('reminderTime');

    if (enableNotifications && this.userProfile.notificationSettings) {
      enableNotifications.checked = this.userProfile.notificationSettings.enabled !== false;
    }

    if (reminderTime && this.userProfile.notificationSettings) {
      reminderTime.value = this.userProfile.notificationSettings.reminderTime || '08:00';
    }
  }

  updateProfileDisplay() {
    if (!this.userProfile) return;

    // Update profile display elements
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAge = document.getElementById('profileAge');

    if (profileName) profileName.textContent = this.userProfile.name || 'Not set';
    if (profileEmail) profileEmail.textContent = this.userProfile.email || 'Not set';
    if (profileAge) profileAge.textContent = this.userProfile.age ? `${this.userProfile.age} years` : 'Not set';
  }

  async updateProfile(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to update your profile', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    // Convert feet and inches to total inches for storage
    const heightFeet = parseInt(formData.get('heightFeet')) || 0;
    const heightInches = parseInt(formData.get('heightInches')) || 0;
    const totalHeightInches = (heightFeet * 12) + heightInches;
    
    const profileData = {
      name: formData.get('name'),
      age: formData.get('age') ? parseInt(formData.get('age')) : null,
      weight: formData.get('weight') ? parseFloat(formData.get('weight')) : null,
      height: totalHeightInches > 0 ? totalHeightInches : null, // Store as total inches
      heightFeet: heightFeet > 0 ? heightFeet : null, // Also store feet for convenience
      heightInches: heightInches > 0 ? heightInches : null, // Also store inches for convenience
      medicalConditions: formData.get('medicalConditions'),
      updatedAt: new Date()
    };

    if (!this.db) {
      this.showToast('Database not available. Please check your connection.', 'error');
      return;
    }

    try {
      this.showLoading('Updating profile...');
      // Use set with merge to create or update the document
      await this.db.collection('users').doc(this.currentUser.uid).set(profileData, { merge: true });
      this.showToast('Profile updated successfully!', 'success');
      this.loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showToast('Error updating profile', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async updateEmergencyContact(e) {
    e.preventDefault();
    
    // Check if user is authenticated
    if (!this.currentUser || !this.currentUser.uid) {
      this.showToast('Please sign in to update emergency contact', 'error');
      return;
    }
    
    const formData = new FormData(e.target);
    
    const emergencyData = {
      emergencyContact: {
        name: formData.get('emergencyName'),
        phone: formData.get('emergencyPhone'),
        relationship: formData.get('emergencyRelationship')
      },
      updatedAt: new Date()
    };

    if (!this.db) {
      this.showToast('Database not available. Please check your connection.', 'error');
      return;
    }

    try {
      this.showLoading('Updating emergency contact...');
      // Use set with merge to create or update the document
      await this.db.collection('users').doc(this.currentUser.uid).set(emergencyData, { merge: true });
      this.showToast('Emergency contact updated successfully!', 'success');
      this.loadProfile(); // Reload to get updated data
    } catch (error) {
      console.error('Error updating emergency contact:', error);
      this.showToast('Error updating emergency contact', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async updateNotificationSettings(e) {
    const enabled = e.target.checked;
    
    try {
      await this.db.collection('users').doc(this.currentUser.uid).set({
        'notificationSettings.enabled': enabled,
        updatedAt: new Date()
      }, { merge: true });
      this.showToast(`Notifications ${enabled ? 'enabled' : 'disabled'}`, 'success');
    } catch (error) {
      console.error('Error updating notification settings:', error);
      this.showToast('Error updating notification settings', 'error');
    }
  }

  async updateReminderTime(e) {
    const time = e.target.value;
    
    try {
      await this.db.collection('users').doc(this.currentUser.uid).set({
        'notificationSettings.reminderTime': time,
        updatedAt: new Date()
      }, { merge: true });
      this.showToast('Reminder time updated', 'success');
    } catch (error) {
      console.error('Error updating reminder time:', error);
      this.showToast('Error updating reminder time', 'error');
    }
  }

  async exportData() {
    if (window.exportManager) {
      window.exportManager.exportAllData();
    } else {
      this.showToast('Export functionality not available', 'error');
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

// Initialize profile manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.profileManager = new ProfileManager();
}); 
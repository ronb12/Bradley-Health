// Bradley Health Shared Utilities

// Dark Mode Management
const darkMode = {
  init() {
    const toggle = document.getElementById('darkToggle');
    if (localStorage.getItem('darkMode') === 'true') {
      document.body.classList.add('dark');
      if (toggle) toggle.checked = true;
    }
    if (toggle) {
      toggle.addEventListener('change', () => {
        document.body.classList.toggle('dark', toggle.checked);
        localStorage.setItem('darkMode', toggle.checked);
      });
    }
  }
};

// Toast Notifications
const toast = {
  show(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
  }
};

// Loading Spinner
const loading = {
  show(element) {
    const spinner = document.createElement('div');
    spinner.className = 'loading';
    element.appendChild(spinner);
    return spinner;
  },
  hide(spinner) {
    if (spinner) spinner.remove();
  }
};

// Modal Management
const modal = {
  show(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
    }
  },
  hide(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }
  }
};

// Form Validation
const validation = {
  required(value) {
    return value.trim() !== '';
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  number(value) {
    return !isNaN(value) && value !== '';
  }
};

// Firebase Helpers
const firebaseHelpers = {
  async saveUserProfile(userId, data) {
    try {
      await db.collection('users').doc(userId).set(data, { merge: true });
      toast.show('Profile updated successfully');
      return true;
    } catch (error) {
      toast.show(error.message, 'error');
      return false;
    }
  },
  
  async getUserProfile(userId) {
    try {
      const doc = await db.collection('users').doc(userId).get();
      return doc.exists ? doc.data() : null;
    } catch (error) {
      toast.show(error.message, 'error');
      return null;
    }
  }
};

// Initialize all shared functionality
document.addEventListener('DOMContentLoaded', () => {
  darkMode.init();
}); 
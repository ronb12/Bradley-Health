// Authentication System for Bradley Health
class AuthManager {
  constructor() {
    this.auth = firebase.auth();
    this.db = firebase.firestore();
    this.currentUser = null;
    this.init();
  }

  init() {
    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUI(user);
      if (user) {
        this.loadUserProfile(user.uid);
      }
    });

    // Setup auth event listeners
    this.setupAuthListeners();
  }

  setupAuthListeners() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Registration form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => this.handleRegister(e));
    }

    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => this.logout());
    }

    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => this.updateProfile(e));
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    try {
      this.showLoading('Logging in...');
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.showToast('Login successful! Welcome back!', 'success');
      this.redirectToDashboard();
    } catch (error) {
      this.showToast(this.getErrorMessage(error), 'error');
    } finally {
      this.hideLoading();
    }
  }

  async handleRegister(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    const name = formData.get('name');

    if (password !== confirmPassword) {
      this.showToast('Passwords do not match', 'error');
      return;
    }

    if (password.length < 6) {
      this.showToast('Password must be at least 6 characters long', 'error');
      return;
    }

    try {
      this.showLoading('Creating account...');
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      
      // Create user profile
      await this.createUserProfile(userCredential.user.uid, {
        name,
        email,
        createdAt: new Date(),
        preferences: {
          theme: 'light',
          notifications: true,
          units: 'metric'
        }
      });

      this.showToast('Account created successfully! Welcome to Bradley Health!', 'success');
      this.redirectToDashboard();
    } catch (error) {
      this.showToast(this.getErrorMessage(error), 'error');
    } finally {
      this.hideLoading();
    }
  }

  async createUserProfile(uid, profileData) {
    try {
      await this.db.collection('users').doc(uid).set(profileData);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  async loadUserProfile(uid) {
    try {
      const doc = await this.db.collection('users').doc(uid).get();
      if (doc.exists) {
        const profile = doc.data();
        this.updateProfileUI(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
    return null;
  }

  async updateProfile(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const profileData = {
      name: formData.get('name'),
      age: parseInt(formData.get('age')),
      weight: parseFloat(formData.get('weight')),
      height: parseFloat(formData.get('height')),
      emergencyContact: {
        name: formData.get('emergencyName'),
        phone: formData.get('emergencyPhone'),
        relationship: formData.get('emergencyRelationship')
      },
      medicalConditions: formData.get('medicalConditions'),
      medications: formData.get('medications'),
      updatedAt: new Date()
    };

    try {
      this.showLoading('Updating profile...');
      await this.db.collection('users').doc(this.currentUser.uid).update(profileData);
      this.showToast('Profile updated successfully!', 'success');
    } catch (error) {
      this.showToast('Error updating profile', 'error');
    } finally {
      this.hideLoading();
    }
  }

  async logout() {
    try {
      await this.auth.signOut();
      this.showToast('Logged out successfully', 'success');
      this.redirectToLogin();
    } catch (error) {
      this.showToast('Error logging out', 'error');
    }
  }

  updateUI(user) {
    const authSection = document.getElementById('authSection');
    const userSection = document.getElementById('userSection');
    const userInfo = document.getElementById('userInfo');

    if (user) {
      // User is logged in
      if (authSection) authSection.style.display = 'none';
      if (userSection) userSection.style.display = 'block';
      if (userInfo) {
        userInfo.innerHTML = `
          <span>Welcome, ${user.displayName || user.email}</span>
          <button id="logoutBtn" class="btn btn-secondary">Logout</button>
        `;
        // Re-attach logout button event
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => this.logout());
        }
      }
    } else {
      // User is logged out
      if (authSection) authSection.style.display = 'block';
      if (userSection) userSection.style.display = 'none';
      if (userInfo) userInfo.innerHTML = '';
    }
  }

  updateProfileUI(profile) {
    // Update profile display elements
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const profileAge = document.getElementById('profileAge');

    if (profileName) profileName.textContent = profile.name || 'Not set';
    if (profileEmail) profileEmail.textContent = profile.email || 'Not set';
    if (profileAge) profileAge.textContent = profile.age ? `${profile.age} years` : 'Not set';
  }

  redirectToDashboard() {
    window.location.href = '/index.html';
  }

  redirectToLogin() {
    window.location.href = '/index.html';
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

  getErrorMessage(error) {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email address';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/email-already-in-use':
        return 'An account with this email already exists';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/too-many-requests':
        return 'Too many failed attempts. Please try again later';
      case 'auth/network-request-failed':
        return 'Network error. Please check your connection';
      default:
        return error.message || 'An error occurred. Please try again';
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!this.currentUser;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Get user ID
  getUserId() {
    return this.currentUser ? this.currentUser.uid : null;
  }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
  
  // Show demo credentials info
  setTimeout(() => {
    if (window.authManager) {
      window.authManager.showToast('Demo Mode: Use demo@bradleyhealth.com / demo123 to login', 'info');
    }
  }, 2000);
}); 
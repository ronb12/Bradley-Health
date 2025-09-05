// Authentication System for Bradley Health
class AuthManager {
  constructor() {
    // Check if Firebase services are available
    if (window.firebaseServices && window.firebaseServices.auth && window.firebaseServices.db) {
      this.auth = window.firebaseServices.auth;
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.init();
    } else {
      console.error('Firebase services not available - authentication disabled');
      this.auth = null;
      this.db = null;
      this.currentUser = null;
    }
  }

  init() {
    // Check if auth is available
    if (!this.auth) {
      console.error('Authentication not available');
      return;
    }

    // Listen for auth state changes
    this.auth.onAuthStateChanged((user) => {
      this.currentUser = user;
      this.updateUI(user);
      if (user) {
        console.log('User authenticated, loading profile and dashboard data...');
        // Add a small delay to ensure Firebase is fully ready
        setTimeout(() => {
          this.loadUserProfile(user.uid);
          // Trigger dashboard data loading only once
          if (window.dashboardManager && !window.dashboardManager.dataLoaded) {
            window.dashboardManager.loadDashboardData();
            window.dashboardManager.dataLoaded = true;
          }
        }, 1000);
      } else {
        console.log('User signed out, resetting dashboard state');
        // Reset dashboard state when user signs out
        if (window.dashboardManager) {
          window.dashboardManager.dataLoaded = false;
          window.dashboardManager.authRetryCount = 0;
          window.dashboardManager.tabRetryCount = 0;
        }
      }
    }, (error) => {
      console.log('Auth state change error (non-critical):', error.message);
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


  }

  async handleLogin(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const email = formData.get('email');
    const password = formData.get('password');

    // Check if Firebase auth is available
    if (!this.auth) {
      this.showToast('Authentication service not available. Please check your connection.', 'error');
      return;
    }

    try {
      this.showLoading('Logging in...');
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      this.showToast('Login successful! Welcome back!', 'success');
      this.redirectToDashboard();
    } catch (error) {
      console.log('Login error:', error.message);
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

    // Check if Firebase auth is available
    if (!this.auth) {
      this.showToast('Authentication service not available. Please check your connection.', 'error');
      return;
    }

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
    if (!this.db) {
      console.error('Firestore not available');
      return;
    }
    
    try {
      await this.db.collection('users').doc(uid).set(profileData);
    } catch (error) {
      console.error('Error creating user profile:', error);
    }
  }

  async loadUserProfile(uid) {
    if (!this.db) {
      console.error('Firestore not available');
      return null;
    }
    
    try {
      // Check if we're online
      if (!navigator.onLine) {
        console.log('Offline - using cached profile data');
        // Try to get from cache first
        const doc = await this.db.collection('users').doc(uid).get({ source: 'cache' });
        if (doc.exists) {
          const profile = doc.data();
          this.updateProfileUI(profile);
          return profile;
        }
        return null;
      }

      // Online - try to get from server with fallback to cache
      const doc = await this.db.collection('users').doc(uid).get({ source: 'default' });
      if (doc.exists) {
        const profile = doc.data();
        this.updateProfileUI(profile);
        return profile;
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      
      // If server request failed, try cache
      if (error.code === 'unavailable' || error.message.includes('offline')) {
        try {
          console.log('Trying to load profile from cache...');
          const doc = await this.db.collection('users').doc(uid).get({ source: 'cache' });
          if (doc.exists) {
            const profile = doc.data();
            this.updateProfileUI(profile);
            return profile;
          }
        } catch (cacheError) {
          console.log('Cache also failed:', cacheError.message);
        }
      }
    }
    return null;
  }



  async logout() {
    if (!this.auth) {
      this.showToast('Authentication not available', 'error');
      return;
    }
    
    try {
      await this.auth.signOut();
      this.showToast('Logged out successfully', 'success');
      this.redirectToLogin();
    } catch (error) {
      this.showToast('Error logging out', 'error');
    }
  }

  requestNotificationPermission() {
    if (window.notificationManager) {
      window.notificationManager.requestPermissionFromUserGesture();
    } else {
      console.log('Notification manager not available');
      this.showToast('Notification system not available', 'error');
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
          <button id="notificationBtn" class="btn btn-outline" title="Enable notifications">
            <i class="fas fa-bell"></i>
          </button>
          <button id="logoutBtn" class="btn btn-secondary">Logout</button>
        `;
        // Re-attach logout button event
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
          logoutBtn.addEventListener('click', () => this.logout());
        }
        // Add notification button event
        const notificationBtn = document.getElementById('notificationBtn');
        if (notificationBtn) {
          notificationBtn.addEventListener('click', () => this.requestNotificationPermission());
        }
      }
      
      // Show welcome message
      this.showToast(`Welcome back, ${user.displayName || user.email}!`, 'success');
    } else {
      // User is logged out
      if (authSection) authSection.style.display = 'block';
      if (userSection) userSection.style.display = 'none';
      if (userInfo) userInfo.innerHTML = '';
      
      // Show sign-in prompt
      this.showToast('Please sign in to access your health dashboard', 'info');
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
    // Use relative path for GitHub Pages compatibility
    window.location.href = './';
  }

  redirectToLogin() {
    // Use relative path for GitHub Pages compatibility
    window.location.href = './';
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
}); 
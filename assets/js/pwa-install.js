// PWA Installation Handler
class PWAInstallManager {
  constructor() {
    this.deferredPrompt = null;
    this.installPrompt = document.getElementById('pwaInstallPrompt');
    this.installBtn = document.getElementById('pwaInstallBtn');
    this.dismissBtn = document.getElementById('pwaDismissBtn');
    
    this.init();
  }

  init() {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      console.log('PWA: beforeinstallprompt event fired');
      e.preventDefault();
      this.deferredPrompt = e;
      // Don't show immediately - wait for user to be logged in
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', (e) => {
      console.log('PWA: App was installed');
      this.hideInstallPrompt();
      this.showToast('Bradley Health has been installed successfully!', 'success');
    });

    // Listen for auth state changes
    this.setupAuthListener();

    // Handle install button click
    if (this.installBtn) {
      this.installBtn.addEventListener('click', () => {
        this.installPWA();
      });
    }

    // Handle dismiss button click
    if (this.dismissBtn) {
      this.dismissBtn.addEventListener('click', () => {
        this.hideInstallPrompt();
        this.setDismissed();
      });
    }

    // Check if app is already installed
    this.checkIfInstalled();
  }

  showInstallPrompt() {
    // Don't show if user has dismissed it recently
    if (this.isDismissed()) {
      return;
    }

    // Don't show if app is already installed
    if (this.isStandalone()) {
      return;
    }

    // Don't show if user is not logged in
    if (!this.isUserLoggedIn()) {
      return;
    }

    if (this.installPrompt) {
      this.installPrompt.style.display = 'block';
    }
  }

  hideInstallPrompt() {
    if (this.installPrompt) {
      this.installPrompt.style.display = 'none';
    }
  }

  async installPWA() {
    if (!this.deferredPrompt) {
      console.log('PWA: No deferred prompt available');
      return;
    }

    try {
      // Show the install prompt
      this.deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await this.deferredPrompt.userChoice;
      
      console.log(`PWA: User response to install prompt: ${outcome}`);
      
      if (outcome === 'accepted') {
        this.showToast('Installing Bradley Health...', 'success');
      } else {
        this.showToast('Installation cancelled', 'warning');
        this.setDismissed();
      }
      
      // Clear the deferred prompt
      this.deferredPrompt = null;
      this.hideInstallPrompt();
      
    } catch (error) {
      console.error('PWA: Error during installation:', error);
      this.showToast('Installation failed. Please try again.', 'error');
    }
  }

  isStandalone() {
    return window.matchMedia('(display-mode: standalone)').matches ||
           window.navigator.standalone === true;
  }

  checkIfInstalled() {
    if (this.isStandalone()) {
      console.log('PWA: App is running in standalone mode (installed)');
      this.hideInstallPrompt();
    }
  }

  isDismissed() {
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (!dismissed) return false;
    
    const dismissTime = parseInt(dismissed);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000; // 24 hours
    
    return (now - dismissTime) < oneDay;
  }

  setDismissed() {
    localStorage.setItem('pwa-install-dismissed', Date.now().toString());
  }

  showToast(message, type = 'info') {
    // Use existing toast system if available
    if (window.showToast) {
      window.showToast(message, type);
    } else {
      console.log(`Toast: ${message}`);
    }
  }

  // Check if user is logged in
  isUserLoggedIn() {
    // Check if auth manager exists and user is logged in
    if (window.authManager && window.authManager.currentUser) {
      return true;
    }
    
    // Fallback: check Firebase auth directly
    if (window.firebaseServices && window.firebaseServices.auth) {
      return window.firebaseServices.auth.currentUser !== null;
    }
    
    return false;
  }

  // Setup auth state listener
  setupAuthListener() {
    // Listen for auth state changes
    if (window.firebaseServices && window.firebaseServices.auth) {
      window.firebaseServices.auth.onAuthStateChanged((user) => {
        if (user && this.deferredPrompt) {
          // User just logged in and we have a deferred prompt
          console.log('PWA: User logged in, showing install prompt');
          setTimeout(() => {
            this.showInstallPrompt();
          }, 2000); // Wait 2 seconds after login
        } else if (!user) {
          // User logged out, hide install prompt
          this.hideInstallPrompt();
        }
      });
    }
  }

  // Manual trigger for testing
  triggerInstallPrompt() {
    if (this.deferredPrompt) {
      this.showInstallPrompt();
    } else {
      console.log('PWA: No install prompt available');
    }
  }
}

// Initialize PWA installation manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwaInstallManager = new PWAInstallManager();
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PWAInstallManager;
} 
// PWA Update Manager for Bradley Health
class PWAUpdateManager {
  constructor() {
    this.registration = null;
    this.updateAvailable = false;
    this.updateNotification = null;
    this.init();
  }

  async init() {
    if (!('serviceWorker' in navigator)) {
      console.log('PWA Update: Service Worker not supported');
      return;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('./service-worker.js');
      console.log('PWA Update: Service Worker registered', this.registration);

      // Check for updates immediately
      await this.checkForUpdates();

      // Listen for service worker updates
      this.registration.addEventListener('updatefound', () => {
        console.log('PWA Update: New service worker found');
        this.handleUpdateFound();
      });

      // Listen for service worker controller changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('PWA Update: Service worker controller changed');
        window.location.reload();
      });

      // Check for updates every 30 minutes
      setInterval(() => {
        this.checkForUpdates();
      }, 30 * 60 * 1000);

    } catch (error) {
      console.error('PWA Update: Service Worker registration failed', error);
    }
  }

  async checkForUpdates() {
    if (!this.registration) return;

    try {
      console.log('PWA Update: Checking for updates...');
      await this.registration.update();
    } catch (error) {
      console.error('PWA Update: Error checking for updates', error);
    }
  }

  handleUpdateFound() {
    const newWorker = this.registration.installing;
    if (!newWorker) return;

    newWorker.addEventListener('statechange', () => {
      if (newWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New content is available
          console.log('PWA Update: New content available');
          this.updateAvailable = true;
          this.showUpdateNotification();
        } else {
          // Content is cached for the first time
          console.log('PWA Update: Content cached for the first time');
        }
      }
    });
  }

  showUpdateNotification() {
    // Remove existing notification if any
    this.hideUpdateNotification();

    // Create update notification
    this.updateNotification = document.createElement('div');
    this.updateNotification.id = 'pwaUpdateNotification';
    this.updateNotification.innerHTML = `
      <div class="update-notification">
        <div class="update-content">
          <div class="update-icon">🔄</div>
          <div class="update-text">
            <div class="update-title">Update Available</div>
            <div class="update-message">A new version of Bradley Health is ready to install</div>
          </div>
        </div>
        <div class="update-actions">
          <button id="updateInstallBtn" class="btn btn-primary">Install Update</button>
          <button id="updateDismissBtn" class="btn btn-secondary">Later</button>
        </div>
      </div>
    `;

    // Add styles
    this.updateNotification.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      color: white;
      padding: 16px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      z-index: 10000;
      transform: translateY(-100%);
      transition: transform 0.3s ease;
    `;

    // Add notification styles
    const style = document.createElement('style');
    style.textContent = `
      .update-notification {
        max-width: 600px;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
      }
      
      .update-content {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
      }
      
      .update-icon {
        font-size: 24px;
        animation: spin 2s linear infinite;
      }
      
      .update-text {
        flex: 1;
      }
      
      .update-title {
        font-weight: bold;
        font-size: 16px;
        margin-bottom: 4px;
      }
      
      .update-message {
        font-size: 14px;
        opacity: 0.9;
      }
      
      .update-actions {
        display: flex;
        gap: 8px;
        flex-shrink: 0;
      }
      
      .update-actions .btn {
        padding: 8px 16px;
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }
      
      .update-actions .btn-primary {
        background: #22c55e;
        color: white;
      }
      
      .update-actions .btn-primary:hover {
        background: #16a34a;
        transform: translateY(-1px);
      }
      
      .update-actions .btn-secondary {
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 1px solid rgba(255, 255, 255, 0.3);
      }
      
      .update-actions .btn-secondary:hover {
        background: rgba(255, 255, 255, 0.3);
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      @media (max-width: 768px) {
        .update-notification {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
        }
        
        .update-actions {
          justify-content: center;
        }
        
        .update-actions .btn {
          flex: 1;
          max-width: 120px;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.updateNotification);

    // Animate in
    setTimeout(() => {
      this.updateNotification.style.transform = 'translateY(0)';
    }, 100);

    // Add event listeners
    document.getElementById('updateInstallBtn').addEventListener('click', () => {
      this.installUpdate();
    });

    document.getElementById('updateDismissBtn').addEventListener('click', () => {
      this.hideUpdateNotification();
    });

    // Auto-hide after 30 seconds if not interacted with
    setTimeout(() => {
      if (this.updateNotification && this.updateNotification.parentNode) {
        this.hideUpdateNotification();
      }
    }, 30000);
  }

  hideUpdateNotification() {
    if (this.updateNotification && this.updateNotification.parentNode) {
      this.updateNotification.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        if (this.updateNotification && this.updateNotification.parentNode) {
          this.updateNotification.parentNode.removeChild(this.updateNotification);
        }
        this.updateNotification = null;
      }, 300);
    }
  }

  async installUpdate() {
    if (!this.registration || !this.registration.waiting) {
      console.log('PWA Update: No update available to install');
      return;
    }

    try {
      console.log('PWA Update: Installing update...');
      
      // Show installing state
      const installBtn = document.getElementById('updateInstallBtn');
      if (installBtn) {
        installBtn.textContent = 'Installing...';
        installBtn.disabled = true;
      }

      // Tell the waiting service worker to skip waiting
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // The controllerchange event will handle the reload
      // But we'll also set a timeout as backup
      setTimeout(() => {
        window.location.reload();
      }, 1000);

    } catch (error) {
      console.error('PWA Update: Error installing update', error);
      
      // Reset button state
      const installBtn = document.getElementById('updateInstallBtn');
      if (installBtn) {
        installBtn.textContent = 'Install Update';
        installBtn.disabled = false;
      }
    }
  }

  // Force check for updates (can be called manually)
  async forceCheckForUpdates() {
    console.log('PWA Update: Force checking for updates...');
    await this.checkForUpdates();
  }

  // Get current version info
  getVersionInfo() {
    if (!this.registration) return null;
    
    return {
      scope: this.registration.scope,
      updateViaCache: this.registration.updateViaCache,
      waiting: !!this.registration.waiting,
      installing: !!this.registration.installing,
      active: !!this.registration.active
    };
  }
}

// Initialize PWA Update Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.pwaUpdateManager = new PWAUpdateManager();
});

// Export for global access
window.PWAUpdateManager = PWAUpdateManager;

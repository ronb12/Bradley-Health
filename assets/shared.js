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

// Enhanced Form Validation
const validation = {
  required(value) {
    return value && value.trim() !== '';
  },
  email(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  },
  number(value) {
    return !isNaN(value) && value !== '';
  },
  phone(value) {
    return /^\+?[\d\s-]{10,}$/.test(value);
  },
  sanitizeInput(value) {
    return value.replace(/[<>]/g, '');
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

// Loading State Component
function showLoading(element) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading-overlay';
    loadingDiv.innerHTML = `
        <div class="loading-spinner"></div>
        <p>Loading...</p>
    `;
    element.appendChild(loadingDiv);
}

function hideLoading(element) {
    const loadingDiv = element.querySelector('.loading-overlay');
    if (loadingDiv) {
        loadingDiv.remove();
    }
}

// Enhanced Error Handling
function showError(message, element) {
    const sanitizedMessage = validation.sanitizeInput(message);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    errorDiv.innerHTML = `
        <p>⚠️ ${sanitizedMessage}</p>
        <button onclick="this.parentElement.remove()" aria-label="Dismiss error message">Dismiss</button>
    `;
    element.appendChild(errorDiv);
}

// Offline Detection
function checkOnlineStatus() {
    if (!navigator.onLine) {
        showError('You are currently offline. Some features may be limited.', document.body);
    }
}

window.addEventListener('online', () => {
    const errorDiv = document.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
});

window.addEventListener('offline', () => {
    showError('You are currently offline. Some features may be limited.', document.body);
});

// Enhanced Health Data Validation
function validateHealthData(data) {
    const errors = [];
    
    if (data.bloodPressure) {
        if (data.bloodPressure.systolic < 70 || data.bloodPressure.systolic > 250) {
            errors.push('Systolic blood pressure must be between 70 and 250');
        }
        if (data.bloodPressure.diastolic < 40 || data.bloodPressure.diastolic > 150) {
            errors.push('Diastolic blood pressure must be between 40 and 150');
        }
        if (data.bloodPressure.systolic <= data.bloodPressure.diastolic) {
            errors.push('Systolic pressure must be higher than diastolic pressure');
        }
    }
    
    if (data.weight && (data.weight < 20 || data.weight > 500)) {
        errors.push('Weight must be between 20 and 500 pounds');
    }
    
    if (data.height && (data.height < 30 || data.height > 300)) {
        errors.push('Height must be between 30 and 300 centimeters');
    }
    
    if (data.emergencyContact) {
        if (!validation.phone(data.emergencyContact.phone)) {
            errors.push('Please enter a valid emergency contact phone number');
        }
    }
    
    return errors;
}

// Data Backup
async function backupUserData(userId) {
    try {
        showLoading(document.body);
        const db = firebase.firestore();
        const userData = await db.collection('users').doc(userId).get();
        const healthData = await db.collection('users').doc(userId)
            .collection('healthData').get();
        
        const backup = {
            userData: userData.data(),
            healthData: healthData.docs.map(doc => doc.data()),
            timestamp: new Date().toISOString()
        };
        
        // Store backup in IndexedDB
        const dbName = 'BradleyHealthBackup';
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
            showError('Failed to create backup', document.body);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('backups')) {
                db.createObjectStore('backups', { keyPath: 'timestamp' });
            }
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            store.add(backup);
            
            transaction.oncomplete = () => {
                hideLoading(document.body);
                showError('Backup created successfully', document.body);
            };
            
            transaction.onerror = () => {
                hideLoading(document.body);
                showError('Failed to create backup', document.body);
            };
        };
    } catch (error) {
        console.error('Backup error:', error);
        hideLoading(document.body);
        showError('Failed to create backup', document.body);
    }
}

// Data Restore
async function restoreUserData(userId) {
    try {
        showLoading(document.body);
        const dbName = 'BradleyHealthBackup';
        const request = indexedDB.open(dbName, 1);
        
        request.onerror = (event) => {
            console.error('Error opening IndexedDB:', event);
            showError('Failed to restore backup', document.body);
        };
        
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(['backups'], 'readonly');
            const store = transaction.objectStore('backups');
            const getAllRequest = store.getAll();
            
            getAllRequest.onsuccess = async () => {
                const backups = getAllRequest.result;
                if (backups.length === 0) {
                    hideLoading(document.body);
                    showError('No backups found', document.body);
                    return;
                }
                
                // Get the most recent backup
                const latestBackup = backups.sort((a, b) => 
                    new Date(b.timestamp) - new Date(a.timestamp)
                )[0];
                
                const db = firebase.firestore();
                
                // Restore user data
                await db.collection('users').doc(userId)
                    .set(latestBackup.userData);
                
                // Restore health data
                const batch = db.batch();
                latestBackup.healthData.forEach(data => {
                    const docRef = db.collection('users').doc(userId)
                        .collection('healthData').doc();
                    batch.set(docRef, data);
                });
                await batch.commit();
                
                hideLoading(document.body);
                showError('Backup restored successfully', document.body);
            };
            
            getAllRequest.onerror = () => {
                hideLoading(document.body);
                showError('Failed to restore backup', document.body);
            };
        };
    } catch (error) {
        console.error('Restore error:', error);
        hideLoading(document.body);
        showError('Failed to restore backup', document.body);
    }
}

// Export functions
window.BradleyHealth = {
    showLoading,
    hideLoading,
    showError,
    validateHealthData,
    backupUserData,
    restoreUserData
};

// iOS-specific functionality
const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;

if (isIOS) {
    // Prevent double-tap zoom
    document.addEventListener('touchend', function(event) {
        event.preventDefault();
        event.target.click();
    }, { passive: false });
    
    // Handle keyboard events
    document.addEventListener('focusin', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            setTimeout(() => {
                event.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        }
    });
    
    // Handle orientation changes
    window.addEventListener('orientationchange', function() {
        setTimeout(() => {
            window.scrollTo(0, 0);
        }, 100);
    });
    
    // Add to home screen prompt
    let deferredPrompt;
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        showError('Add Bradley Health to your home screen for a better experience!', document.body);
    });
    
    // Handle app launch from home screen
    if (window.navigator.standalone) {
        document.documentElement.classList.add('standalone');
    }
}

// PWA Features
class PWAFeatures {
    constructor() {
        this.deferredPrompt = null;
        this.isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        this.init();
    }

    init() {
        // Handle install prompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallPrompt();
        });

        // Handle app launch
        window.addEventListener('appinstalled', () => {
            this.showMessage('App installed successfully!');
        });

        // Handle offline/online status
        window.addEventListener('online', this.handleOnlineStatus.bind(this));
        window.addEventListener('offline', this.handleOfflineStatus.bind(this));

        // Handle service worker updates
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.addEventListener('controllerchange', () => {
                this.showMessage('New version available! Refresh to update.');
            });
        }
    }

    showInstallPrompt() {
        if (this.deferredPrompt && !this.isStandalone) {
            const installButton = document.createElement('button');
            installButton.className = 'install-prompt';
            installButton.innerHTML = `
                <span class="emoji">📱</span>
                <span>Install Bradley Health</span>
            `;
            installButton.onclick = this.installApp.bind(this);
            document.body.appendChild(installButton);
        }
    }

    async installApp() {
        if (this.deferredPrompt) {
            this.deferredPrompt.prompt();
            const { outcome } = await this.deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                this.showMessage('Thank you for installing!');
            }
            this.deferredPrompt = null;
        }
    }

    handleOnlineStatus() {
        this.showMessage('You are back online!');
        this.syncData();
    }

    handleOfflineStatus() {
        this.showMessage('You are offline. Some features may be limited.');
    }

    async syncData() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            try {
                await navigator.serviceWorker.controller.postMessage({
                    type: 'SYNC_DATA'
                });
            } catch (error) {
                console.error('Sync failed:', error);
            }
        }
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'pwa-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Accessibility Features
class AccessibilityFeatures {
    constructor() {
        this.init();
    }

    init() {
        // Handle reduced motion
        this.handleReducedMotion();
        
        // Handle high contrast
        this.handleHighContrast();
        
        // Handle font size
        this.handleFontSize();
        
        // Handle keyboard navigation
        this.handleKeyboardNavigation();
    }

    handleReducedMotion() {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
            document.documentElement.classList.add('reduced-motion');
        }
    }

    handleHighContrast() {
        const prefersHighContrast = window.matchMedia('(forced-colors: active)').matches;
        if (prefersHighContrast) {
            document.documentElement.classList.add('high-contrast');
        }
    }

    handleFontSize() {
        const fontSize = localStorage.getItem('fontSize') || 'medium';
        document.documentElement.setAttribute('data-font-size', fontSize);
    }

    handleKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                document.documentElement.classList.add('keyboard-navigation');
            }
        });

        document.addEventListener('mousedown', () => {
            document.documentElement.classList.remove('keyboard-navigation');
        });
    }
}

// Data Management
class DataManagement {
    constructor() {
        this.dbName = 'BradleyHealthDB';
        this.init();
    }

    async init() {
        await this.openDB();
        this.setupAutoBackup();
    }

    async openDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, 1);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('healthData')) {
                    db.createObjectStore('healthData', { keyPath: 'id', autoIncrement: true });
                }
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    setupAutoBackup() {
        // Backup data every 24 hours
        setInterval(() => this.backupData(), 24 * 60 * 60 * 1000);
    }

    async backupData() {
        try {
            const db = await this.openDB();
            const healthData = await this.getAllHealthData(db);
            const settings = await this.getAllSettings(db);
            
            const backup = {
                healthData,
                settings,
                timestamp: new Date().toISOString()
            };
            
            // Store backup in IndexedDB
            const transaction = db.transaction(['backups'], 'readwrite');
            const store = transaction.objectStore('backups');
            await store.add(backup);
            
            // Also store in Firebase if online
            if (navigator.onLine) {
                const user = firebase.auth().currentUser;
                if (user) {
                    await firebase.firestore()
                        .collection('users')
                        .doc(user.uid)
                        .collection('backups')
                        .add(backup);
                }
            }
        } catch (error) {
            console.error('Backup failed:', error);
        }
    }

    async getAllHealthData(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['healthData'], 'readonly');
            const store = transaction.objectStore('healthData');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAllSettings(db) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['settings'], 'readonly');
            const store = transaction.objectStore('settings');
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}

// Initialize features
const pwaFeatures = new PWAFeatures();
const accessibilityFeatures = new AccessibilityFeatures();
const dataManagement = new DataManagement();

// Export for use in other files
window.BradleyHealth = {
    ...window.BradleyHealth,
    pwaFeatures,
    accessibilityFeatures,
    dataManagement
};

// Share Functionality
class ShareFeatures {
    constructor() {
        this.shareButtons = [];
    }

    init() {
        this.addShareButtons();
        this.handleShareEvents();
    }

    handleShareEvents() {
        this.shareButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-share-section]');
                if (section) {
                    await this.shareSection(section.dataset.shareSection);
                }
            });
        });
    }

    addShareButtons() {
        const sections = document.querySelectorAll('[data-share-section]');
        sections.forEach(section => {
            const button = document.createElement('button');
            button.className = 'share-button';
            button.innerHTML = '📤 Share';
            button.setAttribute('aria-label', 'Share this section');
            section.appendChild(button);
            this.shareButtons.push(button);
        });
    }

    async shareSection(section) {
        try {
            const title = section.querySelector('h2')?.textContent || 'Health Data';
            const text = this.getShareableText(section);
            const url = window.location.href;

            if (navigator.share) {
                await navigator.share({
                    title,
                    text,
                    url
                });
            } else {
                // Fallback for browsers that don't support Web Share API
                await this.copyToClipboard(`${title}\n\n${text}\n\n${url}`);
                this.showMessage('Copied to clipboard!');
            }
        } catch (error) {
            console.error('Share failed:', error);
            this.showMessage('Sharing failed. Please try again.');
        }
    }

    getShareableText(section) {
        // Extract relevant data from the section
        const data = [];
        const rows = section.querySelectorAll('tr');
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            if (cells.length > 0) {
                data.push(Array.from(cells).map(cell => cell.textContent).join(': '));
            }
        });
        return data.join('\n');
    }

    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
        } catch (error) {
            console.error('Copy failed:', error);
            throw error;
        }
    }

    showMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'share-message';
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        setTimeout(() => messageDiv.remove(), 3000);
    }
}

// Periodic Background Sync
class PeriodicSync {
    constructor() {
        this.init();
    }

    async init() {
        if ('serviceWorker' in navigator && 'periodicSync' in navigator.serviceWorker) {
            try {
                const registration = await navigator.serviceWorker.ready;
                await this.registerPeriodicSync(registration);
            } catch (error) {
                console.error('Periodic sync registration failed:', error);
            }
        }
    }

    async registerPeriodicSync(registration) {
        try {
            // Request permission for periodic sync
            const status = await navigator.permissions.query({
                name: 'periodic-background-sync'
            });

            if (status.state === 'granted') {
                // Register periodic sync
                await registration.periodicSync.register('sync-health-data', {
                    minInterval: 24 * 60 * 60 * 1000 // 24 hours
                });
            }
        } catch (error) {
            console.error('Periodic sync registration failed:', error);
        }
    }
}

// Initialize new features
const shareFeatures = new ShareFeatures();
const periodicSync = new PeriodicSync();

// Export for use in other files
window.BradleyHealth = {
    ...window.BradleyHealth,
    shareFeatures,
    periodicSync
}; 
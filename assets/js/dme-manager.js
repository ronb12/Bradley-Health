class DMEManager {
  constructor() {
    // Wait for Firebase to be ready
    if (window.firebaseServices && window.firebaseServices.db) {
      this.db = window.firebaseServices.db;
      this.currentUser = null;
      this.dmeItems = [];
      this.init();
    } else {
      // Retry after a short delay
      setTimeout(() => {
        if (window.firebaseServices && window.firebaseServices.db) {
          this.db = window.firebaseServices.db;
          this.currentUser = null;
          this.dmeItems = [];
          this.init();
        } else {
          console.error('Firebase not available for DME manager');
        }
      }, 1000);
    }
  }

  init() {
    // Wait for authentication
    const checkAuth = () => {
      if (window.authManager && window.authManager.currentUser) {
        this.currentUser = window.authManager.currentUser;
        this.setupEventListeners();
        this.loadDMEData();
      } else {
        setTimeout(checkAuth, 100);
      }
    };
    checkAuth();
  }

  setupEventListeners() {
    // Quick add DME form submission
    const quickAddDMEForm = document.getElementById('quickAddDMEForm');
    if (quickAddDMEForm) {
      quickAddDMEForm.addEventListener('submit', (e) => this.handleQuickAddDME(e));
    }

    // Setup tab switching
    document.addEventListener('DOMContentLoaded', () => {
      const dmeTab = document.querySelector('[data-tab="dme"]');
      if (dmeTab) {
        dmeTab.addEventListener('click', () => this.loadDMEData());
      }
    });
  }

  async loadDMEData() {
    if (!this.currentUser) return;

    try {
      const snapshot = await this.db.collection('durableMedicalEquipment')
        .where('userId', '==', this.currentUser.uid)
        .orderBy('dateAcquired', 'desc')
        .get();

      this.dmeItems = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dateAcquired: doc.data().dateAcquired.toDate(),
        lastMaintenance: doc.data().lastMaintenance ? doc.data().lastMaintenance.toDate() : null,
        nextMaintenance: doc.data().nextMaintenance ? doc.data().nextMaintenance.toDate() : null,
        warrantyExpiry: doc.data().warrantyExpiry ? doc.data().warrantyExpiry.toDate() : null
      }));

      this.updateDMEStats();
      this.updateDMEAlerts();
      this.updateDMEEquipmentList();
    } catch (error) {
      console.error('Error loading DME data:', error);
    }
  }

  updateDMEStats() {
    const workingCount = this.dmeItems.filter(item => item.status === 'working').length;
    const issuesCount = this.dmeItems.filter(item => 
      item.status === 'minor-issues' || item.status === 'needs-repair' || item.status === 'broken'
    ).length;
    const maintenanceCount = this.dmeItems.filter(item => {
      if (!item.nextMaintenance) return false;
      return new Date(item.nextMaintenance) <= new Date();
    }).length;

    // Update patient-friendly stats display
    const workingCountEl = document.getElementById('dme-working-count');
    const issuesCountEl = document.getElementById('dme-issues-count');
    const maintenanceCountEl = document.getElementById('dme-maintenance-count');

    if (workingCountEl) workingCountEl.textContent = `${workingCount} items`;
    if (issuesCountEl) issuesCountEl.textContent = `${issuesCount} items`;
    if (maintenanceCountEl) maintenanceCountEl.textContent = `${maintenanceCount} items`;
  }

  updateDMEAlerts() {
    const alertsContainer = document.getElementById('dme-alerts');
    if (!alertsContainer) return;

    const alerts = this.checkMaintenanceAlerts();
    
    if (alerts.length === 0) {
      alertsContainer.innerHTML = '<div class="no-alerts">No maintenance alerts at this time.</div>';
      return;
    }

    const alertsHTML = alerts.map(alert => `
      <div class="alert-item ${alert.severity}">
        <div class="alert-icon">
          ${alert.severity === 'high' ? '🔴' : alert.severity === 'medium' ? '🟡' : '🟢'}
        </div>
        <div class="alert-content">
          <div class="alert-title">${alert.item}</div>
          <div class="alert-message">${alert.message}</div>
        </div>
      </div>
    `).join('');

    alertsContainer.innerHTML = alertsHTML;
  }

  updateDMEEquipmentList() {
    const equipmentList = document.getElementById('dmeEquipmentList');
    if (!equipmentList) return;

    if (this.dmeItems.length === 0) {
      equipmentList.innerHTML = '<div class="no-equipment">No equipment added yet. Add your first piece of equipment above.</div>';
      return;
    }

    const equipmentHTML = this.dmeItems.map(item => `
      <div class="equipment-card ${item.status}">
        <div class="equipment-header">
          <div class="equipment-icon">${this.getEquipmentIcon(item.type)}</div>
          <div class="equipment-status-badge ${item.status}">
            ${this.getStatusText(item.status)}
          </div>
        </div>
        <div class="equipment-content">
          <h3>${item.name}</h3>
          <p class="equipment-type">${this.getTypeText(item.type)}</p>
          ${item.notes ? `<p class="equipment-notes">${item.notes}</p>` : ''}
          ${item.lastMaintenance ? `
            <p class="last-service">Last serviced: ${item.lastMaintenance.toLocaleDateString()}</p>
          ` : ''}
        </div>
        <div class="equipment-actions">
          <button class="btn btn-secondary" onclick="dmeManager.updateStatus('${item.id}')">
            Update Status
          </button>
          <button class="btn btn-primary" onclick="dmeManager.contactAbout('${item.id}')">
            Get Help
          </button>
        </div>
      </div>
    `).join('');

    equipmentList.innerHTML = equipmentHTML;
  }

  getEquipmentIcon(type) {
    const icons = {
      wheelchair: '🦽',
      walker: '🚶',
      crutches: '🩼',
      cane: '🦯',
      prosthetic: '🦿',
      orthotic: '🦴',
      other: '🩺'
    };
    return icons[type] || '🩺';
  }

  getStatusText(status) {
    const statusTexts = {
      'working': 'Working Well',
      'minor-issues': 'Minor Issues',
      'needs-repair': 'Needs Repair',
      'broken': 'Broken',
      'active': 'Active',
      'inactive': 'Inactive',
      'maintenance': 'In Maintenance',
      'repair': 'In Repair'
    };
    return statusTexts[status] || status;
  }

  getTypeText(type) {
    const typeTexts = {
      wheelchair: 'Wheelchair',
      walker: 'Walker',
      crutches: 'Crutches',
      cane: 'Cane',
      prosthetic: 'Prosthetic',
      orthotic: 'Brace/Orthotic',
      other: 'Other Equipment'
    };
    return typeTexts[type] || type;
  }

  checkMaintenanceAlerts() {
    const alerts = [];
    const today = new Date();

    this.dmeItems.forEach(item => {
      // Check if maintenance is overdue
      if (item.nextMaintenance && new Date(item.nextMaintenance) < today) {
        alerts.push({
          severity: 'high',
          item: item.name,
          message: `Maintenance overdue since ${item.nextMaintenance.toLocaleDateString()}`
        });
      }

      // Check if maintenance is due soon (within 30 days)
      if (item.nextMaintenance) {
        const daysUntilDue = Math.ceil((new Date(item.nextMaintenance) - today) / (1000 * 60 * 60 * 24));
        if (daysUntilDue <= 30 && daysUntilDue > 0) {
          alerts.push({
            severity: 'medium',
            item: item.name,
            message: `Maintenance due in ${daysUntilDue} days`
          });
        }
      }

      // Check warranty expiration
      if (item.warrantyExpiry && new Date(item.warrantyExpiry) < today) {
        alerts.push({
          severity: 'medium',
          item: item.name,
          message: `Warranty expired on ${item.warrantyExpiry.toLocaleDateString()}`
        });
      }
    });

    return alerts;
  }

  async handleQuickAddDME(e) {
    e.preventDefault();
    
    if (!this.currentUser) {
      alert('Please log in to add equipment');
      return;
    }

    // Check if Firebase is ready
    if (!firebase || !firebase.firestore || !window.firebaseServices || !window.firebaseServices.db) {
      alert('Firebase is not ready. Please wait a moment and try again.');
      return;
    }

    const formData = new FormData(e.target);
    
    // Create timestamp - use Firestore timestamp if available, otherwise use JavaScript Date
    let timestamp, dateAcquired;
    try {
      if (firebase && firebase.firestore && firebase.firestore.Timestamp) {
        timestamp = firebase.firestore.Timestamp.now();
        dateAcquired = firebase.firestore.Timestamp.now();
      } else {
        timestamp = new Date();
        dateAcquired = new Date();
      }
    } catch (error) {
      console.warn('Firebase timestamp not available, using JavaScript Date:', error);
      timestamp = new Date();
      dateAcquired = new Date();
    }
    
    const dmeData = {
      userId: this.currentUser.uid,
      name: formData.get('name'),
      type: formData.get('type'),
      status: formData.get('status'),
      notes: formData.get('notes') || '',
      dateAcquired: dateAcquired,
      timestamp: timestamp
    };

    // Add last maintenance date if provided
    if (formData.get('lastMaintenance')) {
      try {
        if (firebase && firebase.firestore && firebase.firestore.Timestamp) {
          dmeData.lastMaintenance = firebase.firestore.Timestamp.fromDate(new Date(formData.get('lastMaintenance')));
        } else {
          dmeData.lastMaintenance = new Date(formData.get('lastMaintenance'));
        }
      } catch (error) {
        console.warn('Error creating maintenance timestamp, using JavaScript Date:', error);
        dmeData.lastMaintenance = new Date(formData.get('lastMaintenance'));
      }
    }

    try {
      await this.db.collection('durableMedicalEquipment').add(dmeData);
      e.target.reset();
      this.loadDMEData();
      showNotification('Equipment added successfully!', 'success');
    } catch (error) {
      console.error('Error adding DME:', error);
      showNotification('Error adding equipment. Please try again.', 'error');
    }
  }

  async handleAddDME(e) {
    e.preventDefault();
    
    if (!this.currentUser) {
      alert('Please log in to add equipment');
      return;
    }

    const formData = new FormData(e.target);
    const dmeData = {
      userId: this.currentUser.uid,
      name: formData.get('name'),
      type: formData.get('type'),
      category: formData.get('category'),
      status: formData.get('status'),
      dateAcquired: firebase.firestore.Timestamp.fromDate(new Date(formData.get('dateAcquired'))),
      value: parseFloat(formData.get('value')) || 0,
      serialNumber: formData.get('serialNumber') || '',
      notes: formData.get('notes') || '',
      timestamp: (() => {
        try {
          if (firebase && firebase.firestore && firebase.firestore.Timestamp) {
            return firebase.firestore.Timestamp.now();
          } else {
            return new Date();
          }
        } catch (error) {
          console.warn('Firebase timestamp not available, using JavaScript Date:', error);
          return new Date();
        }
      })()
    };

    // Add optional dates if provided
    if (formData.get('lastMaintenance')) {
      dmeData.lastMaintenance = firebase.firestore.Timestamp.fromDate(new Date(formData.get('lastMaintenance')));
    }
    if (formData.get('nextMaintenance')) {
      dmeData.nextMaintenance = firebase.firestore.Timestamp.fromDate(new Date(formData.get('nextMaintenance')));
    }
    if (formData.get('warrantyExpiry')) {
      dmeData.warrantyExpiry = firebase.firestore.Timestamp.fromDate(new Date(formData.get('warrantyExpiry')));
    }

    try {
      await this.db.collection('durableMedicalEquipment').add(dmeData);
      e.target.reset();
      this.loadDMEData();
      showNotification('Equipment added successfully!', 'success');
    } catch (error) {
      console.error('Error adding DME:', error);
      showNotification('Error adding equipment. Please try again.', 'error');
    }
  }

  async updateStatus(itemId) {
    const item = this.dmeItems.find(i => i.id === itemId);
    if (!item) return;

    const newStatus = prompt(
      `How is ${item.name} working now?\n\n` +
      `1. Working well\n` +
      `2. Minor issues\n` +
      `3. Needs repair\n` +
      `4. Broken\n\n` +
      `Enter 1, 2, 3, or 4:`
    );

    if (!newStatus) return;

    const statusMap = {
      '1': 'working',
      '2': 'minor-issues', 
      '3': 'needs-repair',
      '4': 'broken'
    };

    const status = statusMap[newStatus];
    if (!status) {
      alert('Please enter 1, 2, 3, or 4');
      return;
    }

    try {
      await this.db.collection('durableMedicalEquipment').doc(itemId).update({
        status: status,
        lastUpdated: (() => {
          try {
            if (firebase && firebase.firestore && firebase.firestore.Timestamp) {
              return firebase.firestore.Timestamp.now();
            } else {
              return new Date();
            }
          } catch (error) {
            console.warn('Firebase timestamp not available, using JavaScript Date:', error);
            return new Date();
          }
        })()
      });
      this.loadDMEData();
      showNotification('Status updated!', 'success');
    } catch (error) {
      console.error('Error updating status:', error);
      showNotification('Error updating status. Please try again.', 'error');
    }
  }

  contactAbout(itemId) {
    const item = this.dmeItems.find(i => i.id === itemId);
    if (!item) return;

    const message = `I need help with my ${item.name} (${this.getTypeText(item.type)}). Current status: ${this.getStatusText(item.status)}.`;
    
    // In a real app, this would open a contact form or messaging system
    alert(`Contact your provider about: ${item.name}\n\nMessage: ${message}\n\nThis would open your provider's contact form in a real app.`);
  }

  async editDME(itemId) {
    // Implementation for editing DME items
    console.log('Edit DME:', itemId);
    // TODO: Implement edit functionality
  }

  async deleteDME(itemId) {
    if (!confirm('Are you sure you want to delete this equipment?')) {
      return;
    }

    try {
      await this.db.collection('durableMedicalEquipment').doc(itemId).delete();
      this.loadDMEData();
      showNotification('Equipment deleted successfully!', 'success');
    } catch (error) {
      console.error('Error deleting DME:', error);
      showNotification('Error deleting equipment. Please try again.', 'error');
    }
  }
}

// Initialize DME Manager
let dmeManager;
document.addEventListener('DOMContentLoaded', () => {
  dmeManager = new DMEManager();
});

// Global functions for patient-friendly interface
function showQuickAddModal() {
  // Scroll to the quick add DME form
  const quickAddForm = document.querySelector('.quick-add-dme');
  if (quickAddForm) {
    quickAddForm.scrollIntoView({ behavior: 'smooth' });
  }
}

function contactProvider(type) {
  const messages = {
    maintenance: 'I need to schedule maintenance for my equipment.',
    repair: 'I have equipment that needs repair.',
    adjustment: 'I need an adjustment to my equipment.',
    emergency: 'I have an emergency issue with my equipment.'
  };

  const message = messages[type] || 'I need help with my equipment.';
  
  // In a real app, this would open a contact form or messaging system
  alert(`Contact your provider\n\nType: ${type.charAt(0).toUpperCase() + type.slice(1)}\nMessage: ${message}\n\nThis would open your provider's contact form in a real app.`);
} 
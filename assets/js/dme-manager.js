class DMEManager {
  constructor() {
    this.db = firebase.firestore();
    this.currentUser = null;
    this.dmeItems = [];
    this.init();
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
    // Add DME form submission
    const addDMEForm = document.getElementById('addDMEForm');
    if (addDMEForm) {
      addDMEForm.addEventListener('submit', (e) => this.handleAddDME(e));
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
    const totalCount = this.dmeItems.length;
    const activeCount = this.dmeItems.filter(item => item.status === 'active').length;
    const maintenanceCount = this.dmeItems.filter(item => {
      if (!item.nextMaintenance) return false;
      return new Date(item.nextMaintenance) <= new Date();
    }).length;
    const totalValue = this.dmeItems.reduce((sum, item) => sum + (item.value || 0), 0);

    // Update stats display
    const totalCountEl = document.getElementById('dme-total-count');
    const activeCountEl = document.getElementById('dme-active-count');
    const maintenanceCountEl = document.getElementById('dme-maintenance-count');
    const totalValueEl = document.getElementById('dme-total-value');

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (maintenanceCountEl) maintenanceCountEl.textContent = maintenanceCount;
    if (totalValueEl) totalValueEl.textContent = `$${totalValue.toLocaleString()}`;
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
      <div class="equipment-item ${item.status}">
        <div class="equipment-header">
          <h3>${item.name}</h3>
          <div class="equipment-status ${item.status}">${item.status}</div>
        </div>
        <div class="equipment-details">
          <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${item.type}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Category:</span>
            <span class="detail-value">${item.category}</span>
          </div>
          <div class="detail-row">
            <span class="detail-label">Acquired:</span>
            <span class="detail-value">${item.dateAcquired.toLocaleDateString()}</span>
          </div>
          ${item.value ? `
            <div class="detail-row">
              <span class="detail-label">Value:</span>
              <span class="detail-value">$${item.value.toLocaleString()}</span>
            </div>
          ` : ''}
          ${item.nextMaintenance ? `
            <div class="detail-row">
              <span class="detail-label">Next Maintenance:</span>
              <span class="detail-value ${new Date(item.nextMaintenance) <= new Date() ? 'overdue' : ''}">
                ${item.nextMaintenance.toLocaleDateString()}
              </span>
            </div>
          ` : ''}
          ${item.warrantyExpiry ? `
            <div class="detail-row">
              <span class="detail-label">Warranty:</span>
              <span class="detail-value ${new Date(item.warrantyExpiry) <= new Date() ? 'expired' : ''}">
                ${item.warrantyExpiry.toLocaleDateString()}
              </span>
            </div>
          ` : ''}
        </div>
        ${item.notes ? `
          <div class="equipment-notes">
            <strong>Notes:</strong> ${item.notes}
          </div>
        ` : ''}
        <div class="equipment-actions">
          <button class="btn btn-secondary" onclick="dmeManager.editDME('${item.id}')">Edit</button>
          <button class="btn btn-danger" onclick="dmeManager.deleteDME('${item.id}')">Delete</button>
        </div>
      </div>
    `).join('');

    equipmentList.innerHTML = equipmentHTML;
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
      timestamp: firebase.firestore.Timestamp.now()
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

// Global function for modal
function showDMEModal() {
  // Scroll to the add DME form
  const addDMEForm = document.querySelector('.add-dme');
  if (addDMEForm) {
    addDMEForm.scrollIntoView({ behavior: 'smooth' });
  }
} 
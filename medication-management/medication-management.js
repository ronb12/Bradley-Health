// Constants
const MEDICATION_STATUS = {
    TAKEN: 'TAKEN',
    MISSED: 'MISSED',
    UPCOMING: 'UPCOMING'
};

const INTERACTION_SEVERITY = {
    NONE: 'none',
    MILD: 'mild',
    MODERATE: 'moderate',
    SEVERE: 'severe'
};

// Initialize medication management database
async function initMedicationManagementDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('medicationManagementDB', 1);

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);

        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // Create object stores
            if (!db.objectStoreNames.contains('medications')) {
                const store = db.createObjectStore('medications', { keyPath: 'id', autoIncrement: true });
                store.createIndex('name', 'name', { unique: false });
                store.createIndex('schedule', 'schedule', { unique: false });
            }
            if (!db.objectStoreNames.contains('interactions')) {
                const store = db.createObjectStore('interactions', { keyPath: 'id', autoIncrement: true });
                store.createIndex('medication1', 'medication1', { unique: false });
                store.createIndex('medication2', 'medication2', { unique: false });
            }
            if (!db.objectStoreNames.contains('refillReminders')) {
                const store = db.createObjectStore('refillReminders', { keyPath: 'id', autoIncrement: true });
                store.createIndex('medicationId', 'medicationId', { unique: false });
                store.createIndex('dueDate', 'dueDate', { unique: false });
            }
        };
    });
}

// Save medication
async function saveMedication(medication) {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['medications'], 'readwrite');
    const store = transaction.objectStore('medications');

    return new Promise((resolve, reject) => {
        const request = store.add({
            ...medication,
            status: MEDICATION_STATUS.UPCOMING,
            createdAt: new Date().toISOString()
        });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get medications
async function getMedications(timeRange = 'week') {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['medications'], 'readonly');
    const store = transaction.objectStore('medications');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => {
            const medications = request.result;
            const filtered = filterMedicationsByTimeRange(medications, timeRange);
            resolve(filtered);
        };
        request.onerror = () => reject(request.error);
    });
}

// Filter medications by time range
function filterMedicationsByTimeRange(medications, timeRange) {
    const now = new Date();
    const startDate = new Date();

    switch (timeRange) {
        case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        default:
            startDate.setDate(now.getDate() - 7);
    }

    return medications.filter(med => new Date(med.createdAt) >= startDate);
}

// Update medication status
async function updateMedicationStatus(medicationId, status) {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['medications'], 'readwrite');
    const store = transaction.objectStore('medications');

    return new Promise((resolve, reject) => {
        const request = store.get(medicationId);
        request.onsuccess = () => {
            const medication = request.result;
            medication.status = status;
            medication.updatedAt = new Date().toISOString();

            const updateRequest = store.put(medication);
            updateRequest.onsuccess = () => resolve(medication);
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
}

// Check medication interactions
async function checkMedicationInteractions(medication1Id, medication2Id) {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['interactions'], 'readonly');
    const store = transaction.objectStore('interactions');

    return new Promise((resolve, reject) => {
        const request = store.index('medication1').getAll(medication1Id);
        request.onsuccess = () => {
            const interactions = request.result;
            const interaction = interactions.find(i => i.medication2 === medication2Id);
            resolve(interaction || { severity: INTERACTION_SEVERITY.NONE });
        };
        request.onerror = () => reject(request.error);
    });
}

// Add refill reminder
async function addRefillReminder(medicationId, dueDate, quantity) {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['refillReminders'], 'readwrite');
    const store = transaction.objectStore('refillReminders');

    return new Promise((resolve, reject) => {
        const request = store.add({
            medicationId,
            dueDate: new Date(dueDate).toISOString(),
            quantity,
            status: 'pending',
            createdAt: new Date().toISOString()
        });

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Get refill reminders
async function getRefillReminders() {
    const db = await initMedicationManagementDB();
    const transaction = db.transaction(['refillReminders'], 'readonly');
    const store = transaction.objectStore('refillReminders');

    return new Promise((resolve, reject) => {
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// Update display
async function updateDisplay() {
    // Update today's schedule
    const medications = await getMedications('week');
    const scheduleList = document.querySelector('.medication-schedule');
    
    // Group medications by time of day
    const morningMeds = medications.filter(m => m.schedule === 'morning');
    const afternoonMeds = medications.filter(m => m.schedule === 'afternoon');
    const eveningMeds = medications.filter(m => m.schedule === 'evening');

    // Update each time group
    updateTimeGroup('Morning', morningMeds);
    updateTimeGroup('Afternoon', afternoonMeds);
    updateTimeGroup('Evening', eveningMeds);

    // Update interaction checker dropdowns
    updateMedicationDropdowns(medications);

    // Update refill reminders
    const reminders = await getRefillReminders();
    updateRefillReminders(reminders);

    // Update medication history
    updateMedicationHistory(medications);
}

// Update time group display
function updateTimeGroup(time, medications) {
    const group = document.querySelector(`.schedule-time-group h3:contains('${time}')`).parentElement;
    const list = group.querySelector('.medication-list');
    
    list.innerHTML = medications.map(med => `
        <div class="medication-item" data-id="${med.id}">
            <div class="medication-info">
                <h4>${med.name}</h4>
                <p>${med.dosage}</p>
            </div>
            <div class="medication-status">
                <label class="status-toggle">
                    <input type="checkbox" ${med.status === MEDICATION_STATUS.TAKEN ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            </div>
        </div>
    `).join('');

    // Add event listeners for status toggles
    list.querySelectorAll('.status-toggle input').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const medicationId = e.target.closest('.medication-item').dataset.id;
            const status = e.target.checked ? MEDICATION_STATUS.TAKEN : MEDICATION_STATUS.MISSED;
            await updateMedicationStatus(medicationId, status);
            updateDisplay();
        });
    });
}

// Update medication dropdowns
function updateMedicationDropdowns(medications) {
    const dropdowns = document.querySelectorAll('#medication1, #medication2');
    const options = medications.map(med => 
        `<option value="${med.id}">${med.name}</option>`
    ).join('');

    dropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option value="">Select medication</option>' + options;
    });
}

// Update refill reminders
function updateRefillReminders(reminders) {
    const list = document.querySelector('.refill-list');
    
    list.innerHTML = reminders.map(reminder => `
        <div class="refill-item">
            <div class="refill-info">
                <h4>${reminder.medicationName}</h4>
                <p>Due: ${new Date(reminder.dueDate).toLocaleDateString()}</p>
                <p>Quantity: ${reminder.quantity}</p>
            </div>
            <div class="refill-status">
                <span class="status-badge ${reminder.status}">${reminder.status}</span>
            </div>
        </div>
    `).join('');
}

// Update medication history
function updateMedicationHistory(medications) {
    const list = document.querySelector('.history-list');
    
    list.innerHTML = medications.map(med => `
        <div class="history-item">
            <div class="history-info">
                <h4>${med.name}</h4>
                <p>${med.dosage}</p>
                <p>Schedule: ${med.schedule}</p>
            </div>
            <div class="history-status">
                <span class="status-badge ${med.status.toLowerCase()}">${med.status}</span>
            </div>
        </div>
    `).join('');
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Initialize display
    updateDisplay();

    // Check interactions
    document.getElementById('checkInteractions').addEventListener('click', async () => {
        const med1 = document.getElementById('medication1').value;
        const med2 = document.getElementById('medication2').value;

        if (!med1 || !med2) {
            showToast('Please select both medications');
            return;
        }

        const interaction = await checkMedicationInteractions(med1, med2);
        const results = document.querySelector('.interaction-results');
        
        results.innerHTML = `
            <div class="interaction-alert ${interaction.severity}">
                <h4>${getInteractionTitle(interaction.severity)}</h4>
                <p>${interaction.description || 'No known interactions found.'}</p>
            </div>
        `;
    });

    // Add refill reminder
    document.getElementById('addRefillReminder').addEventListener('click', () => {
        // Show add reminder form
        showAddReminderForm();
    });

    // History time range change
    document.getElementById('historyTimeRange').addEventListener('change', (e) => {
        updateDisplay();
    });
});

// Helper Functions
function getInteractionTitle(severity) {
    switch (severity) {
        case INTERACTION_SEVERITY.SEVERE:
            return 'Severe Interaction';
        case INTERACTION_SEVERITY.MODERATE:
            return 'Moderate Interaction';
        case INTERACTION_SEVERITY.MILD:
            return 'Mild Interaction';
        default:
            return 'No Interaction';
    }
}

function showAddReminderForm() {
    // Implementation for showing the add reminder form
    // This would typically involve showing a modal or bottom sheet
}

function showToast(message) {
    // Implementation for showing toast notifications
    // This would typically use the mobile.js toast functionality
} 
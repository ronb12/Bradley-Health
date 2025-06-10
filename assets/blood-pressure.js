// Blood Pressure Tracker
class BloodPressureTracker {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.chart = null;
        this.readings = [];
        this.initializeEventListeners();
        this.loadReadings();
        this.addHelpIconListeners();
        this.addFormValidation();
    }

    initializeEventListeners() {
        // Form submission
        document.getElementById('bpForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.logBloodPressure();
        });

        // Chart controls
        document.querySelectorAll('.chart-controls button').forEach(button => {
            button.addEventListener('click', (e) => {
                this.updateChartView(e.target.textContent.toLowerCase());
            });
        });

        // Time filter
        document.getElementById('timeFilter').addEventListener('change', () => {
            this.filterReadings();
        });

        // Export data
        document.getElementById('exportData').addEventListener('click', () => {
            this.exportData();
        });
    }

    addHelpIconListeners() {
        const helpIcons = document.querySelectorAll('.help-icon');
        helpIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const title = icon.getAttribute('title');
                if (title) {
                    this.showTooltip(icon, title);
                }
            });
        });
    }

    showTooltip(element, text) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        
        const rect = element.getBoundingClientRect();
        tooltip.style.position = 'absolute';
        tooltip.style.top = `${rect.bottom + 5}px`;
        tooltip.style.left = `${rect.left}px`;
        
        document.body.appendChild(tooltip);
        
        setTimeout(() => {
            tooltip.remove();
        }, 3000);
    }

    addFormValidation() {
        const form = document.getElementById('bpForm');
        const inputs = form.querySelectorAll('input[type="number"]');
        
        inputs.forEach(input => {
            input.addEventListener('input', () => {
                this.validateInput(input);
            });
            
            input.addEventListener('blur', () => {
                this.validateInput(input);
            });
        });
    }

    validateInput(input) {
        const value = parseInt(input.value);
        const min = parseInt(input.min);
        const max = parseInt(input.max);
        
        if (isNaN(value)) {
            this.showInputError(input, 'Please enter a valid number');
            return false;
        }
        
        if (value < min || value > max) {
            this.showInputError(input, `Please enter a value between ${min} and ${max}`);
            return false;
        }
        
        this.clearInputError(input);
        return true;
    }

    showInputError(input, message) {
        const errorDiv = input.parentElement.querySelector('.input-error') || 
                        document.createElement('div');
        errorDiv.className = 'input-error';
        errorDiv.textContent = message;
        
        if (!input.parentElement.querySelector('.input-error')) {
            input.parentElement.appendChild(errorDiv);
        }
        
        input.classList.add('error');
    }

    clearInputError(input) {
        const errorDiv = input.parentElement.querySelector('.input-error');
        if (errorDiv) {
            errorDiv.remove();
        }
        input.classList.remove('error');
    }

    async logBloodPressure() {
        try {
            this.showLoading();
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const reading = {
                systolic: parseInt(document.getElementById('systolic').value),
                diastolic: parseInt(document.getElementById('diastolic').value),
                pulse: parseInt(document.getElementById('pulse').value),
                timeOfDay: document.getElementById('timeOfDay').value,
                medicationStatus: document.getElementById('medicationStatus').value,
                activityLevel: document.getElementById('activityLevel').value,
                notes: document.getElementById('notes').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp(),
                userId: user.uid
            };

            // Validate reading
            if (!this.validateReading(reading)) {
                throw new Error('Invalid reading values');
            }

            // Add to Firestore
            await this.db.collection('bloodPressure').add(reading);
            
            // Update UI
            this.showSuccess('Reading logged successfully');
            this.resetForm();
            await this.loadReadings();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    validateReading(reading) {
        const { systolic, diastolic, pulse } = reading;
        
        // Basic range validation based on medical standards
        if (systolic < 70 || systolic > 250) return false;
        if (diastolic < 40 || diastolic > 150) return false;
        if (pulse < 40 || pulse > 200) return false;
        
        // Systolic should be higher than diastolic
        if (systolic <= diastolic) return false;
        
        // Additional validation for extreme cases
        if (systolic - diastolic < 20) return false; // Pulse pressure too narrow
        if (systolic - diastolic > 100) return false; // Pulse pressure too wide
        
        return true;
    }

    async loadReadings() {
        try {
            this.showLoading();
            const user = this.auth.currentUser;
            if (!user) throw new Error('User not authenticated');

            const snapshot = await this.db.collection('bloodPressure')
                .where('userId', '==', user.uid)
                .orderBy('timestamp', 'desc')
                .limit(100)
                .get();

            this.readings = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            this.updateUI();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    updateUI() {
        this.updateTodaySummary();
        this.updateChart();
        this.updateReadingsList();
    }

    updateTodaySummary() {
        const today = new Date().setHours(0, 0, 0, 0);
        const todayReadings = this.readings.filter(r => 
            new Date(r.timestamp.toDate()).setHours(0, 0, 0, 0) === today
        );

        if (todayReadings.length === 0) {
            document.querySelector('.data-cards').innerHTML = `
                <div class="data-card">
                    <div class="data-card-header">
                        <span class="data-card-title">No Readings Today</span>
                    </div>
                    <div class="data-card-value">--/--</div>
                    <div class="data-card-trend">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="8" x2="12" y2="12"/>
                            <line x1="12" y1="16" x2="12.01" y2="16"/>
                        </svg>
                        Add your first reading
                    </div>
                </div>
            `;
            return;
        }

        const latest = todayReadings[0];
        const avgSystolic = Math.round(todayReadings.reduce((sum, r) => sum + r.systolic, 0) / todayReadings.length);
        const avgDiastolic = Math.round(todayReadings.reduce((sum, r) => sum + r.diastolic, 0) / todayReadings.length);

        document.querySelector('.data-cards').innerHTML = `
            <div class="data-card">
                <div class="data-card-header">
                    <span class="data-card-title">Latest Reading</span>
                    <span class="status-indicator ${this.getStatusClass(latest)}">${this.getStatusText(latest)}</span>
                </div>
                <div class="data-card-value">${latest.systolic}/${latest.diastolic}</div>
                <div class="data-card-trend">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    ${this.getTrendText(latest)}
                </div>
            </div>
            <div class="data-card">
                <div class="data-card-header">
                    <span class="data-card-title">Average Today</span>
                </div>
                <div class="data-card-value">${avgSystolic}/${avgDiastolic}</div>
                <div class="data-card-trend">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"/>
                    </svg>
                    ${this.getAverageTrendText(todayReadings)}
                </div>
            </div>
            <div class="data-card">
                <div class="data-card-header">
                    <span class="data-card-title">Readings Today</span>
                </div>
                <div class="data-card-value">${todayReadings.length}</div>
                <div class="data-card-trend">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                    </svg>
                    Last: ${this.getTimeAgo(latest.timestamp)}
                </div>
            </div>
        `;
    }

    updateChart() {
        const ctx = document.getElementById('bpChart').getContext('2d');
        
        if (this.chart) {
            this.chart.destroy();
        }

        const data = this.prepareChartData();
        
        this.chart = new Chart(ctx, {
            type: 'line',
            data: data,
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                const label = context.dataset.label || '';
                                const value = context.parsed.y;
                                return `${label}: ${value}`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        type: 'time',
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM d'
                            }
                        },
                        title: {
                            display: true,
                            text: 'Date'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'mmHg / bpm'
                        }
                    }
                }
            }
        });
    }

    prepareChartData() {
        const last7Days = this.readings.slice(0, 7).reverse();
        
        return {
            labels: last7Days.map(r => r.timestamp.toDate()),
            datasets: [
                {
                    label: 'Systolic',
                    data: last7Days.map(r => r.systolic),
                    borderColor: '#2B6CB0',
                    backgroundColor: 'rgba(43, 108, 176, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Diastolic',
                    data: last7Days.map(r => r.diastolic),
                    borderColor: '#38A169',
                    backgroundColor: 'rgba(56, 161, 105, 0.1)',
                    tension: 0.4
                },
                {
                    label: 'Pulse',
                    data: last7Days.map(r => r.pulse),
                    borderColor: '#ED8936',
                    backgroundColor: 'rgba(237, 137, 54, 0.1)',
                    tension: 0.4
                }
            ]
        };
    }

    updateReadingsList() {
        const readingsList = document.getElementById('readingsList');
        readingsList.innerHTML = this.readings.map(reading => `
            <div class="reading-card">
                <div class="reading-header">
                    <div class="reading-values">
                        <span class="reading-bp">${reading.systolic}/${reading.diastolic}</span>
                        <span class="reading-pulse">${reading.pulse} bpm</span>
                    </div>
                    <span class="status-indicator ${this.getStatusClass(reading)}">${this.getStatusText(reading)}</span>
                </div>
                <div class="reading-details">
                    <div class="reading-time">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        ${this.formatDateTime(reading.timestamp)}
                    </div>
                    <div class="reading-meta">
                        <span class="reading-time-of-day">${this.formatTimeOfDay(reading.timeOfDay)}</span>
                        <span class="reading-activity">${this.formatActivityLevel(reading.activityLevel)}</span>
                        <span class="reading-medication">${this.formatMedicationStatus(reading.medicationStatus)}</span>
                    </div>
                    ${reading.notes ? `
                        <div class="reading-notes">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                                <polyline points="14 2 14 8 20 8"/>
                                <line x1="16" y1="13" x2="8" y2="13"/>
                                <line x1="16" y1="17" x2="8" y2="17"/>
                                <polyline points="10 9 9 9 8 9"/>
                            </svg>
                            ${reading.notes}
                        </div>
                    ` : ''}
                </div>
                <div class="reading-actions">
                    <button onclick="bpTracker.editReading('${reading.id}')" class="icon-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                    </button>
                    <button onclick="bpTracker.deleteReading('${reading.id}')" class="icon-button">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        `).join('');
    }

    getStatusClass(reading) {
        const { systolic, diastolic } = reading;
        
        if (systolic >= 180 || diastolic >= 120) return 'status-danger';
        if (systolic >= 140 || diastolic >= 90) return 'status-warning';
        if (systolic >= 120 || diastolic >= 80) return 'status-normal';
        if (systolic < 90 || diastolic < 60) return 'status-warning';
        return 'status-normal';
    }

    getStatusText(reading) {
        const { systolic, diastolic } = reading;
        
        if (systolic >= 180 || diastolic >= 120) return 'Hypertensive Crisis';
        if (systolic >= 140 || diastolic >= 90) return 'Stage 2 Hypertension';
        if (systolic >= 130 || diastolic >= 80) return 'Stage 1 Hypertension';
        if (systolic >= 120 && diastolic < 80) return 'Elevated';
        if (systolic < 90 || diastolic < 60) return 'Low Blood Pressure';
        return 'Normal';
    }

    getTrendText(reading) {
        const { systolic, diastolic } = reading;
        
        if (systolic >= 180 || diastolic >= 120) return 'Seek immediate medical attention';
        if (systolic >= 140 || diastolic >= 90) return 'Consult your healthcare provider';
        if (systolic >= 130 || diastolic >= 80) return 'Monitor closely and consider lifestyle changes';
        if (systolic >= 120 && diastolic < 80) return 'Monitor regularly';
        if (systolic < 90 || diastolic < 60) return 'Monitor and stay hydrated';
        return 'Within normal range';
    }

    getAverageTrendText(readings) {
        if (readings.length < 2) return 'Insufficient data';
        
        const first = readings[readings.length - 1];
        const last = readings[0];
        const systolicDiff = last.systolic - first.systolic;
        const diastolicDiff = last.diastolic - first.diastolic;
        
        if (Math.abs(systolicDiff) <= 5 && Math.abs(diastolicDiff) <= 5) return 'Stable';
        if (systolicDiff > 0 || diastolicDiff > 0) return 'Increasing';
        return 'Decreasing';
    }

    getTimeAgo(timestamp) {
        const now = new Date();
        const readingTime = timestamp.toDate();
        const diff = now - readingTime;
        
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes}m ago`;
        
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    formatDateTime(timestamp) {
        return timestamp.toDate().toLocaleString();
    }

    formatTimeOfDay(timeOfDay) {
        return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1);
    }

    formatActivityLevel(activityLevel) {
        return activityLevel.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatMedicationStatus(medicationStatus) {
        return medicationStatus.split('_').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    async editReading(id) {
        const reading = this.readings.find(r => r.id === id);
        if (!reading) return;

        const modal = document.getElementById('editModal');
        const form = document.getElementById('editForm');
        
        form.innerHTML = `
            <div class="form-row">
                <div class="form-group">
                    <label for="editSystolic">Systolic (mmHg)</label>
                    <input type="number" id="editSystolic" value="${reading.systolic}" required min="60" max="250">
                </div>
                <div class="form-group">
                    <label for="editDiastolic">Diastolic (mmHg)</label>
                    <input type="number" id="editDiastolic" value="${reading.diastolic}" required min="40" max="150">
                </div>
                <div class="form-group">
                    <label for="editPulse">Pulse Rate (bpm)</label>
                    <input type="number" id="editPulse" value="${reading.pulse}" required min="40" max="200">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label for="editTimeOfDay">Time of Day</label>
                    <select id="editTimeOfDay" required>
                        <option value="morning" ${reading.timeOfDay === 'morning' ? 'selected' : ''}>Morning</option>
                        <option value="afternoon" ${reading.timeOfDay === 'afternoon' ? 'selected' : ''}>Afternoon</option>
                        <option value="evening" ${reading.timeOfDay === 'evening' ? 'selected' : ''}>Evening</option>
                        <option value="night" ${reading.timeOfDay === 'night' ? 'selected' : ''}>Night</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editMedicationStatus">Medication Status</label>
                    <select id="editMedicationStatus" required>
                        <option value="taken" ${reading.medicationStatus === 'taken' ? 'selected' : ''}>Taken as Prescribed</option>
                        <option value="missed" ${reading.medicationStatus === 'missed' ? 'selected' : ''}>Missed Dose</option>
                        <option value="delayed" ${reading.medicationStatus === 'delayed' ? 'selected' : ''}>Delayed Dose</option>
                        <option value="none" ${reading.medicationStatus === 'none' ? 'selected' : ''}>No Medication</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="editActivityLevel">Activity Level</label>
                    <select id="editActivityLevel" required>
                        <option value="resting" ${reading.activityLevel === 'resting' ? 'selected' : ''}>Resting</option>
                        <option value="light" ${reading.activityLevel === 'light' ? 'selected' : ''}>Light Activity</option>
                        <option value="moderate" ${reading.activityLevel === 'moderate' ? 'selected' : ''}>Moderate Activity</option>
                        <option value="strenuous" ${reading.activityLevel === 'strenuous' ? 'selected' : ''}>Strenuous Activity</option>
                    </select>
                </div>
            </div>
            <div class="form-group">
                <label for="editNotes">Notes</label>
                <textarea id="editNotes" rows="3">${reading.notes || ''}</textarea>
            </div>
            <div class="form-actions">
                <button type="submit" class="primary-button">Save Changes</button>
                <button type="button" class="secondary-button" onclick="bpTracker.closeModal()">Cancel</button>
            </div>
        `;

        form.onsubmit = (e) => {
            e.preventDefault();
            this.saveEdit(id);
        };

        modal.style.display = 'block';
    }

    async saveEdit(id) {
        try {
            this.showLoading();
            const reading = {
                systolic: parseInt(document.getElementById('editSystolic').value),
                diastolic: parseInt(document.getElementById('editDiastolic').value),
                pulse: parseInt(document.getElementById('editPulse').value),
                timeOfDay: document.getElementById('editTimeOfDay').value,
                medicationStatus: document.getElementById('editMedicationStatus').value,
                activityLevel: document.getElementById('editActivityLevel').value,
                notes: document.getElementById('editNotes').value,
                timestamp: firebase.firestore.FieldValue.serverTimestamp()
            };

            if (!this.validateReading(reading)) {
                throw new Error('Invalid reading values');
            }

            await this.db.collection('bloodPressure').doc(id).update(reading);
            
            this.showSuccess('Reading updated successfully');
            this.closeModal();
            await this.loadReadings();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async deleteReading(id) {
        if (!confirm('Are you sure you want to delete this reading?')) return;

        try {
            this.showLoading();
            await this.db.collection('bloodPressure').doc(id).delete();
            
            this.showSuccess('Reading deleted successfully');
            await this.loadReadings();
        } catch (error) {
            this.showError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    closeModal() {
        document.getElementById('editModal').style.display = 'none';
    }

    resetForm() {
        document.getElementById('bpForm').reset();
    }

    filterReadings() {
        const days = parseInt(document.getElementById('timeFilter').value);
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        
        this.readings = this.readings.filter(r => 
            r.timestamp.toDate() >= cutoff
        );
        
        this.updateUI();
    }

    exportData() {
        const csv = this.convertToCSV(this.readings);
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `blood-pressure-readings-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    }

    convertToCSV(readings) {
        const headers = ['Date', 'Time', 'Systolic', 'Diastolic', 'Pulse', 'Time of Day', 'Medication Status', 'Activity Level', 'Notes'];
        const rows = readings.map(r => [
            r.timestamp.toDate().toLocaleDateString(),
            r.timestamp.toDate().toLocaleTimeString(),
            r.systolic,
            r.diastolic,
            r.pulse,
            this.formatTimeOfDay(r.timeOfDay),
            this.formatMedicationStatus(r.medicationStatus),
            this.formatActivityLevel(r.activityLevel),
            r.notes || ''
        ]);
        
        return [headers, ...rows].map(row => row.join(',')).join('\n');
    }

    showLoading() {
        document.getElementById('loadingOverlay').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loadingOverlay').style.display = 'none';
    }

    showSuccess(message) {
        // Implement success message display
    }

    showError(message) {
        // Implement error message display
    }
}

// Initialize the tracker
const bpTracker = new BloodPressureTracker();

// Add styles to document
const styles = `
    .tooltip {
        background: var(--text);
        color: var(--white);
        padding: 0.5rem 1rem;
        border-radius: var(--radius-md);
        font-size: 0.875rem;
        z-index: 1000;
        animation: fadeIn 0.2s ease;
    }

    .input-error {
        color: var(--error);
        font-size: 0.875rem;
        margin-top: 0.25rem;
    }

    .error {
        border-color: var(--error) !important;
    }

    .empty-state {
        text-align: center;
        padding: var(--spacing-xl);
        color: var(--text-light);
    }

    .empty-state svg {
        color: var(--text-lighter);
        margin-bottom: var(--spacing-md);
    }

    .empty-state h3 {
        margin: 0 0 var(--spacing-sm);
        color: var(--text);
    }

    .empty-state p {
        margin: 0 0 var(--spacing-lg);
    }

    .message {
        position: fixed;
        bottom: 2rem;
        left: 50%;
        transform: translateX(-50%) translateY(100%);
        padding: 1rem 2rem;
        border-radius: var(--radius-lg);
        background: var(--text);
        color: var(--white);
        font-weight: 500;
        z-index: 1000;
        opacity: 0;
        transition: all 0.3s ease;
    }

    .message.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }

    .message.error {
        background: var(--error);
    }

    .message.success {
        background: var(--success);
    }

    .message.warning {
        background: var(--warning);
    }

    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 
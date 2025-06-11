// Mobile-specific functionality
class MobileUI {
    constructor() {
        this.cache = new Map();
        this.debounceTimers = new Map();
        this.menuButton = document.querySelector('.mobile-menu-button');
        this.menu = document.querySelector('.mobile-menu');
        this.menuClose = document.querySelector('.mobile-menu-close');
        this.toast = document.getElementById('mobile-toast');
        this.loading = document.getElementById('mobile-loading');
        this.bottomSheet = document.querySelector('.mobile-bottom-sheet');
        
        this.setupEventListeners();
    }

    // Performance optimized event listeners
    setupEventListeners() {
        const debouncedResize = this.debounce(this.handleResize.bind(this), 250);
        window.addEventListener('resize', debouncedResize);
        
        // Use passive event listeners for better scroll performance
        document.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: true });
        document.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: true });

        // Menu functionality
        if (this.menuButton) {
            this.menuButton.addEventListener('click', () => this.openMenu());
        }
        if (this.menuClose) {
            this.menuClose.addEventListener('click', () => this.closeMenu());
        }

        // Handle back button
        window.addEventListener('popstate', () => this.closeMenu());

        // Handle orientation changes
        window.addEventListener('orientationchange', () => this.handleOrientationChange());
    }

    // Debounce utility
    debounce(func, wait) {
        return (...args) => {
            clearTimeout(this.debounceTimers.get(func));
            this.debounceTimers.set(func, setTimeout(() => func(...args), wait));
        };
    }

    // Menu methods
    openMenu() {
        this.menu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeMenu() {
        this.menu.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Enhanced form validation with performance optimizations
    validateForm(form) {
        if (!form) return false;
        
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        const errors = [];
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                errors.push(`${input.name || 'Field'} is required`);
                isValid = false;
            }
            
            if (input.type === 'email' && !validation.email(input.value)) {
                errors.push('Please enter a valid email address');
                isValid = false;
            }
            
            if (input.type === 'tel' && !validation.phone(input.value)) {
                errors.push('Please enter a valid phone number');
                isValid = false;
            }
        });
        
        if (!isValid) {
            this.showToast(errors.join('\n'), 'error');
        }
        
        return isValid;
    }

    // Performance optimized form submission
    async submitForm(form) {
        try {
            const formData = new FormData(form);
            const data = Object.fromEntries(formData.entries());
            
            // Cache validation results
            const cacheKey = JSON.stringify(data);
            if (this.cache.has(cacheKey)) {
                return this.cache.get(cacheKey);
            }
            
            const result = await this.processFormData(data);
            this.cache.set(cacheKey, result);
            return result;
        } catch (error) {
            console.error('Form submission error:', error);
            throw new Error('Failed to submit form. Please try again.');
        }
    }

    // Enhanced loading state management
    showLoading() {
        const loadingElement = document.createElement('div');
        loadingElement.className = 'loading';
        loadingElement.setAttribute('role', 'status');
        loadingElement.setAttribute('aria-label', 'Loading');
        document.body.appendChild(loadingElement);
    }

    hideLoading() {
        const loadingElement = document.querySelector('.loading');
        if (loadingElement) {
            loadingElement.remove();
        }
    }

    // Enhanced toast notifications
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'polite');
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Use requestAnimationFrame for smooth animations
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Touch event handlers
    handleTouchStart(event) {
        this.touchStartY = event.touches[0].clientY;
    }

    handleTouchMove(event) {
        if (!this.touchStartY) return;
        
        const touchY = event.touches[0].clientY;
        const diff = this.touchStartY - touchY;
        
        // Handle pull-to-refresh
        if (diff > 50 && window.scrollY === 0) {
            this.handlePullToRefresh();
        }
    }

    handlePullToRefresh() {
        this.showLoading();
        // Implement your refresh logic here
        setTimeout(() => this.hideLoading(), 1000);
    }

    handleResize() {
        // Implement responsive layout adjustments
        const width = window.innerWidth;
        if (width <= 768) {
            document.body.classList.add('mobile-view');
        } else {
            document.body.classList.remove('mobile-view');
        }
    }

    // Orientation change handling
    handleOrientationChange() {
        // Adjust UI elements based on orientation
        const isPortrait = window.innerHeight > window.innerWidth;
        
        if (isPortrait) {
            document.body.classList.add('portrait');
            document.body.classList.remove('landscape');
        } else {
            document.body.classList.add('landscape');
            document.body.classList.remove('portrait');
        }
    }

    // Bottom sheet methods
    openBottomSheet(content) {
        if (!this.bottomSheet) return;
        
        const contentElement = this.bottomSheet.querySelector('.mobile-bottom-sheet-content');
        if (contentElement) {
            contentElement.innerHTML = content;
        }
        
        this.bottomSheet.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeBottomSheet() {
        if (!this.bottomSheet) return;
        
        this.bottomSheet.classList.remove('active');
        document.body.style.overflow = '';
    }

    // List handling methods
    setupInfiniteScroll(list, loadMoreCallback) {
        if (!list) return;
        
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadMoreCallback();
                }
            });
        });
        
        const sentinel = document.createElement('div');
        sentinel.style.height = '1px';
        list.appendChild(sentinel);
        
        observer.observe(sentinel);
    }

    // Theme handling methods
    setupThemeToggle() {
        const themeToggle = document.querySelector('.theme-toggle');
        if (!themeToggle) return;
        
        themeToggle.addEventListener('click', () => {
            const isDark = document.body.getAttribute('data-theme') === 'dark';
            document.body.setAttribute('data-theme', isDark ? 'light' : 'dark');
            localStorage.setItem('theme', isDark ? 'light' : 'dark');
        });
        
        // Set initial theme
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.body.setAttribute('data-theme', savedTheme);
    }
}

// Initialize mobile UI
document.addEventListener('DOMContentLoaded', () => {
    window.mobileUI = new MobileUI();
});

// Blood Pressure Tracking
const BP_CATEGORIES = {
    NORMAL: { min: 0, max: 120, diastolicMax: 80, label: 'Normal', class: 'status-normal' },
    ELEVATED: { min: 121, max: 129, diastolicMax: 80, label: 'Elevated', class: 'status-elevated' },
    HIGH_STAGE1: { min: 130, max: 139, diastolicMax: 89, label: 'High Stage 1', class: 'status-high' },
    HIGH_STAGE2: { min: 140, max: 999, diastolicMax: 999, label: 'High Stage 2', class: 'status-high' }
};

// Initialize IndexedDB
const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BradleyHealth', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('bpReadings')) {
                const store = db.createObjectStore('bpReadings', { keyPath: 'id', autoIncrement: true });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
};

// Save BP Reading
const saveBPReading = async (reading) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bpReadings'], 'readwrite');
        const store = transaction.objectStore('bpReadings');
        const request = store.add({
            ...reading,
            timestamp: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Get BP Readings
const getBPReadings = async (timeRange = 'week') => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['bpReadings'], 'readonly');
        const store = transaction.objectStore('bpReadings');
        const index = store.index('timestamp');
        
        const now = new Date();
        let startDate;
        
        switch(timeRange) {
            case 'week':
                startDate = new Date(now.setDate(now.getDate() - 7));
                break;
            case 'month':
                startDate = new Date(now.setMonth(now.getMonth() - 1));
                break;
            case 'year':
                startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                break;
            default:
                startDate = new Date(now.setDate(now.getDate() - 7));
        }
        
        const range = IDBKeyRange.lowerBound(startDate.toISOString());
        const request = index.getAll(range);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Calculate BP Category
const getBPCategory = (systolic, diastolic) => {
    for (const [key, category] of Object.entries(BP_CATEGORIES)) {
        if (systolic >= category.min && systolic <= category.max && diastolic <= category.diastolicMax) {
            return category;
        }
    }
    return BP_CATEGORIES.HIGH_STAGE2;
};

// Update BP Display
const updateBPDisplay = async () => {
    const readings = await getBPReadings('week');
    if (readings.length === 0) return;
    
    const latest = readings[readings.length - 1];
    const category = getBPCategory(latest.systolic, latest.diastolic);
    
    // Update current reading display
    document.querySelector('.bp-value .systolic').textContent = latest.systolic;
    document.querySelector('.bp-value .diastolic').textContent = latest.diastolic;
    document.querySelector('.bp-pulse .pulse-value').textContent = latest.pulse || '--';
    
    const statusBadge = document.querySelector('.status-badge');
    statusBadge.textContent = category.label;
    statusBadge.className = `status-badge ${category.class}`;
    
    // Update timestamp
    const timestamp = new Date(latest.timestamp);
    document.querySelector('.bp-timestamp').textContent = 
        `Last reading: ${timestamp.toLocaleDateString()} at ${timestamp.toLocaleTimeString()}`;
    
    // Update readings list
    updateReadingsList(readings);
};

// Update Readings List
const updateReadingsList = (readings) => {
    const list = document.getElementById('readingsList');
    list.innerHTML = readings.reverse().map(reading => {
        const category = getBPCategory(reading.systolic, reading.diastolic);
        const timestamp = new Date(reading.timestamp);
        
        return `
            <div class="reading-item">
                <div class="reading-values">
                    <div class="reading-bp">
                        <span class="systolic">${reading.systolic}</span>/
                        <span class="diastolic">${reading.diastolic}</span>
                    </div>
                    <div class="reading-pulse">${reading.pulse || '--'} bpm</div>
                </div>
                <div class="reading-info">
                    <div class="reading-time">${timestamp.toLocaleString()}</div>
                    <span class="reading-status ${category.class}">${category.label}</span>
                </div>
            </div>
        `;
    }).join('');
};

// Update BP Statistics
const updateBPStats = async (timeRange) => {
    const readings = await getBPReadings(timeRange);
    if (readings.length === 0) return;
    
    const systolicValues = readings.map(r => r.systolic);
    const diastolicValues = readings.map(r => r.diastolic);
    
    const avgSystolic = Math.round(systolicValues.reduce((a, b) => a + b, 0) / readings.length);
    const avgDiastolic = Math.round(diastolicValues.reduce((a, b) => a + b, 0) / readings.length);
    const maxSystolic = Math.max(...systolicValues);
    const maxDiastolic = Math.max(...diastolicValues);
    const minSystolic = Math.min(...systolicValues);
    const minDiastolic = Math.min(...diastolicValues);
    
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = 
        `${avgSystolic}/${avgDiastolic}`;
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = 
        `${maxSystolic}/${maxDiastolic}`;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = 
        `${minSystolic}/${minDiastolic}`;
    
    renderBPChart(readings);
};

// Render BP Chart
const renderBPChart = (readings) => {
    const ctx = document.getElementById('bpChart');
    if (!ctx) return;
    
    // Clear previous chart
    ctx.innerHTML = '';
    
    // Create SVG chart
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    
    // Add chart elements
    const points = readings.map((reading, i) => {
        const x = (i / (readings.length - 1)) * 100;
        const y = 100 - (reading.systolic / 200) * 100;
        return `${x},${y}`;
    }).join(' ');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--primary)');
    path.setAttribute('stroke-width', '2');
    
    svg.appendChild(path);
    ctx.appendChild(svg);
};

// Export BP Data
const exportBPData = async () => {
    const readings = await getBPReadings('year');
    const csv = [
        ['Date', 'Time', 'Systolic', 'Diastolic', 'Pulse', 'Notes'],
        ...readings.map(reading => {
            const date = new Date(reading.timestamp);
            return [
                date.toLocaleDateString(),
                date.toLocaleTimeString(),
                reading.systolic,
                reading.diastolic,
                reading.pulse || '',
                reading.notes || ''
            ];
        })
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bp-readings-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

// Medication Tracking
const MEDICATION_STATUS = {
    TAKEN: 'taken',
    MISSED: 'missed',
    UPCOMING: 'upcoming'
};

// Initialize Medication DB
const initMedicationDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('BradleyHealth', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('medications')) {
                const store = db.createObjectStore('medications', { keyPath: 'id', autoIncrement: true });
                store.createIndex('time', 'time', { unique: false });
                store.createIndex('status', 'status', { unique: false });
            }
        };
    });
};

// Save Medication
const saveMedication = async (medication) => {
    const db = await initMedicationDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['medications'], 'readwrite');
        const store = transaction.objectStore('medications');
        const request = store.add({
            ...medication,
            status: MEDICATION_STATUS.UPCOMING,
            createdAt: new Date().toISOString()
        });
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

// Get Medications
const getMedications = async (timeRange = 'week') => {
    const db = await initMedicationDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['medications'], 'readonly');
        const store = transaction.objectStore('medications');
        const request = store.getAll();
        
        request.onsuccess = () => {
            const medications = request.result;
            const now = new Date();
            let startDate;
            
            switch(timeRange) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    startDate = new Date(now.setDate(now.getDate() - 7));
            }
            
            const filtered = medications.filter(med => 
                new Date(med.createdAt) >= startDate
            );
            resolve(filtered);
        };
        request.onerror = () => reject(request.error);
    });
};

// Update Medication Status
const updateMedicationStatus = async (id, status) => {
    const db = await initMedicationDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['medications'], 'readwrite');
        const store = transaction.objectStore('medications');
        const request = store.get(id);
        
        request.onsuccess = () => {
            const medication = request.result;
            medication.status = status;
            const updateRequest = store.put(medication);
            updateRequest.onsuccess = () => resolve(medication);
            updateRequest.onerror = () => reject(updateRequest.error);
        };
        request.onerror = () => reject(request.error);
    });
};

// Update Medication Display
const updateMedicationDisplay = async () => {
    const medications = await getMedications();
    const today = new Date().toDateString();
    
    // Update Today's Schedule
    const todaySchedule = document.getElementById('todaySchedule');
    const todayMeds = medications.filter(med => 
        new Date(med.createdAt).toDateString() === today
    );
    
    todaySchedule.innerHTML = todayMeds.map(med => `
        <div class="medication-item">
            <div class="medication-info">
                <div class="medication-name">${med.name}</div>
                <div class="medication-details">
                    ${med.dosage} • ${med.frequency} • 
                    <span class="medication-time">${med.time}</span>
                </div>
            </div>
            <div class="medication-status">
                <div class="medication-checkbox ${med.status === MEDICATION_STATUS.TAKEN ? 'checked' : ''}"
                     onclick="updateMedicationStatus(${med.id}, '${med.status === MEDICATION_STATUS.TAKEN ? MEDICATION_STATUS.MISSED : MEDICATION_STATUS.TAKEN}')">
                </div>
                <span class="status-badge status-${med.status}">${med.status}</span>
            </div>
        </div>
    `).join('');
    
    // Update All Medications
    const allMedications = document.getElementById('allMedications');
    allMedications.innerHTML = medications.map(med => `
        <div class="medication-item">
            <div class="medication-info">
                <div class="medication-name">${med.name}</div>
                <div class="medication-details">
                    ${med.dosage} • ${med.frequency} • 
                    <span class="medication-time">${med.time}</span>
                </div>
                ${med.notes ? `<div class="medication-notes">${med.notes}</div>` : ''}
            </div>
            <div class="medication-actions">
                <button class="medication-action-button" onclick="editMedication(${med.id})">✏️</button>
                <button class="medication-action-button" onclick="deleteMedication(${med.id})">🗑️</button>
            </div>
        </div>
    `).join('');
};

// Update Medication Statistics
const updateMedicationStats = async (timeRange) => {
    const medications = await getMedications(timeRange);
    const total = medications.length;
    const taken = medications.filter(m => m.status === MEDICATION_STATUS.TAKEN).length;
    const missed = medications.filter(m => m.status === MEDICATION_STATUS.MISSED).length;
    
    const adherence = total > 0 ? Math.round((taken / total) * 100) : 0;
    const onTime = total > 0 ? Math.round(((taken + missed) / total) * 100) : 0;
    
    document.querySelector('.stat-item:nth-child(1) .stat-value').textContent = `${adherence}%`;
    document.querySelector('.stat-item:nth-child(2) .stat-value').textContent = `${onTime}%`;
    document.querySelector('.stat-item:nth-child(3) .stat-value').textContent = missed;
    
    renderAdherenceChart(medications);
};

// Render Adherence Chart
const renderAdherenceChart = (medications) => {
    const ctx = document.getElementById('adherenceChart');
    if (!ctx) return;
    
    // Clear previous chart
    ctx.innerHTML = '';
    
    // Create SVG chart
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    
    // Add chart elements
    const days = 7;
    const adherenceData = Array(days).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (days - 1 - i));
        const dayMeds = medications.filter(m => 
            new Date(m.createdAt).toDateString() === date.toDateString()
        );
        const taken = dayMeds.filter(m => m.status === MEDICATION_STATUS.TAKEN).length;
        return dayMeds.length > 0 ? (taken / dayMeds.length) * 100 : 0;
    });
    
    const points = adherenceData.map((value, i) => {
        const x = (i / (days - 1)) * 100;
        const y = 100 - value;
        return `${x},${y}`;
    }).join(' ');
    
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `M ${points}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', 'var(--primary)');
    path.setAttribute('stroke-width', '2');
    
    svg.appendChild(path);
    ctx.appendChild(svg);
};

// Export Medication Data
const exportMedicationData = async () => {
    const medications = await getMedications('year');
    const csv = [
        ['Name', 'Dosage', 'Frequency', 'Time', 'Status', 'Notes', 'Date'],
        ...medications.map(med => [
            med.name,
            med.dosage,
            med.frequency,
            med.time,
            med.status,
            med.notes || '',
            new Date(med.createdAt).toLocaleDateString()
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medications-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
};

// Mood Tracking Constants
const MOOD_LEVELS = {
    SAD: { emoji: '😢', label: 'Sad', value: 1 },
    MEH: { emoji: '😕', label: 'Meh', value: 2 },
    NEUTRAL: { emoji: '😐', label: 'Neutral', value: 3 },
    GOOD: { emoji: '🙂', label: 'Good', value: 4 },
    GREAT: { emoji: '😄', label: 'Great', value: 5 },
    EXCELLENT: { emoji: '🤩', label: 'Excellent', value: 6 }
};

const FACTOR_LEVELS = {
    POOR: { label: 'Poor', value: 1 },
    FAIR: { label: 'Fair', value: 2 },
    GOOD: { label: 'Good', value: 3 },
    EXCELLENT: { label: 'Excellent', value: 4 }
};

// Initialize Mood Database
async function initMoodDB() {
    const db = await openDB('moodDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('moods')) {
                const store = db.createObjectStore('moods', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date');
                store.createIndex('moodLevel', 'moodLevel');
            }
        }
    });
    return db;
}

// Save Mood Entry
async function saveMoodEntry(moodData) {
    const db = await initMoodDB();
    const tx = db.transaction('moods', 'readwrite');
    const store = tx.objectStore('moods');
    
    const entry = {
        ...moodData,
        date: new Date(),
        timestamp: Date.now()
    };
    
    await store.add(entry);
    await tx.done;
    
    updateMoodDisplay();
    updateMoodStats();
}

// Get Mood Entries
async function getMoodEntries(timeRange = 'week') {
    const db = await initMoodDB();
    const tx = db.transaction('moods', 'readonly');
    const store = tx.objectStore('moods');
    const index = store.index('date');
    
    const startDate = new Date();
    switch (timeRange) {
        case 'week':
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }
    
    const entries = await index.getAll(IDBKeyRange.lowerBound(startDate));
    return entries;
}

// Update Mood Display
async function updateMoodDisplay() {
    const entries = await getMoodEntries('week');
    const moodHistory = document.querySelector('.mood-list');
    if (!moodHistory) return;
    
    moodHistory.innerHTML = entries.map(entry => `
        <div class="mood-entry">
            <div class="mood-entry-info">
                <div class="flex items-center">
                    <span class="mood-entry-emoji">${MOOD_LEVELS[entry.moodLevel].emoji}</span>
                    <div>
                        <div class="font-medium">${MOOD_LEVELS[entry.moodLevel].label}</div>
                        <div class="mood-entry-details">${entry.notes || 'No notes'}</div>
                    </div>
                </div>
                <div class="mood-entry-factors">
                    ${Object.entries(entry.factors).map(([factor, level]) => `
                        <span class="mood-factor-tag">${factor}: ${FACTOR_LEVELS[level].label}</span>
                    `).join('')}
                </div>
            </div>
            <div class="mood-entry-time">
                ${formatDate(entry.date)}
            </div>
        </div>
    `).join('');
}

// Update Mood Statistics
async function updateMoodStats() {
    const entries = await getMoodEntries('month');
    if (entries.length === 0) return;
    
    const averageMood = entries.reduce((sum, entry) => sum + MOOD_LEVELS[entry.moodLevel].value, 0) / entries.length;
    const bestDay = entries.reduce((best, entry) => 
        MOOD_LEVELS[entry.moodLevel].value > MOOD_LEVELS[best.moodLevel].value ? entry : best
    );
    
    const stats = {
        average: averageMood.toFixed(1),
        bestDay: formatDate(bestDay.date),
        trend: calculateMoodTrend(entries)
    };
    
    document.querySelector('.mood-stats-average').textContent = stats.average;
    document.querySelector('.mood-stats-best').textContent = stats.bestDay;
    document.querySelector('.mood-stats-trend').textContent = stats.trend;
    
    renderMoodChart(entries);
}

// Calculate Mood Trend
function calculateMoodTrend(entries) {
    if (entries.length < 2) return 'Insufficient data';
    
    const recentEntries = entries.slice(-7);
    const firstAvg = recentEntries.slice(0, 3).reduce((sum, entry) => sum + MOOD_LEVELS[entry.moodLevel].value, 0) / 3;
    const lastAvg = recentEntries.slice(-3).reduce((sum, entry) => sum + MOOD_LEVELS[entry.moodLevel].value, 0) / 3;
    
    const diff = lastAvg - firstAvg;
    if (diff > 0.5) return 'Improving';
    if (diff < -0.5) return 'Declining';
    return 'Stable';
}

// Render Mood Chart
function renderMoodChart(entries) {
    const chart = document.querySelector('.mood-chart');
    if (!chart) return;
    
    const width = chart.clientWidth;
    const height = 200;
    const padding = 40;
    
    const xScale = (width - padding * 2) / (entries.length - 1);
    const yScale = (height - padding * 2) / 5;
    
    const points = entries.map((entry, i) => ({
        x: padding + i * xScale,
        y: height - padding - (MOOD_LEVELS[entry.moodLevel].value - 1) * yScale
    }));
    
    const path = `M ${points.map(p => `${p.x},${p.y}`).join(' L ')}`;
    
    chart.innerHTML = `
        <svg width="${width}" height="${height}">
            <path d="${path}" 
                  fill="none" 
                  stroke="var(--primary)" 
                  stroke-width="2" />
            ${points.map((p, i) => `
                <circle cx="${p.x}" 
                        cy="${p.y}" 
                        r="4" 
                        fill="var(--primary)" />
            `).join('')}
        </svg>
    `;
}

// Export Mood Data
async function exportMoodData() {
    const entries = await getMoodEntries('year');
    const csv = [
        ['Date', 'Mood', 'Sleep Quality', 'Stress Level', 'Physical Activity', 'Notes'],
        ...entries.map(entry => [
            formatDate(entry.date),
            MOOD_LEVELS[entry.moodLevel].label,
            FACTOR_LEVELS[entry.factors.sleep].label,
            FACTOR_LEVELS[entry.factors.stress].label,
            FACTOR_LEVELS[entry.factors.activity].label,
            entry.notes || ''
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mood-data-${formatDate(new Date())}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}

// Initialize Mood Tracking
function initMoodTracking() {
    const moodForm = document.querySelector('#mood-form');
    if (!moodForm) return;
    
    // Mood Selection
    document.querySelectorAll('.mood-emoji').forEach(emoji => {
        emoji.addEventListener('click', () => {
            document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
            emoji.classList.add('selected');
        });
    });
    
    // Factor Rating
    document.querySelectorAll('.rating-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            const factor = dot.closest('.mood-factor');
            factor.querySelectorAll('.rating-dot').forEach(d => d.classList.remove('active'));
            dot.classList.add('active');
        });
    });
    
    // Form Submission
    moodForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const selectedMood = document.querySelector('.mood-emoji.selected');
        if (!selectedMood) {
            showNotification('Please select a mood', 'error');
            return;
        }
        
        const moodLevel = selectedMood.dataset.mood;
        const factors = {
            sleep: getFactorRating('sleep'),
            stress: getFactorRating('stress'),
            activity: getFactorRating('activity')
        };
        
        const notes = document.querySelector('#mood-notes').value;
        
        await saveMoodEntry({
            moodLevel,
            factors,
            notes
        });
        
        showNotification('Mood entry saved successfully');
        moodForm.reset();
        document.querySelectorAll('.mood-emoji').forEach(e => e.classList.remove('selected'));
        document.querySelectorAll('.rating-dot').forEach(d => d.classList.remove('active'));
    });
    
    // Time Range Selection
    document.querySelectorAll('.time-range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.time-range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateMoodStats();
        });
    });
    
    // Export Button
    const exportBtn = document.querySelector('.export-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportMoodData);
    }
    
    // Initial Updates
    updateMoodDisplay();
    updateMoodStats();
}

// Helper Functions
function getFactorRating(factor) {
    const activeDot = document.querySelector(`#${factor}-rating .rating-dot.active`);
    if (!activeDot) return null;
    return activeDot.dataset.rating;
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initMoodTracking();
});

// Daily Summary Constants
const ACTIVITY_TYPES = {
    WALK: { icon: '🚶', label: 'Walk' },
    WATER: { icon: '💧', label: 'Water Intake' },
    MEDITATION: { icon: '🧘', label: 'Meditation' },
    EXERCISE: { icon: '🏃', label: 'Exercise' },
    SLEEP: { icon: '😴', label: 'Sleep' },
    MEDICATION: { icon: '💊', label: 'Medication' }
};

// Initialize Daily Summary Database
async function initDailySummaryDB() {
    const db = await openDB('dailySummaryDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('dailySummaries')) {
                const store = db.createObjectStore('dailySummaries', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date');
            }
        }
    });
    return db;
}

// Save Daily Summary
async function saveDailySummary(summaryData) {
    const db = await initDailySummaryDB();
    const tx = db.transaction('dailySummaries', 'readwrite');
    const store = tx.objectStore('dailySummaries');
    
    const entry = {
        ...summaryData,
        date: new Date(),
        timestamp: Date.now()
    };
    
    await store.add(entry);
    await tx.done;
    
    updateDailySummaryDisplay();
}

// Get Daily Summary
async function getDailySummary(date) {
    const db = await initDailySummaryDB();
    const tx = db.transaction('dailySummaries', 'readonly');
    const store = tx.objectStore('dailySummaries');
    const index = store.index('date');
    
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const entries = await index.getAll(IDBKeyRange.bound(startOfDay, endOfDay));
    return entries[0] || null;
}

// Update Daily Summary Display
async function updateDailySummaryDisplay() {
    const currentDate = new Date();
    const summary = await getDailySummary(currentDate);
    
    if (!summary) {
        // Initialize empty summary
        await saveDailySummary({
            bloodPressure: null,
            mood: null,
            medications: [],
            activities: [],
            notes: ''
        });
        return;
    }
    
    // Update Blood Pressure
    if (summary.bloodPressure) {
        document.querySelector('.stat-value').textContent = summary.bloodPressure;
        document.querySelector('.stat-details').textContent = `Last reading: ${formatTime(summary.bloodPressureTime)}`;
    }
    
    // Update Mood
    if (summary.mood) {
        document.querySelector('.mood-stat-value').textContent = summary.mood.emoji;
        document.querySelector('.mood-stat-details').textContent = 
            `Sleep: ${summary.mood.factors.sleep}, Stress: ${summary.mood.factors.stress}`;
    }
    
    // Update Medications
    const medicationList = document.querySelector('.medication-list');
    if (medicationList) {
        medicationList.innerHTML = summary.medications.map(med => `
            <div class="medication-item">
                <div class="medication-info">
                    <div class="medication-name">${med.name}</div>
                    <div class="medication-time">${formatTime(med.time)}</div>
                </div>
                <span class="status-badge status-${med.status.toLowerCase()}">${med.status}</span>
            </div>
        `).join('');
    }
    
    // Update Activities
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = summary.activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${ACTIVITY_TYPES[activity.type].icon}</div>
                <div class="activity-info">
                    <div class="activity-name">${ACTIVITY_TYPES[activity.type].label}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                <div class="activity-time">${formatTime(activity.time)}</div>
            </div>
        `).join('');
    }
    
    // Update Notes
    const notesContent = document.querySelector('.notes-content');
    if (notesContent) {
        notesContent.innerHTML = `<p>${summary.notes || 'No notes for today.'}</p>`;
    }
}

// Date Navigation
function initDateNavigation() {
    const prevDateBtn = document.getElementById('prevDate');
    const nextDateBtn = document.getElementById('nextDate');
    const currentDateEl = document.getElementById('currentDate');
    
    let currentDate = new Date();
    
    function updateDateDisplay() {
        currentDateEl.textContent = formatDate(currentDate);
        updateDailySummaryDisplay();
    }
    
    prevDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        updateDateDisplay();
    });
    
    nextDateBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        updateDateDisplay();
    });
    
    // Initial display
    updateDateDisplay();
}

// Helper Functions
function formatTime(date) {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDateNavigation();
    updateDailySummaryDisplay();
});

// Dashboard Constants
const ACTIVITY_TYPES = {
    BLOOD_PRESSURE: { icon: '❤️', label: 'Blood Pressure' },
    MOOD: { icon: '😄', label: 'Mood Entry' },
    MEDICATION: { icon: '💊', label: 'Medication' },
    EXERCISE: { icon: '🏃', label: 'Exercise' },
    WATER: { icon: '💧', label: 'Water Intake' },
    SLEEP: { icon: '😴', label: 'Sleep' }
};

// Initialize Dashboard Database
async function initDashboardDB() {
    const db = await openDB('dashboardDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('activities')) {
                const store = db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date');
                store.createIndex('type', 'type');
            }
            if (!db.objectStoreNames.contains('upcoming')) {
                const store = db.createObjectStore('upcoming', { keyPath: 'id', autoIncrement: true });
                store.createIndex('date', 'date');
                store.createIndex('type', 'type');
            }
        }
    });
    return db;
}

// Save Activity
async function saveActivity(activityData) {
    const db = await initDashboardDB();
    const tx = db.transaction('activities', 'readwrite');
    const store = tx.objectStore('activities');
    
    const activity = {
        ...activityData,
        date: new Date(),
        timestamp: Date.now()
    };
    
    await store.add(activity);
    await tx.done;
    
    updateDashboardDisplay();
}

// Get Recent Activities
async function getRecentActivities(limit = 5) {
    const db = await initDashboardDB();
    const tx = db.transaction('activities', 'readonly');
    const store = tx.objectStore('activities');
    const index = store.index('date');
    
    const activities = await index.getAll();
    return activities
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
}

// Get Upcoming Items
async function getUpcomingItems() {
    const db = await initDashboardDB();
    const tx = db.transaction('upcoming', 'readonly');
    const store = tx.objectStore('upcoming');
    const index = store.index('date');
    
    const now = new Date();
    const items = await index.getAll(IDBKeyRange.lowerBound(now));
    return items.sort((a, b) => a.date - b.date);
}

// Update Dashboard Display
async function updateDashboardDisplay() {
    // Update Health Summary
    const latestBP = await getLatestBloodPressure();
    if (latestBP) {
        document.querySelector('.bp-stat-value').textContent = latestBP.reading;
        document.querySelector('.bp-stat-details').textContent = 
            `Last reading: ${formatTime(latestBP.timestamp)}`;
        document.querySelector('.bp-status-badge').className = 
            `status-badge status-${latestBP.status.toLowerCase()}`;
        document.querySelector('.bp-status-badge').textContent = latestBP.status;
    }
    
    const latestMood = await getLatestMood();
    if (latestMood) {
        document.querySelector('.mood-stat-value').textContent = latestMood.emoji;
        document.querySelector('.mood-stat-details').textContent = 
            `Sleep: ${latestMood.factors.sleep}, Stress: ${latestMood.factors.stress}`;
        document.querySelector('.mood-status-badge').className = 
            `status-badge status-${latestMood.status.toLowerCase()}`;
        document.querySelector('.mood-status-badge').textContent = latestMood.status;
    }
    
    // Update Recent Activities
    const activities = await getRecentActivities();
    const activityList = document.querySelector('.activity-list');
    if (activityList) {
        activityList.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <div class="activity-icon">${ACTIVITY_TYPES[activity.type].icon}</div>
                <div class="activity-info">
                    <div class="activity-name">${ACTIVITY_TYPES[activity.type].label}</div>
                    <div class="activity-details">${activity.details}</div>
                </div>
                <div class="activity-time">${formatTime(activity.timestamp)}</div>
            </div>
        `).join('');
    }
    
    // Update Upcoming Items
    const upcoming = await getUpcomingItems();
    const upcomingList = document.querySelector('.upcoming-list');
    if (upcomingList) {
        upcomingList.innerHTML = upcoming.map(item => `
            <div class="upcoming-item">
                <div class="upcoming-icon">${item.icon}</div>
                <div class="upcoming-info">
                    <div class="upcoming-name">${item.name}</div>
                    <div class="upcoming-details">${formatTime(item.date)}</div>
                </div>
                <div class="upcoming-status">${getTimeUntil(item.date)}</div>
            </div>
        `).join('');
    }
}

// Helper Functions
function getTimeUntil(date) {
    const now = new Date();
    const diff = date - now;
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 24) {
        return 'Tomorrow';
    } else if (hours > 0) {
        return `In ${hours} hours`;
    } else if (minutes > 0) {
        return `In ${minutes} minutes`;
    } else {
        return 'Now';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateDashboardDisplay();
    
    // Refresh dashboard every minute
    setInterval(updateDashboardDisplay, 60000);
});

// Profile Constants
const PROFILE_FIELDS = {
    NAME: 'name',
    EMAIL: 'email',
    DOB: 'dateOfBirth',
    BLOOD_TYPE: 'bloodType',
    ALLERGIES: 'allergies'
};

// Initialize Profile Database
async function initProfileDB() {
    const db = await openDB('profileDB', 1, {
        upgrade(db) {
            if (!db.objectStoreNames.contains('profile')) {
                const store = db.createObjectStore('profile', { keyPath: 'id' });
            }
            if (!db.objectStoreNames.contains('contacts')) {
                const store = db.createObjectStore('contacts', { keyPath: 'id', autoIncrement: true });
                store.createIndex('type', 'type');
            }
            if (!db.objectStoreNames.contains('settings')) {
                const store = db.createObjectStore('settings', { keyPath: 'id' });
            }
        }
    });
    return db;
}

// Save Profile
async function saveProfile(profileData) {
    const db = await initProfileDB();
    const tx = db.transaction('profile', 'readwrite');
    const store = tx.objectStore('profile');
    
    const profile = {
        id: 'current',
        ...profileData,
        updatedAt: new Date()
    };
    
    await store.put(profile);
    await tx.done;
    
    updateProfileDisplay();
}

// Get Profile
async function getProfile() {
    const db = await initProfileDB();
    const tx = db.transaction('profile', 'readonly');
    const store = tx.objectStore('profile');
    
    return await store.get('current');
}

// Save Contact
async function saveContact(contactData) {
    const db = await initProfileDB();
    const tx = db.transaction('contacts', 'readwrite');
    const store = tx.objectStore('contacts');
    
    const contact = {
        ...contactData,
        createdAt: new Date()
    };
    
    await store.add(contact);
    await tx.done;
    
    updateContactsDisplay();
}

// Get Contacts
async function getContacts() {
    const db = await initProfileDB();
    const tx = db.transaction('contacts', 'readonly');
    const store = tx.objectStore('contacts');
    
    return await store.getAll();
}

// Save Setting
async function saveSetting(settingData) {
    const db = await initProfileDB();
    const tx = db.transaction('settings', 'readwrite');
    const store = tx.objectStore('settings');
    
    const setting = {
        id: settingData.id,
        value: settingData.value,
        updatedAt: new Date()
    };
    
    await store.put(setting);
    await tx.done;
    
    updateSettingsDisplay();
}

// Get Settings
async function getSettings() {
    const db = await initProfileDB();
    const tx = db.transaction('settings', 'readonly');
    const store = tx.objectStore('settings');
    
    return await store.getAll();
}

// Update Profile Display
async function updateProfileDisplay() {
    const profile = await getProfile();
    if (!profile) return;
    
    document.querySelector('.profile-name').textContent = profile.name;
    document.querySelector('.profile-email').textContent = profile.email;
    
    // Update Health Information
    const infoItems = document.querySelectorAll('.info-item');
    infoItems.forEach(item => {
        const label = item.querySelector('.info-label').textContent.toLowerCase().replace(/\s+/g, '');
        const value = item.querySelector('.info-value');
        
        switch (label) {
            case 'dateofbirth':
                value.textContent = formatDate(profile.dateOfBirth);
                break;
            case 'bloodtype':
                value.textContent = profile.bloodType;
                break;
            case 'allergies':
                value.textContent = profile.allergies.join(', ') || 'None';
                break;
        }
    });
}

// Update Contacts Display
async function updateContactsDisplay() {
    const contacts = await getContacts();
    const contactList = document.querySelector('.contact-list');
    if (!contactList) return;
    
    contactList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-info">
                <div class="contact-name">${contact.name}</div>
                <div class="contact-relation">${contact.relation}</div>
            </div>
            <a href="tel:${contact.phone}" class="contact-phone">${formatPhone(contact.phone)}</a>
        </div>
    `).join('');
}

// Update Settings Display
async function updateSettingsDisplay() {
    const settings = await getSettings();
    const settingsList = document.querySelector('.settings-list');
    if (!settingsList) return;
    
    settingsList.innerHTML = settings.map(setting => `
        <div class="setting-item">
            <div class="setting-info">
                <span class="setting-label">${setting.label}</span>
                <span class="setting-description">${setting.description}</span>
            </div>
            ${setting.type === 'toggle' ? `
                <label class="toggle">
                    <input type="checkbox" ${setting.value ? 'checked' : ''}>
                    <span class="toggle-slider"></span>
                </label>
            ` : `
                <button class="setting-action">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                    </svg>
                </button>
            `}
        </div>
    `).join('');
    
    // Add event listeners for toggles
    document.querySelectorAll('.toggle input').forEach(toggle => {
        toggle.addEventListener('change', async (e) => {
            const settingId = e.target.closest('.setting-item').dataset.id;
            await saveSetting({
                id: settingId,
                value: e.target.checked
            });
        });
    });
}

// Helper Functions
function formatPhone(phone) {
    return phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    updateProfileDisplay();
    updateContactsDisplay();
    updateSettingsDisplay();
}); 
}); 
// Mobile-specific functionality
class MobileUI {
    constructor() {
        this.menuButton = document.querySelector('.mobile-menu-button');
        this.menu = document.querySelector('.mobile-menu');
        this.menuClose = document.querySelector('.mobile-menu-close');
        this.toast = document.getElementById('mobile-toast');
        this.loading = document.getElementById('mobile-loading');
        this.bottomSheet = document.querySelector('.mobile-bottom-sheet');
        
        this.initializeEventListeners();
    }

    initializeEventListeners() {
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

        // Handle touch events
        document.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        document.addEventListener('touchmove', (e) => this.handleTouchMove(e), { passive: true });
        document.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
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

    // Toast methods
    showToast(message, duration = 3000) {
        if (!this.toast) return;
        
        this.toast.textContent = message;
        this.toast.classList.add('active');
        
        setTimeout(() => {
            this.toast.classList.remove('active');
        }, duration);
    }

    // Loading methods
    showLoading() {
        if (!this.loading) return;
        this.loading.style.display = 'flex';
    }

    hideLoading() {
        if (!this.loading) return;
        this.loading.style.display = 'none';
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

    // Touch handling methods
    handleTouchStart(e) {
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        if (!this.touchStartY) return;
        
        const touchY = e.touches[0].clientY;
        const diff = touchY - this.touchStartY;
        
        if (diff > 0 && this.bottomSheet && this.bottomSheet.classList.contains('active')) {
            e.preventDefault();
            this.bottomSheet.style.transform = `translateY(${diff}px)`;
        }
    }

    handleTouchEnd(e) {
        if (!this.touchStartY) return;
        
        const touchY = e.changedTouches[0].clientY;
        const diff = touchY - this.touchStartY;
        
        if (diff > 100 && this.bottomSheet && this.bottomSheet.classList.contains('active')) {
            this.closeBottomSheet();
        } else if (this.bottomSheet) {
            this.bottomSheet.style.transform = '';
        }
        
        this.touchStartY = null;
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

    // Form handling methods
    setupFormValidation(form) {
        if (!form) return;
        
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            if (!this.validateForm(form)) {
                return;
            }
            
            this.showLoading();
            
            try {
                await this.submitForm(form);
                this.showToast('Form submitted successfully');
                form.reset();
            } catch (error) {
                this.showToast('Failed to submit form');
                console.error(error);
            } finally {
                this.hideLoading();
            }
        });
    }

    validateForm(form) {
        const inputs = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                this.showToast(`${input.name || 'Field'} is required`);
                isValid = false;
            }
        });
        
        return isValid;
    }

    async submitForm(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        
        // Implement your form submission logic here
        // Example: await fetch('/api/submit', { method: 'POST', body: JSON.stringify(data) });
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
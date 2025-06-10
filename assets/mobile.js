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
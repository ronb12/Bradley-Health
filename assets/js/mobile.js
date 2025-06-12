// Constants
const ACTIVITY_TYPES = {
    BLOOD_PRESSURE: 'bloodPressure',
    MEDICATION: 'medication',
    EXERCISE: 'exercise',
    SLEEP: 'sleep',
    WEIGHT: 'weight',
    MOOD: 'mood'
};

// DOM Elements
let elements = {};

// Initialize elements
function initializeElements() {
    elements = {
        menuButton: document.querySelector('.mobile-menu-button'),
        menu: document.querySelector('.mobile-menu'),
        closeButton: document.querySelector('.mobile-menu-close'),
        menuItems: document.querySelectorAll('.mobile-menu-item'),
        bottomNav: document.querySelector('.bottom-nav'),
        themeToggle: document.querySelector('.theme-toggle'),
        userGreeting: document.querySelector('.user-greeting'),
        installButton: document.querySelector('.install-button')
    };
}

// Event Listeners
function setupEventListeners() {
    if (elements.menuButton && elements.menu) {
        elements.menuButton.addEventListener('click', () => {
            elements.menu.classList.add('active');
        });
    }
    
    if (elements.closeButton && elements.menu) {
        elements.closeButton.addEventListener('click', () => {
            elements.menu.classList.remove('active');
        });
    }
    
    if (elements.menuItems) {
        elements.menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (elements.menu) {
                    elements.menu.classList.remove('active');
                }
            });
        });
    }

    if (elements.themeToggle) {
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }

    // Handle PWA installation
    if (elements.installButton) {
        let deferredPrompt;
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            elements.installButton.style.display = 'block';
        });

        elements.installButton.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    console.log('User accepted the install prompt');
                }
                deferredPrompt = null;
                elements.installButton.style.display = 'none';
            }
        });
    }
}

// Update user greeting
function updateUserGreeting() {
    if (elements.userGreeting) {
        const user = firebase.auth().currentUser;
        if (user) {
            const displayName = user.displayName || user.email.split('@')[0];
            elements.userGreeting.textContent = `Welcome back, ${displayName}!`;
        }
    }
}

// Initialize theme
function initializeTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    initializeTheme();
    updateUserGreeting();

    // Listen for auth state changes
    firebase.auth().onAuthStateChanged((user) => {
        if (user) {
            updateUserGreeting();
        }
    });

    // Handle safe area insets
    const updateSafeAreaInsets = () => {
        const root = document.documentElement;
        root.style.setProperty('--safe-area-inset-top', `${window.safeAreaInsets?.top || 0}px`);
        root.style.setProperty('--safe-area-inset-bottom', `${window.safeAreaInsets?.bottom || 0}px`);
        root.style.setProperty('--safe-area-inset-left', `${window.safeAreaInsets?.left || 0}px`);
        root.style.setProperty('--safe-area-inset-right', `${window.safeAreaInsets?.right || 0}px`);
    };
    
    updateSafeAreaInsets();
    window.addEventListener('resize', updateSafeAreaInsets);
}); 
/* Mobile Responsiveness */
@media (max-width: 768px) {
    .container {
        padding: 1rem;
    }
    
    .card {
        margin-bottom: 1rem;
    }
    
    button, 
    .button,
    .nav-item {
        min-height: 44px;
    }
}
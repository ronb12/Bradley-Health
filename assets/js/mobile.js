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
let elements = {
    menuButton: null,
    menu: null,
    closeButton: null,
    menuItems: null,
    bottomNav: null,
    header: null,
    mainContent: null
};

// Initialize DOM elements
function initializeElements() {
    elements = {
        menuButton: document.querySelector('.menu-button'),
        menu: document.querySelector('.mobile-menu'),
        closeButton: document.querySelector('.menu-close'),
        menuItems: document.querySelectorAll('.mobile-menu-item'),
        bottomNav: document.querySelector('.bottom-nav'),
        header: document.querySelector('.mobile-header'),
        mainContent: document.querySelector('.main-content')
    };
}

// Event Listeners
function setupEventListeners() {
    if (elements.menuButton) {
        elements.menuButton.addEventListener('click', toggleMenu);
    }
    
    if (elements.closeButton) {
        elements.closeButton.addEventListener('click', closeMenu);
    }
    
    if (elements.menuItems) {
        elements.menuItems.forEach(item => {
            item.addEventListener('click', closeMenu);
        });
    }
    
    // Handle bottom navigation
    if (elements.bottomNav) {
        elements.bottomNav.addEventListener('click', (e) => {
            const navItem = e.target.closest('.nav-item');
            if (navItem) {
                const href = navItem.getAttribute('href');
                if (href) {
                    window.location.href = href;
                }
            }
        });
    }
}

// Menu Functions
function toggleMenu() {
    if (elements.menu) {
        elements.menu.classList.toggle('active');
    }
}

function closeMenu() {
    if (elements.menu) {
        elements.menu.classList.remove('active');
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    
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
class AuthManager {
    constructor() {
        this.auth = firebase.auth();
        this.currentUser = null;
        this.init();
    }

    async init() {
        // Listen for auth state changes
        this.auth.onAuthStateChanged((user) => {
            this.currentUser = user;
            this.updateUI(user);
        });
    }

    updateUI(user) {
        const authElements = document.querySelectorAll('[data-auth]');
        authElements.forEach(element => {
            const authType = element.dataset.auth;
            if (authType === 'logged-in' && user) {
                element.style.display = '';
            } else if (authType === 'logged-out' && !user) {
                element.style.display = '';
            } else {
                element.style.display = 'none';
            }
        });
    }

    async signIn(email, password) {
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async signUp(email, password, displayName) {
        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
            await userCredential.user.updateProfile({ displayName });
            return userCredential.user;
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async signOut() {
        try {
            await this.auth.signOut();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async resetPassword(email) {
        try {
            await this.auth.sendPasswordResetEmail(email);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async updatePassword(newPassword) {
        try {
            await this.currentUser.updatePassword(newPassword);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async updateEmail(newEmail) {
        try {
            await this.currentUser.updateEmail(newEmail);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async updateProfile(profileData) {
        try {
            await this.currentUser.updateProfile(profileData);
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async deleteAccount() {
        try {
            await this.currentUser.delete();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    async verifyEmail() {
        try {
            await this.currentUser.sendEmailVerification();
        } catch (error) {
            throw this.handleAuthError(error);
        }
    }

    handleAuthError(error) {
        console.error('Auth Error:', error);
        let message = 'An error occurred during authentication.';
        
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No account found with this email.';
                break;
            case 'auth/wrong-password':
                message = 'Incorrect password.';
                break;
            case 'auth/email-already-in-use':
                message = 'This email is already registered.';
                break;
            case 'auth/weak-password':
                message = 'Password should be at least 6 characters.';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address.';
                break;
            case 'auth/requires-recent-login':
                message = 'Please sign in again to perform this action.';
                break;
        }
        
        return new Error(message);
    }

    isAuthenticated() {
        return !!this.currentUser;
    }

    getCurrentUser() {
        return this.currentUser;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Authentication Helper Functions

/**
 * Initializes the authentication system
 * Checks user state and redirects as needed
 */
function initializeAuth() {
    // Initialize Firebase if it hasn't been initialized yet
    if (typeof initializeFirebase === 'function') {
        initializeFirebase().then(() => {
            // Set up auth state listener
            firebase.auth().onAuthStateChanged(handleAuthStateChanged);
        }).catch(error => {
            console.error('Firebase initialization failed:', error);
            showAuthError('Firebase initialization failed. Please try again later.');
        });
    } else {
        console.error('Firebase initialization function not found');
    }
}

/**
 * Handles authentication state changes
 * @param {Object} user - Firebase user object or null if signed out
 */
function handleAuthStateChanged(user) {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (user) {
        // User is signed in
        console.log('User signed in:', user.email);
        
        // If on login page, redirect to dashboard
        if (currentPage === 'login.html' || currentPage === '') {
            window.location.href = 'dashboard.html';
        }
        
        // Show user info in UI if applicable
        updateUserInfo(user);
        
    } else {
        // User is signed out
        console.log('User signed out');
        
        // If NOT on login page and not on public pages, redirect to login
        if (currentPage !== 'login.html' && 
            currentPage !== 'index.html' && 
            currentPage !== 'privacy-policy.html' && 
            currentPage !== 'terms.html') {
            window.location.href = 'login.html';
        }
    }
}

/**
 * Updates the UI with user information
 * @param {Object} user - Firebase user object
 */
function updateUserInfo(user) {
    // Find user info elements in the DOM
    const userNameElements = document.querySelectorAll('.user-name');
    const userEmailElements = document.querySelectorAll('.user-email');
    const userAvatarElements = document.querySelectorAll('.user-avatar');
    
    // Update user name elements
    userNameElements.forEach(element => {
        element.textContent = user.displayName || user.email.split('@')[0];
    });
    
    // Update user email elements
    userEmailElements.forEach(element => {
        element.textContent = user.email;
    });
    
    // Update user avatar elements
    userAvatarElements.forEach(element => {
        if (user.photoURL) {
            element.src = user.photoURL;
            element.alt = user.displayName || user.email.split('@')[0];
        } else {
            // Set default avatar with initials
            const initials = (user.displayName || user.email.split('@')[0]).substring(0, 2).toUpperCase();
            element.outerHTML = `<div class="avatar-placeholder">${initials}</div>`;
        }
    });
}

/**
 * Signs in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} - Promise resolving to auth result
 */
function signInWithEmailPassword(email, password) {
    return firebase.auth().signInWithEmailAndPassword(email, password);
}

/**
 * Signs in with Google
 * @returns {Promise} - Promise resolving to auth result
 */
function signInWithGoogle() {
    const provider = new firebase.auth.GoogleAuthProvider();
    return firebase.auth().signInWithPopup(provider);
}

/**
 * Shows authentication error message
 * @param {string} message - Error message to display
 */
function showAuthError(message) {
    const errorElement = document.getElementById('auth-error');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    } else {
        // Create error element if it doesn't exist
        const newErrorElement = document.createElement('div');
        newErrorElement.id = 'auth-error';
        newErrorElement.className = 'error-message';
        newErrorElement.textContent = message;
        
        // Find a suitable container
        const container = document.querySelector('.container') || document.body;
        container.prepend(newErrorElement);
    }
}

// Handle login form submission
function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Show loading state
    const loadingOverlay = document.getElementById('loadingOverlay');
    if (loadingOverlay) loadingOverlay.style.display = 'flex';
    
    // Clear previous errors
    const errorElement = document.getElementById('auth-error');
    if (errorElement) errorElement.style.display = 'none';
    
    signInWithEmailPassword(email, password)
        .then(() => {
            console.log('✅ Login successful');
        })
        .catch(error => {
            console.error('❌ Login error:', error);
            showAuthError(`Login failed: ${error.message}`);
        })
        .finally(() => {
            // Hide loading state
            if (loadingOverlay) loadingOverlay.style.display = 'none';
        });
}

// Initialize auth when page loads
document.addEventListener('DOMContentLoaded', initializeAuth); 
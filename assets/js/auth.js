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
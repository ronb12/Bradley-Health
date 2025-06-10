global.fetch = require('node-fetch');

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword, signOut } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs } = require('firebase/firestore');

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC--9xnMW4s8UPOJUnQbKjMpXgJvoh6ITw",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "294249919277",
  appId: "1:294249919277:web:exampleappid"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

describe('Authentication Tests', () => {
  beforeAll(async () => {
    // Clean up any existing sessions
    await signOut(auth);
  });

  test('should login with valid credentials', async () => {
    const email = 'test@example.com';
    const password = 'testpassword123';
    
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      expect(userCredential.user).toBeTruthy();
      expect(userCredential.user.email).toBe(email);
    } catch (error) {
      throw new Error('Login failed: ' + error.message);
    }
  });

  test('should fail login with invalid credentials', async () => {
    const email = 'wrong@example.com';
    const password = 'wrongpassword';
    
    try {
      await signInWithEmailAndPassword(auth, email, password);
      throw new Error('Login should have failed with invalid credentials');
    } catch (error) {
      expect(error.code).toBe('auth/user-not-found');
    }
  });

  test('should logout successfully', async () => {
    try {
      await signOut(auth);
      expect(auth.currentUser).toBeNull();
    } catch (error) {
      throw new Error('Logout failed: ' + error.message);
    }
  });
}); 
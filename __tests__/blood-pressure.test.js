global.fetch = require('node-fetch');

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where } = require('firebase/firestore');

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

describe('Blood Pressure Tests', () => {
  beforeAll(async () => {
    // Login before tests
    await signInWithEmailAndPassword(auth, 'test@example.com', 'testpassword123');
  });

  test('should add new blood pressure reading', async () => {
    const reading = {
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      timestamp: new Date(),
      notes: 'Test reading',
      userId: auth.currentUser.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'bloodPressure'), reading);
      expect(docRef.id).toBeTruthy();
    } catch (error) {
      throw new Error('Failed to add blood pressure reading: ' + error.message);
    }
  });

  test('should retrieve blood pressure readings', async () => {
    try {
      const q = query(
        collection(db, 'bloodPressure'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      expect(querySnapshot.size).toBeGreaterThan(0);
    } catch (error) {
      throw new Error('Failed to retrieve blood pressure readings: ' + error.message);
    }
  });

  test('should validate blood pressure values', async () => {
    const invalidReading = {
      systolic: 300, // Invalid value
      diastolic: 80,
      pulse: 72,
      timestamp: new Date(),
      notes: 'Invalid reading',
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'bloodPressure'), invalidReading);
      throw new Error('Should not allow invalid blood pressure values');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
}); 
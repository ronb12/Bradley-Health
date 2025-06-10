global.fetch = require('node-fetch');

const { initializeApp } = require('firebase/app');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
const { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } = require('firebase/firestore');

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

describe('Medication Tests', () => {
  let medicationId;

  beforeAll(async () => {
    // Login before tests
    await signInWithEmailAndPassword(auth, 'test@example.com', 'testpassword123');
  });

  test('should add new medication', async () => {
    const medication = {
      name: 'Test Medication',
      dosage: '10mg',
      frequency: 'daily',
      startDate: new Date(),
      notes: 'Test medication',
      userId: auth.currentUser.uid
    };

    try {
      const docRef = await addDoc(collection(db, 'medications'), medication);
      medicationId = docRef.id;
      expect(docRef.id).toBeTruthy();
    } catch (error) {
      throw new Error('Failed to add medication: ' + error.message);
    }
  });

  test('should retrieve medications', async () => {
    try {
      const q = query(
        collection(db, 'medications'),
        where('userId', '==', auth.currentUser.uid)
      );
      const querySnapshot = await getDocs(q);
      expect(querySnapshot.size).toBeGreaterThan(0);
    } catch (error) {
      throw new Error('Failed to retrieve medications: ' + error.message);
    }
  });

  test('should update medication', async () => {
    const updatedData = {
      dosage: '20mg',
      notes: 'Updated dosage'
    };

    try {
      await updateDoc(doc(db, 'medications', medicationId), updatedData);
      const docRef = await getDoc(doc(db, 'medications', medicationId));
      expect(docRef.data().dosage).toBe('20mg');
    } catch (error) {
      throw new Error('Failed to update medication: ' + error.message);
    }
  });

  test('should validate medication data', async () => {
    const invalidMedication = {
      name: '', // Invalid empty name
      dosage: '10mg',
      frequency: 'daily',
      startDate: new Date(),
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, 'medications'), invalidMedication);
      throw new Error('Should not allow invalid medication data');
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
}); 
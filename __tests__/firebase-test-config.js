// Firebase test configuration
const firebaseConfig = {
  apiKey: "AIzaSyDummyKeyForTesting123456789",
  authDomain: "bradley-health-test.firebaseapp.com",
  projectId: "bradley-health-test",
  storageBucket: "bradley-health-test.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890",
  measurementId: "G-ABCDEF1234"
};

// Test user credentials
const testUser = {
  email: "test@bradleyhealth.com",
  password: "Test@123",
  uid: "test-user-123"
};

// Mock Firestore data
const mockMedications = [
  {
    id: "med1",
    name: "Test Medication",
    dosage: "10mg",
    frequency: "daily",
    userId: testUser.uid
  }
];

const mockBloodPressureReadings = [
  {
    id: "bp1",
    systolic: 120,
    diastolic: 80,
    pulse: 72,
    timestamp: new Date().toISOString(),
    userId: testUser.uid
  }
];

module.exports = {
  firebaseConfig,
  testUser,
  mockMedications,
  mockBloodPressureReadings
}; 
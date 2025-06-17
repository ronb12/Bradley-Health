// Add fetch polyfill
global.fetch = require('node-fetch');

// Mock Firebase Auth
const mockUser = {
  uid: 'test-user-123',
  email: 'test@bradleyhealth.com',
  emailVerified: true
};

const mockUserCredential = {
  user: mockUser,
  credential: {
    accessToken: 'mock-access-token'
  }
};

// Mock Firestore
const mockDocRef = {
  id: 'test-doc-id',
  data: () => ({
    name: 'Test Medication',
    dosage: '10mg',
    frequency: 'daily',
    userId: mockUser.uid
  })
};

const mockQuerySnapshot = {
  size: 1,
  docs: [mockDocRef],
  forEach: (callback) => callback(mockDocRef)
};

// Mock Firebase Auth
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({
    currentUser: mockUser
  })),
  signInWithEmailAndPassword: jest.fn(() => Promise.resolve(mockUserCredential)),
  signOut: jest.fn(() => Promise.resolve()),
  onAuthStateChanged: jest.fn((callback) => {
    callback(mockUser);
    return () => {};
  })
}));

// Mock Firestore
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(() => 'mock-collection'),
  doc: jest.fn(() => 'mock-doc'),
  addDoc: jest.fn(() => Promise.resolve(mockDocRef)),
  getDoc: jest.fn(() => Promise.resolve(mockDocRef)),
  getDocs: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
  updateDoc: jest.fn(() => Promise.resolve()),
  deleteDoc: jest.fn(() => Promise.resolve()),
  query: jest.fn(() => 'mock-query'),
  where: jest.fn(() => 'mock-query'),
  orderBy: jest.fn(() => 'mock-query'),
  limit: jest.fn(() => 'mock-query')
}));

// Mock Firebase App
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({
    name: 'test-app',
    options: {}
  }))
}));

// Set test timeout
jest.setTimeout(10000);

// Suppress console errors during tests
console.error = jest.fn(); 
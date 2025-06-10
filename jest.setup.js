// Add fetch polyfill
global.fetch = require('node-fetch');

// Mock Firebase Auth
const mockUser = {
  uid: 'test-user-id',
  email: 'test@example.com',
  isAnonymous: false
};

const mockAuth = {
  currentUser: mockUser,
  onAuthStateChanged: jest.fn((callback) => callback(mockUser))
};

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => mockAuth),
  signInWithEmailAndPassword: jest.fn((auth, email, password) => {
    if (email === 'test@example.com' && password === 'testpassword123') {
      return Promise.resolve({ user: mockUser });
    }
    return Promise.reject({ code: 'auth/user-not-found' });
  }),
  signOut: jest.fn(() => {
    mockAuth.currentUser = null;
    return Promise.resolve();
  })
}));

// Mock Firestore
const mockDocRef = {
  id: 'test-doc-id',
  data: () => ({
    dosage: '20mg',
    notes: 'Updated dosage'
  })
};

const mockQuerySnapshot = {
  size: 1,
  docs: [mockDocRef]
};

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(() => 'mock-collection'),
  addDoc: jest.fn(() => Promise.resolve({ id: 'test-doc-id' })),
  getDocs: jest.fn(() => Promise.resolve(mockQuerySnapshot)),
  getDoc: jest.fn(() => Promise.resolve(mockDocRef)),
  query: jest.fn(() => 'mock-query'),
  where: jest.fn(() => 'mock-where'),
  updateDoc: jest.fn(() => Promise.resolve()),
  doc: jest.fn(() => 'mock-doc')
}));

// Set test timeout
jest.setTimeout(10000);

// Suppress console errors during tests
console.error = jest.fn(); 
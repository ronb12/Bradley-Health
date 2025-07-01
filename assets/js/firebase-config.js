// Firebase Configuration for Bradley Health
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "bradley-health.firebaseapp.com",
  projectId: "bradley-health",
  storageBucket: "bradley-health.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop",
  measurementId: "G-XXXXXXXXXX"
};

// Demo mode configuration for testing
const demoMode = {
  enabled: true,
  users: [
    {
      email: 'demo@bradleyhealth.com',
      password: 'demo123',
      name: 'Demo User',
      uid: 'demo-user-123'
    }
  ]
};

// Initialize Firebase services
let auth, db, storage, messaging;
let firebaseInitialized = false;

try {
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Initialize Firebase services
  auth = firebase.auth();
  db = firebase.firestore();
  storage = firebase.storage();
  messaging = firebase.messaging();

  // Enable offline persistence
  db.enablePersistence()
    .catch((err) => {
      if (err.code == 'failed-precondition') {
        console.log('Multiple tabs open, persistence can only be enabled in one tab at a time.');
      } else if (err.code == 'unimplemented') {
        console.log('The current browser does not support persistence.');
      }
    });

  firebaseInitialized = true;
  console.log('Firebase initialized successfully');
} catch (error) {
  console.warn('Firebase initialization failed, using demo mode:', error);
  firebaseInitialized = false;
}

// Demo mode authentication
class DemoAuth {
  constructor() {
    this.currentUser = null;
    this.listeners = [];
  }

  onAuthStateChanged(callback) {
    this.listeners.push(callback);
    // Call immediately with current state
    callback(this.currentUser);
  }

  signInWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      const user = demoMode.users.find(u => u.email === email && u.password === password);
      if (user) {
        this.currentUser = { ...user, displayName: user.name };
        this.listeners.forEach(callback => callback(this.currentUser));
        resolve({ user: this.currentUser });
      } else {
        reject({ code: 'auth/wrong-password', message: 'Invalid email or password' });
      }
    });
  }

  createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      if (demoMode.users.find(u => u.email === email)) {
        reject({ code: 'auth/email-already-in-use', message: 'Email already in use' });
      } else {
        const newUser = {
          email,
          password,
          name: email.split('@')[0],
          uid: 'demo-user-' + Date.now()
        };
        demoMode.users.push(newUser);
        this.currentUser = { ...newUser, displayName: newUser.name };
        this.listeners.forEach(callback => callback(this.currentUser));
        resolve({ user: this.currentUser });
      }
    });
  }

  signOut() {
    return new Promise((resolve) => {
      this.currentUser = null;
      this.listeners.forEach(callback => callback(null));
      resolve();
    });
  }
}

// Demo mode Firestore
class DemoFirestore {
  constructor() {
    this.data = {
      users: {},
      bloodPressure: {},
      medications: {},
      moodEntries: {},
      goals: {}
    };
  }

  collection(name) {
    return {
      doc: (id) => this.doc(name, id),
      where: (field, op, value) => this.where(name, field, op, value),
      orderBy: (field, direction) => this.orderBy(name, field, direction),
      limit: (count) => this.limit(name, count),
      get: () => this.get(name),
      add: (data) => this.add(name, data),
      set: (id, data) => this.set(name, id, data),
      update: (id, data) => this.update(name, id, data),
      delete: (id) => this.delete(name, id)
    };
  }

  doc(collection, id) {
    return {
      get: () => this.getDoc(collection, id),
      set: (data) => this.setDoc(collection, id, data),
      update: (data) => this.updateDoc(collection, id, data),
      delete: () => this.deleteDoc(collection, id)
    };
  }

  where(collection, field, op, value) {
    return {
      orderBy: (field, direction) => this.orderBy(collection, field, direction),
      limit: (count) => this.limit(collection, count),
      get: () => this.getFiltered(collection, field, op, value)
    };
  }

  orderBy(collection, field, direction) {
    return {
      limit: (count) => this.limit(collection, count),
      get: () => this.getOrdered(collection, field, direction)
    };
  }

  limit(collection, count) {
    return {
      get: () => this.getLimited(collection, count)
    };
  }

  get(collection) {
    return Promise.resolve({
      docs: Object.values(this.data[collection] || {}).map(doc => ({
        id: doc.id,
        data: () => doc,
        exists: true
      })),
      empty: Object.keys(this.data[collection] || {}).length === 0,
      size: Object.keys(this.data[collection] || {}).length
    });
  }

  getDoc(collection, id) {
    const doc = this.data[collection]?.[id];
    return Promise.resolve({
      id,
      data: () => doc,
      exists: !!doc
    });
  }

  add(collection, data) {
    const id = Date.now().toString();
    if (!this.data[collection]) this.data[collection] = {};
    this.data[collection][id] = { ...data, id };
    return Promise.resolve({ id });
  }

  set(collection, id, data) {
    if (!this.data[collection]) this.data[collection] = {};
    this.data[collection][id] = { ...data, id };
    return Promise.resolve();
  }

  update(collection, id, data) {
    if (this.data[collection]?.[id]) {
      this.data[collection][id] = { ...this.data[collection][id], ...data };
    }
    return Promise.resolve();
  }

  delete(collection, id) {
    if (this.data[collection]?.[id]) {
      delete this.data[collection][id];
    }
    return Promise.resolve();
  }

  getFiltered(collection, field, op, value) {
    const docs = Object.values(this.data[collection] || {}).filter(doc => {
      if (op === '==') return doc[field] === value;
      return true;
    });
    return Promise.resolve({
      docs: docs.map(doc => ({
        id: doc.id,
        data: () => doc,
        exists: true
      })),
      empty: docs.length === 0,
      size: docs.length
    });
  }

  getOrdered(collection, field, direction) {
    const docs = Object.values(this.data[collection] || {}).sort((a, b) => {
      if (direction === 'desc') return b[field] - a[field];
      return a[field] - b[field];
    });
    return Promise.resolve({
      docs: docs.map(doc => ({
        id: doc.id,
        data: () => doc,
        exists: true
      })),
      empty: docs.length === 0,
      size: docs.length
    });
  }

  getLimited(collection, count) {
    const docs = Object.values(this.data[collection] || {}).slice(0, count);
    return Promise.resolve({
      docs: docs.map(doc => ({
        id: doc.id,
        data: () => doc,
        exists: true
      })),
      empty: docs.length === 0,
      size: docs.length
    });
  }
}

// Use Firebase or fallback to demo mode
if (firebaseInitialized) {
  // Export Firebase services
  window.firebaseServices = {
    auth,
    db,
    storage,
    messaging
  };
} else {
  // Export demo services
  window.firebaseServices = {
    auth: new DemoAuth(),
    db: new DemoFirestore(),
    storage: null,
    messaging: null
  };
  console.log('Using demo mode - Firebase not available');
}

// Global Firebase reference for compatibility
window.firebase = {
  auth: () => window.firebaseServices.auth,
  firestore: () => window.firebaseServices.db
}; 
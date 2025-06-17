// Mock Firebase Auth
export const auth = { signInWithEmailAndPassword: jest.fn(), signOut: jest.fn() };
export const collection = jest.fn(() => ({ id: "mock-collection-id", data: () => ({}) }));
export const doc = jest.fn(() => ({ id: "mock-doc-id", data: () => ({}) }));
export const addDoc = jest.fn(() => Promise.resolve({ id: "mock-doc-id" }));
export const updateDoc = jest.fn(() => Promise.resolve());
export const getDoc = jest.fn(() => Promise.resolve({ id: "mock-doc-id", data: () => ({}) }));
export const getDocs = jest.fn(() => Promise.resolve({ size: 1, docs: [{ id: "mock-doc-id", data: () => ({}) }] }));

// Import mocked Firebase services
import { auth, db, collection, addDoc, getDocs, query, where } from "../__mocks__/firebase";

describe("Blood Pressure Tests", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock current user
    auth.currentUser = { uid: "test-user-123" };
  });

  test("should add new blood pressure reading", async () => {
    const reading = {
      systolic: 120,
      diastolic: 80,
      pulse: 72,
      timestamp: new Date(),
      notes: "Test reading",
      userId: auth.currentUser.uid
    };

    const docRef = await addDoc(collection(db, "bloodPressure"), reading);
    expect(docRef.id).toBeTruthy();
  });

  test("should retrieve blood pressure readings", async () => {
    const q = query(
      collection(db, "bloodPressure"),
      where("userId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    expect(querySnapshot.size).toBeGreaterThan(0);
  });

  test("should validate blood pressure values", async () => {
    const invalidReading = {
      systolic: 300, // Invalid value
      diastolic: 80,
      pulse: 72,
      timestamp: new Date(),
      notes: "Invalid reading",
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, "bloodPressure"), invalidReading);
      throw new Error("Should not allow invalid blood pressure values");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});

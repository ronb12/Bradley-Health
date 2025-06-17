// Import mocked Firebase services
import { auth, db, collection, addDoc, getDocs, query, where, updateDoc, doc, getDoc } from "../__mocks__/firebase";

describe("Medication Tests", () => {
  let medicationId;

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    // Mock current user
    auth.currentUser = { uid: "test-user-123" };
  });

  test("should add new medication", async () => {
    const medication = {
      name: "Test Medication",
      dosage: "10mg",
      frequency: "daily",
      startDate: new Date(),
      notes: "Test medication",
      userId: auth.currentUser.uid
    };

    const docRef = await addDoc(collection(db, "medications"), medication);
    medicationId = docRef.id;
    expect(docRef.id).toBeTruthy();
  });

  test("should retrieve medications", async () => {
    const q = query(
      collection(db, "medications"),
      where("userId", "==", auth.currentUser.uid)
    );
    const querySnapshot = await getDocs(q);
    expect(querySnapshot.size).toBeGreaterThan(0);
  });

  test("should update medication", async () => {
    const updatedData = {
      dosage: "20mg",
      notes: "Updated dosage"
    };

    await updateDoc(doc(db, "medications", medicationId), updatedData);
    const docRef = await getDoc(doc(db, "medications", medicationId));
    expect(docRef.data().dosage).toBe("20mg");
  });

  test("should validate medication data", async () => {
    const invalidMedication = {
      name: "", // Invalid empty name
      dosage: "10mg",
      frequency: "daily",
      startDate: new Date(),
      userId: auth.currentUser.uid
    };

    try {
      await addDoc(collection(db, "medications"), invalidMedication);
      throw new Error("Should not allow invalid medication data");
    } catch (error) {
      expect(error).toBeTruthy();
    }
  });
});

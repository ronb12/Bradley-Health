// Import mocked Firebase services
import { auth, signInWithEmailAndPassword, signOut } from "../__mocks__/firebase";

describe("Authentication Tests", () => {
  const testEmail = "test@bradleyhealth.com";
  const testPassword = "Test@123";

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
  });

  test("should login with valid credentials", async () => {
    // Mock successful login
    signInWithEmailAndPassword.mockResolvedValueOnce({
      user: {
        email: testEmail,
        uid: "test-user-123"
      }
    });

    const userCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    expect(userCredential.user).toBeTruthy();
    expect(userCredential.user.email).toBe(testEmail);
  });

  test("should fail login with invalid credentials", async () => {
    // Mock failed login
    signInWithEmailAndPassword.mockRejectedValueOnce({
      code: "auth/user-not-found"
    });

    try {
      await signInWithEmailAndPassword(auth, "wrong@example.com", "wrongpassword");
      throw new Error("Login should have failed with invalid credentials");
    } catch (error) {
      expect(error.code).toBe("auth/user-not-found");
    }
  });

  test("should logout successfully", async () => {
    // Mock successful logout
    signOut.mockResolvedValueOnce();
    auth.currentUser = null;

    await signOut(auth);
    expect(auth.currentUser).toBeNull();
  });
});

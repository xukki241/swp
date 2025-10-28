import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as authService from "@/services/authService.js";

describe("AuthService", () => {
  describe("register", () => {
    it("should create first user as owner/admin", async () => {
      const registrationData = {
        name: "First User",
        email: "first@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockEmailSelect);

      // Mock phone check - no existing phone
      const mockPhoneSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockPhoneSelect);

      // Mock email registration check
      const mockRegEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockRegEmailSelect);

      // Mock phone registration check
      const mockRegPhoneSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockRegPhoneSelect);

      // Mock active user count - first user
      const mockCountSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      };
      db.select.mockReturnValueOnce(mockCountSelect);

      // Mock bcrypt hash
      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedPassword");

      // Mock user insertion
      const mockUserInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: "First User",
            email: "first@example.com",
            role: "owner",
            status: "active",
          },
        ]),
      };
      db.insert.mockReturnValueOnce(mockUserInsert);

      // Mock credentials insertion
      const mockCredInsert = {
        values: vi.fn().mockResolvedValue({}),
      };
      db.insert.mockReturnValueOnce(mockCredInsert);

      const result = await authService.register(registrationData);

      expect(result.success).toBe(true);
      expect(result.user.role).toBe("owner");
    });

    it("should create registration request for subsequent users", async () => {
      const registrationData = {
        name: "Second User",
        email: "second@example.com",
        phone: "0987654321",
        address: "456 Oak St",
        password: "password456",
      };

      // Mock email check - no existing user
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockEmailSelect);

      // Mock phone check
      const mockPhoneSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockPhoneSelect);

      // Mock registration checks
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock active user count - not first user
      const mockCountSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select.mockReturnValueOnce(mockCountSelect);

      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedPassword");

      // Mock registration insertion
      const mockRegInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: "Second User",
            email: "second@example.com",
            status: "pending",
          },
        ]),
      };
      db.insert.mockReturnValueOnce(mockRegInsert);

      const result = await authService.register(registrationData);

      expect(result.success).toBe(true);
      expect(result.message).toContain("approval");
    });

    it("should reject duplicate email", async () => {
      const registrationData = {
        name: "User",
        email: "existing@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - existing user
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([{ id: 1, email: "existing@example.com" }]),
      };
      db.select.mockReturnValueOnce(mockEmailSelect);

      await expect(authService.register(registrationData)).rejects.toThrow();
    });
  });

  describe("login", () => {
    it("should login user with valid credentials", async () => {
      const email = "user@example.com";
      const password = "password123";

      const bcrypt = await import("bcryptjs");
      const jwt = await import("jsonwebtoken");

      // Set up bcrypt and jwt mocks FIRST - before authService is called
      bcrypt.default.compare.mockReturnValueOnce(Promise.resolve(true));
      jwt.default.sign.mockReturnValueOnce("mock-jwt-token");

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            name: "Test User",
            email: "user@example.com",
            phone: "1234567890",
            role: "staff",
            status: "active",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock credentials selection with valid credentials
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            userId: 1,
            secret: "hashedPassword",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      const result = await authService.login(email, password);

      expect(result.success).toBe(true);
      expect(result.message).toBe("Login successful");
      expect(result.token).toBe("mock-jwt-token");
      expect(result.user.email).toBe(email);
    });

    it("should fail login when credentials not found", async () => {
      const email = "user@example.com";
      const password = "password123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "user@example.com",
            role: "staff",
            status: "active",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock credentials selection - no credentials found will cause error
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      // This should fail because no credentials found
      await expect(authService.login(email, password)).rejects.toThrow(
        "Invalid email or password"
      );
    });

    it("should reject invalid credentials", async () => {
      const email = "user@example.com";
      const password = "wrongpassword";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "user@example.com",
            status: "active",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock credentials selection
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            userId: 1,
            secret: "hashedPassword",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      const bcrypt = await import("bcrypt");
      bcrypt.default.compare.mockResolvedValueOnce(false);

      await expect(authService.login(email, password)).rejects.toThrow();
    });

    it("should reject inactive user", async () => {
      const email = "user@example.com";
      const password = "password123";

      // Mock user selection - inactive user
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: 1,
            email: "user@example.com",
            status: "inactive",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      await expect(authService.login(email, password)).rejects.toThrow();
    });
  });

  describe("verifyToken", () => {
    it("should verify valid token", async () => {
      const token = "valid-token";
      const decoded = { userId: "1", email: "user@example.com", role: "staff" };

      const jwt = await import("jsonwebtoken");
      jwt.default.verify.mockReturnValue(decoded);

      const result = await authService.verifyToken(token);

      expect(result).toEqual(decoded);
    });

    it("should reject invalid token", async () => {
      const token = "invalid-token";

      const jwt = await import("jsonwebtoken");
      jwt.default.verify.mockImplementation(() => {
        throw new Error("Invalid token");
      });

      await expect(authService.verifyToken(token)).rejects.toThrow();
    });
  });

  describe("changePassword", () => {
    it("should change password successfully", async () => {
      const userId = "1";
      const oldPassword = "oldpass123";
      const newPassword = "newpass456";

      const bcrypt = await import("bcryptjs");

      // Set up bcrypt mocks FIRST
      bcrypt.default.compare.mockReturnValueOnce(Promise.resolve(true));
      bcrypt.default.hash.mockReturnValueOnce(
        Promise.resolve("hashedNewPassword")
      );

      // Mock credentials selection
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            userId: "1",
            secret: "hashedOldPassword",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      // Mock update credentials
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValueOnce(mockUpdate);

      const result = await authService.changePassword(
        userId,
        oldPassword,
        newPassword
      );

      expect(result.success).toBe(true);
      expect(result.message).toBe("Password changed successfully");
    });

    it("should reject invalid old password", async () => {
      const userId = "1";
      const oldPassword = "wrongpass";
      const newPassword = "newpass456";

      // Mock credentials selection
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            userId: "1",
            secret: "hashedOldPassword",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      const bcrypt = await import("bcrypt");
      bcrypt.default.compare.mockResolvedValueOnce(false);

      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow();
    });

    it("should reject when user credentials not found", async () => {
      const userId = "1";
      const oldPassword = "oldpass123";
      const newPassword = "newpass456";

      // Mock credentials selection - no credentials found
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      await expect(
        authService.changePassword(userId, oldPassword, newPassword)
      ).rejects.toThrow();
    });
  });

  describe("requestPasswordReset", () => {
    it("should send OTP for password reset", async () => {
      const email = "user@example.com";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
            name: "Test User",
            status: "active",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock delete existing tokens
      const mockDelete = {
        where: vi.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValueOnce(mockDelete);

      // Mock insert new token
      const mockInsert = {
        values: vi.fn().mockResolvedValue([]),
      };
      db.insert.mockReturnValueOnce(mockInsert);

      // Mock sendOTPEmail
      const emailUtils = await import("@/utils/email.js");
      vi.spyOn(emailUtils, "sendOTPEmail").mockResolvedValue(true);

      const result = await authService.requestPasswordReset(email);

      expect(result.success).toBe(true);
      expect(result.message).toContain("OTP");
    });

    it("should reject inactive user", async () => {
      const email = "inactive@example.com";

      // Mock user selection - inactive user
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "inactive@example.com",
            status: "inactive",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      await expect(authService.requestPasswordReset(email)).rejects.toThrow();
    });
  });

  describe("verifyOTPAndResetPassword", () => {
    it("should reset password with valid OTP", async () => {
      const identifier = "user@example.com";
      const otp = "123456";
      const newPassword = "newpass123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock token selection
      const futureDate = new Date(Date.now() + 600000); // 10 minutes from now
      const mockTokenSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            userId: "1",
            token: "123456",
            expiresAt: futureDate,
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockTokenSelect);

      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedNewPassword");

      // Mock update credentials
      const mockCredUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValueOnce(mockCredUpdate);

      // Mock update token (mark as used)
      const mockTokenUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValueOnce(mockTokenUpdate);

      const result = await authService.verifyOTPAndResetPassword(
        identifier,
        otp,
        newPassword
      );

      expect(result.success).toBe(true);
    });

    it("should reject expired OTP", async () => {
      const identifier = "user@example.com";
      const otp = "123456";
      const newPassword = "newpass123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock token selection with expired OTP
      const pastDate = new Date(Date.now() - 600000); // 10 minutes ago
      const mockTokenSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            userId: "1",
            token: "123456",
            expiresAt: pastDate,
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockTokenSelect);

      // Mock update token (mark as used)
      const mockTokenUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValueOnce(mockTokenUpdate);

      await expect(
        authService.verifyOTPAndResetPassword(identifier, otp, newPassword)
      ).rejects.toThrow();
    });

    it("should reject invalid OTP", async () => {
      const identifier = "user@example.com";
      const otp = "wrongotp";
      const newPassword = "newpass123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock token selection - no match found
      const mockTokenSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockTokenSelect);

      await expect(
        authService.verifyOTPAndResetPassword(identifier, otp, newPassword)
      ).rejects.toThrow("Invalid OTP");
    });

    it("should reject for non-existent user", async () => {
      const identifier = "nonexistent@example.com";
      const otp = "123456";
      const newPassword = "newpass123";

      // Mock user selection - no user found
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      await expect(
        authService.verifyOTPAndResetPassword(identifier, otp, newPassword)
      ).rejects.toThrow("User not found");
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const email = "user@example.com";
      const newPassword = "newpass123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock credentials selection
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            userId: "1",
            secret: "oldHashedPassword",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedNewPassword");

      // Mock update credentials
      const mockUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValueOnce(mockUpdate);

      const result = await authService.resetPassword(email, newPassword);

      expect(result.success).toBe(true);
      expect(result.message).toContain("reset successfully");
    });

    it("should reject for non-existent user", async () => {
      const email = "nonexistent@example.com";
      const newPassword = "newpass123";

      // Mock user selection - no user found
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      await expect(
        authService.resetPassword(email, newPassword)
      ).rejects.toThrow("User not found");
    });

    it("should reject when credentials not found", async () => {
      const email = "user@example.com";
      const newPassword = "newpass123";

      // Mock user selection
      const mockUserSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([
          {
            id: "1",
            email: "user@example.com",
          },
        ]),
      };
      db.select.mockReturnValueOnce(mockUserSelect);

      // Mock credentials selection - no credentials found
      const mockCredSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockCredSelect);

      await expect(
        authService.resetPassword(email, newPassword)
      ).rejects.toThrow("User credentials not found");
    });
  });

  describe("register - additional scenarios", () => {
    it("should reject duplicate phone number", async () => {
      const registrationData = {
        name: "User",
        email: "new@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing email
      const mockEmailSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockEmailSelect);

      // Mock phone check - existing phone
      const mockPhoneSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([{ id: 1, phone: "1234567890" }]),
      };
      db.select.mockReturnValueOnce(mockPhoneSelect);

      await expect(authService.register(registrationData)).rejects.toThrow(
        "Phone number already registered"
      );
    });

    it("should reject pending registration for same email", async () => {
      const registrationData = {
        name: "User",
        email: "pending@example.com",
        phone: "9876543210",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - pending registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, email: "pending@example.com", status: "pending" },
          ]),
      });

      await expect(authService.register(registrationData)).rejects.toThrow(
        "pending registration"
      );
    });

    it("should allow re-registration after rejection", async () => {
      const registrationData = {
        name: "User",
        email: "rejected@example.com",
        phone: "5555555555",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - rejected registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, email: "rejected@example.com", status: "rejected" },
          ]),
      });

      // Mock delete old rejected registration
      db.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValue([]),
      });

      // Mock phone registration check - no phone registration
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock active user count - not first user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      });

      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedPassword");

      // Mock registration insertion
      db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: 2,
            name: "User",
            email: "rejected@example.com",
            status: "pending",
          },
        ]),
      });

      const result = await authService.register(registrationData);

      expect(result.success).toBe(true);
    });

    it("should handle rejected phone registration", async () => {
      const registrationData = {
        name: "User",
        email: "user@example.com",
        phone: "rejected-phone",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - no email registration
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration phone check - rejected phone registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, phone: "rejected-phone", status: "rejected" },
          ]),
      });

      // Mock delete old rejected registration
      db.delete.mockReturnValueOnce({
        where: vi.fn().mockResolvedValue([]),
      });

      // Mock active user count - not first user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      });

      const bcrypt = await import("bcrypt");
      bcrypt.default.hash.mockResolvedValue("hashedPassword");

      // Mock registration insertion
      db.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([
          {
            id: 2,
            name: "User",
            email: "user@example.com",
            status: "pending",
          },
        ]),
      });

      const result = await authService.register(registrationData);

      expect(result.success).toBe(true);
    });

    it("should reject approved email registration", async () => {
      const registrationData = {
        name: "User",
        email: "approved@example.com",
        phone: "5555555556",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - approved registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, email: "approved@example.com", status: "approved" },
          ]),
      });

      await expect(authService.register(registrationData)).rejects.toThrow(
        "Email already registered"
      );
    });

    it("should reject approved phone registration", async () => {
      const registrationData = {
        name: "User",
        email: "user@example.com",
        phone: "approved-phone",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - no email registration
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration phone check - approved phone registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, phone: "approved-phone", status: "approved" },
          ]),
      });

      await expect(authService.register(registrationData)).rejects.toThrow(
        "Phone number already registered"
      );
    });

    it("should reject pending phone registration", async () => {
      const registrationData = {
        name: "User",
        email: "user@example.com",
        phone: "pending-phone",
        address: "123 Main St",
        password: "password123",
      };

      // Mock email check - no existing user
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock phone check - no existing phone
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration email check - no email registration
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      // Mock registration phone check - pending phone registration exists
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi
          .fn()
          .mockResolvedValue([
            { id: 1, phone: "pending-phone", status: "pending" },
          ]),
      });

      await expect(authService.register(registrationData)).rejects.toThrow(
        "Phone number already has a pending registration"
      );
    });
  });

  describe("login - additional scenarios", () => {
    it("should reject non-existent user", async () => {
      const email = "nonexistent@example.com";
      const password = "password123";

      // Mock user selection - no user found
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      await expect(authService.login(email, password)).rejects.toThrow(
        "Invalid email or password"
      );
    });
  });

  describe("requestPasswordReset - additional scenarios", () => {
    it("should handle non-existent user gracefully", async () => {
      const email = "nonexistent@example.com";

      // Mock user selection - no user found
      db.select.mockReturnValueOnce({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      });

      const result = await authService.requestPasswordReset(email);

      // Should still return success for security (don't reveal if user exists)
      expect(result.success).toBe(true);
      expect(result.message).toContain("If an account exists");
    });
  });
});

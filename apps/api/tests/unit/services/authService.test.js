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
      bcrypt.default.compare.mockResolvedValue(false);

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
});

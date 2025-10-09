import { describe, it, expect, vi } from "vitest";

import { db } from "@/db/index.js";
import * as userService from "@/services/userService.js";

describe("UserService", () => {
  describe("getAllUsers", () => {
    it("should fetch all users without search", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "staff" },
        { id: 2, name: "Jane Smith", email: "jane@example.com", role: "admin" },
      ];

      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it("should filter users by search term", async () => {
      const mockUsers = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "staff" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers({ search: "John" });

      expect(result).toEqual(mockUsers);
    });
  });

  describe("getUserById", () => {
    it("should fetch user by id", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserById(1);

      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserById(999);

      expect(result).toBeNull();
    });
  });

  describe("createUser", () => {
    it("should create new user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St",
        role: "staff",
        status: "active",
      };

      const mockUser = { id: 1, ...userData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result = await userService.createUser(userData);

      expect(result).toEqual(mockUser);
    });

    it("should throw error for duplicate email", async () => {
      const userData = {
        name: "John Doe",
        email: "existing@example.com",
        phone: "1234567890",
        role: "staff",
      };

      const error = new Error("Duplicate");
      error.code = "23505";

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(error),
      };
      db.insert.mockReturnValue(mockQuery);

      await expect(userService.createUser(userData)).rejects.toThrow();
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      const userData = { name: "John Updated" };
      const mockUser = {
        id: 1,
        name: "John Updated",
        email: "john@example.com",
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.updateUser(1, userData);

      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.updateUser(999, { name: "Test" });

      expect(result).toBeNull();
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      const mockUser = { id: 1, name: "John Doe" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await userService.deleteUser(1);

      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserByEmail", () => {
    it("should fetch user by email", async () => {
      const mockUser = { id: 1, name: "John Doe", email: "john@example.com" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserByEmail("john@example.com");

      expect(result).toEqual(mockUser);
    });
  });

  describe("getUserByPhone", () => {
    it("should fetch user by phone", async () => {
      const mockUser = { id: 1, name: "John Doe", phone: "1234567890" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserByPhone("1234567890");

      expect(result).toEqual(mockUser);
    });
  });

  describe("activateUser", () => {
    it("should activate user", async () => {
      const mockUser = { id: 1, name: "John Doe", status: "active" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.activateUser(1);

      expect(result.status).toBe("active");
    });
  });

  describe("deactivateUser", () => {
    it("should deactivate user", async () => {
      const mockUser = { id: 1, name: "John Doe", status: "inactive" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.deactivateUser(1);

      expect(result.status).toBe("inactive");
    });
  });

  describe("suspendUser", () => {
    it("should suspend user", async () => {
      const mockUser = { id: 1, name: "John Doe", status: "suspended" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.suspendUser(1);

      expect(result.status).toBe("suspended");
    });
  });
});

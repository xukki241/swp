import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as userService from "@/services/userService.js";

describe("UserService", () => {
  describe("getAllUsers", () => {
    const mockUsers = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        role: "staff",
        status: "active",
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        role: "owner",
        status: "active",
      },
      {
        id: 3,
        name: "Peter Jones",
        email: "peter.jones@example.com",
        role: "staff",
        status: "inactive",
      },
      {
        id: 4,
        name: "Mary Williams",
        email: "mary.williams@example.com",
        role: "staff",
        status: "suspend",
      },
      {
        id: 5,
        name: "David Brown",
        email: "david.brown@example.com",
        role: "owner",
        status: "inactive",
      },
      {
        id: 6,
        name: "Susan Johnson",
        email: "susan.johnson@example.com",
        role: "staff",
        status: "active",
      },
    ];

    it("should fetch all users without search", async () => {
      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers();

      expect(result).toEqual(mockUsers);
    });

    it("should filter users by search term", async () => {
      const expectedUsers = [
        {
          id: 6,
          name: "Susan Johnson",
          email: "susan.johnson@example.com",
          role: "staff",
          status: "active",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(expectedUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers({ search: "Johnson" });

      expect(result).toEqual(expectedUsers);
    });

    it("should filter users by role", async () => {
      const expectedUsers = [
        {
          id: 2,
          name: "Jane Smith",
          email: "jane.smith@example.com",
          role: "owner",
          status: "active",
        },
        {
          id: 5,
          name: "David Brown",
          email: "david.brown@example.com",
          role: "owner",
          status: "inactive",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(expectedUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers({ role: "owner" });

      expect(result).toEqual(expectedUsers);
    });

    it("should filter users by status", async () => {
      const expectedUsers = [
        {
          id: 4,
          name: "Mary Williams",
          email: "mary.williams@example.com",
          role: "staff",
          status: "suspend",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(expectedUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers({ status: "suspend" });

      expect(result).toEqual(expectedUsers);
    });

    it("should filter users by multiple conditions", async () => {
      const expectedUsers = [
        {
          id: 1,
          name: "John Doe",
          email: "john.doe@example.com",
          role: "staff",
          status: "active",
        },
        {
          id: 6,
          name: "Susan Johnson",
          email: "susan.johnson@example.com",
          role: "staff",
          status: "active",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(expectedUsers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllUsers({
        role: "staff",
        status: "active",
      });

      expect(result).toEqual(expectedUsers);
    });

    it("should handle errors when fetching users", async () => {
      const mockQuery = {
        from: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(userService.getAllUsers()).rejects.toThrow(
        "Failed to fetch users"
      );
    });
  });

  describe("getUserById", () => {
    it("should fetch user by id", async () => {
      const mockUser = {
        id: "uuid-1",
        name: "John Doe",
        email: "john@example.com",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockUser]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserById("uuid-1");

      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserById("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle errors when fetching user by id", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(userService.getUserById("uuid-1")).rejects.toThrow(
        "Failed to fetch user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(userService.getUserById(null)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for undefined id", async () => {
      await expect(userService.getUserById(undefined)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for number id", async () => {
      await expect(userService.getUserById(123)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for empty string id", async () => {
      await expect(userService.getUserById("")).rejects.toThrow(
        "Invalid user ID"
      );
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

      await expect(userService.createUser(userData)).rejects.toThrow(
        "User with this email or phone already exists"
      );
    });

    it("should handle general errors when creating user", async () => {
      const userData = {
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        role: "staff",
      };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.insert.mockReturnValue(mockQuery);

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Failed to create user"
      );
    });

    it("should throw error for null userData", async () => {
      await expect(userService.createUser(null)).rejects.toThrow(
        "Invalid user data"
      );
    });

    it("should throw error for undefined userData", async () => {
      await expect(userService.createUser(undefined)).rejects.toThrow(
        "Invalid user data"
      );
    });

    it("should throw error for non-object userData", async () => {
      await expect(userService.createUser("not an object")).rejects.toThrow(
        "Invalid user data"
      );
    });

    it("should throw error for missing name", async () => {
      const userData = {
        email: "john@example.com",
        phone: "1234567890",
      };

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Invalid user name"
      );
    });

    it("should throw error for non-string name", async () => {
      const userData = {
        name: 123,
        email: "john@example.com",
        phone: "1234567890",
      };

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Invalid user name"
      );
    });

    it("should throw error for missing email", async () => {
      const userData = {
        name: "John Doe",
        phone: "1234567890",
      };

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Invalid user email"
      );
    });

    it("should throw error for non-string email", async () => {
      const userData = {
        name: "John Doe",
        email: 123,
        phone: "1234567890",
      };

      await expect(userService.createUser(userData)).rejects.toThrow(
        "Invalid user email"
      );
    });
  });

  describe("updateUser", () => {
    it("should update user", async () => {
      const userData = { name: "John Updated" };
      const mockUser = {
        id: "uuid-1",
        name: "John Updated",
        email: "john@example.com",
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.updateUser("uuid-1", userData);

      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.updateUser("uuid-999", { name: "Test" });

      expect(result).toBeNull();
    });

    it("should throw error for duplicate email when updating", async () => {
      const userData = { email: "existing@example.com" };
      const error = new Error("Duplicate");
      error.code = "23505";

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(error),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(userService.updateUser("uuid-1", userData)).rejects.toThrow(
        "User with this email or phone already exists"
      );
    });

    it("should handle general errors when updating user", async () => {
      const userData = { name: "John Updated" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(userService.updateUser("uuid-1", userData)).rejects.toThrow(
        "Failed to update user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(
        userService.updateUser(null, { name: "Test" })
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw error for undefined id", async () => {
      await expect(
        userService.updateUser(undefined, { name: "Test" })
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw error for number id", async () => {
      await expect(
        userService.updateUser(123, { name: "Test" })
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw error for empty string id", async () => {
      await expect(
        userService.updateUser("", { name: "Test" })
      ).rejects.toThrow("Invalid user ID");
    });

    it("should throw error for null userData", async () => {
      await expect(userService.updateUser("valid-id", null)).rejects.toThrow(
        "Invalid user data"
      );
    });

    it("should throw error for undefined userData", async () => {
      await expect(
        userService.updateUser("valid-id", undefined)
      ).rejects.toThrow("Invalid user data");
    });

    it("should throw error for non-object userData", async () => {
      await expect(
        userService.updateUser("valid-id", "not an object")
      ).rejects.toThrow("Invalid user data");
    });

    it("should throw error for empty object userData", async () => {
      await expect(userService.updateUser("valid-id", {})).rejects.toThrow(
        "Invalid user data"
      );
    });
  });

  describe("deleteUser", () => {
    it("should delete user", async () => {
      const mockUser = { id: "uuid-1", name: "John Doe" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await userService.deleteUser("uuid-1");

      expect(result).toEqual(mockUser);
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await userService.deleteUser("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle errors when deleting user", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.delete.mockReturnValue(mockQuery);

      await expect(userService.deleteUser("uuid-1")).rejects.toThrow(
        "Failed to delete user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(userService.deleteUser(null)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for undefined id", async () => {
      await expect(userService.deleteUser(undefined)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for number id", async () => {
      await expect(userService.deleteUser(123)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for empty string id", async () => {
      await expect(userService.deleteUser("")).rejects.toThrow(
        "Invalid user ID"
      );
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

    it("should return null for non-existent email", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserByEmail("notfound@example.com");

      expect(result).toBeNull();
    });

    it("should handle errors when fetching user by email", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        userService.getUserByEmail("john@example.com")
      ).rejects.toThrow("Failed to fetch user by email");
    });

    it("should throw error for null email", async () => {
      await expect(userService.getUserByEmail(null)).rejects.toThrow(
        "Invalid email"
      );
    });

    it("should throw error for undefined email", async () => {
      await expect(userService.getUserByEmail(undefined)).rejects.toThrow(
        "Invalid email"
      );
    });

    it("should throw error for number email", async () => {
      await expect(userService.getUserByEmail(123)).rejects.toThrow(
        "Invalid email"
      );
    });

    it("should throw error for empty string email", async () => {
      await expect(userService.getUserByEmail("")).rejects.toThrow(
        "Invalid email"
      );
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

    it("should return null for non-existent phone", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getUserByPhone("9999999999");

      expect(result).toBeNull();
    });

    it("should handle errors when fetching user by phone", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(userService.getUserByPhone("1234567890")).rejects.toThrow(
        "Failed to fetch user by phone"
      );
    });

    it("should throw error for null phone", async () => {
      await expect(userService.getUserByPhone(null)).rejects.toThrow(
        "Invalid phone number"
      );
    });

    it("should throw error for undefined phone", async () => {
      await expect(userService.getUserByPhone(undefined)).rejects.toThrow(
        "Invalid phone number"
      );
    });

    it("should throw error for number phone", async () => {
      await expect(userService.getUserByPhone(123)).rejects.toThrow(
        "Invalid phone number"
      );
    });

    it("should throw error for empty string phone", async () => {
      await expect(userService.getUserByPhone("")).rejects.toThrow(
        "Invalid phone number"
      );
    });
  });

  describe("activateUser", () => {
    it("should activate user", async () => {
      const mockUser = {
        id: "uuid-1",
        name: "John Doe",
        status: "active",
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.activateUser("uuid-1");

      expect(result.status).toBe("active");
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.activateUser("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle errors when activating user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(userService.activateUser("uuid-1")).rejects.toThrow(
        "Failed to activate user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(userService.activateUser(null)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for undefined id", async () => {
      await expect(userService.activateUser(undefined)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for number id", async () => {
      await expect(userService.activateUser(123)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for empty string id", async () => {
      await expect(userService.activateUser("")).rejects.toThrow(
        "Invalid user ID"
      );
    });
  });

  describe("deactivateUser", () => {
    it("should deactivate user", async () => {
      const mockUser = {
        id: "uuid-1",
        name: "John Doe",
        status: "inactive",
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.deactivateUser("uuid-1");

      expect(result.status).toBe("inactive");
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.deactivateUser("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle errors when deactivating user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(userService.deactivateUser("uuid-1")).rejects.toThrow(
        "Failed to deactivate user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(userService.deactivateUser(null)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for undefined id", async () => {
      await expect(userService.deactivateUser(undefined)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for number id", async () => {
      await expect(userService.deactivateUser(123)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for empty string id", async () => {
      await expect(userService.deactivateUser("")).rejects.toThrow(
        "Invalid user ID"
      );
    });
  });

  describe("suspendUser", () => {
    it("should suspend user", async () => {
      const mockUser = {
        id: "uuid-1",
        name: "John Doe",
        status: "suspended",
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.suspendUser("uuid-1");

      expect(result.status).toBe("suspended");
    });

    it("should return null for non-existent user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await userService.suspendUser("uuid-999");

      expect(result).toBeNull();
    });

    it("should handle errors when suspending user", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(userService.suspendUser("uuid-1")).rejects.toThrow(
        "Failed to suspend user"
      );
    });

    it("should throw error for null id", async () => {
      await expect(userService.suspendUser(null)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for undefined id", async () => {
      await expect(userService.suspendUser(undefined)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for number id", async () => {
      await expect(userService.suspendUser(123)).rejects.toThrow(
        "Invalid user ID"
      );
    });

    it("should throw error for empty string id", async () => {
      await expect(userService.suspendUser("")).rejects.toThrow(
        "Invalid user ID"
      );
    });
  });

  describe("getAllStaff", () => {
    it("should fetch all staff without filters", async () => {
      const mockStaff = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "staff" },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "manager",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockStaff),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllStaff();

      expect(result).toEqual(mockStaff);
    });

    it("should filter staff by search term", async () => {
      const mockStaff = [
        { id: 1, name: "John Doe", email: "john@example.com", role: "staff" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllStaff({ search: "John" });

      expect(result).toEqual(mockStaff);
    });

    it("should filter staff by role", async () => {
      const mockStaff = [
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          role: "manager",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllStaff({ role: "manager" });

      expect(result).toEqual(mockStaff);
    });

    it("should filter staff by status", async () => {
      const mockStaff = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "active",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllStaff({ status: "active" });

      expect(result).toEqual(mockStaff);
    });

    it("should filter staff by multiple conditions", async () => {
      const mockStaff = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          role: "manager",
          status: "active",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockStaff),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await userService.getAllStaff({
        search: "John",
        role: "manager",
        status: "active",
      });

      expect(result).toEqual(mockStaff);
    });

    it("should handle errors when fetching staff", async () => {
      const mockQuery = {
        from: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(userService.getAllStaff()).rejects.toThrow(
        "Failed to fetch staff"
      );
    });
  });
});

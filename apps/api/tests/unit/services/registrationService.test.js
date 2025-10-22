import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as registrationService from "@/services/registrationService.js";

describe("RegistrationService", () => {
  describe("getAllRegistrations", () => {
    it("should fetch all registrations without filter", async () => {
      const mockRegistrations = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "pending",
        },
        {
          id: 2,
          name: "Jane Smith",
          email: "jane@example.com",
          status: "approved",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockRegistrations),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await registrationService.getAllRegistrations();

      expect(result).toEqual(mockRegistrations);
    });

    it("should filter registrations by status", async () => {
      const mockRegistrations = [
        {
          id: 1,
          name: "John Doe",
          email: "john@example.com",
          status: "pending",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockRegistrations),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await registrationService.getAllRegistrations("pending");

      expect(result).toEqual(mockRegistrations);
    });
  });

  describe("getRegistrationById", () => {
    it("should fetch registration by id", async () => {
      const mockRegistration = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        status: "pending",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockRegistration]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await registrationService.getRegistrationById(1);

      expect(result).toEqual(mockRegistration);
    });

    it("should return null for non-existent registration", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await registrationService.getRegistrationById(999);

      expect(result).toBeNull();
    });
  });

  describe("approveRegistration", () => {
    it("should approve registration and create user", async () => {
      const mockRegistration = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        phone: "1234567890",
        address: "123 Main St",
        password: "hashedPassword",
        status: "pending",
      };

      const mockUser = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
        role: "staff",
        status: "active",
      };

      // Mock registration selection
      const mockRegSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockRegistration]),
      };
      db.select.mockReturnValueOnce(mockRegSelect);

      // Mock existing user check
      const mockUserCheck = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValueOnce(mockUserCheck);

      // Mock user insertion
      const mockUserInsert = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUser]),
      };
      db.insert.mockReturnValueOnce(mockUserInsert);

      // Mock credentials insertion
      const mockCredInsert = {
        values: vi.fn().mockResolvedValue({}),
      };
      db.insert.mockReturnValueOnce(mockCredInsert);

      // Mock registration update
      const mockRegUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue({}),
      };
      db.update.mockReturnValue(mockRegUpdate);

      const result = await registrationService.approveRegistration(1, "staff");

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it("should throw error for non-existent registration", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        registrationService.approveRegistration(999)
      ).rejects.toThrow("Registration not found");
    });

    it("should throw error for already processed registration", async () => {
      const mockRegistration = {
        id: 1,
        status: "approved",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockRegistration]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(registrationService.approveRegistration(1)).rejects.toThrow(
        "Registration already approved"
      );
    });
  });

  describe("rejectRegistration", () => {
    it("should reject registration", async () => {
      const mockRegistration = {
        id: 1,
        name: "John Doe",
        status: "pending",
      };

      // Mock registration selection
      const mockRegSelect = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockRegistration]),
      };
      db.select.mockReturnValue(mockRegSelect);

      // Mock registration update
      const mockRegUpdate = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi
          .fn()
          .mockResolvedValue([{ ...mockRegistration, status: "rejected" }]),
      };
      db.update.mockReturnValue(mockRegUpdate);

      const result = await registrationService.rejectRegistration(1);

      expect(result.success).toBe(true);
      expect(result.registration.status).toBe("rejected");
    });

    it("should throw error for non-existent registration", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(registrationService.rejectRegistration(999)).rejects.toThrow(
        "Registration not found"
      );
    });
  });

  describe("deleteRegistration", () => {
    it("should delete registration", async () => {
      const mockRegistration = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRegistration]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await registrationService.deleteRegistration(1);

      expect(result.success).toBe(true);
      expect(result.registration).toEqual(mockRegistration);
    });

    it("should throw error for non-existent registration", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(mockQuery);

      await expect(registrationService.deleteRegistration(999)).rejects.toThrow(
        "Registration not found"
      );
    });
  });
});

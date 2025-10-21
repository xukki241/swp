import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as medicationService from "@/services/medicationService.js";

describe("MedicationService", () => {
  describe("getAllMedications", () => {
    it("should fetch all medications without filters", async () => {
      const mockMedications = [
        { id: 1, name: "Aspirin", brand: "Bayer", status: "active" },
        { id: 2, name: "Ibuprofen", brand: "Advil", status: "active" },
      ];

      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockMedications),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationService.getAllMedications();

      expect(result).toEqual(mockMedications);
      expect(db.select).toHaveBeenCalled();
    });

    it("should filter medications by search term", async () => {
      const mockMedications = [
        { id: 1, name: "Aspirin", brand: "Bayer", status: "active" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockMedications),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationService.getAllMedications({
        search: "Aspirin",
      });

      expect(result).toEqual(mockMedications);
    });

    it("should filter medications by status", async () => {
      const mockMedications = [
        { id: 1, name: "Aspirin", brand: "Bayer", status: "active" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockMedications),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationService.getAllMedications({
        status: "active",
      });

      expect(result).toEqual(mockMedications);
    });
  });

  describe("getMedicationById", () => {
    it("should fetch medication with variants", async () => {
      const mockMedication = {
        id: 1,
        name: "Aspirin",
        brand: "Bayer",
        status: "active",
      };

      const mockVariants = [
        { id: 1, medicationId: 1, name: "100mg", sku: "ASP-100" },
        { id: 2, medicationId: 1, name: "500mg", sku: "ASP-500" },
      ];

      // Mock medication selection
      const mockMedQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockMedication]),
      };
      db.select.mockReturnValueOnce(mockMedQuery);

      // Mock variants selection
      const mockVarQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValueOnce(mockVarQuery);

      const result = await medicationService.getMedicationById(1);

      expect(result).toEqual({
        ...mockMedication,
        variants: mockVariants,
      });
    });

    it("should return null for non-existent medication", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationService.getMedicationById(999);

      expect(result).toBeNull();
    });
  });

  describe("createMedication", () => {
    it("should create medication with variants", async () => {
      const medicationData = {
        name: "Aspirin",
        brand: "Bayer",
        status: "active",
        variants: [
          { name: "100mg", sku: "ASP-100" },
          { name: "500mg", sku: "ASP-500" },
        ],
      };

      const mockMedication = { id: 1, name: "Aspirin", brand: "Bayer" };
      const mockVariants = [
        { id: 1, medicationId: 1, name: "100mg", sku: "ASP-100" },
        { id: 2, medicationId: 1, name: "500mg", sku: "ASP-500" },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi
            .fn()
            .mockResolvedValueOnce([mockMedication])
            .mockResolvedValueOnce(mockVariants),
        };
        return callback(tx);
      });

      const result = await medicationService.createMedication(medicationData);

      expect(result.name).toBe("Aspirin");
      expect(result.variants).toHaveLength(2);
    });

    it("should create medication without variants", async () => {
      const medicationData = {
        name: "Aspirin",
        brand: "Bayer",
        status: "active",
      };

      const mockMedication = { id: 1, name: "Aspirin", brand: "Bayer" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockMedication]),
        };
        return callback(tx);
      });

      const result = await medicationService.createMedication(medicationData);

      expect(result.name).toBe("Aspirin");
      expect(result.variants).toEqual([]);
    });
  });

  describe("updateMedication", () => {
    it("should update medication and replace variants", async () => {
      const medicationData = {
        name: "Aspirin Updated",
        variants: [{ name: "200mg", sku: "ASP-200" }],
      };

      const mockMedication = { id: 1, name: "Aspirin Updated" };
      const mockVariants = [
        { id: 3, medicationId: 1, name: "200mg", sku: "ASP-200" },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockMedication]),
          delete: vi.fn().mockReturnThis(),
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
        };
        tx.returning.mockResolvedValueOnce([mockMedication]);
        tx.returning.mockResolvedValueOnce(mockVariants);
        return callback(tx);
      });

      const result = await medicationService.updateMedication(
        1,
        medicationData
      );

      expect(result.name).toBe("Aspirin Updated");
    });

    it("should return null for non-existent medication", async () => {
      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([]),
        };
        return callback(tx);
      });

      const result = await medicationService.updateMedication(999, {
        name: "Test",
      });

      expect(result).toBeNull();
    });
  });

  describe("deleteMedication", () => {
    it("should delete medication", async () => {
      const mockMedication = { id: 1, name: "Aspirin" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockMedication]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await medicationService.deleteMedication(1);

      expect(result).toEqual(mockMedication);
    });

    it("should return null when deleting non-existent medication", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await medicationService.deleteMedication(999);

      expect(result).toBeNull();
    });
  });
});

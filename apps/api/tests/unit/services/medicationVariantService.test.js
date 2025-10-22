import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import * as medicationVariantService from "@/services/medicationVariantService.js";

describe("MedicationVariantService", () => {
  describe("getAllMedicationVariants", () => {
    it("should fetch all variants without filters", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", medicationId: 1 },
        { id: 2, name: "500mg", sku: "ASP-500", medicationId: 1 },
      ];

      const mockQuery = {
        from: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants();

      expect(result).toEqual(mockVariants);
    });

    it("should filter variants by search term", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", medicationId: 1 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants({
        search: "ASP-100",
      });

      expect(result).toEqual(mockVariants);
    });

    it("should filter variants by medicationId", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", medicationId: 1 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants({
        medicationId: 1,
      });

      expect(result).toEqual(mockVariants);
    });

    it("should filter variants by isActive status", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", isActive: true },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants({
        isActive: true,
      });

      expect(result).toEqual(mockVariants);
    });
  });

  describe("getMedicationVariantById", () => {
    it("should fetch variant by id", async () => {
      const mockVariant = { id: 1, name: "100mg", sku: "ASP-100" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getMedicationVariantById(1);

      expect(result).toEqual(mockVariant);
    });

    it("should return null for non-existent variant", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result =
        await medicationVariantService.getMedicationVariantById(999);

      expect(result).toBeNull();
    });
  });

  describe("getMedicationVariantBySku", () => {
    it("should fetch variant by SKU", async () => {
      const mockVariant = { id: 1, name: "100mg", sku: "ASP-100" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.select.mockReturnValue(mockQuery);

      const result =
        await medicationVariantService.getMedicationVariantBySku("ASP-100");

      expect(result).toEqual(mockVariant);
    });
  });

  describe("createMedicationVariant", () => {
    it("should create new variant", async () => {
      const variantData = {
        name: "100mg",
        sku: "ASP-100",
        medicationId: 1,
      };

      const mockVariant = { id: 1, ...variantData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result =
        await medicationVariantService.createMedicationVariant(variantData);

      expect(result).toEqual(mockVariant);
    });

    it("should throw error for duplicate SKU", async () => {
      const variantData = {
        name: "100mg",
        sku: "ASP-100",
        medicationId: 1,
      };

      const error = new Error("Duplicate");
      error.code = "23505";

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(error),
      };
      db.insert.mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.createMedicationVariant(variantData)
      ).rejects.toThrow("Medication variant with this SKU already exists");
    });
  });

  describe("updateMedicationVariant", () => {
    it("should update variant", async () => {
      const variantData = { name: "200mg" };
      const mockVariant = { id: 1, name: "200mg", sku: "ASP-100" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await medicationVariantService.updateMedicationVariant(
        1,
        variantData
      );

      expect(result).toEqual(mockVariant);
    });

    it("should return null for non-existent variant", async () => {
      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await medicationVariantService.updateMedicationVariant(
        999,
        {
          name: "Test",
        }
      );

      expect(result).toBeNull();
    });
  });

  describe("deleteMedicationVariant", () => {
    it("should delete variant", async () => {
      const mockVariant = { id: 1, name: "100mg", sku: "ASP-100" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await medicationVariantService.deleteMedicationVariant(1);

      expect(result).toEqual(mockVariant);
    });

    it("should return null for non-existent variant", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result =
        await medicationVariantService.deleteMedicationVariant(999);

      expect(result).toBeNull();
    });
  });
});

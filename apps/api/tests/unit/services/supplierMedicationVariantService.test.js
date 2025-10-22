import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { supplierMedicationVariantService } from "@/services/supplierMedicationVariantService.js";

describe("SupplierMedicationVariantService", () => {
  describe("create", () => {
    it("should create supplier medication variant", async () => {
      const variantData = {
        supplierId: 1,
        medicationVariantId: 1,
        supplierSku: "SUP-001",
        leadTimeDays: 7,
      };

      const mockVariant = { id: 1, ...variantData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.create(variantData);

      expect(result).toEqual(mockVariant);
    });
  });

  describe("getAll", () => {
    it("should fetch all supplier medication variants without filters", async () => {
      const mockVariants = [
        {
          id: 1,
          supplierId: 1,
          medicationVariantId: 1,
          supplierSku: "SUP-001",
        },
        {
          id: 2,
          supplierId: 1,
          medicationVariantId: 2,
          supplierSku: "SUP-002",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.getAll();

      expect(result).toEqual(mockVariants);
    });

    it("should filter by supplierId", async () => {
      const mockVariants = [
        {
          id: 1,
          supplierId: 1,
          medicationVariantId: 1,
          supplierSku: "SUP-001",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.getAll({
        supplierId: 1,
      });

      expect(result).toEqual(mockVariants);
    });

    it("should filter by medicationVariantId", async () => {
      const mockVariants = [
        {
          id: 1,
          supplierId: 1,
          medicationVariantId: 1,
          supplierSku: "SUP-001",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.getAll({
        medicationVariantId: 1,
      });

      expect(result).toEqual(mockVariants);
    });
  });

  describe("getById", () => {
    it("should fetch supplier medication variant by id", async () => {
      const mockVariant = {
        id: 1,
        supplierId: 1,
        medicationVariantId: 1,
        supplierSku: "SUP-001",
        supplierName: "Supplier A",
        medicationName: "Aspirin",
        variantName: "100mg",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.getById(1);

      expect(result).toEqual(mockVariant);
    });
  });

  describe("update", () => {
    it("should update supplier medication variant", async () => {
      const variantData = { supplierSku: "SUP-001-UPDATED", leadTimeDays: 10 };
      const mockVariant = {
        id: 1,
        supplierId: 1,
        medicationVariantId: 1,
        supplierSku: "SUP-001-UPDATED",
        leadTimeDays: 10,
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.update(
        1,
        variantData
      );

      expect(result).toEqual(mockVariant);
    });
  });

  describe("delete", () => {
    it("should delete supplier medication variant", async () => {
      const mockVariant = {
        id: 1,
        supplierId: 1,
        medicationVariantId: 1,
        supplierSku: "SUP-001",
      };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockVariant]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await supplierMedicationVariantService.delete(1);

      expect(result).toEqual(mockVariant);
    });
  });
});

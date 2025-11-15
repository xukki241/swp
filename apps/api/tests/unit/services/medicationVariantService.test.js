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

  describe("getAllMedicationVariants - advanced filtering", () => {
    it("should handle multiple conditions", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", isActive: true },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants({
        search: "ASP",
        medicationId: 1,
        isActive: true,
      });

      expect(result).toEqual(mockVariants);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it("should handle isActive false filter", async () => {
      const mockVariants = [
        { id: 1, name: "100mg", sku: "ASP-100", isActive: false },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await medicationVariantService.getAllMedicationVariants({
        isActive: false,
      });

      expect(result).toEqual(mockVariants);
    });
  });

  describe("getAllMedicationVariants error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.getAllMedicationVariants()
      ).rejects.toThrow("Failed to fetch medication variants");
    });
  });

  describe("getMedicationVariantById error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.getMedicationVariantById(1)
      ).rejects.toThrow("Failed to fetch medication variant");
    });
  });

  describe("getMedicationVariantBySku error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.getMedicationVariantBySku("TEST-SKU")
      ).rejects.toThrow("Failed to fetch medication variant");
    });

    it("should return null for non-existent SKU", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue([]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result =
        await medicationVariantService.getMedicationVariantBySku("NON-EXIST");

      expect(result).toBeNull();
    });
  });

  describe("createMedicationVariant error handling", () => {
    it("should handle generic database errors", async () => {
      const variantData = {
        name: "100mg",
        sku: "ASP-100",
        medicationId: 1,
      };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.insert.mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.createMedicationVariant(variantData)
      ).rejects.toThrow("Failed to create medication variant");
    });
  });

  describe("updateMedicationVariant error handling", () => {
    it("should throw error for duplicate SKU", async () => {
      const variantData = { sku: "DUPLICATE-SKU" };

      const error = new Error("Duplicate");
      error.code = "23505";

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(error),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.updateMedicationVariant(1, variantData)
      ).rejects.toThrow("Medication variant with this SKU already exists");
    });

    it("should handle generic database errors", async () => {
      const variantData = { name: "Test" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.update.mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.updateMedicationVariant(1, variantData)
      ).rejects.toThrow("Failed to update medication variant");
    });
  });

  describe("deleteMedicationVariant error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.delete = vi.fn().mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.deleteMedicationVariant(1)
      ).rejects.toThrow("Failed to delete medication variant");
    });
  });

  describe("searchVariantsForSale", () => {
    it("should search variants for sale with search term", async () => {
      const mockVariants = [
        {
          id: 1,
          medicationId: 1,
          medicationName: "Aspirin",
          name: "100mg",
          sku: "ASP-100",
          barcode: "1234567890",
          sellPrice: 10.5,
          unit: "tablet",
          isActive: true,
          isForSale: true,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
        then: function (resolve) {
          return resolve(mockVariants);
        },
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      // Mock db.query.inventory.findMany for inventory lookup
      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue([
            {
              medicationVariantId: 1,
              quantity: 100,
              quantityReserved: 0,
              batchNumber: "BATCH001",
              expiryDate: new Date("2025-12-31"),
              binId: 1,
              bin: {
                level: "A",
                number: "1",
                rack: {
                  code: "R1",
                  zone: {
                    name: "Zone A",
                  },
                },
              },
            },
          ]),
        },
      };

      const result = await medicationVariantService.searchVariantsForSale({
        search: "Aspirin",
      });

      expect(result).toHaveLength(1);
      expect(result[0].availableQuantity).toBe(100);
    });

    it("should search variants for sale without search term", async () => {
      const mockVariants = [
        {
          id: 1,
          medicationId: 1,
          medicationName: "Aspirin",
          name: "100mg",
          sku: "ASP-100",
          barcode: "1234567890",
          sellPrice: 10.5,
          unit: "tablet",
          isActive: true,
          isForSale: true,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
        then: function (resolve) {
          return resolve(mockVariants);
        },
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      // Mock db.query.inventory.findMany
      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue([
            {
              medicationVariantId: 1,
              quantity: 60,
              quantityReserved: 10,
              batchNumber: "BATCH002",
              expiryDate: new Date("2025-11-30"),
              binId: 2,
              bin: {
                level: "B",
                number: "2",
                rack: {
                  code: "R2",
                  zone: {
                    name: "Zone B",
                  },
                },
              },
            },
          ]),
        },
      };

      const result = await medicationVariantService.searchVariantsForSale();

      expect(result).toHaveLength(1);
      expect(result[0].availableQuantity).toBe(50);
    });

    it("should handle variants with null available quantity", async () => {
      const mockVariants = [
        {
          id: 1,
          medicationId: 1,
          medicationName: "Aspirin",
          name: "100mg",
          sku: "ASP-100",
          barcode: "1234567890",
          sellPrice: 10.5,
          unit: "tablet",
          isActive: true,
          isForSale: true,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
        then: function (resolve) {
          return resolve(mockVariants);
        },
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      // Mock db.query.inventory.findMany with no inventory
      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const result = await medicationVariantService.searchVariantsForSale();

      // Variants with 0 available quantity are filtered out
      expect(result).toHaveLength(0);
    });

    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(
        medicationVariantService.searchVariantsForSale()
      ).rejects.toThrow("Failed to search variants for sale");
    });
  });
});

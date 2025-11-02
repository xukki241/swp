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
    // UTCID01: Test case đã có
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

    // UTCID02: Test case đã có
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

  describe("getMedicationSuppliers", () => {
    it("should fetch all suppliers for a medication", async () => {
      const mockSuppliers = [
        {
          id: 1,
          name: "Supplier A",
          contactName: "John Doe",
          email: "john@suppliera.com",
          phone: "1234567890",
          address: "123 Main St",
          status: "active",
        },
        {
          id: 2,
          name: "Supplier B",
          contactName: "Jane Smith",
          email: "jane@supplierb.com",
          phone: "0987654321",
          address: "456 Elm St",
          status: "active",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockSuppliers),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      const result = await medicationService.getMedicationSuppliers(1);

      expect(result).toEqual(mockSuppliers);
      expect(db.selectDistinct).toHaveBeenCalled();
    });

    it("should handle errors when fetching suppliers", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.getMedicationSuppliers(1)).rejects.toThrow(
        "Failed to fetch suppliers for medication"
      );
    });
  });

  describe("getMedicationPurchases", () => {
    it("should fetch all purchase orders for a medication", async () => {
      const mockPurchases = [
        {
          id: 1,
          supplierId: 1,
          orderDate: "2025-01-01",
          expectedDate: "2025-01-15",
          status: "pending",
          totalAmount: 1000.0,
          supplierName: "Supplier A",
        },
        {
          id: 2,
          supplierId: 2,
          orderDate: "2025-02-01",
          expectedDate: "2025-02-15",
          status: "received",
          totalAmount: 2000.0,
          supplierName: "Supplier B",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockPurchases),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      const result = await medicationService.getMedicationPurchases(1);

      expect(result).toEqual(mockPurchases);
      expect(db.selectDistinct).toHaveBeenCalled();
    });

    it("should handle errors when fetching purchases", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.getMedicationPurchases(1)).rejects.toThrow(
        "Failed to fetch purchase orders for medication"
      );
    });
  });

  describe("getMedicationSales", () => {
    it("should fetch all sales orders for a medication", async () => {
      const mockSales = [
        {
          id: 1,
          customerId: 1,
          orderDate: "2025-01-05",
          totalAmount: 150.0,
          status: "completed",
          paymentMethod: "cash",
        },
        {
          id: 2,
          customerId: 2,
          orderDate: "2025-02-10",
          totalAmount: 300.0,
          status: "pending",
          paymentMethod: "card",
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockSales),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      const result = await medicationService.getMedicationSales(1);

      expect(result).toEqual(mockSales);
      expect(db.selectDistinct).toHaveBeenCalled();
    });

    it("should handle errors when fetching sales", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        innerJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.selectDistinct = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.getMedicationSales(1)).rejects.toThrow(
        "Failed to fetch sales orders for medication"
      );
    });
  });

  describe("getAllMedications error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockRejectedValue(new Error("Database connection error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.getAllMedications()).rejects.toThrow(
        "Failed to fetch medications"
      );
    });

    it("should filter by both search and status", async () => {
      const mockMedications = [
        { id: 1, name: "Aspirin", brand: "Bayer", status: "active" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockMedications),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await medicationService.getAllMedications({
        search: "Aspirin",
        status: "active",
      });

      expect(result).toEqual(mockMedications);
      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("getMedicationById error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.getMedicationById(1)).rejects.toThrow(
        "Failed to fetch medication"
      );
    });
  });

  describe("createMedication error handling", () => {
    it("should handle database errors", async () => {
      db.transaction = vi
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));

      await expect(
        medicationService.createMedication({
          name: "Test",
          brand: "Test Brand",
        })
      ).rejects.toThrow("Failed to create medication");
    });

    it("should create medication with empty variants array", async () => {
      const medicationData = {
        name: "Aspirin",
        brand: "Bayer",
        status: "active",
        variants: [],
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

  describe("updateMedication error handling", () => {
    it("should handle database errors", async () => {
      db.transaction = vi
        .fn()
        .mockRejectedValue(new Error("Transaction failed"));

      await expect(
        medicationService.updateMedication(1, {
          name: "Test",
        })
      ).rejects.toThrow("Failed to update medication");
    });

    it("should update medication without replacing variants", async () => {
      const medicationData = {
        name: "Aspirin Updated",
      };

      const mockMedication = { id: 1, name: "Aspirin Updated" };
      const mockExistingVariants = [
        { id: 1, medicationId: 1, name: "100mg", sku: "ASP-100" },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockMedication]),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
        };
        // Mock the where for the select query to return existing variants
        const selectQuery = {
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(mockExistingVariants),
        };
        tx.select.mockReturnValue(selectQuery);
        return callback(tx);
      });

      const result = await medicationService.updateMedication(
        1,
        medicationData
      );

      expect(result.name).toBe("Aspirin Updated");
      expect(result.variants).toEqual(mockExistingVariants);
    });

    it("should update medication and delete all variants when empty array provided", async () => {
      const medicationData = {
        name: "Aspirin Updated",
        variants: [],
      };

      const mockMedication = { id: 1, name: "Aspirin Updated" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockMedication]),
          delete: vi.fn().mockReturnThis(),
        };
        return callback(tx);
      });

      const result = await medicationService.updateMedication(
        1,
        medicationData
      );

      expect(result.name).toBe("Aspirin Updated");
      expect(result.variants).toEqual([]);
    });
  });

  describe("deleteMedication error handling", () => {
    it("should handle database errors", async () => {
      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockRejectedValue(new Error("Database error")),
      };
      db.delete = vi.fn().mockReturnValue(mockQuery);

      await expect(medicationService.deleteMedication(1)).rejects.toThrow(
        "Failed to delete medication"
      );
    });
  });
});

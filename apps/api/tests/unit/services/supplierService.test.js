import { describe, it, expect, vi } from "vitest";

import { db } from "@/db/index.js";
import { supplierService } from "@/services/supplierService.js";

describe("SupplierService", () => {
  describe("create", () => {
    it("should create supplier without medication variants", async () => {
      const supplierData = {
        name: "Supplier A",
        contactName: "John Doe",
        email: "supplier@example.com",
        phone: "1234567890",
        address: "123 Main St",
        status: "active",
      };

      const mockSupplier = { id: 1, ...supplierData };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockSupplier]),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ ...mockSupplier }]),
        };

        // First select for supplier result
        tx.select.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([{ ...mockSupplier }]),
        });

        // Second select for variants
        tx.select.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        });

        return callback(tx);
      });

      const result = await supplierService.create(supplierData);

      expect(result.name).toBe("Supplier A");
      expect(result.medicationVariants).toEqual([]);
    });

    it("should create supplier with medication variants", async () => {
      const supplierData = {
        name: "Supplier A",
        email: "supplier@example.com",
        medicationVariants: [
          { medicationVariantId: 1, supplierSku: "SUP-001", leadTimeDays: 7 },
          { medicationVariantId: 2, supplierSku: "SUP-002", leadTimeDays: 10 },
        ],
      };

      const mockSupplier = { id: 1, name: "Supplier A" };
      const mockVariants = [
        { id: 1, medicationVariantId: 1, supplierSku: "SUP-001" },
        { id: 2, medicationVariantId: 2, supplierSku: "SUP-002" },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi
            .fn()
            .mockResolvedValueOnce([mockSupplier])
            .mockResolvedValueOnce(mockVariants),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          where: vi
            .fn()
            .mockResolvedValueOnce([mockSupplier])
            .mockResolvedValueOnce(mockVariants),
        };

        return callback(tx);
      });

      const result = await supplierService.create(supplierData);

      expect(result.medicationVariants).toHaveLength(2);
    });
  });

  describe("getAll", () => {
    it("should fetch all suppliers without filters", async () => {
      const mockSuppliers = [
        { id: 1, name: "Supplier A", status: "active" },
        { id: 2, name: "Supplier B", status: "active" },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockSuppliers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierService.getAll();

      expect(result).toEqual(mockSuppliers);
    });

    it("should filter suppliers by search term", async () => {
      const mockSuppliers = [{ id: 1, name: "Supplier A", status: "active" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockSuppliers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierService.getAll({ search: "Supplier A" });

      expect(result).toEqual(mockSuppliers);
    });

    it("should filter suppliers by status", async () => {
      const mockSuppliers = [{ id: 1, name: "Supplier A", status: "active" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockSuppliers),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierService.getAll({ status: "active" });

      expect(result).toEqual(mockSuppliers);
    });
  });

  describe("getById", () => {
    it("should fetch supplier by id with variants", async () => {
      const mockSupplier = {
        id: 1,
        name: "Supplier A",
        email: "supplier@example.com",
      };

      const mockVariants = [
        {
          id: 1,
          medicationVariantId: 1,
          supplierSku: "SUP-001",
          medicationName: "Aspirin",
          variantName: "100mg",
        },
      ];

      // Mock supplier selection
      const mockSupQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockSupplier]),
      };
      db.select.mockReturnValueOnce(mockSupQuery);

      // Mock variants selection
      const mockVarQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockVariants),
      };
      db.select.mockReturnValueOnce(mockVarQuery);

      const result = await supplierService.getById(1);

      expect(result.name).toBe("Supplier A");
      expect(result.medicationVariants).toEqual(mockVariants);
    });

    it("should return null for non-existent supplier", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await supplierService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update supplier", async () => {
      const supplierData = { name: "Supplier A Updated" };
      const mockSupplier = { id: 1, name: "Supplier A Updated" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockSupplier]),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
        };

        tx.select.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([mockSupplier]),
        });

        tx.select.mockReturnValueOnce({
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        });

        return callback(tx);
      });

      const result = await supplierService.update(1, supplierData);

      expect(result.name).toBe("Supplier A Updated");
    });

    it("should return null for non-existent supplier", async () => {
      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([]),
        };
        return callback(tx);
      });

      const result = await supplierService.update(999, { name: "Test" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete supplier", async () => {
      const mockSupplier = { id: 1, name: "Supplier A" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          delete: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockSupplier]),
        };
        return callback(tx);
      });

      const result = await supplierService.delete(1);

      expect(result).toEqual(mockSupplier);
    });
  });
});

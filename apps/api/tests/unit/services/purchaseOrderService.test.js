import { describe, it, expect, vi } from "vitest";

import { db } from "@/db/index.js";
import { purchaseOrderService } from "@/services/purchaseOrderService.js";

describe("PurchaseOrderService", () => {
  describe("create", () => {
    it("should create purchase order with items", async () => {
      const poData = {
        supplierId: 1,
        orderDate: "2025-10-09",
        expectedDate: "2025-10-16",
        status: "pending",
        totalAmount: 1000,
        createdBy: 1,
        items: [
          {
            supplierMedicationVariantId: 1,
            quantity: 10,
            unitPrice: 50,
            totalPrice: 500,
          },
          {
            supplierMedicationVariantId: 2,
            quantity: 10,
            unitPrice: 50,
            totalPrice: 500,
          },
        ],
      };

      const mockPO = {
        id: 1,
        supplierId: 1,
        orderDate: new Date("2025-10-09"),
        status: "pending",
      };

      const mockItems = [
        { id: 1, purchaseOrderId: 1, quantity: 10, unitPrice: 50 },
        { id: 2, purchaseOrderId: 1, quantity: 10, unitPrice: 50 },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi
            .fn()
            .mockResolvedValueOnce([mockPO])
            .mockResolvedValueOnce(mockItems),
        };
        return callback(tx);
      });

      const result = await purchaseOrderService.create(poData);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(2);
    });

    it("should create purchase order without items", async () => {
      const poData = {
        supplierId: 1,
        orderDate: "2025-10-09",
        status: "pending",
        createdBy: 1,
      };

      const mockPO = { id: 1, supplierId: 1, status: "pending" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockPO]),
        };
        return callback(tx);
      });

      const result = await purchaseOrderService.create(poData);

      expect(result.id).toBe(1);
      expect(result.items).toEqual([]);
    });
  });

  describe("getAll", () => {
    it("should fetch all purchase orders without filters", async () => {
      const mockPOs = [
        { id: 1, supplierId: 1, status: "pending", totalAmount: 1000 },
        { id: 2, supplierId: 2, status: "approved", totalAmount: 2000 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockPOs),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.getAll();

      expect(result).toEqual(mockPOs);
    });

    it("should filter purchase orders by supplierId", async () => {
      const mockPOs = [{ id: 1, supplierId: 1, status: "pending" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockPOs),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.getAll({ supplierId: 1 });

      expect(result).toEqual(mockPOs);
    });

    it("should filter purchase orders by status", async () => {
      const mockPOs = [{ id: 1, status: "pending" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockPOs),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.getAll({ status: "pending" });

      expect(result).toEqual(mockPOs);
    });

    it("should filter purchase orders by date range", async () => {
      const mockPOs = [{ id: 1, orderDate: new Date("2025-10-09") }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockPOs),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.getAll({
        startDate: "2025-10-01",
        endDate: "2025-10-31",
      });

      expect(result).toEqual(mockPOs);
    });
  });

  describe("getById", () => {
    it("should fetch purchase order by id with items", async () => {
      const mockPO = {
        id: 1,
        supplierId: 1,
        status: "pending",
        supplierName: "Supplier A",
      };

      const mockItems = [
        { id: 1, purchaseOrderId: 1, quantity: 10, unitPrice: 50 },
        { id: 2, purchaseOrderId: 1, quantity: 20, unitPrice: 25 },
      ];

      // Mock PO selection
      const mockPOQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockPO]),
      };
      db.select.mockReturnValueOnce(mockPOQuery);

      // Mock items selection
      const mockItemsQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValueOnce(mockItemsQuery);

      const result = await purchaseOrderService.getById(1);

      expect(result.id).toBe(1);
      expect(result.items).toEqual(mockItems);
    });

    it("should return null for non-existent purchase order", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update purchase order", async () => {
      const poData = { status: "approved" };
      const mockPO = { id: 1, supplierId: 1, status: "approved" };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockPO]),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
        };

        tx.select.mockReturnValue({
          from: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        });

        return callback(tx);
      });

      const result = await purchaseOrderService.update(1, poData);

      expect(result.status).toBe("approved");
    });

    it("should return null for non-existent purchase order", async () => {
      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([]),
        };
        return callback(tx);
      });

      const result = await purchaseOrderService.update(999, { status: "test" });

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete purchase order", async () => {
      const mockPO = { id: 1, supplierId: 1, status: "pending" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockPO]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await purchaseOrderService.delete(1);

      expect(result).toEqual(mockPO);
    });
  });
});

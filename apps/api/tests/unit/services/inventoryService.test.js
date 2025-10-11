import { eq, and, gte, lte, sql } from "drizzle-orm";
import { describe, it, expect, vi, beforeEach } from "vitest";

import { db } from "@/db/index.js";
import { inventoryService } from "@/services/inventoryService.js";

vi.mock("drizzle-orm", async () => {
  const actual = await vi.importActual("drizzle-orm");
  return {
    ...actual,
    eq: vi.fn(),
    and: vi.fn(),
    gte: vi.fn(),
    lte: vi.fn(),
    sql: {
      raw: vi.fn(),
    },
  };
});

describe("InventoryService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getAll", () => {
    it("should fetch all inventory items without filters", async () => {
      const mockInventory = [
        {
          id: 1,
          medicationVariantId: 1,
          binId: 1,
          batchNumber: "BATCH001",
          quantity: 100,
          quantityReserved: 10,
          quantityAvailable: 90,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getAll();

      expect(result).toEqual(mockInventory);
      expect(mockQuery.limit).toHaveBeenCalledWith(100);
      expect(mockQuery.offset).toHaveBeenCalledWith(0);
    });

    it("should filter by medicationVariantId", async () => {
      const mockInventory = [{ id: 1, medicationVariantId: 5 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        medicationVariantId: 5,
      });

      expect(result).toEqual(mockInventory);
      expect(mockQuery.where).toHaveBeenCalled();
    });

    it("should filter by binId", async () => {
      const mockInventory = [{ id: 1, binId: 3 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({ binId: 3 });

      expect(result).toEqual(mockInventory);
    });

    it("should filter by batchNumber", async () => {
      const mockInventory = [{ id: 1, batchNumber: "BATCH001" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        batchNumber: "BATCH001",
      });

      expect(result).toEqual(mockInventory);
    });

    it("should filter by expiry date range", async () => {
      const mockInventory = [{ id: 1, expiryDate: "2025-12-31" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        expiryDateFrom: "2025-01-01",
        expiryDateTo: "2025-12-31",
      });

      expect(result).toEqual(mockInventory);
    });

    it("should apply pagination", async () => {
      const mockInventory = [];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockInventory),
      };
      db.select.mockReturnValue(mockQuery);

      await inventoryService.getAll({ limit: 50, offset: 25 });

      expect(mockQuery.limit).toHaveBeenCalledWith(50);
      expect(mockQuery.offset).toHaveBeenCalledWith(25);
    });
  });

  describe("getById", () => {
    it("should fetch inventory item by id", async () => {
      const mockItem = {
        id: 1,
        medicationVariantId: 1,
        quantity: 100,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockItem]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getById(1);

      expect(result).toEqual(mockItem);
    });

    it("should return null if item not found", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("getLowStock", () => {
    it("should fetch low stock items with custom threshold", async () => {
      const mockItems = [
        {
          medicationVariantId: 1,
          variantName: "Med A",
          totalAvailable: 50,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getLowStock({ threshold: 100 });

      expect(result).toEqual(mockItems);
    });

    it("should use default threshold of 100", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await inventoryService.getLowStock();

      expect(mockQuery.having).toHaveBeenCalled();
    });
  });

  describe("getExpiringSoon", () => {
    it("should fetch items expiring within specified days", async () => {
      const mockItems = [
        {
          id: 1,
          expiryDate: "2025-11-10",
          daysUntilExpiry: 30,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getExpiringSoon({ days: 30 });

      expect(result).toEqual(mockItems);
    });

    it("should use default days value of 30", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await inventoryService.getExpiringSoon();

      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("getByLocation", () => {
    it("should fetch inventory grouped by location", async () => {
      const mockData = [
        {
          zoneCode: "Z001",
          zoneName: "Zone A",
          totalQuantity: 1000,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue(mockData),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await inventoryService.getByLocation();

      expect(result).toEqual(mockData);
    });

    it("should filter by zoneId", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await inventoryService.getByLocation({ zoneId: 1 });

      expect(mockQuery.where).toHaveBeenCalled();
    });
  });

  describe("adjustQuantity", () => {
    it("should increase inventory quantity", async () => {
      const mockInventory = {
        id: 1,
        quantity: 100,
        quantityReserved: 10,
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockSelectQuery);

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ ...mockInventory, quantity: 150 }]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await inventoryService.adjustQuantity({
        inventoryId: 1,
        adjustmentType: "increase",
        quantity: 50,
        reason: "Correction",
      });

      expect(result.newQuantity).toBe(150);
      expect(result.previousQuantity).toBe(100);
    });

    it("should decrease inventory quantity", async () => {
      const mockInventory = {
        id: 1,
        quantity: 100,
        quantityReserved: 10,
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockSelectQuery);

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ ...mockInventory, quantity: 50 }]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await inventoryService.adjustQuantity({
        inventoryId: 1,
        adjustmentType: "decrease",
        quantity: 50,
        reason: "Damage",
      });

      expect(result.newQuantity).toBe(50);
    });

    it("should throw error if inventory not found", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.adjustQuantity({
          inventoryId: 999,
          adjustmentType: "increase",
          quantity: 50,
          reason: "Test",
        })
      ).rejects.toThrow("Inventory item not found");
    });

    it("should throw error if decrease exceeds available quantity", async () => {
      const mockInventory = {
        id: 1,
        quantity: 100,
        quantityReserved: 10,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.adjustQuantity({
          inventoryId: 1,
          adjustmentType: "decrease",
          quantity: 95,
          reason: "Test",
        })
      ).rejects.toThrow("Insufficient available quantity");
    });
  });

  describe("transferInventory", () => {
    it("should transfer inventory between bins", async () => {
      const mockSourceInventory = {
        id: 1,
        binId: 1,
        medicationVariantId: 1,
        batchNumber: "BATCH001",
        quantity: 500,
        quantityReserved: 50,
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockSourceInventory]),
      };
      db.select.mockReturnValue(mockSelectQuery);

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ ...mockSourceInventory, quantity: 400 }]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const mockInsertQuery = {
        values: vi.fn().mockReturnThis(),
        onConflictDoUpdate: vi
          .fn()
          .mockResolvedValue([{ id: 2, quantity: 100 }]),
      };
      db.insert.mockReturnValue(mockInsertQuery);

      const result = await inventoryService.transferInventory({
        inventoryId: 1,
        fromBinId: 1,
        toBinId: 2,
        quantity: 100,
        reason: "Reorganization",
      });

      expect(result.sourceInventory).toBeDefined();
      expect(result.destinationInventory).toBeDefined();
    });

    it("should throw error if inventory not found", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.transferInventory({
          inventoryId: 999,
          fromBinId: 1,
          toBinId: 2,
          quantity: 100,
          reason: "Test",
        })
      ).rejects.toThrow("Inventory item not found");
    });

    it("should throw error if bin mismatch", async () => {
      const mockInventory = {
        id: 1,
        binId: 5,
        quantity: 500,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.transferInventory({
          inventoryId: 1,
          fromBinId: 1,
          toBinId: 2,
          quantity: 100,
          reason: "Test",
        })
      ).rejects.toThrow("Inventory item is not in the specified source bin");
    });
  });

  describe("reserveInventory", () => {
    it("should reserve inventory successfully", async () => {
      const mockInventory = {
        id: 1,
        quantity: 500,
        quantityReserved: 50,
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockSelectQuery);

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ ...mockInventory, quantityReserved: 100 }]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await inventoryService.reserveInventory({
        inventoryId: 1,
        quantity: 50,
        orderId: "ORD001",
      });

      expect(result.quantityReserved).toBe(100);
    });

    it("should throw error if insufficient available quantity", async () => {
      const mockInventory = {
        id: 1,
        quantity: 100,
        quantityReserved: 90,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.reserveInventory({
          inventoryId: 1,
          quantity: 50,
          orderId: "ORD001",
        })
      ).rejects.toThrow("Insufficient available quantity");
    });
  });

  describe("unreserveInventory", () => {
    it("should unreserve inventory successfully", async () => {
      const mockInventory = {
        id: 1,
        quantity: 500,
        quantityReserved: 100,
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockSelectQuery);

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi
          .fn()
          .mockResolvedValue([{ ...mockInventory, quantityReserved: 50 }]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await inventoryService.unreserveInventory({
        inventoryId: 1,
        quantity: 50,
        orderId: "ORD001",
      });

      expect(result.quantityReserved).toBe(50);
    });

    it("should throw error if insufficient reserved quantity", async () => {
      const mockInventory = {
        id: 1,
        quantity: 500,
        quantityReserved: 30,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockInventory]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(
        inventoryService.unreserveInventory({
          inventoryId: 1,
          quantity: 50,
          orderId: "ORD001",
        })
      ).rejects.toThrow("Insufficient reserved quantity");
    });
  });
});

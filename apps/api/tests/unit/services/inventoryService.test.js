import { beforeEach, describe, expect, it, vi } from "vitest";

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
    sql: vi.fn(() => ({
      as: vi.fn((name) => name),
    })),
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

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: mockInventory.length }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll();

      expect(result.data).toEqual(mockInventory);
      expect(result.total).toBe(mockInventory.length);
    });

    it("should filter by medicationVariantId", async () => {
      const mockInventory = [{ id: 1, medicationVariantId: 5 }];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        medicationVariantId: 5,
      });

      expect(result.data).toEqual(mockInventory);
      expect(result.total).toBe(1);
    });

    it("should filter by binId", async () => {
      const mockInventory = [{ id: 1, binId: 3 }];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({ binId: 3 });

      expect(result.data).toEqual(mockInventory);
      expect(result.total).toBe(1);
    });

    it("should filter by batchNumber", async () => {
      const mockInventory = [{ id: 1, batchNumber: "BATCH001" }];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        batchNumber: "BATCH001",
      });

      expect(result.data).toEqual(mockInventory);
      expect(result.total).toBe(1);
    });

    it("should filter by expiry date range", async () => {
      const mockInventory = [{ id: 1, expiryDate: "2025-12-31" }];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({
        expiryDateFrom: "2025-01-01",
        expiryDateTo: "2025-12-31",
      });

      expect(result.data).toEqual(mockInventory);
      expect(result.total).toBe(1);
    });

    it("should apply pagination", async () => {
      const mockInventory = [];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockInventory),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getAll({ limit: 50, offset: 25 });

      expect(db.query.inventory.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });

  describe("getById", () => {
    it("should fetch inventory item by id", async () => {
      const mockItem = {
        id: 1,
        medicationVariantId: 1,
        quantity: 100,
      };

      db.query = {
        inventory: {
          findFirst: vi.fn().mockResolvedValue(mockItem),
        },
      };

      const result = await inventoryService.getById(1);

      expect(result).toEqual(mockItem);
    });

    it("should return undefined if item not found", async () => {
      db.query = {
        inventory: {
          findFirst: vi.fn().mockResolvedValue(undefined),
        },
      };

      const result = await inventoryService.getById(999);

      expect(result).toBeUndefined();
    });
  });

  describe("getLowStock", () => {
    it("should fetch low stock items with custom threshold", async () => {
      const mockAllItems = [
        {
          id: 1,
          medicationVariantId: 1,
          quantity: 50,
          quantityReserved: 0,
        },
      ];
      const mockLowStockVariants = [{ medicationVariantId: 1 }];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockAllItems),
        },
      };

      const mockSelectQuery = {
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockResolvedValue(mockLowStockVariants),
      };
      db.select = vi.fn().mockReturnValue(mockSelectQuery);

      const result = await inventoryService.getLowStock({ threshold: 100 });

      expect(result.data).toEqual(mockAllItems);
      expect(result.total).toBe(1);
    });

    it("should use default threshold of 250", async () => {
      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        having: vi.fn().mockResolvedValue([]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getLowStock();

      expect(mockQuery.having).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });

  describe("getExpiring", () => {
    it("should fetch items expiring within specified days", async () => {
      // Mock item that is >= 1 year old from manufacture date (manufactured Nov 2023)
      const mockItems = [
        {
          id: 1,
          expiryDate: "2025-11-10",
          manufactureDate: "2023-11-01",
          daysUntilExpiry: 30,
        },
      ];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockItems),
        },
      };

      const mockCountQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockCountQuery);

      const result = await inventoryService.getExpiring({
        daysUntilExpiry: 30,
      });

      expect(result.data).toEqual(mockItems);
      expect(result.total).toBe(1);
    });

    it("should use default days value of 30", async () => {
      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 0 }]),
      };
      db.select = vi.fn().mockReturnValue(mockQuery);

      const result = await inventoryService.getExpiring();

      expect(db.query.inventory.findMany).toHaveBeenCalled();
      expect(result.data).toEqual([]);
    });
  });

  describe("getExpiringSoon", () => {
    it("should call getExpiring method", async () => {
      // Mock item that is >= 1 year old from manufacture date (manufactured Nov 2023)
      const mockItems = [
        { id: 1, expiryDate: "2025-11-10", manufactureDate: "2023-11-01" },
      ];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockItems),
        },
      };

      const mockCountQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([{ count: 1 }]),
      };
      db.select = vi.fn().mockReturnValue(mockCountQuery);

      const result = await inventoryService.getExpiringSoon({
        daysUntilExpiry: 15,
      });

      expect(result.data).toEqual(mockItems);
      expect(result.total).toBe(1);
    });
  });

  describe("getByMedicationVariantId", () => {
    it("should fetch inventory items by medication variant id", async () => {
      const mockItems = [
        { id: 1, medicationVariantId: 5 },
        { id: 2, medicationVariantId: 5 },
      ];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockItems),
        },
      };

      const result = await inventoryService.getByMedicationVariantId(5);

      expect(result).toEqual(mockItems);
      expect(db.query.inventory.findMany).toHaveBeenCalled();
    });
  });

  describe("getByBinId", () => {
    it("should fetch inventory items by bin id", async () => {
      const mockItems = [
        { id: 1, binId: 3 },
        { id: 2, binId: 3 },
      ];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockItems),
        },
      };

      const result = await inventoryService.getByBinId(3);

      expect(result).toEqual(mockItems);
      expect(db.query.inventory.findMany).toHaveBeenCalled();
    });
  });

  describe("getByMedicationId", () => {
    it("should fetch inventory items by medication id", async () => {
      const mockItems = [
        { id: 1, medicationVariant: { medicationId: 7 } },
        { id: 2, medicationVariant: { medicationId: 7 } },
      ];

      db.query = {
        inventory: {
          findMany: vi.fn().mockResolvedValue(mockItems),
        },
      };

      const result = await inventoryService.getByMedicationId(7);

      expect(result).toEqual(mockItems);
      expect(db.query.inventory.findMany).toHaveBeenCalled();
    });
  });

  describe("update", () => {
    it("should update inventory item", async () => {
      const mockUpdated = {
        id: 1,
        quantity: 200,
        updatedAt: new Date(),
      };

      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockUpdated]),
      };
      db.update = vi.fn().mockReturnValue(mockUpdateQuery);

      const result = await inventoryService.update(1, { quantity: 200 });

      expect(result).toEqual(mockUpdated);
      expect(db.update).toHaveBeenCalled();
    });
  });

  describe("getSummaryByVariant", () => {
    it("should get inventory summary by variant with default sorting", async () => {
      const mockData = [
        {
          medicationVariantId: 1,
          totalQuantity: 1000,
          totalReserved: 100,
          availableQuantity: 900,
        },
      ];

      const mockDataQuery = {
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockData),
      };
      const mockCountQuery = {
        from: vi.fn().mockResolvedValue([{ count: 1 }]),
      };

      db.select = vi
        .fn()
        .mockReturnValueOnce(mockDataQuery)
        .mockReturnValueOnce(mockCountQuery);

      const result = await inventoryService.getSummaryByVariant();

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(1);
    });

    it("should apply custom sorting and pagination", async () => {
      const mockData = [];

      const mockDataQuery = {
        from: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockData),
      };
      const mockCountQuery = {
        from: vi.fn().mockResolvedValue([{ count: 0 }]),
      };

      db.select = vi
        .fn()
        .mockReturnValueOnce(mockDataQuery)
        .mockReturnValueOnce(mockCountQuery);

      const result = await inventoryService.getSummaryByVariant({
        sortBy: "totalQuantity",
        sortOrder: "desc",
        limit: 50,
        offset: 10,
      });

      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(0);
    });
  });

  describe("move", () => {
    it("should move inventory to existing batch in target bin", async () => {
      const mockFromInventory = {
        id: "inv-1",
        quantity: 100,
        medicationVariantId: "med-1",
        binId: "bin-1",
      };

      const mockTargetInventory = {
        id: "inv-2",
        quantity: 50,
      };

      const mockTransaction = {
        query: {
          inventory: {
            findFirst: vi
              .fn()
              .mockResolvedValueOnce(mockFromInventory)
              .mockResolvedValueOnce(mockTargetInventory),
          },
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        }),
      };

      db.transaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await inventoryService.move({
        fromInventoryId: "inv-1",
        toBinId: "bin-2",
        quantity: 30,
        medicationVariantId: "med-1",
        batchNumber: "BATCH001",
        manufactureDate: "2025-01-01",
        expiryDate: "2026-01-01",
        purchaseOrderReceiptItemsId: "po-1",
      });

      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should move inventory to new batch in target bin", async () => {
      const mockFromInventory = {
        id: "inv-1",
        quantity: 100,
        medicationVariantId: "med-1",
        binId: "bin-1",
      };

      const mockTransaction = {
        query: {
          inventory: {
            findFirst: vi
              .fn()
              .mockResolvedValueOnce(mockFromInventory)
              .mockResolvedValueOnce(null),
          },
        },
        update: vi.fn().mockReturnValue({
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(undefined),
        }),
        insert: vi.fn().mockReturnValue({
          values: vi.fn().mockResolvedValue(undefined),
        }),
      };

      db.transaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      const result = await inventoryService.move({
        fromInventoryId: "inv-1",
        toBinId: "bin-2",
        quantity: 30,
        medicationVariantId: "med-1",
        batchNumber: "BATCH002",
        manufactureDate: "2025-01-01",
        expiryDate: "2026-01-01",
        purchaseOrderReceiptItemsId: "po-1",
      });

      expect(result.success).toBe(true);
      expect(db.transaction).toHaveBeenCalled();
    });

    it("should throw error if source inventory not found", async () => {
      const mockTransaction = {
        query: {
          inventory: {
            findFirst: vi.fn().mockResolvedValue(null),
          },
        },
      };

      db.transaction = vi.fn().mockImplementation(async (callback) => {
        return await callback(mockTransaction);
      });

      await expect(
        inventoryService.move({
          fromInventoryId: "inv-999",
          toBinId: "bin-2",
          quantity: 30,
          medicationVariantId: "med-1",
          batchNumber: "BATCH001",
          manufactureDate: "2025-01-01",
          expiryDate: "2026-01-01",
        })
      ).rejects.toThrow("Source inventory not found");
    });
  });

  // TODO: Implement getByLocation in inventoryService
  // describe("getByLocation", () => {
  //   it("should fetch inventory grouped by location", async () => {
  //     const mockData = [
  //       {
  //         zoneCode: "Z001",
  //         zoneName: "Zone A",
  //         totalQuantity: 1000,
  //       },
  //     ];

  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       leftJoin: vi.fn().mockReturnThis(),
  //       groupBy: vi.fn().mockReturnThis(),
  //       orderBy: vi.fn().mockResolvedValue(mockData),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     const result = await inventoryService.getByLocation();

  //     expect(result).toEqual(mockData);
  //   });

  //   it("should filter by zoneId", async () => {
  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       leftJoin: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockReturnThis(),
  //       groupBy: vi.fn().mockReturnThis(),
  //       orderBy: vi.fn().mockResolvedValue([]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await inventoryService.getByLocation({ zoneId: 1 });

  //     expect(mockQuery.where).toHaveBeenCalled();
  //   });
  // });

  // TODO: Implement adjustQuantity in inventoryService
  // describe("adjustQuantity", () => {
  //   it("should increase inventory quantity", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 100,
  //       quantityReserved: 10,
  //     };

  //     const mockSelectQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockSelectQuery);

  //     const mockUpdateQuery = {
  //       set: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([{ ...mockInventory, quantity: 150 }]),
  //     };
  //     db.update.mockReturnValue(mockUpdateQuery);

  //     const result = await inventoryService.adjustQuantity({
  //       inventoryId: 1,
  //       adjustmentType: "increase",
  //       quantity: 50,
  //       reason: "Correction",
  //     });

  //     expect(result.newQuantity).toBe(150);
  //     expect(result.previousQuantity).toBe(100);
  //   });

  //   it("should decrease inventory quantity", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 100,
  //       quantityReserved: 10,
  //     };

  //     const mockSelectQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockSelectQuery);

  //     const mockUpdateQuery = {
  //       set: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([{ ...mockInventory, quantity: 50 }]),
  //     };
  //     db.update.mockReturnValue(mockUpdateQuery);

  //     const result = await inventoryService.adjustQuantity({
  //       inventoryId: 1,
  //       adjustmentType: "decrease",
  //       quantity: 50,
  //       reason: "Damage",
  //     });

  //     expect(result.newQuantity).toBe(50);
  //   });

  //   it("should throw error if inventory not found", async () => {
  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.adjustQuantity({
  //         inventoryId: 999,
  //         adjustmentType: "increase",
  //         quantity: 50,
  //         reason: "Test",
  //       })
  //     ).rejects.toThrow("Inventory item not found");
  //   });

  //   it("should throw error if decrease exceeds available quantity", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 100,
  //       quantityReserved: 10,
  //     };

  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.adjustQuantity({
  //         inventoryId: 1,
  //         adjustmentType: "decrease",
  //         quantity: 95,
  //         reason: "Test",
  //       })
  //     ).rejects.toThrow("Insufficient available quantity");
  //   });
  // });

  // TODO: Implement transferInventory in inventoryService
  // describe("transferInventory", () => {
  //   it("should transfer inventory between bins", async () => {
  //     const mockSourceInventory = {
  //       id: 1,
  //       binId: 1,
  //       medicationVariantId: 1,
  //       batchNumber: "BATCH001",
  //       quantity: 500,
  //       quantityReserved: 50,
  //     };

  //     const mockSelectQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockSourceInventory]),
  //     };
  //     db.select.mockReturnValue(mockSelectQuery);

  //     const mockUpdateQuery = {
  //       set: vi.fn().mockReturnThis(),
  //       where: vi
  //         .fn()
  //         .mockResolvedValue([{ ...mockSourceInventory, quantity: 400 }]),
  //     };
  //     db.update.mockReturnValue(mockUpdateQuery);

  //     const mockInsertQuery = {
  //       values: vi.fn().mockReturnThis(),
  //       onConflictDoUpdate: vi
  //         .fn()
  //         .mockResolvedValue([{ id: 2, quantity: 100 }]),
  //     };
  //     db.insert.mockReturnValue(mockInsertQuery);

  //     const result = await inventoryService.transferInventory({
  //       inventoryId: 1,
  //       fromBinId: 1,
  //       toBinId: 2,
  //       quantity: 100,
  //       reason: "Reorganization",
  //     });

  //     expect(result.sourceInventory).toBeDefined();
  //     expect(result.destinationInventory).toBeDefined();
  //   });

  //   it("should throw error if inventory not found", async () => {
  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.transferInventory({
  //         inventoryId: 999,
  //         fromBinId: 1,
  //         toBinId: 2,
  //         quantity: 100,
  //         reason: "Test",
  //       })
  //     ).rejects.toThrow("Inventory item not found");
  //   });

  //   it("should throw error if bin mismatch", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       binId: 5,
  //       quantity: 500,
  //     };

  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.transferInventory({
  //         inventoryId: 1,
  //         fromBinId: 1,
  //         toBinId: 2,
  //         quantity: 100,
  //         reason: "Test",
  //       })
  //     ).rejects.toThrow("Inventory item is not in the specified source bin");
  //   });
  // });

  // TODO: Implement reserveInventory in inventoryService
  // describe("reserveInventory", () => {
  //   it("should reserve inventory successfully", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 500,
  //       quantityReserved: 50,
  //     };

  //     const mockSelectQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockSelectQuery);

  //     const mockUpdateQuery = {
  //       set: vi.fn().mockReturnThis(),
  //       where: vi
  //         .fn()
  //         .mockResolvedValue([{ ...mockInventory, quantityReserved: 100 }]),
  //     };
  //     db.update.mockReturnValue(mockUpdateQuery);

  //     const result = await inventoryService.reserveInventory({
  //       inventoryId: 1,
  //       quantity: 50,
  //       orderId: "ORD001",
  //     });

  //     expect(result.quantityReserved).toBe(100);
  //   });

  //   it("should throw error if insufficient available quantity", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 100,
  //       quantityReserved: 90,
  //     };

  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.reserveInventory({
  //         inventoryId: 1,
  //         quantity: 50,
  //         orderId: "ORD001",
  //       })
  //     ).rejects.toThrow("Insufficient available quantity");
  //   });
  // });

  // TODO: Implement unreserveInventory in inventoryService
  // describe("unreserveInventory", () => {
  //   it("should unreserve inventory successfully", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 500,
  //       quantityReserved: 100,
  //     };

  //     const mockSelectQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockSelectQuery);

  //     const mockUpdateQuery = {
  //       set: vi.fn().mockReturnThis(),
  //       where: vi
  //         .fn()
  //         .mockResolvedValue([{ ...mockInventory, quantityReserved: 50 }]),
  //     };
  //     db.update.mockReturnValue(mockUpdateQuery);

  //     const result = await inventoryService.unreserveInventory({
  //       inventoryId: 1,
  //       quantity: 50,
  //       orderId: "ORD001",
  //     });

  //     expect(result.quantityReserved).toBe(50);
  //   });

  //   it("should throw error if insufficient reserved quantity", async () => {
  //     const mockInventory = {
  //       id: 1,
  //       quantity: 500,
  //       quantityReserved: 30,
  //     };

  //     const mockQuery = {
  //       from: vi.fn().mockReturnThis(),
  //       where: vi.fn().mockResolvedValue([mockInventory]),
  //     };
  //     db.select.mockReturnValue(mockQuery);

  //     await expect(
  //       inventoryService.unreserveInventory({
  //         inventoryId: 1,
  //         quantity: 50,
  //         orderId: "ORD001",
  //       })
  //     ).rejects.toThrow("Insufficient reserved quantity");
  //   });
  // });
});

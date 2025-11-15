import { beforeEach, describe, expect, it, vi } from "vitest";

import { inventoryAllocationService } from "@/services/inventoryAllocationService.js";

vi.mock("@/db/index.js");
vi.mock("@/utils/logger.js");

describe("inventoryAllocationService", () => {
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;

    // Setup default mock behavior
    mockDb.select = vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        groupBy: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockResolvedValue([]),
        limit: vi.fn().mockResolvedValue([]),
      }),
    });

    mockDb.insert = vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([]),
      }),
    });

    mockDb.update = vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    });
  });

  describe("allocateInventory", () => {
    it("should allocate inventory to empty bin for new batch", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        purchaseOrderReceiptItemId: "receipt-1",
        batchNumber: "BATCH-001",
        manufactureDate: new Date("2024-01-01"),
        expiryDate: new Date("2025-12-31"),
        quantity: 100,
      };

      const mockEmptyBins = [
        {
          binId: "bin-1",
          binCode: "B01",
          binName: "Bin 1",
          binLevel: 1,
          binNumber: 1,
          rackId: "rack-1",
          rackCode: "R01",
          rackName: "Rack 1",
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
          hasInventory: false,
        },
      ];

      const mockInventory = [
        {
          id: "inv-1",
          medicationVariantId: "med-1",
          binId: "bin-1",
          quantity: 100,
        },
      ];

      // Mock for bin availability query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockEmptyBins),
        }),
      });

      // Mock for existing inventory check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(mockInventory),
        }),
      });

      const result =
        await inventoryAllocationService.allocateInventory(allocationData);

      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it("should add to existing batch location", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        purchaseOrderReceiptItemId: "receipt-1",
        batchNumber: "BATCH-001",
        manufactureDate: new Date("2024-01-01"),
        expiryDate: new Date("2025-12-31"),
        quantity: 50,
      };

      const mockBinsWithInventory = [
        {
          binId: "bin-1",
          binCode: "B01",
          binName: "Bin 1",
          binLevel: 1,
          binNumber: 1,
          rackId: "rack-1",
          rackCode: "R01",
          rackName: "Rack 1",
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
          hasInventory: true,
        },
      ];

      const mockExistingInventory = [
        {
          id: "inv-1",
          binId: "bin-1",
          quantity: 100,
          binCode: "B01",
          binName: "Bin 1",
        },
      ];

      const mockUpdatedInventory = [
        {
          id: "inv-1",
          medicationVariantId: "med-1",
          quantity: 150,
        },
      ];

      const mockLocationDetails = [
        {
          id: "inv-1",
          medicationVariantId: "med-1",
          binId: "bin-1",
          binCode: "B01",
          binName: "Bin 1",
          quantity: 150,
        },
      ];

      // Mock binsWithInventory query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBinsWithInventory),
        }),
      });

      // Mock existingInventory query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(mockExistingInventory),
        }),
      });

      // Mock update query
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue(mockUpdatedInventory),
          }),
        }),
      });

      // Mock location details query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(mockLocationDetails),
        }),
      });

      const result =
        await inventoryAllocationService.allocateInventory(allocationData);

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBeGreaterThan(0);
      expect(mockDb.update).toHaveBeenCalled();
    });

    it("should throw error when no bins available", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        batchNumber: "BATCH-001",
        quantity: 100,
        manufactureDate: new Date(),
        expiryDate: new Date(),
      };

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        inventoryAllocationService.allocateInventory(allocationData)
      ).rejects.toThrow("No warehouse bins available for allocation");
    });

    it("should use preferred bin when specified", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        purchaseOrderReceiptItemId: "receipt-1",
        batchNumber: "BATCH-001",
        manufactureDate: new Date("2024-01-01"),
        expiryDate: new Date("2025-12-31"),
        quantity: 100,
        preferredBinId: "bin-1",
      };

      const mockPreferredBinInfo = [
        {
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
        },
      ];

      const mockBins = [
        {
          binId: "bin-1",
          binCode: "B01",
          hasInventory: false,
        },
      ];

      // Mock for preferred bin zone lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(mockPreferredBinInfo),
        }),
      });

      // Mock for bin availability query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      // Mock for existing inventory check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "inv-1" }]),
        }),
      });

      const result =
        await inventoryAllocationService.allocateInventory(allocationData);

      expect(result).toBeDefined();
    });

    it("should throw error when preferred bin zone has no empty bins", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        batchNumber: "BATCH-NEW",
        quantity: 100,
        manufactureDate: new Date(),
        expiryDate: new Date(),
        preferredBinId: "bin-1",
      };

      const mockPreferredBinInfo = [
        {
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
        },
      ];

      const mockBinsAllOccupied = [
        {
          binId: "bin-1",
          binCode: "B01",
          hasInventory: true,
        },
        {
          binId: "bin-2",
          binCode: "B02",
          hasInventory: true,
        },
      ];

      // Mock for preferred bin zone lookup
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(mockPreferredBinInfo),
        }),
      });

      // Mock for bin availability query - all occupied
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBinsAllOccupied),
        }),
      });

      // Mock for existing inventory check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      // Mock for zone info query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi
            .fn()
            .mockResolvedValue([{ zoneCode: "Z01", zoneName: "Zone 1" }]),
        }),
      });

      await expect(
        inventoryAllocationService.allocateInventory(allocationData)
      ).rejects.toThrow(/Không còn chỗ trống trong khu/);
    });

    it("should throw error when no empty bins available for new batch", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        batchNumber: "BATCH-NEW",
        quantity: 100,
        manufactureDate: new Date(),
        expiryDate: new Date(),
      };

      const mockBinsAllOccupied = [
        {
          binId: "bin-1",
          binCode: "B01",
          hasInventory: true,
        },
      ];

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBinsAllOccupied),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      await expect(
        inventoryAllocationService.allocateInventory(allocationData)
      ).rejects.toThrow("No empty bins available");
    });

    it("should use first available bin when preferred bin is occupied", async () => {
      const allocationData = {
        medicationVariantId: "med-1",
        batchNumber: "BATCH-NEW",
        quantity: 100,
        manufactureDate: new Date(),
        expiryDate: new Date(),
        preferredBinId: "bin-1",
      };

      const mockPreferredBinInfo = [
        {
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
        },
      ];

      const mockBins = [
        {
          binId: "bin-2",
          binCode: "B02",
          hasInventory: false,
          zoneCode: "Z01",
        },
        {
          binId: "bin-1",
          binCode: "B01",
          hasInventory: true,
        },
      ];

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          limit: vi.fn().mockResolvedValue(mockPreferredBinInfo),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      mockDb.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([
            {
              id: "inv-1",
              binId: "bin-2",
            },
          ]),
        }),
      });

      const result =
        await inventoryAllocationService.allocateInventory(allocationData);

      expect(result).toBeDefined();
      expect(mockDb.insert).toHaveBeenCalled();
    });
  });

  describe("getReceiptAllocations", () => {
    it("should return empty array when receipt has no items", async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });

      const result =
        await inventoryAllocationService.getReceiptAllocations("receipt-1");

      expect(result).toEqual([]);
    });

    it("should return allocations for receipt with items", async () => {
      const mockReceiptItems = [{ id: "item-1" }, { id: "item-2" }];

      const mockAllocations = [
        {
          inventoryId: "inv-1",
          medicationVariantId: "var-1",
          batchNumber: "BATCH-001",
          quantity: 100,
          binCode: "B01",
          zoneCode: "Z01",
        },
        {
          inventoryId: "inv-2",
          medicationVariantId: "var-2",
          batchNumber: "BATCH-002",
          quantity: 50,
          binCode: "B02",
          zoneCode: "Z01",
        },
      ];

      // Mock receipt items query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue(mockReceiptItems),
        }),
      });

      // Mock allocations query
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue(mockAllocations),
        }),
      });

      const result =
        await inventoryAllocationService.getReceiptAllocations("receipt-1");

      expect(result).toEqual(mockAllocations);
      expect(result.length).toBe(2);
    });
  });
});

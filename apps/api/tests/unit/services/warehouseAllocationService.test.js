import { beforeEach, describe, expect, it, vi } from "vitest";

import { warehouseAllocationService } from "@/services/warehouseAllocationService.js";

vi.mock("@/db/index.js");

describe("warehouseAllocationService", () => {
  let mockDb;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;
  });

  describe("findNearestAvailableBinInZone", () => {
    it("should find the nearest available empty bin in a zone", async () => {
      const mockBins = [
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
        {
          binId: "bin-2",
          binCode: "B02",
          binName: "Bin 2",
          binLevel: 1,
          binNumber: 2,
          rackId: "rack-1",
          rackCode: "R01",
          rackName: "Rack 1",
          zoneId: "zone-1",
          zoneCode: "Z01",
          zoneName: "Zone 1",
          hasInventory: true,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      const result =
        await warehouseAllocationService.findNearestAvailableBinInZone(
          "zone-1"
        );

      expect(result).toBeDefined();
      expect(result.binId).toBe("bin-1");
      expect(result.hasInventory).toBeUndefined(); // Should be removed
    });

    it("should exclude bins from exclude list", async () => {
      const mockBins = [
        {
          binId: "bin-1",
          binCode: "B01",
          binName: "Bin 1",
          hasInventory: false,
        },
        {
          binId: "bin-2",
          binCode: "B02",
          binName: "Bin 2",
          hasInventory: false,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      const result =
        await warehouseAllocationService.findNearestAvailableBinInZone(
          "zone-1",
          ["bin-1"]
        );

      expect(result.binId).toBe("bin-2");
    });

    it("should return null if no empty bins available", async () => {
      const mockBins = [
        {
          binId: "bin-1",
          hasInventory: true,
        },
        {
          binId: "bin-2",
          hasInventory: true,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      const result =
        await warehouseAllocationService.findNearestAvailableBinInZone(
          "zone-1"
        );

      expect(result).toBeNull();
    });

    it("should return null if all empty bins are excluded", async () => {
      const mockBins = [
        {
          binId: "bin-1",
          hasInventory: false,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue(mockBins),
        }),
      });

      const result =
        await warehouseAllocationService.findNearestAvailableBinInZone(
          "zone-1",
          ["bin-1"]
        );

      expect(result).toBeNull();
    });
  });

  describe("findBinsForItems", () => {
    it("should find bins for multiple items", async () => {
      const items = [
        {
          medicationVariantId: "med-1",
          zoneId: "zone-1",
          quantity: 10,
        },
        {
          medicationVariantId: "med-2",
          zoneId: "zone-1",
          quantity: 20,
        },
      ];

      // Mock different bins for each call
      let callCount = 0;
      mockDb.select.mockImplementation(() => ({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([
            {
              binId: `bin-${++callCount}`,
              binCode: `B0${callCount}`,
              hasInventory: false,
            },
          ]),
        }),
      }));

      const result = await warehouseAllocationService.findBinsForItems(items);

      expect(result).toHaveLength(2);
      expect(result[0].bin.binId).toBe("bin-1");
      expect(result[1].bin.binId).toBe("bin-2");
      expect(result[0].medicationVariantId).toBe("med-1");
      expect(result[1].medicationVariantId).toBe("med-2");
    });

    it("should handle item with no zone selected", async () => {
      const items = [
        {
          medicationVariantId: "med-1",
          quantity: 10,
        },
      ];

      const result = await warehouseAllocationService.findBinsForItems(items);

      expect(result).toHaveLength(1);
      expect(result[0].error).toBe("No zone selected");
      expect(result[0].bin).toBeNull();
    });

    it("should handle no available bins in zone", async () => {
      const items = [
        {
          medicationVariantId: "med-1",
          zoneId: "zone-1",
          quantity: 10,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([
            {
              binId: "bin-1",
              hasInventory: true,
            },
          ]),
        }),
      });

      const result = await warehouseAllocationService.findBinsForItems(items);

      expect(result).toHaveLength(1);
      expect(result[0].error).toBe("No available bins in selected zone");
      expect(result[0].bin).toBeNull();
    });

    it("should ensure unique bins for each item", async () => {
      const items = [
        {
          medicationVariantId: "med-1",
          zoneId: "zone-1",
          quantity: 10,
        },
        {
          medicationVariantId: "med-2",
          zoneId: "zone-1",
          quantity: 20,
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnThis(),
          leftJoin: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          groupBy: vi.fn().mockReturnThis(),
          orderBy: vi.fn().mockResolvedValue([
            {
              binId: "bin-1",
              hasInventory: false,
            },
            {
              binId: "bin-2",
              hasInventory: false,
            },
          ]),
        }),
      });

      const result = await warehouseAllocationService.findBinsForItems(items);

      expect(result).toHaveLength(2);
      expect(result[0].bin.binId).not.toBe(result[1].bin.binId);
    });

    it("should handle empty items array", async () => {
      const result = await warehouseAllocationService.findBinsForItems([]);

      expect(result).toEqual([]);
    });
  });
});

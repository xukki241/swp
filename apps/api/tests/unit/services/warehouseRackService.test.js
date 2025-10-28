import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { warehouseRackService } from "@/services/warehouseRackService.js";

describe("WarehouseRackService", () => {
  describe("create", () => {
    it("should create new warehouse rack", async () => {
      const rackData = {
        code: "R-001",
        name: "Rack 1",
        zoneId: 1,
        description: "Storage rack",
      };

      const mockZone = { id: 1, code: "Z-001", name: "Zone A" };
      const mockRack = { id: 1, ...rackData };

      // Mock db.query.warehouseZones.findFirst
      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(mockZone),
        },
      };

      // Mock rack insertion
      const mockReturning = vi.fn().mockResolvedValue([mockRack]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert = vi.fn().mockReturnValue({ values: mockValues });

      const result = await warehouseRackService.create(rackData);

      expect(result).toEqual(mockRack);
    });

    it("should throw error when zone does not exist", async () => {
      const rackData = {
        code: "R-001",
        name: "Rack 1",
        zoneId: 999,
      };

      // Mock db.query.warehouseZones.findFirst to return null
      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      await expect(warehouseRackService.create(rackData)).rejects.toThrow(
        "Zone with ID 999 not found"
      );
    });
  });

  describe("getAll", () => {
    it("should fetch all racks without filters", async () => {
      const mockRacks = [
        { id: 1, code: "R-001", name: "Rack 1", zoneId: 1 },
        { id: 2, code: "R-002", name: "Rack 2", zoneId: 1 },
      ];

      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue(mockRacks),
        },
      };

      const result = await warehouseRackService.getAll();

      expect(result).toEqual(mockRacks);
    });

    it("should filter racks by search term", async () => {
      const mockRacks = [{ id: 1, code: "R-001", name: "Rack 1" }];

      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue(mockRacks),
        },
      };

      const result = await warehouseRackService.getAll({ search: "Rack 1" });

      expect(result).toEqual(mockRacks);
    });

    it("should filter racks by zoneId", async () => {
      const mockRacks = [{ id: 1, code: "R-001", zoneId: 1 }];

      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue(mockRacks),
        },
      };

      const result = await warehouseRackService.getAll({ zoneId: 1 });

      expect(result).toEqual(mockRacks);
    });
  });

  describe("getById", () => {
    it("should fetch rack by id with bins", async () => {
      const mockRack = {
        id: 1,
        code: "R-001",
        name: "Rack 1",
        bins: [
          { id: 1, code: "B-001", name: "Bin 1", level: 1 },
          { id: 2, code: "B-002", name: "Bin 2", level: 2 },
        ],
      };

      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(mockRack),
        },
      };

      const result = await warehouseRackService.getById(1);

      expect(result.name).toBe("Rack 1");
      expect(result.bins).toHaveLength(2);
    });

    it("should return null for non-existent rack", async () => {
      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await warehouseRackService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("getByZoneId", () => {
    it("should fetch racks by zone id", async () => {
      const mockRacks = [
        { id: 1, code: "R-001", zoneId: 1 },
        { id: 2, code: "R-002", zoneId: 1 },
      ];

      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue(mockRacks),
        },
      };

      const result = await warehouseRackService.getByZoneId(1);

      expect(result).toEqual(mockRacks);
    });
  });

  describe("update", () => {
    it("should update rack", async () => {
      const rackData = { name: "Rack 1 Updated" };
      const mockRack = { id: 1, code: "R-001", name: "Rack 1 Updated" };

      const mockReturning = vi.fn().mockResolvedValue([mockRack]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      db.update = vi.fn().mockReturnValue({ set: mockSet });

      const result = await warehouseRackService.update(1, rackData);

      expect(result).toEqual(mockRack);
    });

    it("should update rack with new zoneId", async () => {
      const rackData = { name: "Rack 1 Updated", zoneId: 2 };
      const mockZone = { id: 2, name: "Zone B" };
      const mockRack = {
        id: 1,
        code: "R-001",
        name: "Rack 1 Updated",
        zoneId: 2,
      };

      // Mock db.query.warehouseZones.findFirst
      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(mockZone),
        },
      };

      // Mock rack update
      const mockReturning = vi.fn().mockResolvedValue([mockRack]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      db.update = vi.fn().mockReturnValue({ set: mockSet });

      const result = await warehouseRackService.update(1, rackData);

      expect(result.zoneId).toBe(2);
    });

    it("should throw error when updating with non-existent zoneId", async () => {
      const rackData = { zoneId: 999 };

      // Mock db.query.warehouseZones.findFirst to return null
      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      await expect(warehouseRackService.update(1, rackData)).rejects.toThrow(
        "Zone with ID 999 not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete rack without bins", async () => {
      const mockRack = { id: 1, code: "R-001", name: "Rack 1" };

      // Mock db.query.warehouseBins.findMany - no bins
      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      // Mock rack deletion
      const mockReturning = vi.fn().mockResolvedValue([mockRack]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete = vi.fn().mockReturnValue({ where: mockWhere });

      const result = await warehouseRackService.delete(1);

      expect(result).toEqual(mockRack);
    });

    it("should throw error when rack has bins", async () => {
      const mockBins = [{ id: 1, name: "Bin 1" }];

      // Mock db.query.warehouseBins.findMany - has bins
      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      await expect(warehouseRackService.delete(1)).rejects.toThrow(
        "Cannot delete rack. It has 1 bin(s) associated with it."
      );
    });
  });
});

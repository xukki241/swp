import { describe, it, expect, vi } from "vitest";

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

      // Mock zone check
      const mockZoneQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockZone]),
      };
      db.select.mockReturnValue(mockZoneQuery);

      // Mock rack insertion
      const mockInsertQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRack]),
      };
      db.insert.mockReturnValue(mockInsertQuery);

      const result = await warehouseRackService.create(rackData);

      expect(result).toEqual(mockRack);
    });

    it("should throw error when zone does not exist", async () => {
      const rackData = {
        code: "R-001",
        name: "Rack 1",
        zoneId: 999,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

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

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockRacks),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseRackService.getAll();

      expect(result).toEqual(mockRacks);
    });

    it("should filter racks by search term", async () => {
      const mockRacks = [{ id: 1, code: "R-001", name: "Rack 1" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockRacks),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseRackService.getAll({ search: "Rack 1" });

      expect(result).toEqual(mockRacks);
    });

    it("should filter racks by zoneId", async () => {
      const mockRacks = [{ id: 1, code: "R-001", zoneId: 1 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockRacks),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseRackService.getAll({ zoneId: 1 });

      expect(result).toEqual(mockRacks);
    });
  });

  describe("getById", () => {
    it("should fetch rack by id with bins", async () => {
      const mockRack = { id: 1, code: "R-001", name: "Rack 1" };
      const mockBins = [
        { id: 1, code: "B-001", name: "Bin 1", level: 1 },
        { id: 2, code: "B-002", name: "Bin 2", level: 2 },
      ];

      // Mock rack selection
      const mockRackQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockRack]),
      };
      db.select.mockReturnValueOnce(mockRackQuery);

      // Mock bins selection
      const mockBinsQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValueOnce(mockBinsQuery);

      const result = await warehouseRackService.getById(1);

      expect(result.name).toBe("Rack 1");
      expect(result.bins).toEqual(mockBins);
    });

    it("should return null for non-existent rack", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

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

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockRacks),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseRackService.getByZoneId(1);

      expect(result).toEqual(mockRacks);
    });
  });

  describe("update", () => {
    it("should update rack", async () => {
      const rackData = { name: "Rack 1 Updated" };
      const mockRack = { id: 1, code: "R-001", name: "Rack 1 Updated" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRack]),
      };
      db.update.mockReturnValue(mockQuery);

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

      // Mock zone check
      const mockZoneQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockZone]),
      };
      db.select.mockReturnValue(mockZoneQuery);

      // Mock rack update
      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRack]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await warehouseRackService.update(1, rackData);

      expect(result.zoneId).toBe(2);
    });

    it("should throw error when updating with non-existent zoneId", async () => {
      const rackData = { zoneId: 999 };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(warehouseRackService.update(1, rackData)).rejects.toThrow(
        "Zone with ID 999 not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete rack without bins", async () => {
      const mockRack = { id: 1, code: "R-001", name: "Rack 1" };

      // Mock bins check - no bins
      const mockBinsQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockBinsQuery);

      // Mock rack deletion
      const mockDeleteQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockRack]),
      };
      db.delete.mockReturnValue(mockDeleteQuery);

      const result = await warehouseRackService.delete(1);

      expect(result).toEqual(mockRack);
    });

    it("should throw error when rack has bins", async () => {
      const mockBins = [{ id: 1, name: "Bin 1" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      await expect(warehouseRackService.delete(1)).rejects.toThrow(
        "Cannot delete rack"
      );
    });
  });
});

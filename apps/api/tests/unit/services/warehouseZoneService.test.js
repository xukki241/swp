import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { warehouseZoneService } from "@/services/warehouseZoneService.js";

describe("WarehouseZoneService", () => {
  describe("create", () => {
    it("should create new warehouse zone", async () => {
      const zoneData = {
        code: "Z-001",
        name: "Zone A",
        type: "storage",
        location: "Building 1",
      };

      const mockZone = { id: 1, ...zoneData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockZone]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result = await warehouseZoneService.create(zoneData);

      expect(result).toEqual(mockZone);
    });
  });

  describe("getAll", () => {
    it("should fetch all zones without filters", async () => {
      const mockZones = [
        { id: 1, code: "Z-001", name: "Zone A", type: "storage" },
        { id: 2, code: "Z-002", name: "Zone B", type: "quarantine" },
      ];

      db.query = {
        warehouseZones: {
          findMany: vi.fn().mockResolvedValue(mockZones),
        },
      };

      const result = await warehouseZoneService.getAll();

      expect(result).toEqual(mockZones);
    });

    it("should filter zones by search term", async () => {
      const mockZones = [{ id: 1, code: "Z-001", name: "Zone A" }];

      db.query = {
        warehouseZones: {
          findMany: vi.fn().mockResolvedValue(mockZones),
        },
      };

      const result = await warehouseZoneService.getAll({ search: "Zone A" });

      expect(result).toEqual(mockZones);
    });

    it("should filter zones by type", async () => {
      const mockZones = [{ id: 1, code: "Z-001", type: "storage" }];

      db.query = {
        warehouseZones: {
          findMany: vi.fn().mockResolvedValue(mockZones),
        },
      };

      const result = await warehouseZoneService.getAll({ type: "storage" });

      expect(result).toEqual(mockZones);
    });
  });

  describe("getById", () => {
    it("should fetch zone by id with racks", async () => {
      const mockZone = {
        id: 1,
        code: "Z-001",
        name: "Zone A",
        racks: [
          { id: 1, code: "R-001", name: "Rack 1" },
          { id: 2, code: "R-002", name: "Rack 2" },
        ],
      };

      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(mockZone),
        },
      };

      const result = await warehouseZoneService.getById(1);

      expect(result.name).toBe("Zone A");
      expect(result.racks).toHaveLength(2);
    });

    it("should return null for non-existent zone", async () => {
      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await warehouseZoneService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("getByCode", () => {
    it("should fetch zone by code", async () => {
      const mockZone = { id: 1, code: "Z-001", name: "Zone A" };

      db.query = {
        warehouseZones: {
          findFirst: vi.fn().mockResolvedValue(mockZone),
        },
      };

      const result = await warehouseZoneService.getByCode("Z-001");

      expect(result).toEqual(mockZone);
    });
  });

  describe("update", () => {
    it("should update zone", async () => {
      const zoneData = { name: "Zone A Updated" };
      const mockZone = { id: 1, code: "Z-001", name: "Zone A Updated" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockZone]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await warehouseZoneService.update(1, zoneData);

      expect(result).toEqual(mockZone);
    });
  });

  describe("delete", () => {
    it("should delete zone without racks", async () => {
      const mockZone = { id: 1, code: "Z-001", name: "Zone A" };

      // Mock db.query.warehouseRacks.findMany - no racks
      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      // Mock zone deletion
      const mockReturning = vi.fn().mockResolvedValue([mockZone]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      db.delete = vi.fn().mockReturnValue({ where: mockWhere });

      const result = await warehouseZoneService.delete(1);

      expect(result).toEqual(mockZone);
    });

    it("should throw error when zone has racks", async () => {
      const mockRacks = [{ id: 1, name: "Rack 1" }];

      // Mock db.query.warehouseRacks.findMany - has racks
      db.query = {
        warehouseRacks: {
          findMany: vi.fn().mockResolvedValue(mockRacks),
        },
      };

      await expect(warehouseZoneService.delete(1)).rejects.toThrow(
        "Cannot delete zone. It has 1 rack(s) associated with it."
      );
    });
  });
});

import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { warehouseBinService } from "@/services/warehouse/warehouseBinService.js";

describe("WarehouseBinService", () => {
  describe("create", () => {
    it("should create new warehouse bin", async () => {
      const binData = {
        code: "B-001",
        name: "Bin 1",
        rackId: 1,
        level: 1,
        number: 1,
      };

      const mockRack = { id: 1 };
      const mockBin = { id: 1, ...binData };

      // Mock db.query.warehouseRacks.findFirst
      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(mockRack),
        },
      };

      const mockReturning = vi.fn().mockResolvedValue([mockBin]);
      const mockValues = vi.fn().mockReturnValue({ returning: mockReturning });
      db.insert = vi.fn().mockReturnValue({ values: mockValues });

      const result = await warehouseBinService.create(binData);

      expect(result).toEqual(mockBin);
    });

    it("should throw error when rack does not exist", async () => {
      const binData = {
        code: "B-001",
        name: "Bin 1",
        rackId: 999,
      };

      // Mock db.query.warehouseRacks.findFirst to return null
      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      await expect(warehouseBinService.create(binData)).rejects.toThrow(
        "Rack with ID 999 not found"
      );
    });
  });

  describe("getAll", () => {
    it("should fetch all bins without filters", async () => {
      const mockBins = [
        { id: 1, code: "B-001", name: "Bin 1", level: 1 },
        { id: 2, code: "B-002", name: "Bin 2", level: 2 },
      ];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getAll();

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by search term", async () => {
      const mockBins = [{ id: 1, code: "B-001", name: "Bin 1" }];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getAll({ search: "Bin 1" });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by rackId", async () => {
      const mockBins = [{ id: 1, code: "B-001", rackId: 1 }];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getAll({ rackId: 1 });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by zoneId", async () => {
      const mockBins = [{ id: 1, code: "B-001", rack: { zone: { id: 1 } } }];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getAll({ zoneId: 1 });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by level", async () => {
      const mockBins = [{ id: 1, code: "B-001", level: 1 }];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getAll({ level: 1 });

      expect(result).toEqual(mockBins);
    });
  });

  describe("getById", () => {
    it("should fetch bin by id", async () => {
      const mockBin = { id: 1, code: "B-001", name: "Bin 1" };

      db.query = {
        warehouseBins: {
          findFirst: vi.fn().mockResolvedValue(mockBin),
        },
      };

      const result = await warehouseBinService.getById(1);

      expect(result).toEqual(mockBin);
    });
  });

  describe("getByRackId", () => {
    it("should fetch bins by rack id", async () => {
      const mockBins = [
        { id: 1, code: "B-001", rackId: 1 },
        { id: 2, code: "B-002", rackId: 1 },
      ];

      db.query = {
        warehouseBins: {
          findMany: vi.fn().mockResolvedValue(mockBins),
        },
      };

      const result = await warehouseBinService.getByRackId(1);

      expect(result).toEqual(mockBins);
    });
  });

  describe("update", () => {
    it("should update bin", async () => {
      const binData = { name: "Bin 1 Updated" };
      const mockBin = { id: 1, code: "B-001", name: "Bin 1 Updated" };

      const mockReturning = vi.fn().mockResolvedValue([mockBin]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      db.update = vi.fn().mockReturnValue({ set: mockSet });

      const result = await warehouseBinService.update(1, binData);

      expect(result).toEqual(mockBin);
    });

    it("should update bin with new rackId", async () => {
      const binData = { name: "Bin 1 Updated", rackId: 2 };
      const mockRack = { id: 2 };
      const mockBin = {
        id: 1,
        code: "B-001",
        name: "Bin 1 Updated",
        rackId: 2,
      };

      // Mock db.query.warehouseRacks.findFirst
      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(mockRack),
        },
      };

      const mockReturning = vi.fn().mockResolvedValue([mockBin]);
      const mockWhere = vi.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = vi.fn().mockReturnValue({ where: mockWhere });
      db.update = vi.fn().mockReturnValue({ set: mockSet });

      const result = await warehouseBinService.update(1, binData);

      expect(result.rackId).toBe(2);
    });

    it("should throw error when updating with non-existent rackId", async () => {
      const binData = { rackId: 999 };

      // Mock db.query.warehouseRacks.findFirst to return null
      db.query = {
        warehouseRacks: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      await expect(warehouseBinService.update(1, binData)).rejects.toThrow(
        "Rack with ID 999 not found"
      );
    });
  });

  describe("delete", () => {
    it("should delete bin", async () => {
      const mockBin = { id: 1, code: "B-001", name: "Bin 1" };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockBin]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await warehouseBinService.delete(1);

      expect(result).toEqual(mockBin);
    });
  });
});

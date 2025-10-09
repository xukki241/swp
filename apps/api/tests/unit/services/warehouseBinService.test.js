import { describe, it, expect, vi } from "vitest";

import { db } from "@/db/index.js";
import { warehouseBinService } from "@/services/warehouseBinService.js";

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

      const mockRack = { id: 1, code: "R-001", name: "Rack 1" };
      const mockBin = { id: 1, ...binData };

      // Mock rack check
      const mockRackQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockRack]),
      };
      db.select.mockReturnValue(mockRackQuery);

      // Mock bin insertion
      const mockInsertQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockBin]),
      };
      db.insert.mockReturnValue(mockInsertQuery);

      const result = await warehouseBinService.create(binData);

      expect(result).toEqual(mockBin);
    });

    it("should throw error when rack does not exist", async () => {
      const binData = {
        code: "B-001",
        name: "Bin 1",
        rackId: 999,
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

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

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getAll();

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by search term", async () => {
      const mockBins = [{ id: 1, code: "B-001", name: "Bin 1" }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getAll({ search: "Bin 1" });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by rackId", async () => {
      const mockBins = [{ id: 1, code: "B-001", rackId: 1 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getAll({ rackId: 1 });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by zoneId", async () => {
      const mockBins = [{ id: 1, code: "B-001", zoneId: 1 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getAll({ zoneId: 1 });

      expect(result).toEqual(mockBins);
    });

    it("should filter bins by level", async () => {
      const mockBins = [{ id: 1, code: "B-001", level: 1 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getAll({ level: 1 });

      expect(result).toEqual(mockBins);
    });
  });

  describe("getById", () => {
    it("should fetch bin by id", async () => {
      const mockBin = { id: 1, code: "B-001", name: "Bin 1" };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockBin]),
      };
      db.select.mockReturnValue(mockQuery);

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

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockBins),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await warehouseBinService.getByRackId(1);

      expect(result).toEqual(mockBins);
    });
  });

  describe("update", () => {
    it("should update bin", async () => {
      const binData = { name: "Bin 1 Updated" };
      const mockBin = { id: 1, code: "B-001", name: "Bin 1 Updated" };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockBin]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await warehouseBinService.update(1, binData);

      expect(result).toEqual(mockBin);
    });

    it("should update bin with new rackId", async () => {
      const binData = { name: "Bin 1 Updated", rackId: 2 };
      const mockRack = { id: 2, name: "Rack 2" };
      const mockBin = {
        id: 1,
        code: "B-001",
        name: "Bin 1 Updated",
        rackId: 2,
      };

      // Mock rack check
      const mockRackQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockRack]),
      };
      db.select.mockReturnValue(mockRackQuery);

      // Mock bin update
      const mockUpdateQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockBin]),
      };
      db.update.mockReturnValue(mockUpdateQuery);

      const result = await warehouseBinService.update(1, binData);

      expect(result.rackId).toBe(2);
    });

    it("should throw error when updating with non-existent rackId", async () => {
      const binData = { rackId: 999 };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

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

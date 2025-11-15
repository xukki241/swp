import { beforeEach, describe, expect, it, vi } from "vitest";

import { warehouseBinController } from "@/controllers/warehouseBinController.js";
import { inventoryService } from "@/services/inventoryService.js";
import { warehouseBinService } from "@/services/warehouseBinService.js";

vi.mock("@/services/inventoryService.js");
vi.mock("@/services/warehouseBinService.js");

describe("WarehouseBinController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create bin", async () => {
      req.body = {
        rackId: "1",
        code: "B001",
        name: "Bin A",
        level: "1",
        number: "1",
        description: "Test bin",
      };
      warehouseBinService.create.mockResolvedValue({ id: 1 });

      await warehouseBinController.create(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith({
        rackId: "1",
        code: "B001",
        name: "Bin A",
        level: 1,
        number: 1,
        description: "Test bin",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle errors", async () => {
      req.body = {};
      warehouseBinService.create.mockRejectedValue(new Error("Error"));

      await expect(warehouseBinController.create(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("getAll", () => {
    it("should return all bins with filters", async () => {
      req.query = { search: "bin", rackId: "1", zoneId: "2", level: "1" };
      warehouseBinService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseBinController.getAll(req, res);

      expect(warehouseBinService.getAll).toHaveBeenCalledWith({
        search: "bin",
        rackId: "1",
        zoneId: "2",
        level: 1,
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should handle errors", async () => {
      warehouseBinService.getAll.mockRejectedValue(new Error("Error"));

      await expect(warehouseBinController.getAll(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("getById", () => {
    it("should return bin by id", async () => {
      req.params = { id: "1" };
      warehouseBinService.getById.mockResolvedValue({ id: 1 });

      await warehouseBinController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseBinService.getById.mockResolvedValue(null);

      await warehouseBinController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getByRackId", () => {
    it("should return bins by rack id", async () => {
      req.params = { rackId: "1" };
      warehouseBinService.getByRackId.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseBinController.getByRackId(req, res);

      expect(warehouseBinService.getByRackId).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should handle errors", async () => {
      req.params = { rackId: "1" };
      warehouseBinService.getByRackId.mockRejectedValue(new Error("Error"));

      await expect(
        warehouseBinController.getByRackId(req, res)
      ).rejects.toThrow("Error");
    });
  });

  describe("update", () => {
    it("should update bin", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Bin", level: "2", number: "3" };
      warehouseBinService.update.mockResolvedValue({ id: 1 });

      await warehouseBinController.update(req, res);

      expect(warehouseBinService.update).toHaveBeenCalledWith("1", {
        name: "Updated Bin",
        level: 2,
        number: 3,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse bin updated successfully",
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseBinService.update.mockResolvedValue(null);

      await warehouseBinController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete bin", async () => {
      req.params = { id: "1" };
      warehouseBinService.delete.mockResolvedValue({ id: 1 });

      await warehouseBinController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse bin deleted successfully",
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseBinService.delete.mockResolvedValue(null);

      await warehouseBinController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getInventory", () => {
    it("should return inventory items for a bin", async () => {
      req.params = { id: "1" };
      const mockInventory = [
        {
          id: 1,
          medicationVariantId: 10,
          variantName: "Paracetamol 500mg",
          batchNumber: "BATCH001",
          quantity: 500,
          quantityReserved: 50,
          quantityAvailable: 450,
        },
      ];
      inventoryService.getByBinId.mockResolvedValue(mockInventory);

      await warehouseBinController.getInventory(req, res);

      expect(inventoryService.getByBinId).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInventory,
      });
    });

    it("should return empty array if no inventory found", async () => {
      req.params = { id: "999" };
      inventoryService.getByBinId.mockResolvedValue([]);

      await warehouseBinController.getInventory(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [],
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      inventoryService.getByBinId.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        warehouseBinController.getInventory(req, res)
      ).rejects.toThrow("Database error");
    });
  });

  describe("create - batch creation", () => {
    it("should create multiple bins at once", async () => {
      req.body = [
        { rackId: "1", code: "B001", name: "Bin 1", level: "1", number: "1" },
        { rackId: "1", code: "B002", name: "Bin 2", level: "1", number: "2" },
      ];
      const mockBins = [
        { id: 1, rackId: "1", code: "B001" },
        { id: 2, rackId: "1", code: "B002" },
      ];
      warehouseBinService.create.mockResolvedValue(mockBins);

      await warehouseBinController.create(req, res);

      // Array mode doesn't parse level/number, passes them as-is
      expect(warehouseBinService.create).toHaveBeenCalledWith([
        {
          rackId: "1",
          code: "B001",
          name: "Bin 1",
          level: "1",
          number: "1",
          description: undefined,
        },
        {
          rackId: "1",
          code: "B002",
          name: "Bin 2",
          level: "1",
          number: "2",
          description: undefined,
        },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse bins created successfully",
        data: mockBins,
      });
    });

    it("should handle bins with description", async () => {
      req.body = {
        rackId: "1",
        code: "B001",
        name: "Bin A",
        level: "2",
        number: "3",
        description: "Heavy items storage",
      };
      warehouseBinService.create.mockResolvedValue({ id: 1 });

      await warehouseBinController.create(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith({
        rackId: "1",
        code: "B001",
        name: "Bin A",
        level: 2,
        number: 3,
        description: "Heavy items storage",
      });
    });

    it("should handle bins without level and number", async () => {
      req.body = {
        rackId: "1",
        code: "B001",
        name: "Bin A",
      };
      warehouseBinService.create.mockResolvedValue({ id: 1 });

      await warehouseBinController.create(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith({
        rackId: "1",
        code: "B001",
        name: "Bin A",
        level: undefined,
        number: undefined,
        description: undefined,
      });
    });
  });

  describe("createBatch", () => {
    it("should create bins in grid mode", async () => {
      req.params = { rackId: "rack-uuid-1" };
      req.body = {
        mode: "grid",
        levels: 3,
        binsPerLevel: 5,
        codePrefix: "BIN",
        namePrefix: "Bin",
      };
      const mockBins = Array.from({ length: 15 }, (_, i) => ({ id: i + 1 }));
      warehouseBinService.create.mockResolvedValue(mockBins);

      await warehouseBinController.createBatch(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            rackId: "rack-uuid-1",
            code: "BIN-001",
            name: "Bin 1",
            level: 1,
            number: 1,
          }),
          expect.objectContaining({
            rackId: "rack-uuid-1",
            code: "BIN-015",
            name: "Bin 15",
            level: 3,
            number: 5,
          }),
        ])
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "15 warehouse bins created successfully",
        data: mockBins,
      });
    });

    it("should create bins in list mode", async () => {
      req.params = { rackId: "rack-uuid-1" };
      req.body = {
        mode: "list",
        binsPerLevelList: [3, 5, 2],
        codePrefix: "BIN",
        namePrefix: "Bin",
      };
      const mockBins = Array.from({ length: 10 }, (_, i) => ({ id: i + 1 }));
      warehouseBinService.create.mockResolvedValue(mockBins);

      await warehouseBinController.createBatch(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({ level: 1, number: 1 }),
          expect.objectContaining({ level: 1, number: 3 }),
          expect.objectContaining({ level: 2, number: 5 }),
          expect.objectContaining({ level: 3, number: 2 }),
        ])
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should use default code and name prefixes", async () => {
      req.params = { rackId: "rack-uuid-1" };
      req.body = {
        mode: "grid",
        levels: 1,
        binsPerLevel: 1,
      };
      warehouseBinService.create.mockResolvedValue([{ id: 1 }]);

      await warehouseBinController.createBatch(req, res);

      expect(warehouseBinService.create).toHaveBeenCalledWith([
        expect.objectContaining({
          code: "BIN-001",
          name: "Bin 1",
        }),
      ]);
    });

    it("should handle errors", async () => {
      req.params = { rackId: "rack-uuid-1" };
      req.body = { mode: "grid", levels: 2, binsPerLevel: 3 };
      warehouseBinService.create.mockRejectedValue(new Error("Database error"));

      await expect(
        warehouseBinController.createBatch(req, res)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getAll - with filters", () => {
    it("should filter by zoneId", async () => {
      req.query = { zoneId: "zone-uuid-1", limit: "50" };
      warehouseBinService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseBinController.getAll(req, res);

      expect(warehouseBinService.getAll).toHaveBeenCalledWith({
        search: undefined,
        rackId: undefined,
        zoneId: "zone-uuid-1",
        level: undefined,
        limit: "50",
        offset: 0,
      });
    });

    it("should filter by level", async () => {
      req.query = { level: "2" };
      warehouseBinService.getAll.mockResolvedValue([{ id: 1 }]);

      await warehouseBinController.getAll(req, res);

      expect(warehouseBinService.getAll).toHaveBeenCalledWith({
        search: undefined,
        rackId: undefined,
        zoneId: undefined,
        level: 2,
        limit: 100,
        offset: 0,
      });
    });

    it("should combine multiple filters", async () => {
      req.query = {
        search: "bin",
        rackId: "rack-1",
        zoneId: "zone-1",
        level: "3",
        limit: "25",
        offset: "10",
      };
      warehouseBinService.getAll.mockResolvedValue([]);

      await warehouseBinController.getAll(req, res);

      expect(warehouseBinService.getAll).toHaveBeenCalledWith({
        search: "bin",
        rackId: "rack-1",
        zoneId: "zone-1",
        level: 3,
        limit: "25",
        offset: "10",
      });
    });
  });

  describe("update - field conversions", () => {
    it("should convert rackId without parsing", async () => {
      req.params = { id: "1" };
      req.body = { rackId: "new-rack-uuid" };
      warehouseBinService.update.mockResolvedValue({ id: 1 });

      await warehouseBinController.update(req, res);

      expect(warehouseBinService.update).toHaveBeenCalledWith("1", {
        rackId: "new-rack-uuid",
      });
    });

    it("should handle partial updates", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Bin Name" };
      warehouseBinService.update.mockResolvedValue({
        id: 1,
        name: "Updated Bin Name",
      });

      await warehouseBinController.update(req, res);

      expect(warehouseBinService.update).toHaveBeenCalledWith("1", {
        name: "Updated Bin Name",
      });
    });
  });
});

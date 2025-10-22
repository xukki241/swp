import { beforeEach, describe, expect, it, vi } from "vitest";

import { warehouseBinController } from "@/controllers/warehouse/warehouseBinController.js";
import { inventoryService } from "@/services/inventoryService.js";
import { warehouseBinService } from "@/services/warehouse/warehouseBinService.js";

vi.mock("@/services/inventoryService.js");
vi.mock("@/services/warehouse/warehouseBinService.js");

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
});

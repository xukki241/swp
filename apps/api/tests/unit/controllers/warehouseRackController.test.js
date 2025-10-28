import { beforeEach, describe, expect, it, vi } from "vitest";

import { warehouseRackController } from "@/controllers/warehouseRackController.js";
import { warehouseRackService } from "@/services/warehouseRackService.js";

vi.mock("@/services/warehouseRackService.js");

describe("WarehouseRackController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create rack", async () => {
      req.body = { zoneId: "1", code: "R001", name: "Rack A" };
      warehouseRackService.create.mockResolvedValue({ id: 1, zoneId: 1 });

      await warehouseRackController.create(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith({
        zoneId: "1",
        code: "R001",
        name: "Rack A",
        description: undefined,
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle errors", async () => {
      req.body = { zoneId: "1" };
      warehouseRackService.create.mockRejectedValue(new Error("Error"));

      await expect(warehouseRackController.create(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("getAll", () => {
    it("should return all racks with filters", async () => {
      req.query = { search: "rack", zoneId: "1" };
      warehouseRackService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseRackController.getAll(req, res);

      expect(warehouseRackService.getAll).toHaveBeenCalledWith({
        search: "rack",
        zoneId: "1",
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should handle errors", async () => {
      warehouseRackService.getAll.mockRejectedValue(new Error("Error"));

      await expect(warehouseRackController.getAll(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("getById", () => {
    it("should return rack by id", async () => {
      req.params = { id: "1" };
      warehouseRackService.getById.mockResolvedValue({ id: 1 });

      await warehouseRackController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseRackService.getById.mockResolvedValue(null);

      await warehouseRackController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("getByZoneId", () => {
    it("should return racks by zone id", async () => {
      req.params = { zoneId: "1" };
      warehouseRackService.getByZoneId.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await warehouseRackController.getByZoneId(req, res);

      expect(warehouseRackService.getByZoneId).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should handle errors", async () => {
      req.params = { zoneId: "1" };
      warehouseRackService.getByZoneId.mockRejectedValue(new Error("Error"));

      await expect(
        warehouseRackController.getByZoneId(req, res)
      ).rejects.toThrow("Error");
    });
  });

  describe("update", () => {
    it("should update rack", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Rack", zoneId: "2" };
      warehouseRackService.update.mockResolvedValue({
        id: 1,
        name: "Updated Rack",
      });

      await warehouseRackController.update(req, res);

      expect(warehouseRackService.update).toHaveBeenCalledWith(1, {
        name: "Updated Rack",
        zoneId: "2",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse rack updated successfully",
        data: { id: 1, name: "Updated Rack" },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseRackService.update.mockResolvedValue(null);

      await warehouseRackController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete rack", async () => {
      req.params = { id: "1" };
      warehouseRackService.delete.mockResolvedValue({ id: 1 });

      await warehouseRackController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse rack deleted successfully",
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseRackService.delete.mockResolvedValue(null);

      await warehouseRackController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

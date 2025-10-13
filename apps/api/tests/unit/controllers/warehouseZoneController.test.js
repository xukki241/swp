import { describe, it, expect, vi, beforeEach } from "vitest";

import { warehouseZoneController } from "@/controllers/warehouse/warehouseZoneController.js";
import { warehouseZoneService } from "@/services/warehouse/warehouseZoneService.js";

vi.mock("@/services/warehouse/warehouseZoneService.js");

describe("WarehouseZoneController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create zone", async () => {
      req.body = { code: "Z001", name: "Zone A", type: "storage" };
      warehouseZoneService.getByCode.mockResolvedValue(null);
      warehouseZoneService.create.mockResolvedValue({ id: 1, ...req.body });

      await warehouseZoneController.create(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zone created successfully",
        data: { id: 1, ...req.body },
      });
    });

    it("should return 400 if code exists", async () => {
      req.body = { code: "Z001", name: "Zone A" };
      warehouseZoneService.getByCode.mockResolvedValue({ id: 2, code: "Z001" });

      await warehouseZoneController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Zone with code 'Z001' already exists",
      });
    });

    it("should handle errors", async () => {
      req.body = { code: "Z001" };
      warehouseZoneService.getByCode.mockRejectedValue(
        new Error("Database error")
      );

      await warehouseZoneController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAll", () => {
    it("should return all zones with filters", async () => {
      req.query = { search: "zone", type: "storage" };
      warehouseZoneService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseZoneController.getAll(req, res);

      expect(warehouseZoneService.getAll).toHaveBeenCalledWith({
        search: "zone",
        type: "storage",
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: [{ id: 1 }, { id: 2 }],
      });
    });

    it("should handle errors", async () => {
      warehouseZoneService.getAll.mockRejectedValue(
        new Error("Database error")
      );

      await warehouseZoneController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getById", () => {
    it("should return zone by id", async () => {
      req.params = { id: "1" };
      warehouseZoneService.getById.mockResolvedValue({ id: 1, code: "Z001" });

      await warehouseZoneController.getById(req, res);

      expect(warehouseZoneService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: { id: 1, code: "Z001" },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseZoneService.getById.mockResolvedValue(null);

      await warehouseZoneController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update zone", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Zone" };
      warehouseZoneService.update.mockResolvedValue({
        id: 1,
        name: "Updated Zone",
      });

      await warehouseZoneController.update(req, res);

      expect(warehouseZoneService.update).toHaveBeenCalledWith(1, req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zone updated successfully",
        data: { id: 1, name: "Updated Zone" },
      });
    });

    it("should check code uniqueness when updating", async () => {
      req.params = { id: "1" };
      req.body = { code: "Z002" };
      warehouseZoneService.getByCode.mockResolvedValue({ id: 2, code: "Z002" });

      await warehouseZoneController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Zone with code 'Z002' already exists",
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      req.body = { name: "Updated" };
      warehouseZoneService.update.mockResolvedValue(null);

      await warehouseZoneController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete zone", async () => {
      req.params = { id: "1" };
      warehouseZoneService.delete.mockResolvedValue({ id: 1 });

      await warehouseZoneController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zone deleted successfully",
        data: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      warehouseZoneService.delete.mockResolvedValue(null);

      await warehouseZoneController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

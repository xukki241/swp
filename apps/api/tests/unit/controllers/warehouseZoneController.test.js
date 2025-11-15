import { beforeEach, describe, expect, it, vi } from "vitest";

import { warehouseZoneController } from "@/controllers/warehouseZoneController.js";
import { warehouseZoneService } from "@/services/warehouseZoneService.js";

vi.mock("@/services/warehouseZoneService.js");

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

      await expect(warehouseZoneController.create(req, res)).rejects.toThrow(
        "Database error"
      );
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

      await expect(warehouseZoneController.getAll(req, res)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getById", () => {
    it("should return zone by id", async () => {
      req.params = { id: "1" };
      warehouseZoneService.getById.mockResolvedValue({ id: 1, code: "Z001" });

      await warehouseZoneController.getById(req, res);

      expect(warehouseZoneService.getById).toHaveBeenCalledWith("1"); // UUID string
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

      expect(warehouseZoneService.update).toHaveBeenCalledWith("1", req.body); // UUID string
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

  describe("create - batch creation", () => {
    it("should create multiple zones at once", async () => {
      req.body = [
        { code: "Z001", name: "Zone A", type: "storage" },
        { code: "Z002", name: "Zone B", type: "storage" },
        { code: "Z003", name: "Zone C", type: "cold" },
      ];
      const mockZones = [
        { id: 1, code: "Z001", name: "Zone A" },
        { id: 2, code: "Z002", name: "Zone B" },
        { id: 3, code: "Z003", name: "Zone C" },
      ];
      warehouseZoneService.create.mockResolvedValue(mockZones);

      await warehouseZoneController.create(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zones created successfully",
        data: mockZones,
      });
    });

    it("should return 400 for duplicate codes in batch", async () => {
      req.body = [
        { code: "Z001", name: "Zone A" },
        { code: "Z001", name: "Zone B" },
      ];

      await warehouseZoneController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Duplicate zone codes in request payload",
      });
    });

    it("should allow batch with unique codes", async () => {
      req.body = [
        { code: "Z001", name: "Zone A" },
        { code: "Z002", name: "Zone B" },
      ];
      warehouseZoneService.create.mockResolvedValue([
        { id: 1, code: "Z001" },
        { id: 2, code: "Z002" },
      ]);

      await warehouseZoneController.create(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("createBatch", () => {
    it("should create zones in batch with auto-generated codes", async () => {
      req.body = {
        quantity: 5,
        code_prefix: "ZONE",
        name_prefix: "Zone",
      };
      const mockZones = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        code: `ZONE-00${i + 1}`,
        type: "normal",
      }));
      warehouseZoneService.create.mockResolvedValue(mockZones);

      await warehouseZoneController.createBatch(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith([
        { code: "ZONE-001", name: "Zone 1", type: "normal" },
        { code: "ZONE-002", name: "Zone 2", type: "normal" },
        { code: "ZONE-003", name: "Zone 3", type: "normal" },
        { code: "ZONE-004", name: "Zone 4", type: "normal" },
        { code: "ZONE-005", name: "Zone 5", type: "normal" },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "5 warehouse zones created successfully",
        data: mockZones,
      });
    });

    it("should use default prefixes", async () => {
      req.body = { quantity: 2 };
      warehouseZoneService.create.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseZoneController.createBatch(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith([
        { code: "ZONE-001", name: "Zone 1", type: "normal" },
        { code: "ZONE-002", name: "Zone 2", type: "normal" },
      ]);
    });

    it("should handle custom prefixes", async () => {
      req.body = {
        quantity: 3,
        code_prefix: "WZ",
        name_prefix: "Warehouse Zone",
      };
      warehouseZoneService.create.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      await warehouseZoneController.createBatch(req, res);

      expect(warehouseZoneService.create).toHaveBeenCalledWith([
        { code: "WZ-001", name: "Warehouse Zone 1", type: "normal" },
        { code: "WZ-002", name: "Warehouse Zone 2", type: "normal" },
        { code: "WZ-003", name: "Warehouse Zone 3", type: "normal" },
      ]);
    });

    it("should handle errors", async () => {
      req.body = { quantity: 5 };
      warehouseZoneService.create.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        warehouseZoneController.createBatch(req, res)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getAll - with filters", () => {
    it("should filter by type", async () => {
      req.query = { type: "cold" };
      warehouseZoneService.getAll.mockResolvedValue([{ id: 1, type: "cold" }]);

      await warehouseZoneController.getAll(req, res);

      expect(warehouseZoneService.getAll).toHaveBeenCalledWith({
        search: undefined,
        type: "cold",
        limit: 100,
        offset: 0,
      });
    });

    it("should apply search filter", async () => {
      req.query = { search: "cold storage" };
      warehouseZoneService.getAll.mockResolvedValue([{ id: 1 }]);

      await warehouseZoneController.getAll(req, res);

      expect(warehouseZoneService.getAll).toHaveBeenCalledWith({
        search: "cold storage",
        type: undefined,
        limit: 100,
        offset: 0,
      });
    });

    it("should use custom limit and offset", async () => {
      req.query = { limit: "50", offset: "25" };
      warehouseZoneService.getAll.mockResolvedValue([]);

      await warehouseZoneController.getAll(req, res);

      expect(warehouseZoneService.getAll).toHaveBeenCalledWith({
        search: undefined,
        type: undefined,
        limit: "50",
        offset: "25",
      });
    });

    it("should combine multiple filters", async () => {
      req.query = {
        search: "zone",
        type: "normal",
        limit: "20",
        offset: "10",
      };
      warehouseZoneService.getAll.mockResolvedValue([]);

      await warehouseZoneController.getAll(req, res);

      expect(warehouseZoneService.getAll).toHaveBeenCalledWith({
        search: "zone",
        type: "normal",
        limit: "20",
        offset: "10",
      });
    });
  });

  describe("update - code uniqueness validation", () => {
    it("should allow updating with same code", async () => {
      req.params = { id: "1" };
      req.body = { code: "Z001", name: "Updated Zone" };
      warehouseZoneService.getByCode.mockResolvedValue({
        id: "1",
        code: "Z001",
      });
      warehouseZoneService.update.mockResolvedValue({
        id: "1",
        code: "Z001",
        name: "Updated Zone",
      });

      await warehouseZoneController.update(req, res);

      expect(warehouseZoneService.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zone updated successfully",
        data: { id: "1", code: "Z001", name: "Updated Zone" },
      });
    });

    it("should update zone without code change", async () => {
      req.params = { id: "1" };
      req.body = { name: "Updated Name", type: "cold" };
      warehouseZoneService.update.mockResolvedValue({
        id: "1",
        name: "Updated Name",
        type: "cold",
      });

      await warehouseZoneController.update(req, res);

      expect(warehouseZoneService.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse zone updated successfully",
        data: { id: "1", name: "Updated Name", type: "cold" },
      });
    });

    it("should handle partial updates", async () => {
      req.params = { id: "1" };
      req.body = { description: "New description" };
      warehouseZoneService.update.mockResolvedValue({
        id: "1",
        description: "New description",
      });

      await warehouseZoneController.update(req, res);

      expect(warehouseZoneService.update).toHaveBeenCalledWith("1", {
        description: "New description",
      });
    });
  });
});

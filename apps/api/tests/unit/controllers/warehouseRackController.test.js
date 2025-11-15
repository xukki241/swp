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

      // UUID string
      expect(warehouseRackService.update).toHaveBeenCalledWith("1", {
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

  describe("create - batch creation", () => {
    it("should create multiple racks at once", async () => {
      req.body = [
        { zoneId: "zone-1", code: "R001", name: "Rack 1" },
        { zoneId: "zone-1", code: "R002", name: "Rack 2" },
        { zoneId: "zone-1", code: "R003", name: "Rack 3" },
      ];
      const mockRacks = [
        { id: 1, zoneId: "zone-1", code: "R001" },
        { id: 2, zoneId: "zone-1", code: "R002" },
        { id: 3, zoneId: "zone-1", code: "R003" },
      ];
      warehouseRackService.create.mockResolvedValue(mockRacks);

      await warehouseRackController.create(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith([
        {
          zoneId: "zone-1",
          code: "R001",
          name: "Rack 1",
          description: undefined,
        },
        {
          zoneId: "zone-1",
          code: "R002",
          name: "Rack 2",
          description: undefined,
        },
        {
          zoneId: "zone-1",
          code: "R003",
          name: "Rack 3",
          description: undefined,
        },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Warehouse racks created successfully",
        data: mockRacks,
      });
    });

    it("should create single rack with description", async () => {
      req.body = {
        zoneId: "zone-1",
        code: "R001",
        name: "Rack A",
        description: "Heavy duty rack",
      };
      warehouseRackService.create.mockResolvedValue({ id: 1, ...req.body });

      await warehouseRackController.create(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith({
        zoneId: "zone-1",
        code: "R001",
        name: "Rack A",
        description: "Heavy duty rack",
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe("createBatch", () => {
    it("should create racks in batch with auto-generated codes", async () => {
      req.params = { zoneId: "zone-uuid-1" };
      req.body = {
        quantity: 5,
        code_prefix: "RACK",
        name_prefix: "Rack",
      };
      const mockRacks = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        code: `RACK-00${i + 1}`,
      }));
      warehouseRackService.create.mockResolvedValue(mockRacks);

      await warehouseRackController.createBatch(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith([
        { zoneId: "zone-uuid-1", code: "RACK-001", name: "Rack 1" },
        { zoneId: "zone-uuid-1", code: "RACK-002", name: "Rack 2" },
        { zoneId: "zone-uuid-1", code: "RACK-003", name: "Rack 3" },
        { zoneId: "zone-uuid-1", code: "RACK-004", name: "Rack 4" },
        { zoneId: "zone-uuid-1", code: "RACK-005", name: "Rack 5" },
      ]);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "5 warehouse racks created successfully",
        data: mockRacks,
      });
    });

    it("should use default prefixes", async () => {
      req.params = { zoneId: "zone-uuid-1" };
      req.body = { quantity: 2 };
      warehouseRackService.create.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseRackController.createBatch(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith([
        { zoneId: "zone-uuid-1", code: "RACK-001", name: "Rack 1" },
        { zoneId: "zone-uuid-1", code: "RACK-002", name: "Rack 2" },
      ]);
    });

    it("should handle custom prefixes", async () => {
      req.params = { zoneId: "zone-uuid-1" };
      req.body = {
        quantity: 3,
        code_prefix: "R",
        name_prefix: "Storage Rack",
      };
      warehouseRackService.create.mockResolvedValue([
        { id: 1 },
        { id: 2 },
        { id: 3 },
      ]);

      await warehouseRackController.createBatch(req, res);

      expect(warehouseRackService.create).toHaveBeenCalledWith([
        { zoneId: "zone-uuid-1", code: "R-001", name: "Storage Rack 1" },
        { zoneId: "zone-uuid-1", code: "R-002", name: "Storage Rack 2" },
        { zoneId: "zone-uuid-1", code: "R-003", name: "Storage Rack 3" },
      ]);
    });

    it("should handle errors", async () => {
      req.params = { zoneId: "zone-uuid-1" };
      req.body = { quantity: 5 };
      warehouseRackService.create.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        warehouseRackController.createBatch(req, res)
      ).rejects.toThrow("Database error");
    });
  });

  describe("getAll - with filters", () => {
    it("should filter by zoneId", async () => {
      req.query = { zoneId: "zone-uuid-1" };
      warehouseRackService.getAll.mockResolvedValue([{ id: 1 }, { id: 2 }]);

      await warehouseRackController.getAll(req, res);

      expect(warehouseRackService.getAll).toHaveBeenCalledWith({
        search: undefined,
        zoneId: "zone-uuid-1",
        limit: 100,
        offset: 0,
      });
    });

    it("should apply search filter", async () => {
      req.query = { search: "heavy" };
      warehouseRackService.getAll.mockResolvedValue([{ id: 1 }]);

      await warehouseRackController.getAll(req, res);

      expect(warehouseRackService.getAll).toHaveBeenCalledWith({
        search: "heavy",
        zoneId: undefined,
        limit: 100,
        offset: 0,
      });
    });

    it("should use custom limit and offset", async () => {
      req.query = { limit: "25", offset: "50" };
      warehouseRackService.getAll.mockResolvedValue([]);

      await warehouseRackController.getAll(req, res);

      expect(warehouseRackService.getAll).toHaveBeenCalledWith({
        search: undefined,
        zoneId: undefined,
        limit: "25",
        offset: "50",
      });
    });
  });

  describe("update - field handling", () => {
    it("should update only zoneId", async () => {
      req.params = { id: "1" };
      req.body = { zoneId: "new-zone-uuid" };
      warehouseRackService.update.mockResolvedValue({
        id: 1,
        zoneId: "new-zone-uuid",
      });

      await warehouseRackController.update(req, res);

      expect(warehouseRackService.update).toHaveBeenCalledWith("1", {
        zoneId: "new-zone-uuid",
      });
    });

    it("should update multiple fields", async () => {
      req.params = { id: "1" };
      req.body = {
        zoneId: "new-zone-uuid",
        code: "R-NEW",
        name: "Updated Rack",
        description: "New description",
      };
      warehouseRackService.update.mockResolvedValue({ id: 1, ...req.body });

      await warehouseRackController.update(req, res);

      expect(warehouseRackService.update).toHaveBeenCalledWith("1", {
        zoneId: "new-zone-uuid",
        code: "R-NEW",
        name: "Updated Rack",
        description: "New description",
      });
    });
  });
});

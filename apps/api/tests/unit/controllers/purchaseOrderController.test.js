import { beforeEach, describe, expect, it, vi } from "vitest";

import { purchaseOrderController } from "@/controllers/purchaseOrderController.js";
import { purchaseOrderService } from "@/services/purchaseOrderService.js";

vi.mock("@/services/purchaseOrderService.js");

describe("PurchaseOrderController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 1 }, // Mock authenticated user
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create a new purchase order", async () => {
      req.body = {
        supplierId: 1,
        expectedDeliveryDate: "2025-10-15",
        items: [],
      };

      const mockPO = { id: 1, ...req.body };
      purchaseOrderService.create.mockResolvedValue(mockPO);

      await purchaseOrderController.create(req, res);

      expect(purchaseOrderService.create).toHaveBeenCalledWith(
        req.body,
        req.user.id
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockPO);
    });

    it("should handle errors", async () => {
      req.body = {};
      const error = new Error("Validation error");
      purchaseOrderService.create.mockRejectedValue(error);

      await purchaseOrderController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
    });
  });

  describe("getAll", () => {
    it("should return all purchase orders with filters", async () => {
      req.query = {
        supplierId: "1",
        status: "pending",
        limit: "50",
        offset: "0",
      };

      const mockPOs = [
        { id: 1, supplierId: 1, status: "pending" },
        { id: 2, supplierId: 1, status: "pending" },
      ];
      purchaseOrderService.getAll.mockResolvedValue(mockPOs);

      await purchaseOrderController.getAll(req, res);

      expect(purchaseOrderService.getAll).toHaveBeenCalledWith({
        supplierId: "1", // Query params are strings
        status: "pending",
        startDate: undefined,
        endDate: undefined,
        limit: 50,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith(mockPOs);
    });

    it("should use default values for pagination", async () => {
      req.query = {};
      purchaseOrderService.getAll.mockResolvedValue([]);

      await purchaseOrderController.getAll(req, res);

      expect(purchaseOrderService.getAll).toHaveBeenCalledWith({
        supplierId: undefined,
        status: undefined,
        startDate: undefined,
        endDate: undefined,
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      purchaseOrderService.getAll.mockRejectedValue(error);

      await purchaseOrderController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("getById", () => {
    it("should return purchase order by id", async () => {
      req.params.id = "1";
      const mockPO = { id: "1", supplierId: 1 };
      purchaseOrderService.getById.mockResolvedValue(mockPO);

      await purchaseOrderController.getById(req, res);

      expect(purchaseOrderService.getById).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith(mockPO);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderService.getById.mockResolvedValue(null);

      await purchaseOrderController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Purchase order not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      purchaseOrderService.getById.mockRejectedValue(error);

      await purchaseOrderController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("update", () => {
    it("should update purchase order", async () => {
      req.params.id = "1";
      req.body = { status: "approved" };
      const mockPO = { id: "1", status: "approved" };
      purchaseOrderService.update.mockResolvedValue(mockPO);

      await purchaseOrderController.update(req, res);

      expect(purchaseOrderService.update).toHaveBeenCalledWith("1", req.body);
      expect(res.json).toHaveBeenCalledWith(mockPO);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      req.body = { status: "approved" };
      purchaseOrderService.update.mockResolvedValue(null);

      await purchaseOrderController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Purchase order not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      req.body = {};
      const error = new Error("Validation error");
      purchaseOrderService.update.mockRejectedValue(error);

      await purchaseOrderController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
    });
  });

  describe("delete", () => {
    it("should delete purchase order", async () => {
      req.params.id = "1";
      const mockPO = { id: "1", supplierId: 1 };
      purchaseOrderService.delete.mockResolvedValue(mockPO);

      await purchaseOrderController.delete(req, res);

      expect(purchaseOrderService.delete).toHaveBeenCalledWith("1");
      expect(res.json).toHaveBeenCalledWith({
        message: "Purchase order deleted successfully",
        purchaseOrder: mockPO,
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderService.delete.mockResolvedValue(null);

      await purchaseOrderController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Purchase order not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      const error = new Error("Database error");
      purchaseOrderService.delete.mockRejectedValue(error);

      await purchaseOrderController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });
});

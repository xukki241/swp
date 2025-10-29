import { beforeEach, describe, expect, it, vi } from "vitest";

import { purchaseOrderItemController } from "@/controllers/purchaseOrderItemController.js";
import { purchaseOrderItemService } from "@/services/purchaseOrderItemService.js";

vi.mock("@/services/purchaseOrderItemService.js");

describe("PurchaseOrderItemController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create purchase order item", async () => {
      req.body = {
        purchaseOrderId: "1",
        medicationVariantId: 1,
        quantity: 100,
      };
      const mockItem = { id: 1, ...req.body };
      purchaseOrderItemService.create.mockResolvedValue(mockItem);

      await purchaseOrderItemController.create(req, res);

      expect(purchaseOrderItemService.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it("should handle errors", async () => {
      req.body = {};
      purchaseOrderItemService.create.mockRejectedValue(
        new Error("Validation error")
      );

      await purchaseOrderItemController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Validation error" });
    });
  });

  describe("getAll", () => {
    it("should return all items with filters", async () => {
      req.query = { purchaseOrderId: "1", limit: "50" };
      const mockItems = [
        { id: 1, purchaseOrderId: 1 },
        { id: 2, purchaseOrderId: 1 },
      ];
      purchaseOrderItemService.getAll.mockResolvedValue(mockItems);

      await purchaseOrderItemController.getAll(req, res);

      expect(purchaseOrderItemService.getAll).toHaveBeenCalledWith({
        purchaseOrderId: "1",
        limit: 50,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith(mockItems);
    });

    it("should handle errors", async () => {
      purchaseOrderItemService.getAll.mockRejectedValue(
        new Error("Database error")
      );

      await purchaseOrderItemController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getById", () => {
    it("should return item by id", async () => {
      req.params = { id: "1" };
      const mockItem = { id: 1 };
      purchaseOrderItemService.getById.mockResolvedValue(mockItem);

      await purchaseOrderItemController.getById(req, res);

      expect(purchaseOrderItemService.getById).toHaveBeenCalledWith("1"); // UUID string
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderItemService.getById.mockResolvedValue(null);

      await purchaseOrderItemController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update item", async () => {
      req.params = { id: "1" };
      req.body = { quantity: 200 };
      const mockItem = { id: 1, quantity: 200 };
      purchaseOrderItemService.update.mockResolvedValue(mockItem);

      await purchaseOrderItemController.update(req, res);

      // UUID string
      expect(purchaseOrderItemService.update).toHaveBeenCalledWith(
        "1",
        req.body
      );
      expect(res.json).toHaveBeenCalledWith(mockItem);
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderItemService.update.mockResolvedValue(null);

      await purchaseOrderItemController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete item", async () => {
      req.params = { id: "1" };
      const mockItem = { id: 1 };
      purchaseOrderItemService.delete.mockResolvedValue(mockItem);

      await purchaseOrderItemController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Purchase order item deleted successfully",
        purchaseOrderItem: mockItem,
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderItemService.delete.mockResolvedValue(null);

      await purchaseOrderItemController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";

import { purchaseOrderReceiptItemController } from "@/controllers/purchaseOrderReceiptItemController.js";
import { purchaseOrderReceiptItemService } from "@/services/purchaseOrderReceiptItemService.js";

vi.mock("@/services/purchaseOrderReceiptItemService.js");

describe("PurchaseOrderReceiptItemController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create receipt item", async () => {
      req.body = { purchaseOrderReceiptId: 1, purchaseOrderItemId: 1 };
      purchaseOrderReceiptItemService.create.mockResolvedValue({
        id: 1,
        ...req.body,
      });

      await purchaseOrderReceiptItemController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should handle errors", async () => {
      purchaseOrderReceiptItemService.create.mockRejectedValue(
        new Error("Error")
      );

      await purchaseOrderReceiptItemController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAll", () => {
    it("should return all items", async () => {
      req.query = { purchaseOrderReceiptId: "1" };
      purchaseOrderReceiptItemService.getAll.mockResolvedValue([
        { id: 1 },
        { id: 2 },
      ]);

      await purchaseOrderReceiptItemController.getAll(req, res);

      expect(res.json).toHaveBeenCalledWith([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("getById", () => {
    it("should return item by id", async () => {
      req.params = { id: "1" };
      purchaseOrderReceiptItemService.getById.mockResolvedValue({ id: 1 });

      await purchaseOrderReceiptItemController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptItemService.getById.mockResolvedValue(null);

      await purchaseOrderReceiptItemController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update item", async () => {
      req.params = { id: "1" };
      req.body = { quantityReceived: 100 };
      purchaseOrderReceiptItemService.update.mockResolvedValue({ id: 1 });

      await purchaseOrderReceiptItemController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptItemService.update.mockResolvedValue(null);

      await purchaseOrderReceiptItemController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete item", async () => {
      req.params = { id: "1" };
      purchaseOrderReceiptItemService.delete.mockResolvedValue({ id: 1 });

      await purchaseOrderReceiptItemController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Purchase order receipt item deleted successfully",
        purchaseOrderReceiptItem: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptItemService.delete.mockResolvedValue(null);

      await purchaseOrderReceiptItemController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

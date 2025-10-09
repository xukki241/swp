import { describe, it, expect, vi, beforeEach } from "vitest";

import { purchaseOrderReceiptController } from "@/controllers/purchaseOrderReceiptController.js";
import { purchaseOrderReceiptService } from "@/services/purchaseOrderReceiptService.js";

vi.mock("@/services/purchaseOrderReceiptService.js");

describe("PurchaseOrderReceiptController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
  });

  describe("create", () => {
    it("should create receipt", async () => {
      req.body = { purchaseOrderId: 1, receivedBy: 1 };
      const mockReceipt = { id: 1, ...req.body };
      purchaseOrderReceiptService.create.mockResolvedValue(mockReceipt);

      await purchaseOrderReceiptController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockReceipt);
    });

    it("should handle errors", async () => {
      purchaseOrderReceiptService.create.mockRejectedValue(
        new Error("Validation error")
      );

      await purchaseOrderReceiptController.create(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("getAll", () => {
    it("should return all receipts with filters", async () => {
      req.query = { purchaseOrderId: "1", limit: "50" };
      const mockReceipts = [{ id: 1 }, { id: 2 }];
      purchaseOrderReceiptService.getAll.mockResolvedValue(mockReceipts);

      await purchaseOrderReceiptController.getAll(req, res);

      expect(purchaseOrderReceiptService.getAll).toHaveBeenCalledWith({
        purchaseOrderId: 1,
        startDate: undefined,
        endDate: undefined,
        limit: 50,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith(mockReceipts);
    });
  });

  describe("getById", () => {
    it("should return receipt by id", async () => {
      req.params = { id: "1" };
      purchaseOrderReceiptService.getById.mockResolvedValue({ id: 1 });

      await purchaseOrderReceiptController.getById(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1 });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptService.getById.mockResolvedValue(null);

      await purchaseOrderReceiptController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("update", () => {
    it("should update receipt", async () => {
      req.params = { id: "1" };
      req.body = { notes: "Updated notes" };
      purchaseOrderReceiptService.update.mockResolvedValue({
        id: 1,
        notes: "Updated notes",
      });

      await purchaseOrderReceiptController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({ id: 1, notes: "Updated notes" });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptService.update.mockResolvedValue(null);

      await purchaseOrderReceiptController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe("delete", () => {
    it("should delete receipt", async () => {
      req.params = { id: "1" };
      purchaseOrderReceiptService.delete.mockResolvedValue({ id: 1 });

      await purchaseOrderReceiptController.delete(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: "Purchase order receipt deleted successfully",
        purchaseOrderReceipt: { id: 1 },
      });
    });

    it("should return 404 if not found", async () => {
      req.params = { id: "999" };
      purchaseOrderReceiptService.delete.mockResolvedValue(null);

      await purchaseOrderReceiptController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});

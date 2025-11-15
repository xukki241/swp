import { beforeEach, describe, expect, it, vi } from "vitest";

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
      req.body = { purchaseOrderId: "1", receivedBy: 1 };
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
        purchaseOrderId: "1",
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

  describe("getAllByPurchaseOrder", () => {
    it("should return all receipts for a purchase order", async () => {
      req.params = { purchaseOrderId: "po-uuid-1" };
      const mockReceipts = [
        { id: "receipt-1", purchaseOrderId: "po-uuid-1" },
        { id: "receipt-2", purchaseOrderId: "po-uuid-1" },
      ];
      purchaseOrderReceiptService.getAll.mockResolvedValue(mockReceipts);

      await purchaseOrderReceiptController.getAllByPurchaseOrder(req, res);

      expect(purchaseOrderReceiptService.getAll).toHaveBeenCalledWith({
        purchaseOrderId: "po-uuid-1",
      });
      expect(res.json).toHaveBeenCalledWith(mockReceipts);
    });

    it("should handle errors", async () => {
      req.params = { purchaseOrderId: "po-uuid-1" };
      purchaseOrderReceiptService.getAll.mockRejectedValue(
        new Error("Database error")
      );

      await purchaseOrderReceiptController.getAllByPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: "Database error" });
    });
  });

  describe("getAllocations", () => {
    it("should return inventory allocations for a receipt", async () => {
      req.params = { id: "receipt-uuid-1" };
      const mockAllocations = [
        { binId: "bin-1", quantity: 100 },
        { binId: "bin-2", quantity: 50 },
      ];

      // Mock the dynamic import
      const mockInventoryAllocationService = {
        getReceiptAllocations: vi.fn().mockResolvedValue(mockAllocations),
      };
      vi.doMock("@/services/inventoryAllocationService.js", () => ({
        inventoryAllocationService: mockInventoryAllocationService,
      }));

      await purchaseOrderReceiptController.getAllocations(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockAllocations,
      });
    });

    it("should handle errors in getAllocations", async () => {
      req.params = { id: "receipt-uuid-1" };

      // Mock the dynamic import to throw an error
      vi.doMock("@/services/inventoryAllocationService.js", () => {
        throw new Error("Service error");
      });

      await purchaseOrderReceiptController.getAllocations(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("findAvailableBins", () => {
    it("should find available bins for receipt items", async () => {
      req.body = {
        items: [
          { medicationVariantId: "var-1", quantity: 100 },
          { medicationVariantId: "var-2", quantity: 200 },
        ],
      };

      const mockResults = [
        { medicationVariantId: "var-1", bins: [{ binId: "bin-1" }] },
        { medicationVariantId: "var-2", bins: [{ binId: "bin-2" }] },
      ];

      // Mock the dynamic import
      const mockWarehouseAllocationService = {
        findBinsForItems: vi.fn().mockResolvedValue(mockResults),
      };
      vi.doMock("@/services/warehouseAllocationService.js", () => ({
        warehouseAllocationService: mockWarehouseAllocationService,
      }));

      await purchaseOrderReceiptController.findAvailableBins(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResults,
      });
    });

    it("should return 400 if items array is missing", async () => {
      req.body = {};

      await purchaseOrderReceiptController.findAvailableBins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Items array is required",
      });
    });

    it("should return 400 if items is not an array", async () => {
      req.body = { items: "not-an-array" };

      await purchaseOrderReceiptController.findAvailableBins(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Items array is required",
      });
    });

    it("should handle errors in findAvailableBins", async () => {
      req.body = {
        items: [{ medicationVariantId: "var-1", quantity: 100 }],
      };

      // Mock the dynamic import to throw an error
      vi.doMock("@/services/warehouseAllocationService.js", () => {
        throw new Error("Allocation error");
      });

      await purchaseOrderReceiptController.findAvailableBins(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("create - advanced scenarios", () => {
    it("should handle receivedDate in request", async () => {
      req.params = { purchaseOrderId: "po-uuid-1" };
      req.body = {
        receivedDate: "2025-01-15",
        receivedBy: "user-uuid-1",
        items: [{ medicationVariantId: "var-1", quantity: 100 }],
      };
      const mockReceipt = { id: "receipt-1", ...req.body };
      purchaseOrderReceiptService.create.mockResolvedValue(mockReceipt);

      await purchaseOrderReceiptController.create(req, res);

      expect(purchaseOrderReceiptService.create).toHaveBeenCalledWith({
        purchaseOrderId: "po-uuid-1",
        receivedDate: "2025-01-15",
        receivedBy: "user-uuid-1",
        items: [{ medicationVariantId: "var-1", quantity: 100 }],
      });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("should filter out undefined fields", async () => {
      req.params = { purchaseOrderId: "po-uuid-1" };
      req.body = {
        receivedBy: "user-uuid-1",
        notes: undefined,
        items: [],
      };
      const mockReceipt = { id: "receipt-1" };
      purchaseOrderReceiptService.create.mockResolvedValue(mockReceipt);

      await purchaseOrderReceiptController.create(req, res);

      expect(purchaseOrderReceiptService.create).toHaveBeenCalledWith({
        purchaseOrderId: "po-uuid-1",
        receivedBy: "user-uuid-1",
        items: [],
      });
    });
  });

  describe("getAll - with date filters", () => {
    it("should filter by date range", async () => {
      req.query = {
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        limit: "25",
        offset: "10",
      };
      const mockReceipts = [{ id: 1 }, { id: 2 }];
      purchaseOrderReceiptService.getAll.mockResolvedValue(mockReceipts);

      await purchaseOrderReceiptController.getAll(req, res);

      expect(purchaseOrderReceiptService.getAll).toHaveBeenCalledWith({
        purchaseOrderId: undefined,
        startDate: "2025-01-01",
        endDate: "2025-01-31",
        limit: 25,
        offset: 10,
      });
      expect(res.json).toHaveBeenCalledWith(mockReceipts);
    });
  });

  describe("update - error handling", () => {
    it("should handle update errors", async () => {
      req.params = { id: "1" };
      req.body = { notes: "Updated" };
      purchaseOrderReceiptService.update.mockRejectedValue(
        new Error("Update failed")
      );

      await purchaseOrderReceiptController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: "Update failed" });
    });
  });
});

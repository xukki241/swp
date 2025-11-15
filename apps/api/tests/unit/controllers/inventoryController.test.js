import { beforeEach, describe, expect, it, vi } from "vitest";

import { inventoryController } from "@/controllers/inventoryController.js";
import { inventoryService } from "@/services/inventoryService.js";

vi.mock("@/services/inventoryService.js");

describe("InventoryController", () => {
  let req, res;

  beforeEach(() => {
    req = { body: {}, params: {}, query: {} };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    // Mock all inventory service methods
    inventoryService.getAll = vi.fn();
    inventoryService.getById = vi.fn();
    inventoryService.getLowStock = vi.fn();
    inventoryService.getExpiringSoon = vi.fn();
    inventoryService.getByLocation = vi.fn();
    inventoryService.adjustQuantity = vi.fn();
    inventoryService.transferInventory = vi.fn();
    inventoryService.reserveInventory = vi.fn();
    inventoryService.unreserveInventory = vi.fn();
  });

  describe("getAll", () => {
    it("should return all inventory items with filters", async () => {
      req.query = {
        medication_variant_id: "1",
        bin_id: "2",
        batchNumber: "BATCH001",
        limit: "50",
        page: "2",
      };
      const mockInventory = [
        { id: 1, quantity: 100 },
        { id: 2, quantity: 200 },
      ];
      inventoryService.getAll.mockResolvedValue({
        data: mockInventory,
        total: 2,
      });

      await inventoryController.getAll(req, res);

      expect(inventoryService.getAll).toHaveBeenCalledWith({
        medicationVariantId: "1",
        binId: "2",
        batchNumber: "BATCH001",
        expiryDateFrom: undefined,
        expiryDateTo: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 50,
        offset: 50,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInventory,
        pagination: {
          page: 2,
          limit: 50,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should use default pagination values", async () => {
      req.query = {};
      inventoryService.getAll.mockResolvedValue({ data: [], total: 0 });

      await inventoryController.getAll(req, res);

      expect(inventoryService.getAll).toHaveBeenCalledWith({
        medicationVariantId: undefined,
        binId: undefined,
        batchNumber: undefined,
        expiryDateFrom: undefined,
        expiryDateTo: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getAll.mockRejectedValue(new Error("Database error"));

      await expect(inventoryController.getAll(req, res)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getById", () => {
    it("should return inventory item by id", async () => {
      req.params = { id: "uuid-123" };
      const mockItem = { id: "uuid-123", quantity: 100 };
      inventoryService.getById.mockResolvedValue(mockItem);

      await inventoryController.getById(req, res);

      expect(inventoryService.getById).toHaveBeenCalledWith("uuid-123");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItem,
      });
    });

    it("should return 404 if item not found", async () => {
      req.params = { id: "uuid-999" };
      inventoryService.getById.mockResolvedValue(null);

      await inventoryController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Inventory item not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "uuid-123" };
      inventoryService.getById.mockRejectedValue(new Error("Database error"));

      await expect(inventoryController.getById(req, res)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("getLowStock", () => {
    it("should return low stock items", async () => {
      req.query = { threshold: "50", limit: "50", offset: "10", page: "2" };
      const mockItems = [{ id: 1, quantity: 30 }];
      inventoryService.getLowStock.mockResolvedValue({
        data: mockItems,
        total: 1,
      });

      await inventoryController.getLowStock(req, res);

      expect(inventoryService.getLowStock).toHaveBeenCalledWith({
        threshold: 50,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 50,
        offset: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItems,
        pagination: {
          page: 2,
          limit: 50,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should use default threshold", async () => {
      req.query = {};
      inventoryService.getLowStock.mockResolvedValue({ data: [], total: 0 });

      await inventoryController.getLowStock(req, res);

      expect(inventoryService.getLowStock).toHaveBeenCalledWith({
        threshold: 250,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 50,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getLowStock.mockRejectedValue(new Error("Error"));

      await expect(inventoryController.getLowStock(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("getExpiringSoon", () => {
    it("should return items expiring within specified days", async () => {
      req.query = { daysUntilExpiry: "60" };
      const mockItems = [{ id: 1, daysUntilExpiry: 45 }];
      inventoryService.getExpiringSoon.mockResolvedValue({
        data: mockItems,
        total: 1,
      });

      await inventoryController.getExpiringSoon(req, res);

      expect(inventoryService.getExpiringSoon).toHaveBeenCalledWith({
        daysUntilExpiry: 60,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItems,
        pagination: {
          page: 1,
          limit: 100,
          total: 1,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should use default days value", async () => {
      req.query = {};
      inventoryService.getExpiringSoon.mockResolvedValue({
        data: [],
        total: 0,
      });

      await inventoryController.getExpiringSoon(req, res);

      expect(inventoryService.getExpiringSoon).toHaveBeenCalledWith({
        daysUntilExpiry: 30,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getExpiringSoon.mockRejectedValue(new Error("Error"));

      await expect(
        inventoryController.getExpiringSoon(req, res)
      ).rejects.toThrow("Error");
    });
  });

  describe("getByLocation", () => {
    it("should return inventory grouped by location", async () => {
      req.query = { zoneId: "zone-1", rackId: "rack-2" };
      const mockData = [{ zoneCode: "Z001", totalQuantity: 1000 }];
      inventoryService.getByLocation.mockResolvedValue(mockData);

      await inventoryController.getByLocation(req, res);

      expect(inventoryService.getByLocation).toHaveBeenCalledWith({
        zoneId: "zone-1",
        rackId: "rack-2",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getByLocation.mockRejectedValue(new Error("Error"));

      await expect(inventoryController.getByLocation(req, res)).rejects.toThrow(
        "Error"
      );
    });
  });

  describe("adjustQuantity", () => {
    it("should adjust inventory quantity with increase", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        adjustmentType: "increase",
        quantity: "50",
        reason: "Correction",
      };
      const mockResult = {
        id: "inv-uuid-1",
        previousQuantity: 100,
        newQuantity: 150,
      };
      inventoryService.adjustQuantity.mockResolvedValue(mockResult);

      await inventoryController.adjustQuantity(req, res);

      expect(inventoryService.adjustQuantity).toHaveBeenCalledWith({
        inventoryId: "inv-uuid-1",
        adjustmentType: "increase",
        quantity: 50,
        reason: "Correction",
        notes: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory adjusted successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "inv-uuid-1" };

      await inventoryController.adjustQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "inventoryId, adjustmentType, and quantity are required",
      });
    });

    it("should validate adjustment type", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        adjustmentType: "invalid",
        quantity: "50",
        reason: "Test",
      };

      await inventoryController.adjustQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "adjustmentType must be 'increase' or 'decrease'",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        adjustmentType: "decrease",
        quantity: "50",
        reason: "Test",
      };
      inventoryService.adjustQuantity.mockRejectedValue(
        new Error("Insufficient quantity")
      );

      await expect(
        inventoryController.adjustQuantity(req, res)
      ).rejects.toThrow("Insufficient quantity");
    });
  });

  describe("transferInventory", () => {
    it("should transfer inventory between bins", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        fromBinId: "bin-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: "100",
        reason: "Reorganization",
      };
      const mockResult = { success: true };
      inventoryService.transferInventory.mockResolvedValue(mockResult);

      await inventoryController.transferInventory(req, res);

      expect(inventoryService.transferInventory).toHaveBeenCalledWith({
        inventoryId: "inv-uuid-1",
        fromBinId: "bin-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: 100,
        reason: "Reorganization",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory transferred successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "inv-uuid-1" };

      await inventoryController.transferInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should validate same bin transfer", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        fromBinId: "bin-uuid-1",
        toBinId: "bin-uuid-1",
        quantity: "50",
      };

      await inventoryController.transferInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Cannot transfer to the same bin",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        fromBinId: "bin-uuid-2",
        toBinId: "bin-uuid-3",
        quantity: "100",
        reason: "Test",
      };
      inventoryService.transferInventory.mockRejectedValue(
        new Error("Insufficient quantity")
      );

      await expect(
        inventoryController.transferInventory(req, res)
      ).rejects.toThrow("Insufficient quantity");
    });
  });

  describe("reserveInventory", () => {
    it("should reserve inventory successfully", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        quantity: "50",
        reservationReason: "For order",
      };
      const mockResult = {
        id: "inv-uuid-1",
        quantity: 500,
        quantityReserved: 100,
        quantityAvailable: 400,
      };
      inventoryService.reserveInventory.mockResolvedValue(mockResult);

      await inventoryController.reserveInventory(req, res);

      expect(inventoryService.reserveInventory).toHaveBeenCalledWith({
        inventoryId: "inv-uuid-1",
        quantity: 50,
        reservationReason: "For order",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory reserved successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "inv-uuid-1" };

      await inventoryController.reserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        quantity: "50",
        reservationReason: "Test",
      };
      inventoryService.reserveInventory.mockRejectedValue(
        new Error("Insufficient available quantity")
      );

      await expect(
        inventoryController.reserveInventory(req, res)
      ).rejects.toThrow("Insufficient available quantity");
    });
  });

  describe("unreserveInventory", () => {
    it("should unreserve inventory successfully", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        quantity: "50",
      };
      const mockResult = {
        id: "inv-uuid-1",
        quantity: 500,
        quantityReserved: 50,
        quantityAvailable: 450,
      };
      inventoryService.unreserveInventory.mockResolvedValue(mockResult);

      await inventoryController.unreserveInventory(req, res);

      expect(inventoryService.unreserveInventory).toHaveBeenCalledWith({
        inventoryId: "inv-uuid-1",
        quantity: 50,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory unreserved successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "inv-uuid-1" };

      await inventoryController.unreserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "inv-uuid-1",
        quantity: "50",
      };
      inventoryService.unreserveInventory.mockRejectedValue(
        new Error("Insufficient reserved quantity")
      );

      await expect(
        inventoryController.unreserveInventory(req, res)
      ).rejects.toThrow("Insufficient reserved quantity");
    });
  });

  describe("getSummaryByVariant", () => {
    it("should return inventory summary by variant with pagination", async () => {
      req.query = { page: "1", limit: "50" };
      const mockData = [
        { medicationVariantId: "1", totalQuantity: 1000 },
        { medicationVariantId: "2", totalQuantity: 500 },
      ];
      inventoryService.getSummaryByVariant.mockResolvedValue({
        data: mockData,
        total: 2,
      });

      await inventoryController.getSummaryByVariant(req, res);

      expect(inventoryService.getSummaryByVariant).toHaveBeenCalledWith({
        sortBy: undefined,
        sortOrder: undefined,
        limit: 50,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
        pagination: {
          page: 1,
          limit: 50,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should handle errors", async () => {
      inventoryService.getSummaryByVariant.mockRejectedValue(
        new Error("Database error")
      );

      await expect(
        inventoryController.getSummaryByVariant(req, res)
      ).rejects.toThrow("Database error");
    });
  });

  describe("update", () => {
    it("should update inventory item successfully", async () => {
      req.params = { inventoryBatchId: "inv-uuid-1" };
      req.body = { quantity: "500", notes: "Updated" };
      const mockItem = { id: "inv-uuid-1", quantity: 500, notes: "Updated" };
      inventoryService.update.mockResolvedValue(mockItem);

      await inventoryController.update(req, res);

      expect(inventoryService.update).toHaveBeenCalledWith("inv-uuid-1", {
        quantity: "500",
        notes: "Updated",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inventory item updated successfully",
        data: mockItem,
      });
    });

    it("should return 404 if item not found", async () => {
      req.params = { inventoryBatchId: "inv-uuid-999" };
      req.body = { quantity: "500" };
      inventoryService.update.mockResolvedValue(null);

      await inventoryController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Inventory item not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { inventoryBatchId: "inv-uuid-1" };
      req.body = { quantity: "500" };
      inventoryService.update.mockRejectedValue(new Error("Update error"));

      await expect(inventoryController.update(req, res)).rejects.toThrow(
        "Update error"
      );
    });
  });

  describe("adjust", () => {
    it("should adjust inventory quantity successfully", async () => {
      req.params = { inventoryBatchId: "inv-uuid-1" };
      req.body = { newQuantity: "600", reason: "Stock correction" };
      const mockCurrentInventory = {
        id: "inv-uuid-1",
        quantity: 500,
        quantityReserved: 50,
      };
      const mockUpdated = { ...mockCurrentInventory, quantity: 600 };
      inventoryService.getById.mockResolvedValue(mockCurrentInventory);
      inventoryService.update.mockResolvedValue(mockUpdated);

      await inventoryController.adjust(req, res);

      expect(inventoryService.getById).toHaveBeenCalledWith("inv-uuid-1");
      expect(inventoryService.update).toHaveBeenCalledWith("inv-uuid-1", {
        quantity: "600",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inventory adjusted successfully. Reason: Stock correction",
        data: mockUpdated,
      });
    });

    it("should return 404 if inventory not found", async () => {
      req.params = { inventoryBatchId: "inv-uuid-999" };
      req.body = { newQuantity: "600", reason: "Test" };
      inventoryService.getById.mockResolvedValue(null);

      await inventoryController.adjust(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Inventory item not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { inventoryBatchId: "inv-uuid-1" };
      req.body = { newQuantity: "600", reason: "Test" };
      inventoryService.getById.mockRejectedValue(new Error("Database error"));

      await expect(inventoryController.adjust(req, res)).rejects.toThrow(
        "Database error"
      );
    });
  });

  describe("move", () => {
    it("should move inventory between bins successfully", async () => {
      req.body = {
        fromInventoryId: "inv-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: 100,
        reason: "Reorganization",
      };
      const mockFromInventory = {
        id: "inv-uuid-1",
        quantity: 500,
        quantityReserved: 50,
        medicationVariantId: "var-1",
        batchNumber: "BATCH001",
        manufactureDate: "2024-01-01",
        expiryDate: "2026-01-01",
        purchaseOrderReceiptItemsId: "receipt-1",
      };
      inventoryService.getById.mockResolvedValue(mockFromInventory);
      inventoryService.move.mockResolvedValue({});

      await inventoryController.move(req, res);

      expect(inventoryService.getById).toHaveBeenCalledWith("inv-uuid-1");
      expect(inventoryService.move).toHaveBeenCalledWith({
        fromInventoryId: "inv-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: 100,
        reason: "Reorganization",
        medicationVariantId: "var-1",
        batchNumber: "BATCH001",
        manufactureDate: "2024-01-01",
        expiryDate: "2026-01-01",
        purchaseOrderReceiptItemsId: "receipt-1",
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Inventory moved successfully. Reason: Reorganization",
      });
    });

    it("should return 404 if source inventory not found", async () => {
      req.body = {
        fromInventoryId: "inv-uuid-999",
        toBinId: "bin-uuid-2",
        quantity: 100,
        reason: "Test",
      };
      inventoryService.getById.mockResolvedValue(null);

      await inventoryController.move(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Source inventory not found",
      });
    });

    it("should return 400 if insufficient available quantity", async () => {
      req.body = {
        fromInventoryId: "inv-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: 500,
        reason: "Test",
      };
      const mockFromInventory = {
        id: "inv-uuid-1",
        quantity: 500,
        quantityReserved: 100,
      };
      inventoryService.getById.mockResolvedValue(mockFromInventory);

      await inventoryController.move(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Insufficient available quantity in source inventory",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        fromInventoryId: "inv-uuid-1",
        toBinId: "bin-uuid-2",
        quantity: 100,
        reason: "Test",
      };
      inventoryService.getById.mockRejectedValue(new Error("Database error"));

      await expect(inventoryController.move(req, res)).rejects.toThrow(
        "Database error"
      );
    });
  });
});

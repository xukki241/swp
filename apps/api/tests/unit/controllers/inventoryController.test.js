import { describe, it, expect, vi, beforeEach } from "vitest";

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
  });

  describe("getAll", () => {
    it("should return all inventory items with filters", async () => {
      req.query = {
        medicationVariantId: "1",
        binId: "2",
        batchNumber: "BATCH001",
        limit: "50",
        offset: "10",
      };
      const mockInventory = [
        { id: 1, quantity: 100 },
        { id: 2, quantity: 200 },
      ];
      inventoryService.getAll.mockResolvedValue(mockInventory);

      await inventoryController.getAll(req, res);

      expect(inventoryService.getAll).toHaveBeenCalledWith({
        medicationVariantId: 1,
        binId: 2,
        batchNumber: "BATCH001",
        limit: 50,
        offset: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockInventory,
        pagination: {
          total: 2,
          limit: 50,
          offset: 10,
        },
      });
    });

    it("should use default pagination values", async () => {
      req.query = {};
      inventoryService.getAll.mockResolvedValue([]);

      await inventoryController.getAll(req, res);

      expect(inventoryService.getAll).toHaveBeenCalledWith({
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getAll.mockRejectedValue(new Error("Database error"));

      await inventoryController.getAll(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Failed to retrieve inventory",
        details: "Database error",
      });
    });
  });

  describe("getById", () => {
    it("should return inventory item by id", async () => {
      req.params = { id: "1" };
      const mockItem = { id: 1, quantity: 100 };
      inventoryService.getById.mockResolvedValue(mockItem);

      await inventoryController.getById(req, res);

      expect(inventoryService.getById).toHaveBeenCalledWith(1);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItem,
      });
    });

    it("should return 404 if item not found", async () => {
      req.params = { id: "999" };
      inventoryService.getById.mockResolvedValue(null);

      await inventoryController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Inventory item not found",
      });
    });

    it("should handle errors", async () => {
      req.params = { id: "1" };
      inventoryService.getById.mockRejectedValue(new Error("Database error"));

      await inventoryController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getLowStock", () => {
    it("should return low stock items with custom threshold", async () => {
      req.query = { threshold: "50", limit: "20" };
      const mockItems = [{ id: 1, totalAvailable: 30 }];
      inventoryService.getLowStock.mockResolvedValue(mockItems);

      await inventoryController.getLowStock(req, res);

      expect(inventoryService.getLowStock).toHaveBeenCalledWith({
        threshold: 50,
        limit: 20,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItems,
        pagination: {
          total: 1,
          limit: 20,
          offset: 0,
        },
      });
    });

    it("should use default threshold", async () => {
      req.query = {};
      inventoryService.getLowStock.mockResolvedValue([]);

      await inventoryController.getLowStock(req, res);

      expect(inventoryService.getLowStock).toHaveBeenCalledWith({
        threshold: 100,
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getLowStock.mockRejectedValue(new Error("Error"));

      await inventoryController.getLowStock(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getExpiringSoon", () => {
    it("should return items expiring within specified days", async () => {
      req.query = { days: "60" };
      const mockItems = [{ id: 1, daysUntilExpiry: 45 }];
      inventoryService.getExpiringSoon.mockResolvedValue(mockItems);

      await inventoryController.getExpiringSoon(req, res);

      expect(inventoryService.getExpiringSoon).toHaveBeenCalledWith({
        days: 60,
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockItems,
        pagination: {
          total: 1,
          limit: 100,
          offset: 0,
        },
      });
    });

    it("should use default days value", async () => {
      req.query = {};
      inventoryService.getExpiringSoon.mockResolvedValue([]);

      await inventoryController.getExpiringSoon(req, res);

      expect(inventoryService.getExpiringSoon).toHaveBeenCalledWith({
        days: 30,
        limit: 100,
        offset: 0,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getExpiringSoon.mockRejectedValue(new Error("Error"));

      await inventoryController.getExpiringSoon(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getByLocation", () => {
    it("should return inventory grouped by location", async () => {
      req.query = { zoneId: "1", rackId: "2" };
      const mockData = [{ zoneCode: "Z001", totalQuantity: 1000 }];
      inventoryService.getByLocation.mockResolvedValue(mockData);

      await inventoryController.getByLocation(req, res);

      expect(inventoryService.getByLocation).toHaveBeenCalledWith({
        zoneId: 1,
        rackId: 2,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockData,
      });
    });

    it("should handle errors", async () => {
      inventoryService.getByLocation.mockRejectedValue(new Error("Error"));

      await inventoryController.getByLocation(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("adjustQuantity", () => {
    it("should adjust inventory quantity with increase", async () => {
      req.body = {
        inventoryId: "1",
        adjustmentType: "increase",
        quantity: "50",
        reason: "Correction",
      };
      const mockResult = {
        id: 1,
        previousQuantity: 100,
        newQuantity: 150,
      };
      inventoryService.adjustQuantity.mockResolvedValue(mockResult);

      await inventoryController.adjustQuantity(req, res);

      expect(inventoryService.adjustQuantity).toHaveBeenCalledWith({
        inventoryId: 1,
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
      req.body = { inventoryId: "1" };

      await inventoryController.adjustQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Missing required fields: adjustmentType, quantity, reason",
      });
    });

    it("should validate adjustment type", async () => {
      req.body = {
        inventoryId: "1",
        adjustmentType: "invalid",
        quantity: "50",
        reason: "Test",
      };

      await inventoryController.adjustQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Invalid adjustment type. Must be 'increase' or 'decrease'",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "1",
        adjustmentType: "increase",
        quantity: "50",
        reason: "Test",
      };
      inventoryService.adjustQuantity.mockRejectedValue(
        new Error("Insufficient quantity")
      );

      await inventoryController.adjustQuantity(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("transferInventory", () => {
    it("should transfer inventory between bins", async () => {
      req.body = {
        inventoryId: "1",
        fromBinId: "2",
        toBinId: "3",
        quantity: "100",
        reason: "Reorganization",
      };
      const mockResult = {
        sourceInventory: { id: 1, quantity: 400 },
        destinationInventory: { id: 2, quantity: 100 },
      };
      inventoryService.transferInventory.mockResolvedValue(mockResult);

      await inventoryController.transferInventory(req, res);

      expect(inventoryService.transferInventory).toHaveBeenCalledWith({
        inventoryId: 1,
        fromBinId: 2,
        toBinId: 3,
        quantity: 100,
        reason: "Reorganization",
        notes: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory transferred successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "1" };

      await inventoryController.transferInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should validate same bin transfer", async () => {
      req.body = {
        inventoryId: "1",
        fromBinId: "2",
        toBinId: "2",
        quantity: "100",
        reason: "Test",
      };

      await inventoryController.transferInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Cannot transfer to the same bin",
      });
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "1",
        fromBinId: "2",
        toBinId: "3",
        quantity: "100",
        reason: "Test",
      };
      inventoryService.transferInventory.mockRejectedValue(
        new Error("Insufficient quantity")
      );

      await inventoryController.transferInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("reserveInventory", () => {
    it("should reserve inventory successfully", async () => {
      req.body = {
        inventoryId: "1",
        quantity: "50",
        orderId: "ORD001",
      };
      const mockResult = {
        id: 1,
        quantity: 500,
        quantityReserved: 100,
        quantityAvailable: 400,
      };
      inventoryService.reserveInventory.mockResolvedValue(mockResult);

      await inventoryController.reserveInventory(req, res);

      expect(inventoryService.reserveInventory).toHaveBeenCalledWith({
        inventoryId: 1,
        quantity: 50,
        orderId: "ORD001",
        notes: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory reserved successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "1" };

      await inventoryController.reserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "1",
        quantity: "50",
        orderId: "ORD001",
      };
      inventoryService.reserveInventory.mockRejectedValue(
        new Error("Insufficient available quantity")
      );

      await inventoryController.reserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe("unreserveInventory", () => {
    it("should unreserve inventory successfully", async () => {
      req.body = {
        inventoryId: "1",
        quantity: "50",
        orderId: "ORD001",
      };
      const mockResult = {
        id: 1,
        quantity: 500,
        quantityReserved: 50,
        quantityAvailable: 450,
      };
      inventoryService.unreserveInventory.mockResolvedValue(mockResult);

      await inventoryController.unreserveInventory(req, res);

      expect(inventoryService.unreserveInventory).toHaveBeenCalledWith({
        inventoryId: 1,
        quantity: 50,
        orderId: "ORD001",
        notes: undefined,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult,
        message: "Inventory unreserved successfully",
      });
    });

    it("should validate required fields", async () => {
      req.body = { inventoryId: "1" };

      await inventoryController.unreserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should handle errors", async () => {
      req.body = {
        inventoryId: "1",
        quantity: "50",
        orderId: "ORD001",
      };
      inventoryService.unreserveInventory.mockRejectedValue(
        new Error("Insufficient reserved quantity")
      );

      await inventoryController.unreserveInventory(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});

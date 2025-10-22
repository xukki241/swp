import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { purchaseOrderItemService } from "@/services/purchaseOrderItemService.js";

describe("PurchaseOrderItemService", () => {
  describe("create", () => {
    it("should create purchase order item", async () => {
      const itemData = {
        purchaseOrderId: 1,
        supplierMedicationVariantId: 1,
        quantity: 10,
        unitPrice: 50,
        totalPrice: 500,
      };

      const mockItem = { id: 1, ...itemData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.create(itemData);

      expect(result).toEqual(mockItem);
    });
  });

  describe("getAll", () => {
    it("should fetch all items without filters", async () => {
      const mockItems = [
        { id: 1, purchaseOrderId: 1, quantity: 10, unitPrice: 50 },
        { id: 2, purchaseOrderId: 1, quantity: 20, unitPrice: 25 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.getAll();

      expect(result).toEqual(mockItems);
    });

    it("should filter items by purchaseOrderId", async () => {
      const mockItems = [{ id: 1, purchaseOrderId: 1, quantity: 10 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.getAll({
        purchaseOrderId: 1,
      });

      expect(result).toEqual(mockItems);
    });
  });

  describe("getById", () => {
    it("should fetch item by id", async () => {
      const mockItem = {
        id: 1,
        purchaseOrderId: 1,
        quantity: 10,
        unitPrice: 50,
        medicationName: "Aspirin",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockItem]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.getById(1);

      expect(result).toEqual(mockItem);
    });
  });

  describe("update", () => {
    it("should update purchase order item", async () => {
      const itemData = { quantity: 15, totalPrice: 750 };
      const mockItem = {
        id: 1,
        purchaseOrderId: 1,
        quantity: 15,
        totalPrice: 750,
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.update(1, itemData);

      expect(result).toEqual(mockItem);
    });
  });

  describe("delete", () => {
    it("should delete purchase order item", async () => {
      const mockItem = { id: 1, purchaseOrderId: 1, quantity: 10 };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await purchaseOrderItemService.delete(1);

      expect(result).toEqual(mockItem);
    });
  });
});

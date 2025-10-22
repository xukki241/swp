import { describe, expect, it, vi } from "vitest";

import { db } from "@/db/index.js";
import { purchaseOrderReceiptItemService } from "@/services/purchaseOrderReceiptItemService.js";

describe("PurchaseOrderReceiptItemService", () => {
  describe("create", () => {
    it("should create purchase order receipt item", async () => {
      const itemData = {
        purchaseOrderReceiptId: 1,
        purchaseOrderItemId: 1,
        quantity: 10,
      };

      const mockItem = { id: 1, ...itemData };

      const mockQuery = {
        values: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.insert.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.create(itemData);

      expect(result).toEqual(mockItem);
    });
  });

  describe("getAll", () => {
    it("should fetch all items without filters", async () => {
      const mockItems = [
        { id: 1, purchaseOrderReceiptId: 1, quantity: 10 },
        { id: 2, purchaseOrderReceiptId: 1, quantity: 20 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.getAll();

      expect(result).toEqual(mockItems);
    });

    it("should filter items by purchaseOrderReceiptId", async () => {
      const mockItems = [{ id: 1, purchaseOrderReceiptId: 1, quantity: 10 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.getAll({
        purchaseOrderReceiptId: 1,
      });

      expect(result).toEqual(mockItems);
    });
  });

  describe("getById", () => {
    it("should fetch item by id", async () => {
      const mockItem = {
        id: 1,
        purchaseOrderReceiptId: 1,
        purchaseOrderItemId: 1,
        quantity: 10,
        orderedQuantity: 15,
        medicationName: "Aspirin",
      };

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockItem]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.getById(1);

      expect(result).toEqual(mockItem);
    });
  });

  describe("update", () => {
    it("should update purchase order receipt item", async () => {
      const itemData = { quantity: 12 };
      const mockItem = {
        id: 1,
        purchaseOrderReceiptId: 1,
        quantity: 12,
      };

      const mockQuery = {
        set: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.update.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.update(1, itemData);

      expect(result).toEqual(mockItem);
    });
  });

  describe("delete", () => {
    it("should delete purchase order receipt item", async () => {
      const mockItem = {
        id: 1,
        purchaseOrderReceiptId: 1,
        quantity: 10,
      };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockItem]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptItemService.delete(1);

      expect(result).toEqual(mockItem);
    });
  });
});

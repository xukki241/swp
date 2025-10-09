import { describe, it, expect, vi } from "vitest";

import { db } from "@/db/index.js";
import { purchaseOrderReceiptService } from "@/services/purchaseOrderReceiptService.js";

describe("PurchaseOrderReceiptService", () => {
  describe("create", () => {
    it("should create purchase order receipt with items", async () => {
      const receiptData = {
        purchaseOrderId: 1,
        receivedDate: "2025-10-09",
        receivedBy: 1,
        items: [
          { purchaseOrderItemId: 1, quantity: 10 },
          { purchaseOrderItemId: 2, quantity: 20 },
        ],
      };

      const mockReceipt = {
        id: 1,
        purchaseOrderId: 1,
        receivedDate: new Date("2025-10-09"),
        receivedBy: 1,
      };

      const mockItems = [
        {
          id: 1,
          purchaseOrderReceiptId: 1,
          purchaseOrderItemId: 1,
          quantity: 10,
        },
        {
          id: 2,
          purchaseOrderReceiptId: 1,
          purchaseOrderItemId: 2,
          quantity: 20,
        },
      ];

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi
            .fn()
            .mockResolvedValueOnce([mockReceipt])
            .mockResolvedValueOnce(mockItems),
        };
        return callback(tx);
      });

      const result = await purchaseOrderReceiptService.create(receiptData);

      expect(result.id).toBe(1);
      expect(result.items).toHaveLength(2);
    });

    it("should create purchase order receipt without items", async () => {
      const receiptData = {
        purchaseOrderId: 1,
        receivedDate: "2025-10-09",
        receivedBy: 1,
      };

      const mockReceipt = { id: 1, purchaseOrderId: 1, receivedBy: 1 };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          insert: vi.fn().mockReturnThis(),
          values: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockReceipt]),
        };
        return callback(tx);
      });

      const result = await purchaseOrderReceiptService.create(receiptData);

      expect(result.id).toBe(1);
      expect(result.items).toEqual([]);
    });
  });

  describe("getAll", () => {
    it("should fetch all receipts without filters", async () => {
      const mockReceipts = [
        {
          id: 1,
          purchaseOrderId: 1,
          receivedDate: new Date("2025-10-09"),
          receivedBy: 1,
        },
        {
          id: 2,
          purchaseOrderId: 2,
          receivedDate: new Date("2025-10-10"),
          receivedBy: 1,
        },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReceipts),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptService.getAll();

      expect(result).toEqual(mockReceipts);
    });

    it("should filter receipts by purchaseOrderId", async () => {
      const mockReceipts = [{ id: 1, purchaseOrderId: 1, receivedBy: 1 }];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReceipts),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptService.getAll({
        purchaseOrderId: 1,
      });

      expect(result).toEqual(mockReceipts);
    });

    it("should filter receipts by date range", async () => {
      const mockReceipts = [
        { id: 1, receivedDate: new Date("2025-10-09"), receivedBy: 1 },
      ];

      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        offset: vi.fn().mockResolvedValue(mockReceipts),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptService.getAll({
        startDate: "2025-10-01",
        endDate: "2025-10-31",
      });

      expect(result).toEqual(mockReceipts);
    });
  });

  describe("getById", () => {
    it("should fetch receipt by id with items", async () => {
      const mockReceipt = {
        id: 1,
        purchaseOrderId: 1,
        receivedBy: 1,
        receivedByName: "John Doe",
      };

      const mockItems = [
        { id: 1, purchaseOrderReceiptId: 1, quantity: 10 },
        { id: 2, purchaseOrderReceiptId: 1, quantity: 20 },
      ];

      // Mock receipt selection
      const mockReceiptQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([mockReceipt]),
      };
      db.select.mockReturnValueOnce(mockReceiptQuery);

      // Mock items selection
      const mockItemsQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue(mockItems),
      };
      db.select.mockReturnValueOnce(mockItemsQuery);

      const result = await purchaseOrderReceiptService.getById(1);

      expect(result.id).toBe(1);
      expect(result.items).toEqual(mockItems);
    });

    it("should return null for non-existent receipt", async () => {
      const mockQuery = {
        from: vi.fn().mockReturnThis(),
        leftJoin: vi.fn().mockReturnThis(),
        where: vi.fn().mockResolvedValue([]),
      };
      db.select.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptService.getById(999);

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update purchase order receipt", async () => {
      const receiptData = { receivedDate: "2025-10-10" };
      const mockReceipt = {
        id: 1,
        purchaseOrderId: 1,
        receivedDate: new Date("2025-10-10"),
      };

      db.transaction.mockImplementation(async (callback) => {
        const tx = {
          update: vi.fn().mockReturnThis(),
          set: vi.fn().mockReturnThis(),
          where: vi.fn().mockReturnThis(),
          returning: vi.fn().mockResolvedValue([mockReceipt]),
          select: vi.fn().mockReturnThis(),
          from: vi.fn().mockReturnThis(),
        };

        // Mock select for items
        tx.select.mockReturnValue({
          from: vi.fn().mockReturnThis(),
          where: vi.fn().mockResolvedValue([]),
        });

        return callback(tx);
      });

      const result = await purchaseOrderReceiptService.update(1, receiptData);

      expect(result.receivedDate).toEqual(new Date("2025-10-10"));
    });
  });

  describe("delete", () => {
    it("should delete purchase order receipt", async () => {
      const mockReceipt = { id: 1, purchaseOrderId: 1, receivedBy: 1 };

      const mockQuery = {
        where: vi.fn().mockReturnThis(),
        returning: vi.fn().mockResolvedValue([mockReceipt]),
      };
      db.delete.mockReturnValue(mockQuery);

      const result = await purchaseOrderReceiptService.delete(1);

      expect(result).toEqual(mockReceipt);
    });
  });
});

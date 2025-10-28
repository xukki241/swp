import { beforeEach, describe, expect, it, vi } from "vitest";

import { salesOrderService } from "@/services/salesOrderService.js";

vi.mock("@/db/index.js");

describe("salesOrderService", () => {
  let mockDb;
  let mockTx;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { db } = await import("@/db/index.js");
    mockDb = db;

    // Mock transaction
    mockTx = {
      query: {
        medicationVariants: {
          findFirst: vi.fn(),
        },
        salesOrders: {
          findFirst: vi.fn(),
          findMany: vi.fn(),
        },
        salesOrderItems: {
          findMany: vi.fn(),
        },
      },
      select: vi.fn(),
      insert: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    };

    mockDb.transaction = vi.fn((callback) => callback(mockTx));
  });

  describe("create", () => {
    it("should create a sales order with items", async () => {
      const orderData = {
        customer_id: "cust-1",
        payment_method: "cash",
        items: [
          {
            medication_variant_id: "var-1",
            quantity: 10,
          },
        ],
      };

      const mockVariant = {
        id: "var-1",
        name: "Aspirin",
        sku: "ASP-100",
        sellPrice: 5.0,
        isActive: true,
        isForSale: true,
      };

      const mockInventory = [
        {
          id: "inv-1",
          quantity: 100,
          quantityReserved: 0,
          quantityAvailable: 100,
          expiryDate: new Date("2025-12-31"),
          batchNumber: "BATCH-1",
        },
      ];

      const mockOrder = {
        id: "order-1",
        customerId: "cust-1",
        totalAmount: 50,
        status: "pending",
      };

      const mockOrderItems = [
        {
          id: "item-1",
          salesOrderId: "order-1",
          medicationVariantId: "var-1",
          quantity: 10,
          unitPrice: 5.0,
          totalPrice: 50.0,
        },
      ];

      mockTx.query.medicationVariants.findFirst.mockResolvedValue(mockVariant);
      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockInventory),
          }),
        }),
      });
      mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      mockTx.insert.mockImplementation(() => ({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrder]),
        }),
      }));
      mockTx.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrder]),
        }),
      });
      mockTx.insert.mockReturnValueOnce({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue(mockOrderItems),
        }),
      });
      mockTx.query.salesOrders.findFirst.mockResolvedValue({
        ...mockOrder,
        customer: { id: "cust-1", name: "John" },
        salesperson: null,
      });

      const result = await salesOrderService.create(orderData, "user-1");

      expect(result).toBeDefined();
      expect(result.items).toEqual(mockOrderItems);
    });

    it("should throw error if no items provided", async () => {
      const orderData = {
        customer_id: "cust-1",
        items: [],
      };

      await expect(salesOrderService.create(orderData)).rejects.toThrow(
        "Sales order must have at least one item"
      );
    });

    it("should throw error if medication variant not found", async () => {
      const orderData = {
        customer_id: "cust-1",
        items: [{ medication_variant_id: "nonexistent", quantity: 10 }],
      };

      mockTx.query.medicationVariants.findFirst.mockResolvedValue(null);

      await expect(salesOrderService.create(orderData)).rejects.toThrow(
        "Medication variant with ID nonexistent not found"
      );
    });

    it("should throw error if variant is not for sale", async () => {
      const orderData = {
        customer_id: "cust-1",
        items: [{ medication_variant_id: "var-1", quantity: 10 }],
      };

      mockTx.query.medicationVariants.findFirst.mockResolvedValue({
        id: "var-1",
        name: "Test",
        sku: "TST",
        isActive: false,
        isForSale: false,
      });

      await expect(salesOrderService.create(orderData)).rejects.toThrow(
        "is not available for sale"
      );
    });

    it("should throw error if insufficient inventory", async () => {
      const orderData = {
        customer_id: "cust-1",
        items: [{ medication_variant_id: "var-1", quantity: 100 }],
      };

      mockTx.query.medicationVariants.findFirst.mockResolvedValue({
        id: "var-1",
        name: "Test",
        sku: "TST",
        sellPrice: 5.0,
        isActive: true,
        isForSale: true,
      });

      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([
              {
                id: "inv-1",
                quantity: 50,
                quantityReserved: 0,
                quantityAvailable: 50,
              },
            ]),
          }),
        }),
      });

      await expect(salesOrderService.create(orderData)).rejects.toThrow(
        "Insufficient inventory"
      );
    });
  });

  describe("getAll", () => {
    it("should get all sales orders with pagination", async () => {
      const mockOrders = [
        { id: "order-1", customerId: "cust-1" },
        { id: "order-2", customerId: "cust-2" },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 2 }]),
        }),
      });

      mockDb.query = {
        salesOrders: {
          findMany: vi.fn().mockResolvedValue(mockOrders),
        },
      };

      const result = await salesOrderService.getAll();

      expect(result.data).toEqual(mockOrders);
      expect(result.total).toBe(2);
    });

    it("should filter by customerId", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 1 }]),
        }),
      });

      mockDb.query = {
        salesOrders: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await salesOrderService.getAll({ customerId: "cust-1" });

      expect(mockDb.query.salesOrders.findMany).toHaveBeenCalled();
    });

    it("should filter by status", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      mockDb.query = {
        salesOrders: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await salesOrderService.getAll({ status: "completed" });

      expect(mockDb.query.salesOrders.findMany).toHaveBeenCalled();
    });

    it("should filter by date range", async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ count: 0 }]),
        }),
      });

      mockDb.query = {
        salesOrders: {
          findMany: vi.fn().mockResolvedValue([]),
        },
      };

      await salesOrderService.getAll({
        orderDateFrom: "2024-01-01",
        orderDateTo: "2024-12-31",
      });

      expect(mockDb.query.salesOrders.findMany).toHaveBeenCalled();
    });
  });

  describe("getById", () => {
    it("should get order by ID with items", async () => {
      const mockOrder = {
        id: "order-1",
        customer: {},
        salesperson: {},
        items: [],
      };

      mockDb.query = {
        salesOrders: {
          findFirst: vi.fn().mockResolvedValue(mockOrder),
        },
      };

      const result = await salesOrderService.getById("order-1");

      expect(result).toEqual(mockOrder);
    });

    it("should return null if order not found", async () => {
      mockDb.query = {
        salesOrders: {
          findFirst: vi.fn().mockResolvedValue(null),
        },
      };

      const result = await salesOrderService.getById("nonexistent");

      expect(result).toBeNull();
    });
  });

  describe("update", () => {
    it("should update order to completed status", async () => {
      const mockOrder = {
        id: "order-1",
        status: "pending",
        customerId: "cust-1",
        totalAmount: 50,
      };

      const mockItems = [
        {
          id: "item-1",
          medicationVariantId: "var-1",
          quantity: 10,
          unitPrice: 5,
          totalPrice: 50,
        },
      ];

      const mockInventory = [
        {
          id: "inv-1",
          quantity: 100,
          quantityReserved: 10,
        },
      ];

      mockTx.query.salesOrders.findFirst.mockResolvedValue(mockOrder);
      mockTx.query.salesOrderItems.findMany.mockResolvedValue(mockItems);
      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockInventory),
          }),
        }),
      });
      mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockResolvedValue([{ ...mockOrder, status: "completed" }]),
          }),
        }),
      });

      const result = await salesOrderService.update("order-1", {
        status: "completed",
      });

      expect(result.status).toBe("completed");
    });

    it("should update order to cancelled status", async () => {
      const mockOrder = {
        id: "order-1",
        status: "pending",
      };

      const mockItems = [
        {
          id: "item-1",
          medicationVariantId: "var-1",
          quantity: 10,
        },
      ];

      mockTx.query.salesOrders.findFirst.mockResolvedValue(mockOrder);
      mockTx.query.salesOrderItems.findMany.mockResolvedValue(mockItems);
      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi
              .fn()
              .mockResolvedValue([{ id: "inv-1", quantityReserved: 10 }]),
          }),
        }),
      });
      mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi
              .fn()
              .mockResolvedValue([{ ...mockOrder, status: "cancelled" }]),
          }),
        }),
      });

      const result = await salesOrderService.update("order-1", {
        status: "cancelled",
      });

      expect(result.status).toBe("cancelled");
    });

    it("should return null if order not found", async () => {
      mockTx.query.salesOrders.findFirst.mockResolvedValue(null);

      const result = await salesOrderService.update("nonexistent", {});

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("should delete order and unreserve inventory", async () => {
      const mockItems = [
        {
          id: "item-1",
          medicationVariantId: "var-1",
          quantity: 10,
        },
      ];

      const mockInventory = [
        {
          id: "inv-1",
          quantityReserved: 10,
        },
      ];

      const mockOrder = { id: "order-1" };

      mockTx.query.salesOrderItems.findMany.mockResolvedValue(mockItems);
      mockTx.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockInventory),
          }),
        }),
      });
      mockTx.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      });
      mockTx.delete.mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockOrder]),
        }),
      });

      const result = await salesOrderService.delete("order-1");

      expect(result).toEqual(mockOrder);
      expect(mockTx.delete).toHaveBeenCalledTimes(2); // items + order
    });
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import { salesOrderController } from "@/controllers/salesOrderController.js";
import { salesOrderService } from "@/services/salesOrderService.js";

vi.mock("@/services/salesOrderService.js");
vi.mock("@/utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));
vi.mock("@/utils/salesInvoiceEmail.js", () => ({
  sendSalesInvoiceEmail: vi.fn().mockResolvedValue(true),
}));

describe("SalesOrderController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: "user-1" },
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create sales order successfully", async () => {
      const orderData = {
        customerId: "customer-1",
        items: [{ variantId: "1", quantity: 10, sellPrice: 100 }],
      };
      const mockOrder = {
        id: "order-1",
        ...orderData,
        totalAmount: 1000,
      };

      req.body = orderData;
      salesOrderService.create.mockResolvedValue(mockOrder);

      await salesOrderController.create(req, res);

      expect(salesOrderService.create).toHaveBeenCalledWith(
        orderData,
        "user-1"
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order created successfully",
        data: mockOrder,
      });
    });
  });

  describe("getAll", () => {
    it("should fetch all sales orders with default pagination", async () => {
      const mockResult = {
        data: [{ id: "1" }, { id: "2" }],
        total: 2,
      };

      salesOrderService.getAll.mockResolvedValue(mockResult);

      await salesOrderController.getAll(req, res);

      expect(salesOrderService.getAll).toHaveBeenCalledWith({
        customerId: undefined,
        status: undefined,
        paymentMethod: undefined,
        salespersonId: undefined,
        orderDateFrom: undefined,
        orderDateTo: undefined,
        sortBy: undefined,
        sortOrder: undefined,
        limit: 100,
        offset: 0,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: {
          page: 1,
          limit: 100,
          total: 2,
          totalPages: 1,
          hasMore: false,
        },
      });
    });

    it("should fetch sales orders with filters and pagination", async () => {
      req.query = {
        customerId: "customer-1",
        status: "paid",
        page: "2",
        limit: "10",
        sortBy: "orderDate",
        sortOrder: "desc",
      };

      const mockResult = {
        data: [{ id: "1" }],
        total: 25,
      };

      salesOrderService.getAll.mockResolvedValue(mockResult);

      await salesOrderController.getAll(req, res);

      expect(salesOrderService.getAll).toHaveBeenCalledWith({
        customerId: "customer-1",
        status: "paid",
        paymentMethod: undefined,
        salespersonId: undefined,
        orderDateFrom: undefined,
        orderDateTo: undefined,
        sortBy: "orderDate",
        sortOrder: "desc",
        limit: 10,
        offset: 10,
      });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockResult.data,
        pagination: {
          page: 2,
          limit: 10,
          total: 25,
          totalPages: 3,
          hasMore: true,
        },
      });
    });
  });

  describe("getById", () => {
    it("should fetch sales order by id", async () => {
      const mockOrder = {
        id: "order-1",
        customerId: "customer-1",
        totalAmount: 1000,
      };

      req.params.id = "order-1";
      salesOrderService.getById.mockResolvedValue(mockOrder);

      await salesOrderController.getById(req, res);

      expect(salesOrderService.getById).toHaveBeenCalledWith("order-1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: mockOrder,
      });
    });

    it("should return 404 if sales order not found", async () => {
      req.params.id = "order-999";
      salesOrderService.getById.mockResolvedValue(null);

      await salesOrderController.getById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sales order not found",
      });
    });
  });

  describe("update", () => {
    it("should update sales order successfully", async () => {
      const updateData = { status: "completed" };
      const mockOrder = {
        id: "order-1",
        status: "completed",
        totalAmount: 1000,
      };

      req.params.id = "order-1";
      req.body = updateData;
      salesOrderService.update.mockResolvedValue(mockOrder);

      await salesOrderController.update(req, res);

      expect(salesOrderService.update).toHaveBeenCalledWith(
        "order-1",
        updateData
      );
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order updated successfully",
        data: mockOrder,
      });
    });

    it("should return 404 if sales order not found", async () => {
      req.params.id = "order-999";
      req.body = { status: "completed" };
      salesOrderService.update.mockResolvedValue(null);

      await salesOrderController.update(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sales order not found",
      });
    });

    it("should send invoice email when status changed to paid", async () => {
      const updateData = { status: "paid" };
      const mockOrder = {
        id: "order-1",
        status: "paid",
        totalAmount: 1000,
        orderDate: new Date("2025-11-13"),
        customer: { email: "customer@example.com", name: "John Doe" },
        salesperson: { name: "Jane Sales" },
        items: [
          {
            medicationName: "Med A",
            variantName: "Variant 1",
            quantity: 10,
            sellPrice: 100,
          },
        ],
        paymentMethod: "cash",
      };

      req.params.id = "order-1";
      req.body = updateData;
      salesOrderService.update.mockResolvedValue(mockOrder);

      await salesOrderController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order updated successfully",
        data: mockOrder,
      });
    });

    it("should not send email if customer has no email", async () => {
      const updateData = { status: "paid" };
      const mockOrder = {
        id: "order-1",
        status: "paid",
        customer: { name: "John Doe" },
        items: [],
      };

      req.params.id = "order-1";
      req.body = updateData;
      salesOrderService.update.mockResolvedValue(mockOrder);

      await salesOrderController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order updated successfully",
        data: mockOrder,
      });
    });

    it("should handle invalid date format gracefully", async () => {
      const updateData = { status: "paid" };
      const mockOrder = {
        id: "order-1",
        status: "paid",
        orderDate: "invalid-date",
        customer: { email: "customer@example.com", name: "John Doe" },
        items: [],
        totalAmount: 1000,
      };

      req.params.id = "order-1";
      req.body = updateData;
      salesOrderService.update.mockResolvedValue(mockOrder);

      await salesOrderController.update(req, res);

      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order updated successfully",
        data: mockOrder,
      });
    });
  });

  describe("delete", () => {
    it("should delete sales order successfully", async () => {
      const mockOrder = { id: "order-1" };

      req.params.id = "order-1";
      salesOrderService.delete.mockResolvedValue(mockOrder);

      await salesOrderController.delete(req, res);

      expect(salesOrderService.delete).toHaveBeenCalledWith("order-1");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales order cancelled successfully",
      });
    });

    it("should return 404 if sales order not found", async () => {
      req.params.id = "order-999";
      salesOrderService.delete.mockResolvedValue(null);

      await salesOrderController.delete(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Sales order not found",
      });
    });
  });
});

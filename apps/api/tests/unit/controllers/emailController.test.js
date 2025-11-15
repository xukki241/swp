import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  sendPurchaseOrder,
  sendSalesInvoice,
} from "@/controllers/emailController.js";

vi.mock("@/utils/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/purchaseOrderEmail.js", () => ({
  sendPurchaseOrderEmail: vi.fn(),
}));

vi.mock("@/utils/salesInvoiceEmail.js", () => ({
  sendSalesInvoiceEmail: vi.fn(),
}));

import { sendPurchaseOrderEmail } from "@/utils/purchaseOrderEmail.js";
import { sendSalesInvoiceEmail } from "@/utils/salesInvoiceEmail.js";

describe("EmailController", () => {
  let req, res;

  beforeEach(() => {
    req = {
      body: {},
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    vi.clearAllMocks();
  });

  describe("sendPurchaseOrder", () => {
    it("should send purchase order email successfully", async () => {
      req.body = {
        supplierEmail: "supplier@example.com",
        supplierName: "Supplier A",
        items: [
          { name: "Item 1", quantity: 10, price: 100 },
          { name: "Item 2", quantity: 5, price: 200 },
        ],
        totalAmount: 2000,
      };

      sendPurchaseOrderEmail.mockResolvedValue();

      await sendPurchaseOrder(req, res);

      expect(sendPurchaseOrderEmail).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Purchase order email sent successfully",
      });
    });

    it("should return 400 if supplier email is missing", async () => {
      req.body = {
        items: [{ name: "Item 1", quantity: 10 }],
      };

      await sendPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Supplier email and order items are required",
      });
      expect(sendPurchaseOrderEmail).not.toHaveBeenCalled();
    });

    it("should return 400 if items array is empty", async () => {
      req.body = {
        supplierEmail: "supplier@example.com",
        items: [],
      };

      await sendPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Supplier email and order items are required",
      });
    });

    it("should return 400 if items is missing", async () => {
      req.body = {
        supplierEmail: "supplier@example.com",
      };

      await sendPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Supplier email and order items are required",
      });
    });

    it("should return 500 if email sending fails", async () => {
      req.body = {
        supplierEmail: "supplier@example.com",
        items: [{ name: "Item 1", quantity: 10 }],
      };

      const error = new Error("Email service unavailable");
      sendPurchaseOrderEmail.mockRejectedValue(error);

      await sendPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Email service unavailable",
      });
    });

    it("should handle error without message", async () => {
      req.body = {
        supplierEmail: "supplier@example.com",
        items: [{ name: "Item 1" }],
      };

      sendPurchaseOrderEmail.mockRejectedValue(new Error());

      await sendPurchaseOrder(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to send purchase order email",
      });
    });
  });

  describe("sendSalesInvoice", () => {
    it("should send sales invoice email successfully", async () => {
      req.body = {
        customerEmail: "customer@example.com",
        customerName: "John Doe",
        items: [
          { name: "Item 1", quantity: 2, price: 50 },
          { name: "Item 2", quantity: 1, price: 100 },
        ],
        totalAmount: 200,
      };

      sendSalesInvoiceEmail.mockResolvedValue();

      await sendSalesInvoice(req, res);

      expect(sendSalesInvoiceEmail).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Sales invoice email sent successfully",
      });
    });

    it("should return 400 if customer email is missing", async () => {
      req.body = {
        items: [{ name: "Item 1", quantity: 1 }],
      };

      await sendSalesInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Customer email and order items are required",
      });
      expect(sendSalesInvoiceEmail).not.toHaveBeenCalled();
    });

    it("should return 400 if items array is empty", async () => {
      req.body = {
        customerEmail: "customer@example.com",
        items: [],
      };

      await sendSalesInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Customer email and order items are required",
      });
    });

    it("should return 400 if items is missing", async () => {
      req.body = {
        customerEmail: "customer@example.com",
      };

      await sendSalesInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("should return 500 if email sending fails", async () => {
      req.body = {
        customerEmail: "customer@example.com",
        items: [{ name: "Item 1", quantity: 1 }],
      };

      const error = new Error("SMTP connection failed");
      sendSalesInvoiceEmail.mockRejectedValue(error);

      await sendSalesInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "SMTP connection failed",
      });
    });

    it("should handle error without message", async () => {
      req.body = {
        customerEmail: "customer@example.com",
        items: [{ name: "Item 1" }],
      };

      sendSalesInvoiceEmail.mockRejectedValue(new Error());

      await sendSalesInvoice(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Failed to send sales invoice email",
      });
    });
  });
});

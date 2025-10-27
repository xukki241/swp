import asyncHandler from "express-async-handler";

import { salesOrderService } from "../services/salesOrderService.js";
import { sendSalesInvoiceEmail } from "../utils/salesInvoiceEmail.js";
import logger from "../utils/logger.js";

export const salesOrderController = {
  // POST /api/sales - Create a new sales order
  create: asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Get user ID from auth middleware
    const order = await salesOrderService.create(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
    });
  }),

  // GET /api/sales - Get all sales orders with pagination
  getAll: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 100;
    const offset = (page - 1) * limit;

    const filters = {
      customerId: req.query.customerId,
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      salespersonId: req.query.salespersonId,
      orderDateFrom: req.query.orderDateFrom,
      orderDateTo: req.query.orderDateTo,
      sortBy: req.query.sortBy,
      sortOrder: req.query.sortOrder,
      limit,
      offset,
    };

    const result = await salesOrderService.getAll(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  // GET /api/sales/:id - Get sales order by ID with items
  getById: asyncHandler(async (req, res) => {
    const order = await salesOrderService.getById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.json({
      success: true,
      data: order,
    });
  }),

  // PATCH /api/sales/:id - Update sales order status
  update: asyncHandler(async (req, res) => {
    const order = await salesOrderService.update(req.params.id, req.body);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    // Send invoice email if order is marked as paid and customer has email
    if (req.body.status === 'paid' && order.customer?.email) {
      try {
        // Format date safely
        let formattedDate = 'N/A';
        try {
          const orderDate = new Date(order.orderDate || order.createdAt);
          if (!isNaN(orderDate.getTime())) {
            formattedDate = orderDate.toLocaleDateString('vi-VN', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
          }
        } catch (dateError) {
          logger.warn('Failed to format order date:', dateError);
        }

        const invoiceData = {
          customerEmail: order.customer.email,
          customerName: order.customer.name,
          salespersonName: order.salesperson?.name || "Staff",
          items: order.items.map(item => ({
            medicationName: item.medicationName,
            variantName: item.variantName,
            quantity: item.quantity,
            sellingPrice: item.sellPrice,
          })),
          totalAmount: order.totalAmount, // Fixed: use totalAmount instead of total
          paymentMethod: order.paymentMethod,
          orderNumber: order.id,
          orderDate: formattedDate,
        };

        // Send email asynchronously (don't wait for it)
        sendSalesInvoiceEmail(invoiceData).catch(err => {
          logger.error('Failed to send invoice email after marking as paid:', err);
        });

        logger.info(`📧 Invoice email queued for order ${order.id}`);
      } catch (emailError) {
        // Log but don't fail the update
        logger.error('Error preparing invoice email:', emailError);
      }
    }

    res.json({
      success: true,
      message: "Sales order updated successfully",
      data: order,
    });
  }),

  // DELETE /api/sales/:id - Cancel sales order
  delete: asyncHandler(async (req, res) => {
    const order = await salesOrderService.delete(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.json({
      success: true,
      message: "Sales order cancelled successfully",
    });
  }),
};

export default salesOrderController;

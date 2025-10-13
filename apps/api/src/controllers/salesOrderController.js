import asyncHandler from "express-async-handler";

import { salesOrderService } from "../services/salesOrderService.js";

export const salesOrderController = {
  // Create a new sales order
  create: asyncHandler(async (req, res) => {
    const userId = req.user?.id; // Get user ID from auth middleware
    const order = await salesOrderService.create(req.body, userId);

    res.status(201).json({
      success: true,
      message: "Sales order created successfully",
      data: order,
    });
  }),

  // Get all sales orders
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      customerId: req.query.customerId
        ? Number.parseInt(req.query.customerId)
        : undefined,
      status: req.query.status,
      paymentMethod: req.query.paymentMethod,
      salespersonId: req.query.salespersonId
        ? Number.parseInt(req.query.salespersonId)
        : undefined,
      orderDateFrom: req.query.orderDateFrom,
      orderDateTo: req.query.orderDateTo,
      limit: req.query.limit ? Number.parseInt(req.query.limit) : 100,
      offset: req.query.offset ? Number.parseInt(req.query.offset) : 0,
    };

    const orders = await salesOrderService.getAll(filters);

    res.json({
      success: true,
      data: orders,
    });
  }),

  // Get sales order by ID
  getById: asyncHandler(async (req, res) => {
    const order = await salesOrderService.getById(
      Number.parseInt(req.params.id)
    );

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

  // Update sales order (mainly status changes)
  update: asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id);

    const order = await salesOrderService.update(id, req.body);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.json({
      success: true,
      message: "Sales order updated successfully",
      data: order,
    });
  }),

  // Delete (cancel) sales order
  delete: asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id);

    const order = await salesOrderService.delete(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Sales order not found",
      });
    }

    res.json({
      success: true,
      message: "Sales order cancelled successfully",
      data: order,
    });
  }),
};

export default salesOrderController;

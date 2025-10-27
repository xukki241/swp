import asyncHandler from "express-async-handler";

import { customerService } from "../services/customerService.js";

export const customerController = {
  // Create a new customer
  create: asyncHandler(async (req, res) => {
    const payload = req.body;

    if (Array.isArray(payload)) {
      // Batch create
      const customers = await customerService.create(payload);
      return res.status(201).json({
        success: true,
        message: "Customers created successfully",
        data: customers,
      });
    }

    // Single create - check for duplicates
    if (payload.email) {
      const existingCustomer = await customerService.getByEmail(payload.email);
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: `Customer with email '${payload.email}' already exists`,
        });
      }
    }

    if (payload.phone) {
      const existingCustomer = await customerService.getByPhone(payload.phone);
      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: `Customer with phone '${payload.phone}' already exists`,
        });
      }
    }

    const customer = await customerService.create(payload);
    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  }),

  // Get all customers
  getAll: asyncHandler(async (req, res) => {
    const filters = {
      search: req.query.search,
      limit: req.query.limit ? Number.parseInt(req.query.limit) : 100,
      offset: req.query.offset ? Number.parseInt(req.query.offset) : 0,
    };

    const customers = await customerService.getAll(filters);
    res.json({
      success: true,
      data: customers,
    });
  }),

  // Get customer by ID
  getById: asyncHandler(async (req, res) => {
    const customer = await customerService.getById(req.params.id); // UUID as string

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      data: customer,
    });
  }),

  // Update customer
  update: asyncHandler(async (req, res) => {
    const id = req.params.id; // UUID, keep as string

    // Check for email uniqueness if being updated and has a value
    if (req.body.email) {
      const trimmedEmail = req.body.email.trim();
      if (trimmedEmail) {
        const existingCustomer = await customerService.getByEmail(trimmedEmail);
        // Compare IDs directly (both are UUIDs as strings)
        if (existingCustomer && existingCustomer.id !== id) {
          return res.status(400).json({
            success: false,
            message: `Customer with email '${trimmedEmail}' already exists`,
          });
        }
      }
    }

    // Check for phone uniqueness if being updated and has a value
    if (req.body.phone) {
      const trimmedPhone = req.body.phone.trim();
      if (trimmedPhone) {
        const existingCustomer = await customerService.getByPhone(trimmedPhone);
        // Compare IDs directly (both are UUIDs as strings)
        if (existingCustomer && existingCustomer.id !== id) {
          return res.status(400).json({
            success: false,
            message: `Customer with phone '${trimmedPhone}' already exists`,
          });
        }
      }
    }

    const customer = await customerService.update(id, req.body);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  }),

  // Delete customer
  delete: asyncHandler(async (req, res) => {
    const customer = await customerService.delete(req.params.id); // UUID as string

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    res.json({
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    });
  }),
};

export default customerController;

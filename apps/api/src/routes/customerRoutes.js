import {
  createCustomerSchema,
  createCustomersRequestSchema,
  updateCustomerRequestSchema,
} from "@pharmaflow/dto";
import express from "express";

import { customerController } from "../controllers/customerController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

export const customerRouter = express.Router();

// All routes require authentication
customerRouter.use(authenticate);

// GET /api/customers - Get all customers
customerRouter.get("/", customerController.getAll);

// GET /api/customers/:id - Get customer by ID
customerRouter.get("/:id", customerController.getById);

// POST /api/customers - Create customer (single or batch)
// Accepts both single customer object and array of customers
customerRouter.post(
  "/",
  validateBody(createCustomerSchema.or(createCustomersRequestSchema)),
  customerController.create
);

// PATCH /api/customers/:id - Update customer
customerRouter.patch(
  "/:id",
  validateBody(updateCustomerRequestSchema),
  customerController.update
);

// DELETE /api/customers/:id - Delete customer
customerRouter.delete("/:id", authorize("owner"), customerController.delete);

export default customerRouter;

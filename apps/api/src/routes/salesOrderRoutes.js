import {
  createSalesOrderRequestSchema,
  updateSalesOrderRequestSchema,
  listSalesOrdersQuerySchema,
} from "@pharmaflow/dto";
import express from "express";

import { salesOrderController } from "../controllers/salesOrderController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";

export const salesOrderRouter = express.Router();

// All routes require authentication
salesOrderRouter.use(authenticate);

// GET /api/sales - Get all sales orders
salesOrderRouter.get(
  "/",
  validateQuery(listSalesOrdersQuerySchema),
  salesOrderController.getAll
);

// GET /api/sales/:id - Get sales order by ID
salesOrderRouter.get("/:id", salesOrderController.getById);

// POST /api/sales - Create sales order
salesOrderRouter.post(
  "/",
  validateBody(createSalesOrderRequestSchema),
  salesOrderController.create
);

// PATCH /api/sales/:id - Update sales order status
salesOrderRouter.patch(
  "/:id",
  validateBody(updateSalesOrderRequestSchema),
  salesOrderController.update
);

// DELETE /api/sales/:id - Cancel sales order
salesOrderRouter.delete("/:id", salesOrderController.delete);

export default salesOrderRouter;

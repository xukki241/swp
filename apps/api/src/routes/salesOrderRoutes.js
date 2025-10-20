import {
  createSalesOrderRequestSchema,
  updateSalesOrderRequestSchema,
  listSalesOrdersQuerySchema,
  salesOrderIdParamSchema,
} from "@pharmaflow/dto";
import express from "express";

import { salesOrderController } from "../controllers/salesOrderController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import {
  validateBody,
  validateQuery,
  validateParams,
} from "../middleware/validate.js";

export const salesOrderRouter = express.Router();

// All routes require authentication
salesOrderRouter.use(authenticate);

// GET /api/sales - List all sales orders (operationId: listSalesOrders)
salesOrderRouter.get(
  "/",
  validateQuery(listSalesOrdersQuerySchema),
  salesOrderController.getAll
);

// GET /api/sales/:id - Get sales order by ID (operationId: getSalesOrderById)
salesOrderRouter.get(
  "/:id",
  validateParams(salesOrderIdParamSchema),
  salesOrderController.getById
);

// POST /api/sales - Create sales order (operationId: createSalesOrder)
salesOrderRouter.post(
  "/",
  validateBody(createSalesOrderRequestSchema),
  salesOrderController.create
);

// PATCH /api/sales/:id - Update sales order status (operationId: updateSalesOrder)
salesOrderRouter.patch(
  "/:id",
  validateParams(salesOrderIdParamSchema),
  validateBody(updateSalesOrderRequestSchema),
  salesOrderController.update
);

// DELETE /api/sales/:id - Cancel sales order (operationId: cancelSalesOrder - Owner only)
salesOrderRouter.delete(
  "/:id",
  validateParams(salesOrderIdParamSchema),
  authorize("owner"),
  salesOrderController.delete
);

export default salesOrderRouter;

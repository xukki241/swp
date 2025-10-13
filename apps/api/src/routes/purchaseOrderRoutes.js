import {
  createPurchaseOrdersRequestSchema,
  listPurchaseOrdersQuerySchema,
  updatePurchaseOrderRequestSchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import { purchaseOrderController } from "../controllers/purchaseOrderController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

import {
  nestedReceiptRouter,
  standaloneReceiptRouter,
} from "./purchaseOrderReceiptRoutes.js";

export const purchaseOrderRouter = express.Router();

// Mount nested receipt routes (before authentication to handle params properly)
purchaseOrderRouter.use("/:purchaseOrderId/receipts", nestedReceiptRouter);

// Mount standalone receipt routes (for accessing receipts without purchaseOrderId)
purchaseOrderRouter.use("/receipts", standaloneReceiptRouter);

// All routes require authentication
purchaseOrderRouter.use(authenticate);

// Param validation schema for routes with :id
const idParamSchema = z.object({
  id: uuidSchema,
});

/**
 * @route   GET /api/purchases
 * @desc    Get all purchase orders
 * @access  Private (Authenticated)
 */
purchaseOrderRouter.get(
  "/",
  validateQuery(listPurchaseOrdersQuerySchema),
  purchaseOrderController.getAll
);

/**
 * @route   GET /api/purchases/:id
 * @desc    Get purchase order by ID
 * @access  Private (Authenticated)
 */
purchaseOrderRouter.get(
  "/:id",
  validateParams(idParamSchema),
  purchaseOrderController.getById
);

/**
 * @route   POST /api/purchases
 * @desc    Create purchase orders (batch)
 * @access  Private (Owner only)
 */
purchaseOrderRouter.post(
  "/",
  authorize("owner"),
  validateBody(createPurchaseOrdersRequestSchema),
  purchaseOrderController.create
);

/**
 * @route   PATCH /api/purchases/:id
 * @desc    Update purchase order by ID
 * @access  Private (Owner only)
 */
purchaseOrderRouter.patch(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  validateBody(updatePurchaseOrderRequestSchema),
  purchaseOrderController.update
);

/**
 * @route   DELETE /api/purchases/:id
 * @desc    Delete purchase order by ID
 * @access  Private (Owner only)
 */
purchaseOrderRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  purchaseOrderController.delete
);

export default purchaseOrderRouter;

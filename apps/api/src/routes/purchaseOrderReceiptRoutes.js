import {
  createReceiptRequestSchema,
  listReceiptsQuerySchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import { purchaseOrderReceiptController } from "../controllers/purchaseOrderReceiptController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

// Nested router for /api/purchases/:purchaseOrderId/receipts
export const nestedReceiptRouter = express.Router({ mergeParams: true });

// Standalone router for /api/purchases/receipts
export const standaloneReceiptRouter = express.Router();

// All routes require authentication
nestedReceiptRouter.use(authenticate);
standaloneReceiptRouter.use(authenticate);

// Param validation schemas
const idParamSchema = z.object({
  id: uuidSchema,
});

const purchaseOrderIdParamSchema = z.object({
  purchaseOrderId: uuidSchema,
});

const purchaseOrderIdAndIdParamSchema = z.object({
  purchaseOrderId: uuidSchema,
  id: uuidSchema,
});

// ========== Nested Routes (under /api/purchases/:purchaseOrderId/receipts) ==========

/**
 * @route   GET /api/purchases/:purchaseOrderId/receipts
 * @desc    Get all receipts for a purchase order
 * @access  Private (Authenticated)
 */
nestedReceiptRouter.get(
  "/",
  validateParams(purchaseOrderIdParamSchema),
  validateQuery(listReceiptsQuerySchema),
  purchaseOrderReceiptController.getAllByPurchaseOrder
);

/**
 * @route   GET /api/purchases/:purchaseOrderId/receipts/:id
 * @desc    Get receipt by ID with items
 * @access  Private (Authenticated)
 */
nestedReceiptRouter.get(
  "/:id",
  validateParams(purchaseOrderIdAndIdParamSchema),
  purchaseOrderReceiptController.getById
);

/**
 * @route   POST /api/purchases/:purchaseOrderId/receipts
 * @desc    Create a receipt for a purchase order
 * @access  Private (Owner only)
 */
nestedReceiptRouter.post(
  "/",
  authorize("owner"),
  validateParams(purchaseOrderIdParamSchema),
  validateBody(createReceiptRequestSchema),
  purchaseOrderReceiptController.create
);

// ========== Standalone Routes (under /api/purchases/receipts) ==========

/**
 * @route   GET /api/purchases/receipts
 * @desc    Get all receipts (across all purchase orders)
 * @access  Private (Authenticated)
 */
standaloneReceiptRouter.get(
  "/",
  validateQuery(listReceiptsQuerySchema),
  purchaseOrderReceiptController.getAll
);

/**
 * @route   GET /api/purchases/receipts/:id
 * @desc    Get receipt by ID (without requiring purchaseOrderId)
 * @access  Private (Authenticated)
 */
standaloneReceiptRouter.get(
  "/:id",
  validateParams(idParamSchema),
  purchaseOrderReceiptController.getById
);

export default nestedReceiptRouter;

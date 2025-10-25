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
import { createAuditLog } from "../middleware/auditLog.js";
import { authorize } from "../middleware/checkAuth.js";

// Nested router for /api/purchases/:purchaseOrderId/receipts
export const nestedReceiptRouter = express.Router({ mergeParams: true });

// Standalone router for /api/purchases/receipts
export const standaloneReceiptRouter = express.Router();

// Note: Authentication is already applied in purchaseOrderRouter

// Param validation schemas
const receiptIdParamSchema = z.object({
  id: uuidSchema,
});

const purchaseOrderIdParamSchema = z.object({
  purchaseOrderId: uuidSchema,
});

const purchaseOrderIdAndReceiptIdParamSchema = z.object({
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
  validateParams(purchaseOrderIdAndReceiptIdParamSchema),
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
  createAuditLog("CREATE", "purchase_receipt"),
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
  validateParams(receiptIdParamSchema),
  purchaseOrderReceiptController.getById
);

/**
 * @route   GET /api/purchases/receipts/:id/allocations
 * @desc    Get inventory allocations for a receipt
 * @access  Private (Authenticated)
 */
standaloneReceiptRouter.get(
  "/:id/allocations",
  validateParams(receiptIdParamSchema),
  purchaseOrderReceiptController.getAllocations
);

/**
 * @route   POST /api/purchases/receipts/find-bins
 * @desc    Find available bins for receipt items with selected zones
 * @access  Private (Authenticated)
 */
standaloneReceiptRouter.post(
  "/find-bins",
  purchaseOrderReceiptController.findAvailableBins
);

/**
 * @route   DELETE /api/purchases/receipts/:id
 * @desc    Delete a receipt by ID
 * @access  Private (Owner only)
 */
standaloneReceiptRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(receiptIdParamSchema),
  purchaseOrderReceiptController.delete
);

export default nestedReceiptRouter;

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
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

import {
  nestedReceiptRouter,
  standaloneReceiptRouter,
} from "./purchaseOrderReceiptRoutes.js";

export const purchaseOrderRouter = express.Router();

/**
 * @route   GET /api/purchases/confirm/:id
 * @desc    Confirm purchase order by supplier (public, no auth required)
 * @access  Public
 */
purchaseOrderRouter.get(
  "/confirm/:id",
  validateParams(z.object({ id: uuidSchema })),
  purchaseOrderController.confirm
);

// All other routes require authentication
purchaseOrderRouter.use(authenticate);

// Mount standalone receipt routes FIRST (must be before /:id route)
purchaseOrderRouter.use("/receipts", standaloneReceiptRouter);

// Mount nested receipt routes (for /purchases/:purchaseOrderId/receipts)
purchaseOrderRouter.use("/:purchaseOrderId/receipts", nestedReceiptRouter);

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
  createAuditLog("CREATE", "purchase_order"),
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
  createAuditLog("UPDATE", "purchase_order"),
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
  createAuditLog("DELETE", "purchase_order"),
  purchaseOrderController.delete
);

export default purchaseOrderRouter;

import {
  createSuppliersRequestSchema,
  listSuppliersQuerySchema,
  updateSupplierRequestSchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import { supplierController } from "../controllers/supplierController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

import { supplierMedicationVariantRouter } from "./supplierMedicationVariantRoutes.js";

export const supplierRouter = express.Router();

// Mount nested medication routes (before authentication to handle params properly)
supplierRouter.use("/:supplierId/medications", supplierMedicationVariantRouter);

// All routes require authentication
supplierRouter.use(authenticate);

// Param validation schema for routes with :id
const idParamSchema = z.object({
  id: uuidSchema,
});

/**
 * @route   GET /api/suppliers
 * @desc    Get all suppliers
 * @access  Private (Authenticated)
 */
supplierRouter.get(
  "/",
  validateQuery(listSuppliersQuerySchema),
  supplierController.getAll
);

/**
 * @route   GET /api/suppliers/:id
 * @desc    Get supplier by ID
 * @access  Private (Authenticated)
 */
supplierRouter.get(
  "/:id",
  validateParams(idParamSchema),
  supplierController.getById
);

/**
 * @route   POST /api/suppliers
 * @desc    Create suppliers (batch)
 * @access  Private (Owner only)
 */
supplierRouter.post(
  "/",
  authorize("owner"),
  validateBody(createSuppliersRequestSchema),
  createAuditLog("CREATE", "supplier"),
  supplierController.create
);

/**
 * @route   PATCH /api/suppliers/:id
 * @desc    Update supplier by ID
 * @access  Private (Owner only)
 */
supplierRouter.patch(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  validateBody(updateSupplierRequestSchema),
  createAuditLog("UPDATE", "supplier"),
  supplierController.update
);

/**
 * @route   DELETE /api/suppliers/:id
 * @desc    Delete supplier by ID
 * @access  Private (Owner only)
 * Note: Consider storing supplier entity data before delete for better audit trail
 */
supplierRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  createAuditLog("DELETE", "supplier"),
  supplierController.delete
);

export default supplierRouter;

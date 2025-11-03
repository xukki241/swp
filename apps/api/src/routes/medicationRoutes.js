import {
  createMedicationsRequestSchema,
  listMedicationsQuerySchema,
  listVariantsQuerySchema,
  updateMedicationRequestSchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import * as medicationController from "../controllers/medicationController.js";
import * as medicationVariantController from "../controllers/medicationVariantController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { handleMulterError, uploadSingle } from "../middleware/upload.js";

import { medicationVariantRouter } from "./medicationVariantRoutes.js";

export const medicationRouter = express.Router();

// Mount variant routes before authentication
medicationRouter.use("/:medicationId/variants", medicationVariantRouter);

medicationRouter.use(authenticate);

// Param validation schema for routes with :id
const idParamSchema = z.object({
  id: uuidSchema,
});

/* -------------------- MEDICATION -------------------- */

/**
 * @route   GET /api/medications
 * @desc    Get all medications
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/",
  validateQuery(listMedicationsQuerySchema),
  medicationController.getAllMedications
);
/**
 * @route   GET /api/medications/variants/search-for-sale
 * @desc    Search variants for POS/Sales with inventory data
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/variants/search-for-sale",
  medicationVariantController.searchVariantsForSale
);
/**
 * @route   GET /api/medications/variants/all
 * @desc    Get all variants for a medication
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/variants/all",
  validateQuery(listVariantsQuerySchema),
  medicationVariantController.getAllMedicationVariants
);
/**
 * @route   GET /api/medications/:id
 * @desc    Get medication by ID
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/:id",
  validateParams(idParamSchema),
  medicationController.getMedicationById
);

/**
 * @route   GET /api/medications/:id/inventory
 * @desc    Get inventory for a medication
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/:id/inventory",
  validateParams(idParamSchema),
  medicationController.getMedicationInventory
);

/**
 * @route   GET /api/medications/:id/suppliers
 * @desc    Get suppliers for a medication
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/:id/suppliers",
  validateParams(idParamSchema),
  medicationController.getMedicationSuppliers
);

/**
 * @route   GET /api/medications/:id/purchases
 * @desc    Get purchase orders containing a medication
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/:id/purchases",
  validateParams(idParamSchema),
  medicationController.getMedicationPurchases
);

/**
 * @route   GET /api/medications/:id/sales
 * @desc    Get sales orders containing a medication
 * @access  Private (Authenticated)
 */
medicationRouter.get(
  "/:id/sales",
  validateParams(idParamSchema),
  medicationController.getMedicationSales
);

/**
 * @route   POST /api/medications/:id/upload-image
 * @desc    Upload medication image
 * @access  Private (Owner only)
 */
medicationRouter.post(
  "/:id/upload-image",
  authorize("owner"),
  validateParams(idParamSchema),
  uploadSingle("image"),
  handleMulterError,
  createAuditLog("UPDATE", "medication", {
    excludeFields: ["costPrice", "supplierCost"],
  }),
  medicationController.uploadMedicationImage
);

/**
 * @route   DELETE /api/medications/:id/image
 * @desc    Delete medication image
 * @access  Private (Owner only)
 */
medicationRouter.delete(
  "/:id/image",
  authorize("owner"),
  validateParams(idParamSchema),
  createAuditLog("DELETE", "medication", {
    excludeFields: ["costPrice", "supplierCost"],
  }),
  medicationController.deleteMedicationImage
);

/**
 * @route   GET /api/medications/variants/:id/inventory
 * @desc    Get inventory for a medication variant
 * @access  Private (Authenticated)
 * @note    This route must be placed before POST /api/medications to avoid conflicts
 */
medicationRouter.get(
  "/variants/:id/inventory",
  validateParams(idParamSchema),
  medicationVariantController.getMedicationVariantInventory
);

/**
 * @route   POST /api/medications
 * @desc    Create a new medication (batch)
 * @access  Private (Owner only)
 */
medicationRouter.post(
  "/",
  authorize("owner"),
  validateBody(createMedicationsRequestSchema),
  createAuditLog("CREATE", "medication", {
    excludeFields: ["costPrice", "supplierCost"],
  }),
  medicationController.createMedication
);

/**
 * @route   PATCH /api/medications/:id
 * @desc    Update medication by ID
 * @access  Private (Owner only)
 */
medicationRouter.patch(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  validateBody(updateMedicationRequestSchema),
  createAuditLog("UPDATE", "medication", {
    excludeFields: ["costPrice", "supplierCost"],
  }),
  medicationController.updateMedication
);

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete medication by ID
 * @access  Private (Owner only)
 * Note: Consider storing medication entity data before delete for better audit trail
 */
medicationRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  createAuditLog("DELETE", "medication"),
  medicationController.deleteMedication
);

export default medicationRouter;

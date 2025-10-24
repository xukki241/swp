import {
  createSupplierMedicationsRequestSchema,
  listSupplierMedicationsQuerySchema,
  updateSupplierMedicationRequestSchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import { supplierMedicationVariantController } from "../controllers/supplierMedicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { createAuditLog } from "../middleware/auditLog.js";

// Nested router for /api/suppliers/:supplierId/medications
export const supplierMedicationVariantRouter = express.Router({
  mergeParams: true,
});

// All routes require authentication
supplierMedicationVariantRouter.use(authenticate);

// Param validation schemas
const supplierIdParamSchema = z.object({
  supplierId: uuidSchema,
});

const supplierIdAndIdParamSchema = z.object({
  supplierId: uuidSchema,
  id: uuidSchema,
});

/**
 * @route   GET /api/suppliers/:supplierId/medications
 * @desc    Get all medication variants for a supplier
 * @access  Private (Authenticated)
 */
supplierMedicationVariantRouter.get(
  "/",
  validateParams(supplierIdParamSchema),
  validateQuery(listSupplierMedicationsQuerySchema),
  supplierMedicationVariantController.getAll
);

/**
 * @route   GET /api/suppliers/:supplierId/medications/:id
 * @desc    Get supplier medication variant by ID
 * @access  Private (Authenticated)
 */
supplierMedicationVariantRouter.get(
  "/:id",
  validateParams(supplierIdAndIdParamSchema),
  supplierMedicationVariantController.getById
);

/**
 * @route   POST /api/suppliers/:supplierId/medications
 * @desc    Add medication variants to supplier (batch)
 * @access  Private (Owner only)
 */
supplierMedicationVariantRouter.post(
  "/",
  authorize("owner"),
  validateParams(supplierIdParamSchema),
  validateBody(createSupplierMedicationsRequestSchema),
  createAuditLog("CREATE", "supplier_medication_variant"),
  supplierMedicationVariantController.create
);

/**
 * @route   PATCH /api/suppliers/:supplierId/medications/:id
 * @desc    Update supplier medication variant
 * @access  Private (Owner only)
 */
supplierMedicationVariantRouter.patch(
  "/:id",
  authorize("owner"),
  validateParams(supplierIdAndIdParamSchema),
  validateBody(updateSupplierMedicationRequestSchema),
  createAuditLog("UPDATE", "supplier_medication_variant", {
    getChanges: (req) => ({ supplierMedicationVariant: req.body }),
  }),
  supplierMedicationVariantController.update
);

/**
 * @route   DELETE /api/suppliers/:supplierId/medications/:id
 * @desc    Remove medication variant from supplier
 * @access  Private (Owner only)
 */
supplierMedicationVariantRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(supplierIdAndIdParamSchema),
  createAuditLog("DELETE", "supplier_medication_variant"),
  supplierMedicationVariantController.delete
);

export default supplierMedicationVariantRouter;

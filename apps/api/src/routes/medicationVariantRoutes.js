import {
  createVariantsRequestSchema,
  listVariantsQuerySchema,
  updateVariantRequestSchema,
  uuidSchema,
} from "@pharmaflow/dto";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import * as medicationVariantController from "../controllers/medicationVariantController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const medicationVariantRouter = express.Router({ mergeParams: true });

medicationVariantRouter.use(authenticate);

const medicationIdParamSchema = z.object({
  medicationId: uuidSchema,
});

const medicationIdAndIdParamSchema = z.object({
  medicationId: uuidSchema,
  id: uuidSchema,
});

/**
 * @route   GET /api/medications/:medicationId/variants
 * @desc    Get all variants for a medication
 * @access  Private (Authenticated)
 */
medicationVariantRouter.get(
  "/",
  validateParams(medicationIdParamSchema),
  validateQuery(listVariantsQuerySchema),
  medicationVariantController.getAllMedicationVariants
);

/**
 * @route   GET /api/medications/:medicationId/variants/:id
 * @desc    Get variant by ID
 * @access  Private (Authenticated)
 */
medicationVariantRouter.get(
  "/:id",
  validateParams(medicationIdAndIdParamSchema),
  medicationVariantController.getMedicationVariantById
);

/**
 * @route   POST /api/medications/:medicationId/variants
 * @desc    Create medication variants (batch)
 * @access  Private (Owner only)
 */
medicationVariantRouter.post(
  "/",
  authorize("owner"),
  validateParams(medicationIdParamSchema),
  validateBody(createVariantsRequestSchema),
  createAuditLog("CREATE", "medication_variant"),
  medicationVariantController.createMedicationVariant
);

/**
 * @route   PATCH /api/medications/:medicationId/variants/:id
 * @desc    Update medication variant by ID
 * @access  Private (Owner only)
 */
medicationVariantRouter.patch(
  "/:id",
  authorize("owner"),
  validateParams(medicationIdAndIdParamSchema),
  validateBody(updateVariantRequestSchema),
  createAuditLog("UPDATE", "medication_variant", {
    getChanges: (req) => ({ medicationVariant: req.body }),
  }),
  medicationVariantController.updateMedicationVariant
);

/**
 * @route   DELETE /api/medications/:medicationId/variants/:id
 * @desc    Delete medication variant by ID
 * @access  Private (Owner only)
 */
medicationVariantRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(medicationIdAndIdParamSchema),
  createAuditLog("DELETE", "medication_variant"),
  medicationVariantController.deleteMedicationVariant
);

export default medicationVariantRouter;

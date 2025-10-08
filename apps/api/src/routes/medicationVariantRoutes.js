import express from "express";

import * as medicationVariantController from "../controllers/medicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * @route   GET /api/medication-variants
 * @desc    Get all medication variants with optional search and filters
 * @access  Private (Owner, Staff)
 * @query   search - Search term for name, sku, or barcode
 * @query   medicationId - Filter by medication ID
 * @query   isActive - Filter by active status (true/false)
 */
router.get(
  "/",
  authenticate,
  medicationVariantController.getAllMedicationVariants
);

/**
 * @route   GET /api/medication-variants/:id
 * @desc    Get medication variant by ID
 * @access  Private (Owner, Staff)
 */
router.get(
  "/:id",
  authenticate,
  medicationVariantController.getMedicationVariantById
);

/**
 * @route   POST /api/medication-variants
 * @desc    Create a new medication variant (owner only)
 * @access  Private (Owner)
 * @body    { medicationId, sku, name, unit, unitFactor?, barcode?, sellPrice, isActive?, isForSale? }
 */
router.post(
  "/",
  authenticate,
  authorize("owner"),
  medicationVariantController.createMedicationVariant
);

/**
 * @route   PUT /api/medication-variants/:id
 * @desc    Update medication variant by ID (owner only)
 * @access  Private (Owner)
 * @body    { medicationId?, sku?, name?, unit?, unitFactor?, barcode?, sellPrice?, isActive?, isForSale? }
 */
router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationVariantController.updateMedicationVariant
);

/**
 * @route   DELETE /api/medication-variants/:id
 * @desc    Delete medication variant by ID (owner only)
 * @access  Private (Owner)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationVariantController.deleteMedicationVariant
);

export default router;

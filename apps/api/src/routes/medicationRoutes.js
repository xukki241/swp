import express from "express";

import * as medicationController from "../controllers/medicationController.js";
import * as medicationVariantController from "../controllers/medicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

/* -------------------- MEDICATION -------------------- */

/**
 * @route   GET /api/medications
 * @desc    Get all medications
 */
router.get("/", authenticate, medicationController.getAllMedications);

/**
 * @route   GET /api/medications/:id
 * @desc    Get medication by ID
 */
router.get("/:id", authenticate, medicationController.getMedicationById);

/**
 * @route   POST /api/medications
 * @desc    Create a new medication
 */
router.post(
  "/",
  authenticate,
  authorize("owner"),
  medicationController.createMedication
);

/**
 * @route   PUT /api/medications/:id
 * @desc    Update medication by ID
 */
router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationController.updateMedication
);

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete medication by ID
 */
router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationController.deleteMedication
);

/* -------------------- VARIANTS (nested) -------------------- */

/**
 * @route   GET /api/medications/:medicationId/variants
 * @desc    Get all variants of a medication
 */
router.get(
  "/:medicationId/variants",
  authenticate,
  (req, res, next) => {
    req.query.medicationId = req.params.medicationId;
    next();
  },
  medicationVariantController.getAllMedicationVariants
);

/**
 * @route   GET /api/medications/:medicationId/variants/:variantId
 * @desc    Get variant by ID (nested)
 */
router.get(
  "/:medicationId/variants/:variantId",
  authenticate,
  (req, res, next) => {
    req.params.id = req.params.variantId;
    next();
  },
  medicationVariantController.getMedicationVariantById
);

/**
 * @route   POST /api/medications/:medicationId/variants
 * @desc    Create new variant for medication
 */
router.post(
  "/:medicationId/variants",
  authenticate,
  authorize("owner"),
  (req, res, next) => {
    req.body.medicationId = req.params.medicationId;
    next();
  },
  medicationVariantController.createMedicationVariant
);

/**
 * @route   PUT /api/medications/:medicationId/variants/:variantId
 * @desc    Update variant by ID
 */
router.put(
  "/:medicationId/variants/:variantId",
  authenticate,
  authorize("owner"),
  (req, res, next) => {
    req.params.id = req.params.variantId;
    req.body.medicationId = req.params.medicationId;
    next();
  },
  medicationVariantController.updateMedicationVariant
);

/**
 * @route   DELETE /api/medications/:medicationId/variants/:variantId
 * @desc    Delete variant by ID
 */
router.delete(
  "/:medicationId/variants/:variantId",
  authenticate,
  authorize("owner"),
  (req, res, next) => {
    req.params.id = req.params.variantId;
    next();
  },
  medicationVariantController.deleteMedicationVariant
);

export default router;

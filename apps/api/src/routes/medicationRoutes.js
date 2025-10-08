import express from "express";

import * as medicationController from "../controllers/medicationController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * @route   GET /api/medications
 * @desc    Get all medications with optional search and filters
 * @access  Private (Owner, Staff)
 * @query   search - Search term for name or brand
 * @query   status - Filter by status (active, inactive, discontinued)
 */
router.get("/", authenticate, medicationController.getAllMedications);

/**
 * @route   GET /api/medications/:id
 * @desc    Get medication by ID
 * @access  Private (Owner, Staff)
 */
router.get("/:id", authenticate, medicationController.getMedicationById);

/**
 * @route   POST /api/medications
 * @desc    Create a new medication (owner only)
 * @access  Private (Owner)
 * @body    { name, brand?, description?, isPrescriptionRequired?, isControlledSubstance?, status? }
 */
router.post(
  "/",
  authenticate,
  authorize("owner"),
  medicationController.createMedication
);

/**
 * @route   PUT /api/medications/:id
 * @desc    Update medication by ID (owner only)
 * @access  Private (Owner)
 * @body    { name?, brand?, description?, isPrescriptionRequired?, isControlledSubstance?, status? }
 */
router.put(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationController.updateMedication
);

/**
 * @route   DELETE /api/medications/:id
 * @desc    Delete medication by ID (owner only)
 * @access  Private (Owner)
 */
router.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationController.deleteMedication
);

export default router;

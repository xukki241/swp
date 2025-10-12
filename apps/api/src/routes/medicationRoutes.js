import express from "express";

import * as medicationController from "../controllers/medicationController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const medicationRouter = express.Router();

/**
 * @route   GET /api/medications
 * @desc    Get all medications with optional search and filters
 * @access  Private (Owner, Staff)
 * @query   search - Search term for name or brand
 * @query   status - Filter by status (active, inactive, discontinued)
 */
medicationRouter.get("/", authenticate, medicationController.getAllMedications);

/**
 * @route   GET /api/medications/:id
 * @desc    Get medication by ID
 * @access  Private (Owner, Staff)
 */
medicationRouter.get(
  "/:id",
  authenticate,
  medicationController.getMedicationById
);

/**
 * @route   GET /api/medications/:id/inventory
 * @desc    Get inventory for a medication
 * @access  Private (Owner, Staff)
 */
medicationRouter.get(
  "/:id/inventory",
  authenticate,
  medicationController.getMedicationInventory
);

/**
 * @route   POST /api/medications
 * @desc    Create a new medication (owner only)
 * @access  Private (Owner)
 * @body    { name, brand?, description?, isPrescriptionRequired?, isControlledSubstance?, status? }
 */
medicationRouter.post(
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
medicationRouter.put(
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
medicationRouter.delete(
  "/:id",
  authenticate,
  authorize("owner"),
  medicationController.deleteMedication
);

export default medicationRouter;

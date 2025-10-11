import express from "express";

import { supplierController } from "../controllers/supplierController.js";
import { supplierMedicationVariantController } from "../controllers/supplierMedicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

/* -------------------- SUPPLIERS -------------------- */

// Require authentication for all
router.use(authenticate);

// Get all suppliers (Owner + Staff)
router.get("/", supplierController.getAll);

// Get supplier by ID
router.get("/:id", supplierController.getById);

// Create new supplier (Owner only)
router.post("/", authorize("owner"), supplierController.create);

// Update supplier (Owner only)
router.put("/:id", authorize("owner"), supplierController.update);

// Delete supplier (Owner only)
router.delete("/:id", authorize("owner"), supplierController.delete);

/* -------------------- SUPPLIER MEDICATION VARIANTS (Nested) -------------------- */

/**
 * @route   GET /api/suppliers/:supplierId/medication-variants
 * @desc    Get all medication variants for supplier
 */
router.get(
  "/:supplierId/medication-variants",
  (req, res, next) => {
    req.query.supplierId = req.params.supplierId;
    next();
  },
  supplierMedicationVariantController.getAll
);

/**
 * @route   GET /api/suppliers/:supplierId/medication-variants/:variantId
 * @desc    Get one medication variant by ID for supplier
 */
router.get(
  "/:supplierId/medication-variants/:variantId",
  (req, res, next) => {
    req.params.id = req.params.variantId;
    next();
  },
  supplierMedicationVariantController.getById
);

/**
 * @route   POST /api/suppliers/:supplierId/medication-variants
 * @desc    Create new medication variant for supplier
 */
router.post(
  "/:supplierId/medication-variants",
  authorize("owner"),
  (req, res, next) => {
    req.body.supplierId = req.params.supplierId;
    next();
  },
  supplierMedicationVariantController.create
);

/**
 * @route   PUT /api/suppliers/:supplierId/medication-variants/:variantId
 * @desc    Update a supplier’s medication variant
 */
router.put(
  "/:supplierId/medication-variants/:variantId",
  authorize("owner"),
  (req, res, next) => {
    req.body.supplierId = req.params.supplierId;
    req.params.id = req.params.variantId;
    next();
  },
  supplierMedicationVariantController.update
);

/**
 * @route   DELETE /api/suppliers/:supplierId/medication-variants/:variantId
 * @desc    Delete a supplier’s medication variant
 */
router.delete(
  "/:supplierId/medication-variants/:variantId",
  authorize("owner"),
  (req, res, next) => {
    req.params.id = req.params.variantId;
    next();
  },
  supplierMedicationVariantController.delete
);

export default router;

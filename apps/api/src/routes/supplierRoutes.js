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
 * @route   GET /api/suppliers/:supplierId/medications
 * @desc    Get all medications provided by this supplier
 */
router.get(
  "/:supplierId/medications",
  (req, res, next) => {
    req.query.supplierId = req.params.supplierId;
    next();
  },
  supplierMedicationVariantController.getAll
);

/**
 * @route   POST /api/suppliers/:supplierId/medications
 * @desc    Bulk add medications that this supplier provides
 */
router.post(
  "/:supplierId/medications",
  authorize("owner"),
  (req, res, next) => {
    req.body = Array.isArray(req.body) ? req.body : [req.body];
    req.body.forEach((item) => {
      item.supplierId = req.params.supplierId;
    });
    next();
  },
  supplierMedicationVariantController.bulkCreate
);

/**
 * @route   PATCH /api/suppliers/:supplierId/medications/:id
 * @desc    Update supplier medication info (SKU, lead time)
 */
router.patch(
  "/:supplierId/medications/:id",
  authorize("owner"),
  (req, res, next) => {
    req.params.variantId = req.params.id;
    next();
  },
  supplierMedicationVariantController.update
);

/**
 * @route   DELETE /api/suppliers/:supplierId/medications/:id
 * @desc    Remove medication link from supplier
 */
router.delete(
  "/:supplierId/medications/:id",
  authorize("owner"),
  (req, res, next) => {
    req.params.variantId = req.params.id;
    next();
  },
  supplierMedicationVariantController.delete
);

export default router;

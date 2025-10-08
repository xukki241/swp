import express from "express";

import { supplierMedicationVariantController } from "../controllers/supplierMedicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", supplierMedicationVariantController.getAll);
router.get("/:id", supplierMedicationVariantController.getById);

// CUD routes - only accessible by Owner
router.post(
  "/",
  authorize("owner"),
  supplierMedicationVariantController.create
);
router.put(
  "/:id",
  authorize("owner"),
  supplierMedicationVariantController.update
);
router.delete(
  "/:id",
  authorize("owner"),
  supplierMedicationVariantController.delete
);

export default router;

import express from "express";

import { supplierMedicationVariantController } from "../controllers/supplierMedicationVariantController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const supplierMedicationVariantRouter = express.Router();

// All routes require authentication
supplierMedicationVariantRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
supplierMedicationVariantRouter.get(
  "/",
  supplierMedicationVariantController.getAll
);
supplierMedicationVariantRouter.get(
  "/:id",
  supplierMedicationVariantController.getById
);

// CUD routes - only accessible by Owner
supplierMedicationVariantRouter.post(
  "/",
  authorize("owner"),
  supplierMedicationVariantController.create
);
supplierMedicationVariantRouter.put(
  "/:id",
  authorize("owner"),
  supplierMedicationVariantController.update
);
supplierMedicationVariantRouter.delete(
  "/:id",
  authorize("owner"),
  supplierMedicationVariantController.delete
);

export default supplierMedicationVariantRouter;

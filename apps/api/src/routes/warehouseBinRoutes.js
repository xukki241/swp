import {
  createWarehouseBinSchema,
  updateWarehouseBinSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseBinController } from "../controllers/warehouseBinController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", warehouseBinController.getAll);
router.get("/:id", warehouseBinController.getById);
router.get("/:id/inventory", warehouseBinController.getInventory);
router.get("/rack/:rackId", warehouseBinController.getByRackId);

// CUD routes - only accessible by Owner
router.post(
  "/",
  authorize("owner"),
  validateBody(createWarehouseBinSchema),
  warehouseBinController.create
);
router.put(
  "/:id",
  authorize("owner"),
  validateBody(updateWarehouseBinSchema),
  warehouseBinController.update
);
router.delete("/:id", authorize("owner"), warehouseBinController.delete);

export default router;

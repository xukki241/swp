import {
  createWarehouseZoneSchema,
  updateWarehouseZoneSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseZoneController } from "../controllers/warehouseZoneController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", warehouseZoneController.getAll);
router.get("/:id", warehouseZoneController.getById);

// CUD routes - only accessible by Owner
router.post(
  "/",
  authorize("owner"),
  validateBody(createWarehouseZoneSchema),
  warehouseZoneController.create
);
router.put(
  "/:id",
  authorize("owner"),
  validateBody(updateWarehouseZoneSchema),
  warehouseZoneController.update
);
router.delete("/:id", authorize("owner"), warehouseZoneController.delete);

export default router;

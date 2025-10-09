import {
  createWarehouseRackSchema,
  updateWarehouseRackSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseRackController } from "../controllers/warehouseRackController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", warehouseRackController.getAll);
router.get("/:id", warehouseRackController.getById);
router.get("/zone/:zoneId", warehouseRackController.getByZoneId);

// CUD routes - only accessible by Owner
router.post(
  "/",
  authorize("owner"),
  validateBody(createWarehouseRackSchema),
  warehouseRackController.create
);
router.put(
  "/:id",
  authorize("owner"),
  validateBody(updateWarehouseRackSchema),
  warehouseRackController.update
);
router.delete("/:id", authorize("owner"), warehouseRackController.delete);

export default router;

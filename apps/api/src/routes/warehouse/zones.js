import {
  createWarehouseZoneSchema,
  updateWarehouseZoneSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseZoneController } from "../../controllers/warehouseZoneController.js";
import { authorize } from "../../middleware/checkAuth.js";
import { validateBody } from "../../middleware/validate.js";

export const warehouseZonesRouter = express.Router();

// ZONES
// GET /api/warehouse/zones
warehouseZonesRouter.get("/zones", warehouseZoneController.getAll);

// POST /api/warehouse/zones (create single or batch)
warehouseZonesRouter.post(
  "/zones",
  authorize("owner"),
  validateBody(createWarehouseZoneSchema),
  warehouseZoneController.create
);

// GET /api/warehouse/zones/:id
warehouseZonesRouter.get("/zones/:id", warehouseZoneController.getById);

// PATCH /api/warehouse/zones/:id
warehouseZonesRouter.patch(
  "/zones/:id",
  authorize("owner"),
  validateBody(updateWarehouseZoneSchema),
  warehouseZoneController.update
);

// DELETE /api/warehouse/zones/:id
warehouseZonesRouter.delete(
  "/zones/:id",
  authorize("owner"),
  warehouseZoneController.delete
);

export default warehouseZonesRouter;

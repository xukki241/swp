import {
  batchCreateZonesRequestSchema,
  createWarehouseZoneSchema,
  updateWarehouseZoneSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseZoneController } from "../../controllers/warehouseZoneController.js";
import { createAuditLog } from "../../middleware/auditLog.js";
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
  createAuditLog("CREATE", "warehouse_zone"),
  warehouseZoneController.create
);

// POST /api/warehouse/zones/batch (batch create with auto-generated codes)
warehouseZonesRouter.post(
  "/zones/batch",
  authorize("owner"),
  validateBody(batchCreateZonesRequestSchema),
  createAuditLog("CREATE", "warehouse_zone"),
  warehouseZoneController.createBatch
);

// GET /api/warehouse/zones/:id
warehouseZonesRouter.get("/zones/:id", warehouseZoneController.getById);

// PATCH /api/warehouse/zones/:id
warehouseZonesRouter.patch(
  "/zones/:id",
  authorize("owner"),
  validateBody(updateWarehouseZoneSchema),
  createAuditLog("UPDATE", "warehouse_zone"),
  warehouseZoneController.update
);

// DELETE /api/warehouse/zones/:id
// Note: The controller should store the complete warehouse zone data before deletion in metadata.entityData
warehouseZonesRouter.delete(
  "/zones/:id",
  authorize("owner"),
  createAuditLog("DELETE", "warehouse_zone"),
  warehouseZoneController.delete
);

export default warehouseZonesRouter;

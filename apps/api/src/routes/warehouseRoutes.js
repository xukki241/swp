import {
  createWarehouseBinSchema,
  createWarehouseRackSchema,
  createWarehouseZoneSchema,
  updateWarehouseBinSchema,
  updateWarehouseRackSchema,
  updateWarehouseZoneSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseBinController } from "../controllers/warehouseBinController.js";
import { warehouseRackController } from "../controllers/warehouseRackController.js";
import { warehouseZoneController } from "../controllers/warehouseZoneController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// ============ ZONES ============
// GET /api/warehouse/zones
router.get("/zones", warehouseZoneController.getAll);

// POST /api/warehouse/zones (create single or batch)
router.post(
  "/zones",
  authorize("owner"),
  validateBody(createWarehouseZoneSchema),
  warehouseZoneController.create
);

// GET /api/warehouse/zones/:id
router.get("/zones/:id", warehouseZoneController.getById);

// PATCH /api/warehouse/zones/:id
router.patch(
  "/zones/:id",
  authorize("owner"),
  validateBody(updateWarehouseZoneSchema),
  warehouseZoneController.update
);

// DELETE /api/warehouse/zones/:id
router.delete("/zones/:id", authorize("owner"), warehouseZoneController.delete);

// ============ RACKS ============
// POST /api/warehouse/zones/:zoneId/racks (create racks in a zone)
router.post(
  "/zones/:zoneId/racks",
  authorize("owner"),
  validateBody(createWarehouseRackSchema),
  (req, res, next) => {
    // Inject zoneId from params into body for controller
    req.body.zoneId = req.params.zoneId;
    next();
  },
  warehouseRackController.create
);

// GET /api/warehouse/zones/:zoneId/racks (get racks in a zone)
router.get("/zones/:zoneId/racks", warehouseRackController.getByZoneId);

// GET /api/warehouse/racks/:id
router.get("/racks/:id", warehouseRackController.getById);

// PATCH /api/warehouse/racks/:id
router.patch(
  "/racks/:id",
  authorize("owner"),
  validateBody(updateWarehouseRackSchema),
  warehouseRackController.update
);

// DELETE /api/warehouse/racks/:id
router.delete("/racks/:id", authorize("owner"), warehouseRackController.delete);

// ============ BINS ============
// POST /api/warehouse/racks/:rackId/bins (create bins in a rack)
router.post(
  "/racks/:rackId/bins",
  authorize("owner"),
  validateBody(createWarehouseBinSchema),
  (req, res, next) => {
    // Inject rackId from params into body for controller
    req.body.rackId = req.params.rackId;
    next();
  },
  warehouseBinController.create
);

// GET /api/warehouse/racks/:rackId/bins (get bins in a rack)
router.get("/racks/:rackId/bins", warehouseBinController.getByRackId);

// GET /api/warehouse/bins/:id
router.get("/bins/:id", warehouseBinController.getById);

// GET /api/warehouse/bins/:id/inventory
router.get("/bins/:id/inventory", warehouseBinController.getInventory);

// PATCH /api/warehouse/bins/:id
router.patch(
  "/bins/:id",
  authorize("owner"),
  validateBody(updateWarehouseBinSchema),
  warehouseBinController.update
);

// DELETE /api/warehouse/bins/:id
router.delete("/bins/:id", authorize("owner"), warehouseBinController.delete);

export default router;

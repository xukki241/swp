import {
  batchCreateBinsRequestSchema,
  batchCreateRacksRequestSchema,
  createWarehouseBinSchema,
  createWarehouseRackSchema,
  updateWarehouseRackSchema,
} from "@pharmaflow/dto";
import express from "express";

import { warehouseBinController } from "../../controllers/warehouse/warehouseBinController.js";
import { warehouseRackController } from "../../controllers/warehouse/warehouseRackController.js";
import { createAuditLog } from "../../middleware/auditLog.js";
import { authorize } from "../../middleware/checkAuth.js";
import { validateBody } from "../../middleware/validate.js";

export const warehouseRacksRouter = express.Router();

// GET /api/warehouse/racks (get all racks across all zones)
warehouseRacksRouter.get("/racks", warehouseRackController.getAll);

// POST /api/warehouse/zones/:zoneId/racks (create racks in a zone)
warehouseRacksRouter.post(
  "/zones/:zoneId/racks",
  authorize("owner"),
  validateBody(createWarehouseRackSchema),
  (req, res, next) => {
    // Inject zoneId from params into body for controller
    req.body.zoneId = req.params.zoneId;
    next();
  },
  createAuditLog("CREATE", "warehouse_rack"),
  warehouseRackController.create
);

// POST /api/warehouse/zones/:zoneId/racks/batch (batch create racks with auto-generated codes)
warehouseRacksRouter.post(
  "/zones/:zoneId/racks/batch",
  authorize("owner"),
  validateBody(batchCreateRacksRequestSchema),
  createAuditLog("CREATE", "warehouse_rack"),
  warehouseRackController.createBatch
);

// GET /api/warehouse/zones/:zoneId/racks (get racks in a zone)
warehouseRacksRouter.get(
  "/zones/:zoneId/racks",
  warehouseRackController.getByZoneId
);

// GET /api/warehouse/racks/:id
warehouseRacksRouter.get("/racks/:id", warehouseRackController.getById);

// PATCH /api/warehouse/racks/:id
warehouseRacksRouter.patch(
  "/racks/:id",
  authorize("owner"),
  validateBody(updateWarehouseRackSchema),
  createAuditLog("UPDATE", "warehouse_rack"),
  warehouseRackController.update
);

// DELETE /api/warehouse/racks/:id
warehouseRacksRouter.delete(
  "/racks/:id",
  authorize("owner"),
  createAuditLog("DELETE", "warehouse_rack"),
  warehouseRackController.delete
);

// POST /api/warehouse/racks/:rackId/bins (create bins in a rack)
warehouseRacksRouter.post(
  "/racks/:rackId/bins",
  authorize("owner"),
  validateBody(createWarehouseBinSchema),
  (req, res, next) => {
    // Inject rackId from params into body for controller
    req.body.rackId = req.params.rackId;
    next();
  },
  createAuditLog("CREATE", "warehouse_bin"),
  warehouseBinController.create
);

// POST /api/warehouse/racks/:rackId/bins/batch (batch create bins with auto-generated codes)
warehouseRacksRouter.post(
  "/racks/:rackId/bins/batch",
  authorize("owner"),
  validateBody(batchCreateBinsRequestSchema),
  createAuditLog("CREATE", "warehouse_bin"),
  warehouseBinController.createBatch
);

// GET /api/warehouse/racks/:rackId/bins (get bins in a rack)
warehouseRacksRouter.get(
  "/racks/:rackId/bins",
  warehouseBinController.getByRackId
);

export default warehouseRacksRouter;

import { updateWarehouseBinSchema } from "@pharmaflow/dto";
import express from "express";

import { warehouseBinController } from "../../controllers/warehouse/warehouseBinController.js";
import { createAuditLog } from "../../middleware/auditLog.js";
import { authorize } from "../../middleware/checkAuth.js";
import { validateBody } from "../../middleware/validate.js";

export const warehouseBinsRouter = express.Router();

// GET /api/warehouse/bins (get all bins across all racks)
warehouseBinsRouter.get("/bins", warehouseBinController.getAll);

// GET /api/warehouse/bins/:id
warehouseBinsRouter.get("/bins/:id", warehouseBinController.getById);

// GET /api/warehouse/bins/:id/inventory
warehouseBinsRouter.get(
  "/bins/:id/inventory",
  warehouseBinController.getInventory
);

// PATCH /api/warehouse/bins/:id
warehouseBinsRouter.patch(
  "/bins/:id",
  authorize("owner"),
  validateBody(updateWarehouseBinSchema),
  createAuditLog("UPDATE", "warehouse_bin"),
  warehouseBinController.update
);

// DELETE /api/warehouse/bins/:id
warehouseBinsRouter.delete(
  "/bins/:id",
  authorize("owner"),
  createAuditLog("DELETE", "warehouse_bin"),
  warehouseBinController.delete
);

export default warehouseBinsRouter;

import {
  adjustInventoryRequestSchema,
  getExpiringInventoryQuerySchema,
  getInventorySummaryQuerySchema,
  getLowStockInventoryQuerySchema,
  inventoryBatchIdParamSchema,
  listInventoryQuerySchema,
  moveInventoryRequestSchema,
  updateInventorySchema,
} from "@pharmaflow/dto";
import express from "express";

import { inventoryController } from "../controllers/inventoryController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validate.js";

export const inventoryRouter = express.Router();

// All routes require authentication
inventoryRouter.use(authenticate);

// GET /api/inventory - List all inventory (operationId: listInventory)
inventoryRouter.get(
  "/",
  validateQuery(listInventoryQuerySchema),
  inventoryController.getAll
);

// GET /api/inventory/summary/by-variant - Get inventory summary by variant (operationId: getInventorySummaryByVariant)
inventoryRouter.get(
  "/summary/by-variant",
  validateQuery(getInventorySummaryQuerySchema),
  inventoryController.getSummaryByVariant
);

// GET /api/inventory/expiring - Get expiring inventory (operationId: getExpiringInventory)
inventoryRouter.get(
  "/expiring",
  validateQuery(getExpiringInventoryQuerySchema),
  inventoryController.getExpiringSoon
);

// GET /api/inventory/low-stock - Get low stock inventory (operationId: getLowStockInventory)
inventoryRouter.get(
  "/low-stock",
  validateQuery(getLowStockInventoryQuerySchema),
  inventoryController.getLowStock
);

// GET /api/inventory/batches/:inventoryBatchId - Get inventory by ID (operationId: getInventoryById)
inventoryRouter.get(
  "/batches/:inventoryBatchId",
  validateParams(inventoryBatchIdParamSchema),
  inventoryController.getById
);

// PATCH /api/inventory/batches/:inventoryBatchId - Update inventory (operationId: updateInventory - Owner only)
inventoryRouter.patch(
  "/batches/:inventoryBatchId",
  validateParams(inventoryBatchIdParamSchema),
  authorize("owner"),
  validateBody(updateInventorySchema),
  createAuditLog("UPDATE", "inventory", {
    excludeFields: ["costPrice", "supplierCost"],
  }),
  inventoryController.update
);

// PATCH /api/inventory/batches/:inventoryBatchId/adjust - Adjust inventory quantity (operationId: adjustInventory - Owner only)
inventoryRouter.patch(
  "/batches/:inventoryBatchId/adjust",
  validateParams(inventoryBatchIdParamSchema),
  authorize("owner"),
  validateBody(adjustInventoryRequestSchema),
  createAuditLog("UPDATE", "inventory", {
    excludeFields: ["costPrice", "supplierCost"],
    getChanges: (req) => ({ adjustment: req.body }),
  }),
  inventoryController.adjust
);

// POST /api/inventory/move - Move inventory between bins (operationId: moveInventory - Owner only)
inventoryRouter.post(
  "/move",
  authorize("owner"),
  validateBody(moveInventoryRequestSchema),
  createAuditLog("UPDATE", "inventory", {
    excludeFields: ["costPrice", "supplierCost"],
    getChanges: (req) => ({ movement: req.body }),
  }),
  inventoryController.move
);

export default inventoryRouter;

import express from "express";

import { purchaseOrderItemController } from "../controllers/purchaseOrderItemController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const purchaseOrderItemRouter = express.Router();

// All routes require authentication
purchaseOrderItemRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
purchaseOrderItemRouter.get("/", purchaseOrderItemController.getAll);
purchaseOrderItemRouter.get("/:id", purchaseOrderItemController.getById);

// CUD routes - only accessible by Owner
purchaseOrderItemRouter.post(
  "/",
  authorize("owner"),
  createAuditLog("CREATE", "purchase_order_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
  }),
  purchaseOrderItemController.create
);
purchaseOrderItemRouter.put(
  "/:id",
  authorize("owner"),
  createAuditLog("UPDATE", "purchase_order_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
    getChanges: (req) => ({ purchaseOrderItem: req.body }),
  }),
  purchaseOrderItemController.update
);
// Note: The controller should store the complete purchase order item data before deletion in metadata.entityData
purchaseOrderItemRouter.delete(
  "/:id",
  authorize("owner"),
  createAuditLog("DELETE", "purchase_order_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
  }),
  purchaseOrderItemController.delete
);

export default purchaseOrderItemRouter;

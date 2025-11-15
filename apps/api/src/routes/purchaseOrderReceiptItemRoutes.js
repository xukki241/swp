import express from "express";

import { purchaseOrderReceiptItemController } from "../controllers/purchaseOrderReceiptItemController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const purchaseOrderReceiptItemRouter = express.Router();

// All routes require authentication
purchaseOrderReceiptItemRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
purchaseOrderReceiptItemRouter.get(
  "/",
  purchaseOrderReceiptItemController.getAll
);
purchaseOrderReceiptItemRouter.get(
  "/:id",
  purchaseOrderReceiptItemController.getById
);

// CUD routes - only accessible by Owner
purchaseOrderReceiptItemRouter.post(
  "/",
  authorize("owner"),
  createAuditLog("CREATE", "purchase_receipt_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
  }),
  purchaseOrderReceiptItemController.create
);
purchaseOrderReceiptItemRouter.put(
  "/:id",
  authorize("owner"),
  createAuditLog("UPDATE", "purchase_receipt_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
    getChanges: (req) => ({ purchaseOrderReceiptItem: req.body }),
  }),
  purchaseOrderReceiptItemController.update
);
// Note: The controller should store the complete purchase order receipt item data before deletion in metadata.entityData
purchaseOrderReceiptItemRouter.delete(
  "/:id",
  authorize("owner"),
  createAuditLog("DELETE", "purchase_receipt_item", {
    excludeFields: ["unitCost", "totalCost", "supplierCost"],
  }),
  purchaseOrderReceiptItemController.delete
);

export default purchaseOrderReceiptItemRouter;

import express from "express";

import { purchaseOrderReceiptItemController } from "../controllers/purchaseOrderReceiptItemController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { createAuditLog } from "../middleware/auditLog.js";

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
  createAuditLog("CREATE", "purchase_receipt_item"),
  purchaseOrderReceiptItemController.create
);
purchaseOrderReceiptItemRouter.put(
  "/:id",
  authorize("owner"),
  createAuditLog("UPDATE", "purchase_receipt_item", {
    getChanges: (req) => ({ purchaseOrderReceiptItem: req.body }),
  }),
  purchaseOrderReceiptItemController.update
);
purchaseOrderReceiptItemRouter.delete(
  "/:id",
  authorize("owner"),
  createAuditLog("DELETE", "purchase_receipt_item"),
  purchaseOrderReceiptItemController.delete
);

export default purchaseOrderReceiptItemRouter;

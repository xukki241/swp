import express from "express";

import { purchaseOrderController } from "../controllers/purchaseOrderController.js";
import { purchaseOrderItemController } from "../controllers/purchaseOrderItemController.js";
import { purchaseOrderReceiptController } from "../controllers/purchaseOrderReceiptController.js";
import { purchaseOrderReceiptItemController } from "../controllers/purchaseOrderReceiptItemController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

//
// ========= PURCHASE ORDER =========
//
router.get("/", purchaseOrderController.getAll);
router.get("/:id", purchaseOrderController.getById);
router.post("/", authorize("owner"), purchaseOrderController.create);
router.put("/:id", authorize("owner"), purchaseOrderController.update);
router.delete("/:id", authorize("owner"), purchaseOrderController.delete);

//
// ========= PURCHASE ORDER ITEMS (nested) =========
// /api/purchase-orders/:purchaseOrderId/items
//
router.get(
  "/:purchaseOrderId/items",
  purchaseOrderItemController.getAllByPurchaseOrder
);
router.get(
  "/:purchaseOrderId/items/:itemId",
  purchaseOrderItemController.getById
);
router.post(
  "/:purchaseOrderId/items",
  authorize("owner"),
  purchaseOrderItemController.create
);
router.put(
  "/:purchaseOrderId/items/:itemId",
  authorize("owner"),
  purchaseOrderItemController.update
);
router.delete(
  "/:purchaseOrderId/items/:itemId",
  authorize("owner"),
  purchaseOrderItemController.delete
);

//
// ========= PURCHASE ORDER RECEIPTS (nested) =========
// /api/purchase-orders/:purchaseOrderId/receipts
//
router.get(
  "/:purchaseOrderId/receipts",
  purchaseOrderReceiptController.getAllByPurchaseOrder
);
router.get(
  "/:purchaseOrderId/receipts/:receiptId",
  purchaseOrderReceiptController.getById
);
router.post(
  "/:purchaseOrderId/receipts",
  authorize("owner"),
  purchaseOrderReceiptController.create
);
router.put(
  "/:purchaseOrderId/receipts/:receiptId",
  authorize("owner"),
  purchaseOrderReceiptController.update
);
router.delete(
  "/:purchaseOrderId/receipts/:receiptId",
  authorize("owner"),
  purchaseOrderReceiptController.delete
);

//
// ========= RECEIPT ITEMS (nested under receipts) =========
// /api/purchase-orders/:purchaseOrderId/receipts/:receiptId/items
//
router.get(
  "/:purchaseOrderId/receipts/:receiptId/items",
  purchaseOrderReceiptItemController.getAllByReceipt
);
router.get(
  "/:purchaseOrderId/receipts/:receiptId/items/:itemId",
  purchaseOrderReceiptItemController.getById
);
router.post(
  "/:purchaseOrderId/receipts/:receiptId/items",
  authorize("owner"),
  purchaseOrderReceiptItemController.create
);
router.put(
  "/:purchaseOrderId/receipts/:receiptId/items/:itemId",
  authorize("owner"),
  purchaseOrderReceiptItemController.update
);
router.delete(
  "/:purchaseOrderId/receipts/:receiptId/items/:itemId",
  authorize("owner"),
  purchaseOrderReceiptItemController.delete
);

export default router;

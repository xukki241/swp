import express from "express";

import { purchaseOrderReceiptItemController } from "../controllers/purchaseOrderReceiptItemController.js";
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
  purchaseOrderReceiptItemController.create
);
purchaseOrderReceiptItemRouter.put(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptItemController.update
);
purchaseOrderReceiptItemRouter.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptItemController.delete
);

export default purchaseOrderReceiptItemRouter;

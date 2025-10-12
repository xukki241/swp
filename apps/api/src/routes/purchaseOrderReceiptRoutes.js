import express from "express";

import { purchaseOrderReceiptController } from "../controllers/purchaseOrderReceiptController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const purchaseOrderReceiptRouter = express.Router();

// All routes require authentication
purchaseOrderReceiptRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
purchaseOrderReceiptRouter.get("/", purchaseOrderReceiptController.getAll);
purchaseOrderReceiptRouter.get("/:id", purchaseOrderReceiptController.getById);

// CUD routes - only accessible by Owner
purchaseOrderReceiptRouter.post(
  "/",
  authorize("owner"),
  purchaseOrderReceiptController.create
);
purchaseOrderReceiptRouter.put(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptController.update
);
purchaseOrderReceiptRouter.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptController.delete
);

export default purchaseOrderReceiptRouter;

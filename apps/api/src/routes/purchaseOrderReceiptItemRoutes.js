import express from "express";

import { purchaseOrderReceiptItemController } from "../controllers/purchaseOrderReceiptItemController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", purchaseOrderReceiptItemController.getAll);
router.get("/:id", purchaseOrderReceiptItemController.getById);

// CUD routes - only accessible by Owner
router.post("/", authorize("owner"), purchaseOrderReceiptItemController.create);
router.put(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptItemController.update
);
router.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptItemController.delete
);

export default router;

import express from "express";

import { purchaseOrderReceiptController } from "../controllers/purchaseOrderReceiptController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", purchaseOrderReceiptController.getAll);
router.get("/:id", purchaseOrderReceiptController.getById);

// CUD routes - only accessible by Owner
router.post("/", authorize("owner"), purchaseOrderReceiptController.create);
router.put("/:id", authorize("owner"), purchaseOrderReceiptController.update);
router.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderReceiptController.delete
);

export default router;

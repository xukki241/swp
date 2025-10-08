import express from "express";

import { purchaseOrderItemController } from "../controllers/purchaseOrderItemController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", purchaseOrderItemController.getAll);
router.get("/:id", purchaseOrderItemController.getById);

// CUD routes - only accessible by Owner
router.post("/", authorize("owner"), purchaseOrderItemController.create);
router.put("/:id", authorize("owner"), purchaseOrderItemController.update);
router.delete("/:id", authorize("owner"), purchaseOrderItemController.delete);

export default router;

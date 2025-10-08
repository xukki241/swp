import express from "express";

import { purchaseOrderController } from "../controllers/purchaseOrderController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", purchaseOrderController.getAll);
router.get("/:id", purchaseOrderController.getById);

// CUD routes - only accessible by Owner
router.post("/", authorize("owner"), purchaseOrderController.create);
router.put("/:id", authorize("owner"), purchaseOrderController.update);
router.delete("/:id", authorize("owner"), purchaseOrderController.delete);

export default router;

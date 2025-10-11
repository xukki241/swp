import { updateInventorySchema } from "@pharmaflow/dto";
import express from "express";

import { inventoryController } from "../controllers/inventoryController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", inventoryController.getAll);
router.get("/summary/by-variant", inventoryController.getSummaryByVariant);
router.get("/expiring", inventoryController.getExpiring);
router.get("/low-stock", inventoryController.getLowStock);
router.get("/:id", inventoryController.getById);

// Update routes - only accessible by Owner
router.patch(
  "/:id",
  authorize("owner"),
  validateBody(updateInventorySchema),
  inventoryController.update
);

export default router;

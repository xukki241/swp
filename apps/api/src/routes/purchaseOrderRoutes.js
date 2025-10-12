import express from "express";

import { purchaseOrderController } from "../controllers/purchaseOrderController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const purchaseOrderRouter = express.Router();

// All routes require authentication
purchaseOrderRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
purchaseOrderRouter.get("/", purchaseOrderController.getAll);
purchaseOrderRouter.get("/:id", purchaseOrderController.getById);

// CUD routes - only accessible by Owner
purchaseOrderRouter.post(
  "/",
  authorize("owner"),
  purchaseOrderController.create
);
purchaseOrderRouter.put(
  "/:id",
  authorize("owner"),
  purchaseOrderController.update
);
purchaseOrderRouter.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderController.delete
);

export default purchaseOrderRouter;

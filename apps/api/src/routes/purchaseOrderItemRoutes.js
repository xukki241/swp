import express from "express";

import { purchaseOrderItemController } from "../controllers/purchaseOrderItemController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const purchaseOrderItemRouter = express.Router();

// All routes require authentication
purchaseOrderItemRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
purchaseOrderItemRouter.get("/", purchaseOrderItemController.getAll);
purchaseOrderItemRouter.get("/:id", purchaseOrderItemController.getById);

// CUD routes - only accessible by Owner
purchaseOrderItemRouter.post(
  "/",
  authorize("owner"),
  purchaseOrderItemController.create
);
purchaseOrderItemRouter.put(
  "/:id",
  authorize("owner"),
  purchaseOrderItemController.update
);
purchaseOrderItemRouter.delete(
  "/:id",
  authorize("owner"),
  purchaseOrderItemController.delete
);

export default purchaseOrderItemRouter;

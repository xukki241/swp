import { updateInventorySchema } from "@pharmaflow/dto";
import express from "express";

import { inventoryController } from "../controllers/inventoryController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody } from "../middleware/validate.js";

export const inventoryRouter = express.Router();

// All routes require authentication
inventoryRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
inventoryRouter.get("/", inventoryController.getAll);
inventoryRouter.get(
  "/summary/by-variant",
  inventoryController.getSummaryByVariant
);
inventoryRouter.get("/expiring", inventoryController.getExpiring);
inventoryRouter.get("/low-stock", inventoryController.getLowStock);
inventoryRouter.get("/:id", inventoryController.getById);

// Update routes - only accessible by Owner
inventoryRouter.patch(
  "/:id",
  authorize("owner"),
  validateBody(updateInventorySchema),
  inventoryController.update
);

export default inventoryRouter;

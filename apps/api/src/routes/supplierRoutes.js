import express from "express";

import { supplierController } from "../controllers/supplierController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

export const supplierRouter = express.Router();

// All routes require authentication
supplierRouter.use(authenticate);

// GET routes - accessible by both Owner and Staff
supplierRouter.get("/", supplierController.getAll);
supplierRouter.get("/:id", supplierController.getById);

// CUD routes - only accessible by Owner
supplierRouter.post("/", authorize("owner"), supplierController.create);
supplierRouter.put("/:id", authorize("owner"), supplierController.update);
supplierRouter.delete("/:id", authorize("owner"), supplierController.delete);

export default supplierRouter;

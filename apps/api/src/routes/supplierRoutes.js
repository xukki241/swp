import express from "express";

import { supplierController } from "../controllers/supplierController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// GET routes - accessible by both Owner and Staff
router.get("/", supplierController.getAll);
router.get("/:id", supplierController.getById);

// CUD routes - only accessible by Owner
router.post("/", authorize("owner"), supplierController.create);
router.put("/:id", authorize("owner"), supplierController.update);
router.delete("/:id", authorize("owner"), supplierController.delete);

export default router;

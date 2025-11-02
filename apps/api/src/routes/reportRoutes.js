import {
  createReportRequestSchema,
  listReportsQuerySchema,
} from "@pharmaflow/dto";
import express from "express";

import { reportController } from "../controllers/reportController.js";
import { createAuditLog } from "../middleware/auditLog.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import { validateBody, validateQuery } from "../middleware/validate.js";

export const reportRouter = express.Router();

// All routes require authentication and owner role
reportRouter.use(authenticate);
reportRouter.use(authorize("owner"));

// POST /api/reports - Create/generate a new report
reportRouter.post(
  "/",
  validateBody(createReportRequestSchema),
  createAuditLog("EXPORT", "report"),
  reportController.create
);

// GET /api/reports - Get all reports
reportRouter.get(
  "/",
  validateQuery(listReportsQuerySchema),
  reportController.getAll
);

// GET /api/reports/daily - Generate daily sales report
reportRouter.get("/daily", reportController.generateDaily);

// GET /api/reports/weekly - Generate weekly sales report
reportRouter.get("/weekly", reportController.generateWeekly);

// GET /api/reports/monthly - Generate monthly sales report
reportRouter.get("/monthly", reportController.generateMonthly);

// GET /api/reports/:id - Get report by ID
reportRouter.get("/:id", reportController.getById);

// DELETE /api/reports/:id - Delete a report
reportRouter.delete(
  "/:id",
  authorize("owner"),
  createAuditLog("DELETE", "report"),
  reportController.delete
);

export default reportRouter;

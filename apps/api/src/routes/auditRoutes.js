import express from "express";

import { auditController } from "../controllers/auditController.js";
import { authenticate } from "../middleware/checkAuth.js";

const auditRouter = express.Router();

/**
 * All audit routes require authentication
 * Most routes should be restricted to admin users only
 */

auditRouter.use(authenticate);

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private (Admin only recommended)
 */
auditRouter.get("/", auditController.getAll);

/**
 * @route   GET /api/audit-logs/statistics
 * @desc    Get audit statistics
 * @access  Private (Admin only recommended)
 */
auditRouter.get("/statistics", auditController.getStatistics);

/**
 * @route   GET /api/audit-logs/entity/:entity/:entityId
 * @desc    Get audit logs for a specific entity
 * @access  Private
 */
auditRouter.get("/entity/:entity/:entityId", auditController.getByEntity);

/**
 * @route   GET /api/audit-logs/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Private (Users can view their own logs, admin can view all)
 */
auditRouter.get("/user/:userId", auditController.getByUser);

/**
 * @route   DELETE /api/audit-logs/cleanup
 * @desc    Delete old audit logs
 * @access  Private (Admin only)
 */
auditRouter.delete("/cleanup", auditController.cleanup);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get audit log by ID
 * @access  Private
 */
auditRouter.get("/:id", auditController.getById);

export default auditRouter;

import express from "express";

import { auditController } from "../controllers/auditController.js";
import { checkAuth } from "../middleware/checkAuth.js";

const router = express.Router();

/**
 * All audit routes require authentication
 * Most routes should be restricted to admin users only
 */

/**
 * @route   GET /api/audit-logs
 * @desc    Get all audit logs with filtering and pagination
 * @access  Private (Admin only recommended)
 */
router.get("/", checkAuth, auditController.getAll);

/**
 * @route   GET /api/audit-logs/statistics
 * @desc    Get audit statistics
 * @access  Private (Admin only recommended)
 */
router.get("/statistics", checkAuth, auditController.getStatistics);

/**
 * @route   GET /api/audit-logs/entity/:entity/:entityId
 * @desc    Get audit logs for a specific entity
 * @access  Private
 */
router.get("/entity/:entity/:entityId", checkAuth, auditController.getByEntity);

/**
 * @route   GET /api/audit-logs/user/:userId
 * @desc    Get audit logs for a specific user
 * @access  Private (Users can view their own logs, admin can view all)
 */
router.get("/user/:userId", checkAuth, auditController.getByUser);

/**
 * @route   DELETE /api/audit-logs/cleanup
 * @desc    Delete old audit logs
 * @access  Private (Admin only)
 */
router.delete("/cleanup", checkAuth, auditController.cleanup);

/**
 * @route   GET /api/audit-logs/:id
 * @desc    Get audit log by ID
 * @access  Private
 */
router.get("/:id", checkAuth, auditController.getById);

export default router;

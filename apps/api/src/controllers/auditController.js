import asyncHandler from "express-async-handler";

import { auditService } from "../services/auditService.js";
import logger from "../utils/logger.js";

/**
 * Audit Log Controller
 * Handles viewing and querying audit logs
 */
export const auditController = {
  /**
   * Get all audit logs with filtering and pagination
   * GET /api/audit-logs
   */
  getAll: asyncHandler(async (req, res) => {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = req.query;

    const filters = {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
    };

    const result = await auditService.getAll(filters);

    logger.info(`Retrieved ${result.data.length} audit logs`, {
      filters,
      userId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully",
      data: result.data,
      pagination: result.pagination,
    });
  }),

  /**
   * Get audit log by ID
   * GET /api/audit-logs/:id
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const auditLog = await auditService.getById(id);

    if (!auditLog) {
      return res.status(404).json({
        success: false,
        message: "Audit log not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Audit log retrieved successfully",
      data: auditLog,
    });
  }),

  /**
   * Get audit logs for a specific entity
   * GET /api/audit-logs/entity/:entity/:entityId
   */
  getByEntity: asyncHandler(async (req, res) => {
    const { entity, entityId } = req.params;

    const logs = await auditService.getByEntity(entity, entityId);

    logger.info(
      `Retrieved ${logs.length} audit logs for ${entity} ${entityId}`,
      {
        requestedBy: req.user?.id,
      }
    );

    res.status(200).json({
      success: true,
      message: "Entity audit logs retrieved successfully",
      data: logs,
    });
  }),

  /**
   * Get audit logs for a specific user
   * GET /api/audit-logs/user/:userId
   */
  getByUser: asyncHandler(async (req, res) => {
    const { userId } = req.params;
    const { limit = 100 } = req.query;

    const logs = await auditService.getByUser(userId, {
      limit: parseInt(limit, 10),
    });

    logger.info(`Retrieved ${logs.length} audit logs for user ${userId}`, {
      requestedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: "User audit logs retrieved successfully",
      data: logs,
    });
  }),

  /**
   * Get audit statistics
   * GET /api/audit-logs/statistics
   */
  getStatistics: asyncHandler(async (req, res) => {
    const { startDate, endDate } = req.query;

    const stats = await auditService.getStatistics({
      startDate,
      endDate,
    });

    logger.info("Retrieved audit statistics", {
      requestedBy: req.user?.id,
      filters: { startDate, endDate },
    });

    res.status(200).json({
      success: true,
      message: "Audit statistics retrieved successfully",
      data: stats,
    });
  }),

  /**
   * Delete old audit logs (admin only)
   * DELETE /api/audit-logs/cleanup
   */
  cleanup: asyncHandler(async (req, res) => {
    const { daysToKeep = 90 } = req.query;

    const deletedCount = await auditService.deleteOldLogs(
      parseInt(daysToKeep, 10)
    );

    logger.info(`Cleaned up ${deletedCount} old audit logs`, {
      daysToKeep,
      performedBy: req.user?.id,
    });

    res.status(200).json({
      success: true,
      message: `Successfully deleted ${deletedCount} old audit logs`,
      data: {
        deletedCount,
        daysKept: parseInt(daysToKeep, 10),
      },
    });
  }),
};

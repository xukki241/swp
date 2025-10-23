import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { auditLogs } from "../db/schema/index.js";
import logger from "../utils/logger.js";

/**
 * Audit Service
 * Manages audit log creation and retrieval for tracking user actions
 */
export const auditService = {
  /**
   * Create an audit log entry
   * @param {Object} auditData - Audit log data
   * @param {string} auditData.userId - ID of the user performing the action
   * @param {string} auditData.action - Action performed (e.g., 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT')
   * @param {string} auditData.entity - Entity type affected (e.g., 'user', 'medication', 'sale')
   * @param {string} [auditData.entityId] - ID of the affected entity
   * @param {Object} [auditData.changes] - Details of what changed (before/after values)
   * @returns {Promise<Object>} Created audit log entry
   */
  async log(auditData) {
    try {
      const [auditLog] = await db
        .insert(auditLogs)
        .values({
          userId: auditData.userId || null,
          action: auditData.action,
          entity: auditData.entity,
          entityId: auditData.entityId || null,
          changes: auditData.changes || null,
        })
        .returning();

      logger.info(
        `Audit log created: ${auditData.action} on ${auditData.entity}`,
        {
          userId: auditData.userId,
          entityId: auditData.entityId,
        }
      );

      return auditLog;
    } catch (error) {
      logger.error("Failed to create audit log:", error);
      // Don't throw error to prevent audit logging from breaking the main operation
      return null;
    }
  },

  /**
   * Get all audit logs with filtering and pagination
   * @param {Object} filters - Filter options
   * @param {string} [filters.userId] - Filter by user ID
   * @param {string} [filters.action] - Filter by action type
   * @param {string} [filters.entity] - Filter by entity type
   * @param {string} [filters.entityId] - Filter by entity ID
   * @param {string} [filters.startDate] - Filter by start date
   * @param {string} [filters.endDate] - Filter by end date
   * @param {number} [filters.page=1] - Page number
   * @param {number} [filters.limit=50] - Items per page
   * @returns {Promise<Object>} Paginated audit logs
   */
  async getAll(filters = {}) {
    const {
      userId,
      action,
      entity,
      entityId,
      startDate,
      endDate,
      page = 1,
      limit = 50,
    } = filters;

    const offset = (page - 1) * limit;
    const conditions = [];

    if (userId) {
      conditions.push(eq(auditLogs.userId, userId));
    }

    if (action) {
      conditions.push(eq(auditLogs.action, action));
    }

    if (entity) {
      conditions.push(eq(auditLogs.entity, entity));
    }

    if (entityId) {
      conditions.push(eq(auditLogs.entityId, entityId));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get total count
    const [{ count }] = await db
      .select({ count: sql`count(*)::int` })
      .from(auditLogs)
      .where(whereClause);

    // Get paginated results with user information
    const logs = await db.query.auditLogs.findMany({
      where: whereClause,
      orderBy: [desc(auditLogs.createdAt)],
      limit,
      offset,
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return {
      data: logs,
      pagination: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  },

  /**
   * Get audit log by ID
   * @param {string} id - Audit log ID
   * @returns {Promise<Object|null>} Audit log entry
   */
  async getById(id) {
    const log = await db.query.auditLogs.findFirst({
      where: eq(auditLogs.id, id),
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return log || null;
  },

  /**
   * Get audit logs for a specific entity
   * @param {string} entity - Entity type
   * @param {string} entityId - Entity ID
   * @returns {Promise<Array>} Audit logs for the entity
   */
  async getByEntity(entity, entityId) {
    const logs = await db.query.auditLogs.findMany({
      where: and(
        eq(auditLogs.entity, entity),
        eq(auditLogs.entityId, entityId)
      ),
      orderBy: [desc(auditLogs.createdAt)],
      with: {
        user: {
          columns: {
            id: true,
            username: true,
            email: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    return logs;
  },

  /**
   * Get audit logs for a specific user
   * @param {string} userId - User ID
   * @param {Object} options - Additional options
   * @param {number} [options.limit=100] - Limit number of results
   * @returns {Promise<Array>} Audit logs for the user
   */
  async getByUser(userId, options = {}) {
    const { limit = 100 } = options;

    const logs = await db.query.auditLogs.findMany({
      where: eq(auditLogs.userId, userId),
      orderBy: [desc(auditLogs.createdAt)],
      limit,
    });

    return logs;
  },

  /**
   * Get audit statistics
   * @param {Object} filters - Filter options
   * @param {string} [filters.startDate] - Start date for statistics
   * @param {string} [filters.endDate] - End date for statistics
   * @returns {Promise<Object>} Audit statistics
   */
  async getStatistics(filters = {}) {
    const { startDate, endDate } = filters;
    const conditions = [];

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get action count statistics
    const actionStats = await db
      .select({
        action: auditLogs.action,
        count: sql`count(*)::int`,
      })
      .from(auditLogs)
      .where(whereClause)
      .groupBy(auditLogs.action);

    // Get entity count statistics
    const entityStats = await db
      .select({
        entity: auditLogs.entity,
        count: sql`count(*)::int`,
      })
      .from(auditLogs)
      .where(whereClause)
      .groupBy(auditLogs.entity);

    // Get total count
    const [{ total }] = await db
      .select({ total: sql`count(*)::int` })
      .from(auditLogs)
      .where(whereClause);

    return {
      total,
      byAction: actionStats,
      byEntity: entityStats,
    };
  },

  /**
   * Delete old audit logs (for maintenance)
   * @param {number} daysToKeep - Number of days of logs to keep
   * @returns {Promise<number>} Number of deleted logs
   */
  async deleteOldLogs(daysToKeep = 90) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await db
      .delete(auditLogs)
      .where(lte(auditLogs.createdAt, cutoffDate))
      .returning({ id: auditLogs.id });

    logger.info(
      `Deleted ${result.length} audit logs older than ${daysToKeep} days`
    );

    return result.length;
  },
};

import { auditService } from "../services/auditService.js";
import logger from "../utils/logger.js";

/**
 * Middleware to automatically log actions
 * This can be attached to routes to automatically create audit logs
 *
 * @param {string} action - Action being performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} entity - Entity type (e.g., 'user', 'medication', 'sale')
 * @param {Object} options - Additional options
 * @param {Function} [options.getEntityId] - Function to extract entity ID from req/res
 * @param {Function} [options.getChanges] - Function to extract changes from req/res
 * @returns {Function} Express middleware function
 */
export const createAuditLog = (action, entity, options = {}) => {
  return async (req, res, next) => {
    // Store original send function
    const originalSend = res.send;

    // Override send to capture response data
    res.send = function (data) {
      // Restore original send function
      res.send = originalSend;

      // Only log on successful operations (2xx status codes)
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Run audit logging asynchronously to not block response
        setImmediate(async () => {
          try {
            const userId = req.user?.id || null;
            let entityId = null;
            let changes = null;

            // Extract entity ID if function provided
            if (options.getEntityId) {
              entityId = options.getEntityId(req, res, data);
            } else if (req.params?.id) {
              entityId = req.params.id;
            } else if (typeof data === "string") {
              try {
                const parsedData = JSON.parse(data);
                entityId = parsedData?.data?.id || null;
              } catch {
                // Not JSON, ignore
              }
            }

            // Extract changes if function provided
            if (options.getChanges) {
              changes = options.getChanges(req, res, data);
            } else if (action === "UPDATE" && req.body) {
              changes = {
                updated: req.body,
              };
            } else if (action === "CREATE" && typeof data === "string") {
              try {
                const parsedData = JSON.parse(data);
                changes = {
                  created: parsedData?.data || null,
                };
              } catch {
                // Not JSON, ignore
              }
            }

            await auditService.log({
              userId,
              action,
              entity,
              entityId,
              changes,
            });
          } catch (error) {
            logger.error("Failed to create audit log in middleware:", error);
          }
        });
      }

      // Send the response
      return originalSend.call(this, data);
    };

    next();
  };
};

/**
 * Helper to create audit log for login
 */
export const auditLogin = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          let userId = req.user?.id;

          // Try to extract user ID from response if not in req
          if (!userId && typeof data === "string") {
            try {
              const parsedData = JSON.parse(data);
              userId = parsedData?.data?.user?.id || null;
            } catch {
              // Not JSON, ignore
            }
          }

          await auditService.log({
            userId,
            action: "LOGIN",
            entity: "auth",
            changes: {
              ip: req.ip,
              userAgent: req.get("user-agent"),
            },
          });
        } catch (error) {
          logger.error("Failed to create login audit log:", error);
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Helper to create audit log for logout
 */
export const auditLogout = async (req, res, next) => {
  const userId = req.user?.id || null;

  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          await auditService.log({
            userId,
            action: "LOGOUT",
            entity: "auth",
            changes: {
              ip: req.ip,
            },
          });
        } catch (error) {
          logger.error("Failed to create logout audit log:", error);
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Helper to create audit log for password changes
 */
export const auditPasswordChange = async (req, res, next) => {
  const originalSend = res.send;

  res.send = function (data) {
    res.send = originalSend;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          const userId = req.user?.id || req.body?.userId || null;

          await auditService.log({
            userId,
            action: "PASSWORD_CHANGE",
            entity: "auth",
            changes: {
              ip: req.ip,
            },
          });
        } catch (error) {
          logger.error("Failed to create password change audit log:", error);
        }
      });
    }

    return originalSend.call(this, data);
  };

  next();
};

/**
 * Manual audit logging helper (for use in controllers/services)
 */
export const logAudit = async (auditData) => {
  try {
    return await auditService.log(auditData);
  } catch (error) {
    logger.error("Failed to create manual audit log:", error);
    return null;
  }
};

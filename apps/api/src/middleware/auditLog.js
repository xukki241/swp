import { auditService } from "../services/auditService.js";
import logger from "../utils/logger.js";

/**
 * Enhanced middleware to automatically log actions with better error handling and performance
 * This can be attached to routes to automatically create audit logs
 *
 * @param {string} action - Action being performed (e.g., 'CREATE', 'UPDATE', 'DELETE')
 * @param {string} entity - Entity type (e.g., 'user', 'medication', 'sale')
 * @param {Object} options - Additional options
 * @param {Function} [options.getEntityId] - Function to extract entity ID from req/res
 * @param {Function} [options.getChanges] - Function to extract changes from req/res
 * @param {boolean} [options.skipOnError=false] - Skip logging if response is an error
 * @param {Function} [options.shouldLog] - Custom function to determine if logging should occur
 * @param {Array<string>} [options.excludeFields] - Fields to exclude from changes logging
 * @returns {Function} Express middleware function
 */
export const createAuditLog = (action, entity, options = {}) => {
  return async (req, res, next) => {
    // Store original methods
    const originalSend = res.send;
    const originalJson = res.json;
    let isLogged = false;

    // Helper function to perform audit logging
    const performAuditLog = async (data) => {
      // Prevent duplicate logging
      if (isLogged) {
        return;
      }
      isLogged = true;

      // Only log on successful operations (2xx status codes) unless skipOnError is false
      const shouldLog =
        res.statusCode >= 200 && res.statusCode < 300 && !options.skipOnError;

      if (!shouldLog) {
        return;
      }

      // Custom shouldLog function
      if (options.shouldLog && !options.shouldLog(req, res, data)) {
        return;
      }

      // Run audit logging asynchronously to not block response
      setImmediate(async () => {
        try {
          const userId = req.user?.id || null;
          let entityId = null;
          let changes = null;

          // Extract entity ID
          if (options.getEntityId) {
            entityId = await options.getEntityId(req, res, data);
          } else if (req.params?.id) {
            entityId = req.params.id;
          } else {
            // Try to extract from response data
            const parsedData = parseResponseData(data);
            entityId = parsedData?.data?.id || parsedData?.id || null;
          }

          // Extract changes
          if (options.getChanges) {
            changes = await options.getChanges(req, res, data);
          } else {
            changes = extractChanges(action, req, data, options.excludeFields);
          }

          // Additional metadata
          const metadata = {
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get("user-agent"),
            method: req.method,
            path: req.originalUrl || req.url,
          };

          await auditService.log({
            userId,
            action,
            entity,
            entityId,
            changes: {
              ...changes,
              metadata,
            },
          });
        } catch (error) {
          logger.error("Failed to create audit log in middleware:", {
            error: error.message,
            action,
            entity,
            userId: req.user?.id,
          });
        }
      });
    };

    // Override res.send
    res.send = function (data) {
      performAuditLog(data);
      return originalSend.call(this, data);
    };

    // Override res.json
    res.json = function (data) {
      performAuditLog(data);
      return originalJson.call(this, data);
    };

    next();
  };
};

/**
 * Parse response data safely
 */
const parseResponseData = (data) => {
  if (!data) {
    return null;
  }

  if (typeof data === "object") {
    return data;
  }

  if (typeof data === "string") {
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  return null;
};

/**
 * Extract changes based on action type
 */
const extractChanges = (action, req, responseData, excludeFields = []) => {
  const changes = {};
  const parsedData = parseResponseData(responseData);

  // Filter sensitive fields
  const filterSensitiveData = (obj) => {
    if (!obj || typeof obj !== "object") {
      return obj;
    }

    const filtered = { ...obj };
    const sensitiveFields = [
      "password",
      "passwordHash",
      "token",
      "refreshToken",
      "secret",
      "apiKey",
      ...excludeFields,
    ];

    sensitiveFields.forEach((field) => {
      if (filtered[field]) {
        filtered[field] = "[REDACTED]";
      }
    });

    return filtered;
  };

  switch (action) {
    case "CREATE":
      if (parsedData?.data) {
        changes.created = filterSensitiveData(parsedData.data);
      } else if (req.body) {
        changes.input = filterSensitiveData(req.body);
      }
      break;

    case "UPDATE":
      if (req.body) {
        changes.updates = filterSensitiveData(req.body);
      }
      // Store old values if available
      if (req.oldValues) {
        changes.before = filterSensitiveData(req.oldValues);
      }
      if (parsedData?.data) {
        changes.after = filterSensitiveData(parsedData.data);
      }
      break;

    case "DELETE":
      if (req.params) {
        changes.deletedId = req.params.id;
      }
      // Store deleted entity data if available
      if (req.deletedEntity) {
        changes.deletedEntity = filterSensitiveData(req.deletedEntity);
      }
      break;

    case "EXPORT":
      changes.exportType = req.query?.type || "unknown";
      changes.filters = req.query || {};
      break;

    case "IMPORT":
      changes.itemCount = req.importedCount || 0;
      changes.source = req.body?.source || "unknown";
      break;

    default:
      if (req.body && Object.keys(req.body).length > 0) {
        changes.data = filterSensitiveData(req.body);
      }
      break;
  }

  return Object.keys(changes).length > 0 ? changes : null;
};

/**
 * Enhanced helper to create audit log for login with better tracking
 */
export const auditLogin = async (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  let isLogged = false;

  const performAuditLog = async (data) => {
    if (isLogged) {
      return;
    }
    isLogged = true;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          let userId = req.user?.id;
          let userEmail = req.body?.email || req.body?.username;

          // Try to extract user ID from response if not in req
          if (!userId) {
            const parsedData = parseResponseData(data);
            userId = parsedData?.data?.user?.id || parsedData?.user?.id || null;
            userEmail =
              parsedData?.data?.user?.email ||
              parsedData?.user?.email ||
              userEmail;
          }

          await auditService.log({
            userId,
            action: "LOGIN",
            entity: "auth",
            changes: {
              email: userEmail,
              ip: req.ip || req.connection?.remoteAddress,
              userAgent: req.get("user-agent"),
              timestamp: new Date().toISOString(),
              success: true,
            },
          });

          logger.info("Login audit log created", { userId, email: userEmail });
        } catch (error) {
          logger.error("Failed to create login audit log:", {
            error: error.message,
            email: req.body?.email,
          });
        }
      });
    } else {
      // Log failed login attempts
      setImmediate(async () => {
        try {
          await auditService.log({
            userId: null,
            action: "LOGIN",
            entity: "auth",
            changes: {
              email: req.body?.email || req.body?.username,
              ip: req.ip || req.connection?.remoteAddress,
              userAgent: req.get("user-agent"),
              timestamp: new Date().toISOString(),
              success: false,
              statusCode: res.statusCode,
            },
          });

          logger.warn("Failed login attempt logged", {
            email: req.body?.email,
          });
        } catch (error) {
          logger.error("Failed to create failed login audit log:", {
            error: error.message,
          });
        }
      });
    }
  };

  res.send = function (data) {
    performAuditLog(data);
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    performAuditLog(data);
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Enhanced helper to create audit log for logout
 */
export const auditLogout = async (req, res, next) => {
  const userId = req.user?.id || null;
  const originalSend = res.send;
  const originalJson = res.json;
  let isLogged = false;

  const performAuditLog = async () => {
    if (isLogged) {
      return;
    }
    isLogged = true;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          await auditService.log({
            userId,
            action: "LOGOUT",
            entity: "auth",
            changes: {
              ip: req.ip || req.connection?.remoteAddress,
              userAgent: req.get("user-agent"),
              timestamp: new Date().toISOString(),
            },
          });

          logger.info("Logout audit log created", { userId });
        } catch (error) {
          logger.error("Failed to create logout audit log:", {
            error: error.message,
            userId,
          });
        }
      });
    }
  };

  res.send = function (data) {
    performAuditLog();
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    performAuditLog();
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Enhanced helper to create audit log for password changes
 */
export const auditPasswordChange = async (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  let isLogged = false;

  const performAuditLog = async (_data) => {
    if (isLogged) {
      return;
    }
    isLogged = true;

    setImmediate(async () => {
      try {
        const userId = req.user?.id || req.body?.userId || null;
        const success = res.statusCode >= 200 && res.statusCode < 300;

        await auditService.log({
          userId,
          action: "PASSWORD_CHANGE",
          entity: "auth",
          changes: {
            ip: req.ip || req.connection?.remoteAddress,
            userAgent: req.get("user-agent"),
            timestamp: new Date().toISOString(),
            success,
            method: req.body?.resetToken ? "reset" : "change",
          },
        });

        logger.info("Password change audit log created", { userId, success });
      } catch (error) {
        logger.error("Failed to create password change audit log:", {
          error: error.message,
          userId: req.user?.id,
        });
      }
    });
  };

  res.send = function (data) {
    performAuditLog(data);
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    performAuditLog(data);
    return originalJson.call(this, data);
  };

  next();
};

/**
 * Helper to create audit log for password reset
 */
export const auditPasswordReset = async (req, res, next) => {
  const originalSend = res.send;
  const originalJson = res.json;
  let isLogged = false;

  const performAuditLog = async () => {
    if (isLogged) {
      return;
    }
    isLogged = true;

    if (res.statusCode >= 200 && res.statusCode < 300) {
      setImmediate(async () => {
        try {
          await auditService.log({
            userId: null, // User not authenticated yet
            action: "PASSWORD_RESET",
            entity: "auth",
            changes: {
              email: req.body?.email,
              ip: req.ip || req.connection?.remoteAddress,
              userAgent: req.get("user-agent"),
              timestamp: new Date().toISOString(),
            },
          });

          logger.info("Password reset audit log created", {
            email: req.body?.email,
          });
        } catch (error) {
          logger.error("Failed to create password reset audit log:", {
            error: error.message,
          });
        }
      });
    }
  };

  res.send = function (data) {
    performAuditLog();
    return originalSend.call(this, data);
  };

  res.json = function (data) {
    performAuditLog();
    return originalJson.call(this, data);
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
    logger.error("Failed to create manual audit log:", {
      error: error.message,
      action: auditData?.action,
      entity: auditData?.entity,
    });
    return null;
  }
};

/**
 * Batch audit logging for multiple operations
 */
export const logAuditBatch = async (auditDataArray) => {
  try {
    const promises = auditDataArray.map((auditData) =>
      auditService.log(auditData).catch((error) => {
        logger.error("Failed to create batch audit log:", {
          error: error.message,
          action: auditData?.action,
          entity: auditData?.entity,
        });
        return null;
      })
    );

    const results = await Promise.allSettled(promises);
    const successful = results.filter((r) => r.status === "fulfilled").length;

    logger.info(
      `Batch audit logging completed: ${successful}/${auditDataArray.length} successful`
    );

    return results;
  } catch (error) {
    logger.error("Failed to create batch audit logs:", {
      error: error.message,
    });
    return [];
  }
};

import { instance } from "@/lib/axios";

/**
 * Audit Log API Services
 */

// Get all audit logs with filtering and pagination
export const getAuditLogs = async (filters = {}) => {
  const params = new URLSearchParams();

  if (filters.userId) {
    params.append("userId", filters.userId);
  }
  if (filters.action) {
    params.append("action", filters.action);
  }
  if (filters.entity) {
    params.append("entity", filters.entity);
  }
  if (filters.entityId) {
    params.append("entityId", filters.entityId);
  }
  if (filters.startDate) {
    params.append("startDate", filters.startDate);
  }
  if (filters.endDate) {
    params.append("endDate", filters.endDate);
  }
  if (filters.page) {
    params.append("page", filters.page);
  }
  if (filters.limit) {
    params.append("limit", filters.limit);
  }

  const response = await instance.get(`/audit-logs?${params.toString()}`);
  return response.data;
};

// Get audit log by ID
export const getAuditLogById = async (id) => {
  const response = await instance.get(`/audit-logs/${id}`);
  return response.data;
};

// Get audit logs for a specific entity
export const getAuditLogsByEntity = async (entity, entityId) => {
  const response = await instance.get(
    `/audit-logs/entity/${entity}/${entityId}`
  );
  return response.data;
};

// Get audit logs for a specific user
export const getAuditLogsByUser = async (userId, limit = 100) => {
  const response = await instance.get(
    `/audit-logs/user/${userId}?limit=${limit}`
  );
  return response.data;
};

// Get audit statistics
export const getAuditStatistics = async (startDate, endDate) => {
  const params = new URLSearchParams();
  if (startDate) {
    params.append("startDate", startDate);
  }
  if (endDate) {
    params.append("endDate", endDate);
  }

  const response = await instance.get(
    `/audit-logs/statistics?${params.toString()}`
  );
  return response.data;
};

// Cleanup old audit logs (admin only)
export const cleanupAuditLogs = async (daysToKeep = 90) => {
  const response = await instance.delete(
    `/audit-logs/cleanup?daysToKeep=${daysToKeep}`
  );
  return response.data;
};

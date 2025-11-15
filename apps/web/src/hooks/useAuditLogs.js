import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cleanupAuditLogs,
  getAuditLogById,
  getAuditLogs,
  getAuditLogsByEntity,
  getAuditLogsByUser,
  getAuditStatistics,
} from "@/services/auditService";

/**
 * Hook to fetch audit logs with filtering
 */
export const useAuditLogs = (filters = {}) => {
  // Convert "all" to empty string for API
  const apiFilters = Object.keys(filters).reduce((acc, key) => {
    const value = filters[key];
    acc[key] = value === "all" ? "" : value;
    return acc;
  }, {});

  return useQuery({
    queryKey: ["auditLogs", filters],
    queryFn: () => getAuditLogs(apiFilters),
    keepPreviousData: true,
  });
};

/**
 * Hook to fetch a single audit log by ID
 */
export const useAuditLog = (id) => {
  return useQuery({
    queryKey: ["auditLog", id],
    queryFn: () => getAuditLogById(id),
    enabled: !!id,
  });
};

/**
 * Hook to fetch audit logs for a specific entity
 */
export const useAuditLogsByEntity = (entity, entityId) => {
  return useQuery({
    queryKey: ["auditLogs", "entity", entity, entityId],
    queryFn: () => getAuditLogsByEntity(entity, entityId),
    enabled: !!(entity && entityId),
  });
};

/**
 * Hook to fetch audit logs for a specific user
 */
export const useAuditLogsByUser = (userId, limit = 100) => {
  return useQuery({
    queryKey: ["auditLogs", "user", userId, limit],
    queryFn: () => getAuditLogsByUser(userId, limit),
    enabled: !!userId,
  });
};

/**
 * Hook to fetch audit statistics
 */
export const useAuditStatistics = (startDate, endDate) => {
  return useQuery({
    queryKey: ["auditStatistics", startDate, endDate],
    queryFn: () => getAuditStatistics(startDate, endDate),
  });
};

/**
 * Hook to cleanup old audit logs
 */
export const useCleanupAuditLogs = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cleanupAuditLogs,
    onSuccess: () => {
      // Invalidate audit logs queries
      queryClient.invalidateQueries(["auditLogs"]);
      queryClient.invalidateQueries(["auditStatistics"]);
    },
  });
};

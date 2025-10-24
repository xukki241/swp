import { z } from "zod";

import {
  jsonSchema,
  successListResponseSchema,
  successResponseSchema,
  timestampSchema,
  uuidSchema,
} from "../common/index.js";

// Audit log action enum
export const auditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "LOGIN",
  "LOGOUT",
  "PASSWORD_CHANGE",
  "PASSWORD_RESET",
  "VIEW",
  "EXPORT",
  "IMPORT",
]);

// Audit log entity enum
export const auditEntitySchema = z.enum([
  "auth",
  "user",
  "customer",
  "medication",
  "medication_variant",
  "supplier",
  "supplier_medication",
  "purchase_order",
  "purchase_receipt",
  "inventory",
  "sale",
  "warehouse_zone",
  "warehouse_rack",
  "warehouse_bin",
  "report",
  "file",
]);

// Base audit log data schema
export const auditLogSchema = z.object({
  id: uuidSchema,
  userId: uuidSchema.nullable(),
  action: auditActionSchema,
  entity: auditEntitySchema,
  entityId: uuidSchema.nullable(),
  changes: jsonSchema.nullable(),
  createdAt: timestampSchema,
});

// Audit log with user information
export const auditLogWithUserSchema = auditLogSchema.extend({
  user: z
    .object({
      id: uuidSchema,
      username: z.string(),
      email: z.string().email(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
    })
    .nullable(),
});

// Query parameters for filtering audit logs
export const auditLogQuerySchema = z.object({
  userId: uuidSchema.optional(),
  action: auditActionSchema.optional(),
  entity: auditEntitySchema.optional(),
  entityId: uuidSchema.optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
});

// Request schema for creating audit log (usually done internally)
export const createAuditLogSchema = z.object({
  userId: uuidSchema.optional(),
  action: auditActionSchema,
  entity: auditEntitySchema,
  entityId: uuidSchema.optional(),
  changes: jsonSchema.optional(),
});

// Statistics query schema
export const auditStatisticsQuerySchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// Statistics response data schema
export const auditStatisticsDataSchema = z.object({
  total: z.number().int().nonnegative(),
  byAction: z.array(
    z.object({
      action: auditActionSchema,
      count: z.number().int().nonnegative(),
    })
  ),
  byEntity: z.array(
    z.object({
      entity: auditEntitySchema,
      count: z.number().int().nonnegative(),
    })
  ),
});

// Cleanup query schema
export const auditCleanupQuerySchema = z.object({
  daysToKeep: z.coerce.number().int().positive().default(90),
});

// Response schemas
export const auditLogResponseSchema = successResponseSchema(
  auditLogWithUserSchema
);
export const auditLogListResponseSchema = successListResponseSchema(
  auditLogWithUserSchema
);
export const auditStatisticsResponseSchema = successResponseSchema(
  auditStatisticsDataSchema
);
export const auditCleanupResponseSchema = successResponseSchema(
  z.object({
    deletedCount: z.number().int().nonnegative(),
    daysKept: z.number().int().positive(),
  })
);

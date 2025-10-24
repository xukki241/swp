import { z } from "zod";
import {
  codeSchema,
  descriptionSchema,
  nameSchema,
  paginationSchema,
  positiveIntSchema,
  uuidSchema,
  warehouseZoneTypeEnum,
} from "../common/index.js";

// Zone schema
export const warehouseZoneSchema = z.object({
  id: uuidSchema,
  code: codeSchema,
  name: nameSchema,
  type: warehouseZoneTypeEnum,
  location: z.string().nullable().optional(),
  description: descriptionSchema,
});

// POST /api/warehouse/zones (batch)
export const createZoneSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  type: warehouseZoneTypeEnum.default("normal"),
  location: z.string().optional(),
  description: descriptionSchema,
});

export const createZonesRequestSchema = z.array(createZoneSchema);
export const createZonesResponseSchema = z.array(warehouseZoneSchema);

// POST /api/warehouse/zones/batch
export const batchCreateZonesRequestSchema = z.object({
  quantity: positiveIntSchema,
  code_prefix: z.string().max(50).default("ZONE"),
  name_prefix: z.string().max(100).default("Zone"),
});

export const batchCreateZonesResponseSchema = z.array(warehouseZoneSchema);

// GET /api/warehouse/zones
export const listZonesQuerySchema = paginationSchema.extend({
  code: z.string().optional(),
  type: warehouseZoneTypeEnum.optional(),
});

export const listZonesResponseSchema = z.object({
  data: z.array(warehouseZoneSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/warehouse/zones/:id
export const getZoneResponseSchema = warehouseZoneSchema;

// PATCH /api/warehouse/zones/:id
export const updateZoneRequestSchema = createZoneSchema.partial();
export const updateZoneResponseSchema = warehouseZoneSchema;

// DELETE /api/warehouse/zones/:id
export const deleteZoneResponseSchema = z.object({
  message: z.string(),
});

// Alias exports for middleware validation
export const createWarehouseZoneSchema = z.union([
  createZoneSchema,
  z.array(createZoneSchema),
]);

export const updateWarehouseZoneSchema = updateZoneRequestSchema;

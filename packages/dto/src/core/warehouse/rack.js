import { z } from "zod";
import {
  codeSchema,
  descriptionSchema,
  nameSchema,
  paginationSchema,
  positiveIntSchema,
  uuidSchema,
} from "../common/index.js";

// Rack schema
export const warehouseRackSchema = z.object({
  id: uuidSchema,
  zoneId: uuidSchema,
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
});

// POST /api/warehouse/zones/:zoneId/racks (batch)
export const createRackSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  description: descriptionSchema,
});

export const createRacksRequestSchema = z.array(createRackSchema);
export const createRacksResponseSchema = z.array(warehouseRackSchema);

// POST /api/warehouse/zones/:zoneId/racks/batch
export const batchCreateRacksRequestSchema = z.object({
  quantity: positiveIntSchema,
  code_prefix: z.string().max(50).default("RACK"),
  name_prefix: z.string().max(100).default("Rack"),
});

export const batchCreateRacksResponseSchema = z.array(warehouseRackSchema);

// GET /api/warehouse/zones/:zoneId/racks
export const listRacksQuerySchema = paginationSchema.extend({
  code: z.string().optional(),
});

export const listRacksResponseSchema = z.object({
  data: z.array(warehouseRackSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/warehouse/racks/:id
export const getRackResponseSchema = warehouseRackSchema;

// PATCH /api/warehouse/racks/:id
export const updateRackRequestSchema = createRackSchema.partial();
export const updateRackResponseSchema = warehouseRackSchema;

// DELETE /api/warehouse/racks/:id
export const deleteRackResponseSchema = z.object({
  message: z.string(),
});

// Alias exports for middleware validation
export const createWarehouseRackSchema = z.union([
  createRackSchema,
  z.array(createRackSchema),
]);

export const updateWarehouseRackSchema = updateRackRequestSchema;

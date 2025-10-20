import { z } from "zod";
import {
  uuidSchema,
  codeSchema,
  nameSchema,
  descriptionSchema,
  paginationSchema,
  positiveIntSchema,
} from "../common/index.js";

// Bin schema
export const warehouseBinSchema = z.object({
  id: uuidSchema,
  rackId: uuidSchema,
  code: codeSchema,
  name: nameSchema,
  level: positiveIntSchema,
  number: positiveIntSchema,
  description: descriptionSchema,
});

// POST /api/warehouse/racks/:rackId/bins (batch)
export const createBinSchema = z.object({
  code: codeSchema,
  name: nameSchema,
  level: positiveIntSchema,
  number: positiveIntSchema,
  description: descriptionSchema,
});

export const createBinsRequestSchema = z.array(createBinSchema);
export const createBinsResponseSchema = z.array(warehouseBinSchema);

// POST /api/warehouse/racks/:rackId/bins/batch
export const batchCreateBinsRequestSchema = z.union([
  z.object({
    mode: z.literal("grid"),
    levels: positiveIntSchema,
    binsPerLevel: positiveIntSchema,
    codePrefix: z.string().max(50).default("BIN"),
    namePrefix: z.string().max(100).default("Bin"),
  }),
  z.object({
    mode: z.literal("list"),
    binsPerLevelList: z.array(positiveIntSchema).min(1),
    codePrefix: z.string().max(50).default("BIN"),
    namePrefix: z.string().max(100).default("Bin"),
  }),
]);

export const batchCreateBinsResponseSchema = z.array(warehouseBinSchema);

// GET /api/warehouse/racks/:rackId/bins
export const listBinsQuerySchema = paginationSchema.extend({
  code: z.string().optional(),
  level: positiveIntSchema.optional(),
  number: positiveIntSchema.optional(),
});

export const listBinsResponseSchema = z.object({
  data: z.array(warehouseBinSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/warehouse/bins/:id
export const getBinResponseSchema = warehouseBinSchema;

// GET /api/warehouse/bins/:id/inventory
export const getBinInventoryResponseSchema = z.array(z.any());

// PATCH /api/warehouse/bins/:id
export const updateBinRequestSchema = createBinSchema.partial();
export const updateBinResponseSchema = warehouseBinSchema;

// DELETE /api/warehouse/bins/:id
export const deleteBinResponseSchema = z.object({
  message: z.string(),
});

// Alias exports for middleware validation
export const createWarehouseBinSchema = z.union([
  createBinSchema,
  z.array(createBinSchema),
]);

export const updateWarehouseBinSchema = updateBinRequestSchema;

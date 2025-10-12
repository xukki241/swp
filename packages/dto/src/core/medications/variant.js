import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  booleanSchema,
  positiveDecimalSchema,
  paginationSchema,
} from "../common/index.js";

// Medication variant schema
export const medicationVariantSchema = z.object({
  id: uuidSchema,
  medicationId: uuidSchema,
  sku: z.string().max(50),
  name: nameSchema,
  unit: z.string().max(50),
  unitFactor: positiveDecimalSchema,
  barcode: z.string().max(50).nullable().optional(),
  sellPrice: positiveDecimalSchema,
  isActive: booleanSchema,
  isForSale: booleanSchema,
});

// POST /api/medications/:medicationId/variants (batch)
export const createVariantSchema = z.object({
  sku: z.string().min(1).max(50),
  name: nameSchema,
  unit: z.string().min(1).max(50),
  unitFactor: positiveDecimalSchema.default(1.0),
  barcode: z.string().max(50).optional(),
  sellPrice: positiveDecimalSchema,
  isActive: booleanSchema.default(true),
  isForSale: booleanSchema.default(false),
});

export const createVariantsRequestSchema = z.array(createVariantSchema);
export const createVariantsResponseSchema = z.array(medicationVariantSchema);

// GET /api/medications/:medicationId/variants
export const listVariantsQuerySchema = paginationSchema.extend({
  sku: z.string().optional(),
  barcode: z.string().optional(),
  isActive: booleanSchema.optional(),
  isForSale: booleanSchema.optional(),
});

export const listVariantsResponseSchema = z.object({
  data: z.array(medicationVariantSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/medications/:medicationId/variants/:id
export const getVariantResponseSchema = medicationVariantSchema;

// GET /api/medications/variants/:id/inventory
export const getVariantInventoryResponseSchema = z.array(z.any());

// PATCH /api/medications/:medicationId/variants/:id
export const updateVariantRequestSchema = createVariantSchema.partial();
export const updateVariantResponseSchema = medicationVariantSchema;

// DELETE /api/medications/:medicationId/variants/:id
export const deleteVariantResponseSchema = z.object({
  message: z.string(),
});

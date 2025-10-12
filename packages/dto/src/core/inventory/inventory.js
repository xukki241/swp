import { z } from "zod";
import {
  uuidSchema,
  dateSchema,
  positiveDecimalSchema,
  paginationSchema,
} from "../common/index.js";

// Inventory schema
export const inventorySchema = z.object({
  id: uuidSchema,
  medicationVariantId: uuidSchema,
  purchaseOrderReceiptItemsId: uuidSchema,
  binId: uuidSchema,
  batchNumber: z.string().max(100),
  manufactureDate: dateSchema.nullable().optional(),
  expiryDate: dateSchema.nullable().optional(),
  quantity: positiveDecimalSchema,
  quantityReserved: positiveDecimalSchema,
});

// GET /api/inventory
export const listInventoryQuerySchema = paginationSchema.extend({
  medication_variant_id: uuidSchema.optional(),
  bin_id: uuidSchema.optional(),
  batchNumber: z.string().optional(),
  expiryDateFrom: dateSchema.optional(),
  expiryDateTo: dateSchema.optional(),
});

export const listInventoryResponseSchema = z.object({
  data: z.array(inventorySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/inventory/:id
export const getInventoryResponseSchema = inventorySchema;

// PATCH /api/inventory/:id/adjust - Adjust inventory
export const adjustInventoryRequestSchema = z.object({
  newQuantity: positiveDecimalSchema,
  reason: z.string().min(1),
});

export const adjustInventoryResponseSchema = inventorySchema;

// POST /api/inventory/move - Move inventory
export const moveInventoryRequestSchema = z.object({
  fromInventoryId: uuidSchema,
  toBinId: uuidSchema,
  quantity: positiveDecimalSchema,
  reason: z.string().min(1),
});

export const moveInventoryResponseSchema = z.object({
  message: z.string(),
});

// Alias exports for middleware validation
export const updateInventorySchema = inventorySchema.partial();

import { z } from "zod";
import {
  uuidSchema,
  dateSchema,
  positiveDecimalSchema,
  positiveIntSchema,
  paginationSchema,
  sortBySchema,
  sortOrderSchema,
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

// Inventory summary schema
export const inventorySummarySchema = z.object({
  medicationVariantId: uuidSchema,
  totalQuantity: positiveDecimalSchema,
  totalReserved: positiveDecimalSchema,
  availableQuantity: positiveDecimalSchema,
});

// GET /api/inventory - List all inventory
export const listInventoryQuerySchema = paginationSchema.extend({
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
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

// GET /api/inventory/batches/:inventoryBatchId - Get inventory by ID
export const inventoryBatchIdParamSchema = z.object({
  inventoryBatchId: uuidSchema,
});

export const getInventoryResponseSchema = inventorySchema;

// PATCH /api/inventory/:id - Update inventory
export const updateInventorySchema = z.object({
  medicationVariantId: uuidSchema.optional(),
  purchaseOrderReceiptItemsId: uuidSchema.optional(),
  binId: uuidSchema.optional(),
  batchNumber: z.string().max(100).optional(),
  manufactureDate: dateSchema.nullable().optional(),
  expiryDate: dateSchema.nullable().optional(),
  quantity: positiveDecimalSchema.optional(),
  quantityReserved: positiveDecimalSchema.optional(),
});

export const updateInventoryResponseSchema = inventorySchema;

// PATCH /api/inventory/:id/adjust - Adjust inventory quantity
export const adjustInventoryRequestSchema = z.object({
  newQuantity: positiveDecimalSchema,
  reason: z.string().min(1),
});

export const adjustInventoryResponseSchema = inventorySchema;

// POST /api/inventory/move - Move inventory between bins
export const moveInventoryRequestSchema = z.object({
  fromInventoryId: uuidSchema,
  toBinId: uuidSchema,
  quantity: positiveDecimalSchema,
  reason: z.string().min(1),
});

export const moveInventoryResponseSchema = z.object({
  message: z.string(),
});

// GET /api/inventory/summary/by-variant - Get inventory summary by variant
export const getInventorySummaryQuerySchema = paginationSchema.extend({
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
});

export const getInventorySummaryResponseSchema = z.object({
  data: z.array(inventorySummarySchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/inventory/expiring - Get expiring inventory
export const getExpiringInventoryQuerySchema = paginationSchema.extend({
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
  daysUntilExpiry: z.coerce.number().int().positive().default(30).optional(),
});

export const getExpiringInventoryResponseSchema = listInventoryResponseSchema;

// GET /api/inventory/low-stock - Get low stock inventory
export const getLowStockInventoryQuerySchema = paginationSchema.extend({
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
  threshold: z.coerce.number().min(0).default(10).optional(),
});

export const getLowStockInventoryResponseSchema = listInventoryResponseSchema;

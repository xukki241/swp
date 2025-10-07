import { z } from "zod";
import { idSchema, positiveDecimalSchema, dateSchema } from "./common.js";

// Inventory base schema
export const inventoryBaseSchema = z.object({
  medicationVariantId: idSchema,
  purchaseOrderReceiptItemsId: idSchema,
  binId: idSchema,
  batchNumber: z.string().min(1).max(100),
  manufactureDate: dateSchema.optional(),
  expiryDate: dateSchema.optional(),
  quantity: positiveDecimalSchema,
  quantityReserved: positiveDecimalSchema.default("0"),
});

// Inventory schema with ID
export const inventorySchema = inventoryBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createInventorySchema = inventoryBaseSchema;

// Update schema
export const updateInventorySchema = inventoryBaseSchema.partial().extend({
  medicationVariantId: idSchema.optional(),
  purchaseOrderReceiptItemsId: idSchema.optional(),
  binId: idSchema.optional(),
});

// Query schema
export const inventoryQuerySchema = z.object({
  id: idSchema.optional(),
  medicationVariantId: idSchema.optional(),
  binId: idSchema.optional(),
  batchNumber: z.string().optional(),
  expiryDateFrom: dateSchema.optional(),
  expiryDateTo: dateSchema.optional(),
});

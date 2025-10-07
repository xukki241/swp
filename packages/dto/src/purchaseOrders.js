import { z } from "zod";
import { idSchema, positiveDecimalSchema, timestampSchema } from "./common.js";
import { purchaseOrderStatusSchema } from "./enums.js";

// Purchase order base schema
export const purchaseOrderBaseSchema = z.object({
  supplierId: idSchema,
  orderDate: timestampSchema,
  expectedDate: timestampSchema.optional(),
  status: purchaseOrderStatusSchema.default("pending"),
  totalAmount: positiveDecimalSchema.default("0"),
  createdBy: idSchema.optional(),
});

// Purchase order schema with ID
export const purchaseOrderSchema = purchaseOrderBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createPurchaseOrderSchema = purchaseOrderBaseSchema
  .omit({ orderDate: true })
  .extend({
    orderDate: timestampSchema.optional(),
  });

// Update schema
export const updatePurchaseOrderSchema = purchaseOrderBaseSchema
  .partial()
  .extend({
    supplierId: idSchema.optional(),
  });

// Query schema
export const purchaseOrderQuerySchema = z.object({
  id: idSchema.optional(),
  supplierId: idSchema.optional(),
  status: purchaseOrderStatusSchema.optional(),
  createdBy: idSchema.optional(),
  orderDateFrom: timestampSchema.optional(),
  orderDateTo: timestampSchema.optional(),
});

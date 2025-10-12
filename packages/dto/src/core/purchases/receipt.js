import { z } from "zod";
import {
  uuidSchema,
  timestampSchema,
  dateSchema,
  positiveIntSchema,
  paginationSchema,
} from "../common/index.js";

// Purchase order receipt schema
export const purchaseOrderReceiptSchema = z.object({
  id: uuidSchema,
  purchaseOrderId: uuidSchema,
  receivedDate: timestampSchema,
  receivedBy: uuidSchema.nullable().optional(),
});

// Receipt item schema
export const purchaseOrderReceiptItemSchema = z.object({
  id: uuidSchema,
  purchaseOrderReceiptId: uuidSchema,
  purchaseOrderItemId: uuidSchema,
  quantity: positiveIntSchema,
});

// POST /api/purchases/:purchaseOrderId/receipts - Create receipt with items
export const createReceiptItemSchema = z.object({
  purchase_order_item_id: uuidSchema,
  quantity: positiveIntSchema,
  bin_id: uuidSchema,
  batch_number: z.string().min(1).max(100),
  manufacture_date: dateSchema.optional(),
  expiry_date: dateSchema.optional(),
});

export const createReceiptRequestSchema = z.object({
  items: z.array(createReceiptItemSchema).min(1),
});

export const createReceiptResponseSchema = purchaseOrderReceiptSchema;

// GET /api/purchases/:purchaseOrderId/receipts
export const listReceiptsQuerySchema = paginationSchema;

export const listReceiptsResponseSchema = z.object({
  data: z.array(purchaseOrderReceiptSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/receipts/:id
export const getReceiptResponseSchema = purchaseOrderReceiptSchema.extend({
  items: z.array(purchaseOrderReceiptItemSchema).optional(),
});

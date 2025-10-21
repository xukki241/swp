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
  purchaseOrderItemId: uuidSchema,
  quantity: positiveIntSchema,
});

export const createReceiptRequestSchema = z.object({
  receivedDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .optional(),
  receivedBy: uuidSchema.optional(),
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

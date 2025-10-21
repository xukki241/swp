import { z } from "zod";
import {
  paginationSchema,
  positiveDecimalSchema,
  positiveIntSchema,
  purchaseOrderStatusEnum,
  timestampSchema,
  uuidSchema,
} from "../common/index.js";

// Purchase order schema
export const purchaseOrderSchema = z.object({
  id: uuidSchema,
  supplierId: uuidSchema,
  orderDate: timestampSchema,
  expectedDate: timestampSchema.nullable().optional(),
  status: purchaseOrderStatusEnum,
  totalAmount: positiveDecimalSchema,
  createdBy: uuidSchema.nullable().optional(),
});

// Purchase order item schema
export const purchaseOrderItemSchema = z.object({
  id: uuidSchema,
  purchaseOrderId: uuidSchema,
  supplierMedicationVariantId: uuidSchema,
  quantity: positiveIntSchema,
  unitPrice: positiveDecimalSchema,
  totalPrice: positiveDecimalSchema,
});

// POST /api/purchases (batch) - Create with items
export const createPurchaseOrderItemSchema = z.object({
  supplier_medication_variant_id: uuidSchema,
  quantity: positiveIntSchema,
  unit_price: positiveDecimalSchema,
});

export const createPurchaseOrderSchema = z.object({
  supplier_id: uuidSchema,
  items: z.array(createPurchaseOrderItemSchema).min(1),
});

export const createPurchaseOrdersRequestSchema = z.array(
  createPurchaseOrderSchema
);
export const createPurchaseOrdersResponseSchema = z.array(purchaseOrderSchema);

// GET /api/purchases
export const listPurchaseOrdersQuerySchema = paginationSchema.extend({
  supplierId: uuidSchema.optional(),
  status: purchaseOrderStatusEnum.optional(),
  createdBy: uuidSchema.optional(),
  orderDateFrom: timestampSchema.optional(),
  orderDateTo: timestampSchema.optional(),
});

export const listPurchaseOrdersResponseSchema = z.object({
  data: z.array(purchaseOrderSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/purchases/:id
export const getPurchaseOrderResponseSchema = purchaseOrderSchema.extend({
  items: z.array(purchaseOrderItemSchema).optional(),
});

// PATCH /api/purchases/:id
export const updatePurchaseOrderRequestSchema = z.object({
  status: purchaseOrderStatusEnum.optional(),
});

export const updatePurchaseOrderResponseSchema = purchaseOrderSchema;

// DELETE /api/purchases/:id
export const deletePurchaseOrderResponseSchema = z.object({
  message: z.string(),
});

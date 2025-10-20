import { z } from "zod";
import {
  uuidSchema,
  timestampSchema,
  positiveDecimalSchema,
  positiveIntSchema,
  paginationSchema,
  sortBySchema,
  sortOrderSchema,
} from "../common/index.js";
import {
  salesOrderStatusEnum,
  salesOrderPaymentMethodEnum,
} from "../common/index.js";

// Sales order schema
export const salesOrderSchema = z.object({
  id: uuidSchema,
  customerId: uuidSchema,
  orderDate: timestampSchema,
  totalAmount: positiveDecimalSchema,
  status: salesOrderStatusEnum,
  paymentMethod: salesOrderPaymentMethodEnum,
  salespersonId: uuidSchema.nullable().optional(),
});

// Sales order item schema
export const salesOrderItemSchema = z.object({
  id: uuidSchema,
  salesOrderId: uuidSchema,
  medicationVariantId: uuidSchema,
  quantity: positiveIntSchema,
  unitPrice: positiveDecimalSchema,
  totalPrice: positiveDecimalSchema,
});

// Sales order with items (for GET /:id response)
export const salesOrderWithItemsSchema = salesOrderSchema.extend({
  items: z.array(salesOrderItemSchema),
});

// POST /api/sales - Create sales order with items
export const createSalesOrderItemSchema = z.object({
  medication_variant_id: uuidSchema,
  quantity: positiveIntSchema,
});

export const createSalesOrderRequestSchema = z.object({
  customer_id: uuidSchema,
  payment_method: salesOrderPaymentMethodEnum.default("cash").optional(),
  items: z.array(createSalesOrderItemSchema).min(1),
});

export const createSalesOrderResponseSchema = salesOrderSchema;

// GET /api/sales - List sales orders
export const listSalesOrdersQuerySchema = paginationSchema.extend({
  sortBy: sortBySchema.optional(),
  sortOrder: sortOrderSchema.optional(),
  customerId: uuidSchema.optional(),
  status: salesOrderStatusEnum.optional(),
  paymentMethod: salesOrderPaymentMethodEnum.optional(),
  salespersonId: uuidSchema.optional(),
  orderDateFrom: timestampSchema.optional(),
  orderDateTo: timestampSchema.optional(),
});

export const listSalesOrdersResponseSchema = z.object({
  data: z.array(salesOrderSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/sales/:id
export const salesOrderIdParamSchema = z.object({
  id: uuidSchema,
});

export const getSalesOrderResponseSchema = salesOrderWithItemsSchema;

// PATCH /api/sales/:id - Update sales order status
export const updateSalesOrderRequestSchema = z.object({
  status: salesOrderStatusEnum.optional(),
});

export const updateSalesOrderResponseSchema = salesOrderSchema;

// DELETE /api/sales/:id - Cancel sales order
export const deleteSalesOrderResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

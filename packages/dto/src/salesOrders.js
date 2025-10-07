import { z } from "zod";
import { idSchema, positiveDecimalSchema, timestampSchema } from "./common.js";
import {
  salesOrderStatusSchema,
  salesOrderPaymentMethodSchema,
} from "./enums.js";

// Sales order base schema
export const salesOrderBaseSchema = z.object({
  customerId: idSchema,
  orderDate: timestampSchema,
  totalAmount: positiveDecimalSchema.default("0"),
  status: salesOrderStatusSchema.default("pending"),
  paymentMethod: salesOrderPaymentMethodSchema.default("cash"),
  salespersonId: idSchema.optional(),
});

// Sales order schema with ID
export const salesOrderSchema = salesOrderBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createSalesOrderSchema = salesOrderBaseSchema
  .omit({ orderDate: true })
  .extend({
    orderDate: timestampSchema.optional(),
  });

// Update schema
export const updateSalesOrderSchema = salesOrderBaseSchema.partial().extend({
  customerId: idSchema.optional(),
});

// Query schema
export const salesOrderQuerySchema = z.object({
  id: idSchema.optional(),
  customerId: idSchema.optional(),
  status: salesOrderStatusSchema.optional(),
  paymentMethod: salesOrderPaymentMethodSchema.optional(),
  salespersonId: idSchema.optional(),
  orderDateFrom: timestampSchema.optional(),
  orderDateTo: timestampSchema.optional(),
});

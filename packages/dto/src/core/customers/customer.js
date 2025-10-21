import { z } from "zod";
import {
  addressSchema,
  emailSchema,
  nameSchema,
  paginationSchema,
  phoneSchema,
  uuidSchema,
} from "../common/index.js";

// Customer schema
export const customerSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
});

// POST /api/customers (batch)
export const createCustomerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
});

export const createCustomersRequestSchema = z.array(createCustomerSchema);
export const createCustomersResponseSchema = z.array(customerSchema);

// GET /api/customers
export const listCustomersQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
});

export const listCustomersResponseSchema = z.object({
  data: z.array(customerSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/customers/:id
export const getCustomerResponseSchema = customerSchema;

// PATCH /api/customers/:id
export const updateCustomerRequestSchema = createCustomerSchema.partial();
export const updateCustomerResponseSchema = customerSchema;

// DELETE /api/customers/:id
export const deleteCustomerResponseSchema = z.object({
  message: z.string(),
});

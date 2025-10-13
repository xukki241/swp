import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  paginationSchema,
} from "../common/index.js";
import { supplierStatusEnum } from "../common/index.js";

// Supplier schema
export const supplierSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  contactName: z.string().max(100).nullable().optional(),
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: supplierStatusEnum,
});

// POST /api/suppliers (batch)
export const createSupplierSchema = z.object({
  name: nameSchema,
  contactName: z.string().max(100).optional(),
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: supplierStatusEnum.default("active"),
});

export const createSuppliersRequestSchema = z.array(createSupplierSchema);
export const createSuppliersResponseSchema = z.array(supplierSchema);

// GET /api/suppliers
export const listSuppliersQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
  email: z.string().optional(),
  phone: z.string().optional(),
  status: supplierStatusEnum.optional(),
});

export const listSuppliersResponseSchema = z.object({
  data: z.array(supplierSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/suppliers/:id
export const getSupplierResponseSchema = supplierSchema;

// PATCH /api/suppliers/:id
export const updateSupplierRequestSchema = createSupplierSchema.partial();
export const updateSupplierResponseSchema = supplierSchema;

// DELETE /api/suppliers/:id
export const deleteSupplierResponseSchema = z.object({
  message: z.string(),
});

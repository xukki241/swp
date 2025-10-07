import { z } from "zod";
import {
  nameSchema,
  descriptionSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  idSchema,
} from "./common.js";
import { supplierStatusSchema } from "./enums.js";

// Supplier base schema
export const supplierBaseSchema = z.object({
  name: nameSchema,
  contactName: z.string().max(100).optional(),
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: supplierStatusSchema.default("active"),
});

// Supplier schema with ID
export const supplierSchema = supplierBaseSchema.extend({
  id: idSchema,
});

// Supplier create schema
export const createSupplierSchema = supplierBaseSchema;

// Supplier update schema
export const updateSupplierSchema = supplierBaseSchema.partial();

// Supplier query schema
export const supplierQuerySchema = z.object({
  id: idSchema.optional(),
  name: z.string().optional(),
  email: emailSchema,
  phone: phoneSchema,
  status: supplierStatusSchema.optional(),
});

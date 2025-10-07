import { z } from "zod";
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  idSchema,
} from "./common.js";

// Customer base schema
export const customerBaseSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
});

// Customer schema with ID
export const customerSchema = customerBaseSchema.extend({
  id: idSchema,
});

// Customer create schema
export const createCustomerSchema = customerBaseSchema;

// Customer update schema
export const updateCustomerSchema = customerBaseSchema.partial();

// Customer query schema
export const customerQuerySchema = z.object({
  id: idSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  name: z.string().optional(),
});

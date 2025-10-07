import { z } from "zod";
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  idSchema,
} from "./common.js";
import { userRoleSchema, userStatusSchema } from "./enums.js";

// User base schema
export const userBaseSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: userStatusSchema.default("active"),
  role: userRoleSchema.default("staff"),
});

// User schema with ID (for responses)
export const userSchema = userBaseSchema.extend({
  id: idSchema,
});

// User create schema (for POST requests)
export const createUserSchema = userBaseSchema;

// User update schema (for PUT/PATCH requests)
export const updateUserSchema = userBaseSchema.partial();

// User query schema (for filtering)
export const userQuerySchema = z.object({
  id: idSchema.optional(),
  email: emailSchema,
  phone: phoneSchema,
  status: userStatusSchema.optional(),
  role: userRoleSchema.optional(),
});

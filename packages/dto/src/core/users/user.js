import { z } from "zod";
import {
  addressSchema,
  emailSchema,
  nameSchema,
  paginationSchema,
  phoneSchema,
  userRoleEnum,
  userStatusEnum,
  uuidSchema,
} from "../common/index.js";

// Base user schema
export const userSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  address: addressSchema,
  status: userStatusEnum,
  role: userRoleEnum,
});

// POST /api/users (batch) - Create users
export const createUserSchema = z.object({
  name: nameSchema,
  email: emailSchema.refine((val) => val != null, {
    message: "Email is required",
  }),
  phone: phoneSchema.refine((val) => val != null, {
    message: "Phone is required",
  }),
  address: addressSchema,
  password: z.string().min(8).max(255),
  role: userRoleEnum.default("staff"),
});

export const createUsersRequestSchema = z.array(createUserSchema);
export const createUsersResponseSchema = z.array(userSchema);

// GET /api/users - List users with pagination
export const listUsersQuerySchema = paginationSchema.extend({
  email: z.string().optional(),
  phone: z.string().optional(),
  status: userStatusEnum.optional(),
  role: userRoleEnum.optional(),
});

export const listUsersResponseSchema = z.object({
  data: z.array(userSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/users/:id - Get user by ID
export const getUserResponseSchema = userSchema;

// PATCH /api/users/:id - Update user
export const updateUserRequestSchema = z.object({
  name: nameSchema.optional(),
  address: addressSchema.optional(),
  status: userStatusEnum.optional(),
  role: userRoleEnum.optional(),
});

export const updateUserResponseSchema = userSchema;

// DELETE /api/users/:id - Delete user
export const deleteUserResponseSchema = z.object({
  message: z.string(),
});

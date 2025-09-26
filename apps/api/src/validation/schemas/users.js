import { z } from "zod";
import { createSelectSchema, createInsertSchema } from "drizzle-zod";
import { users, userStatusEnum } from "../../db/schema/users.js";

// Base Drizzle Zod schemas
export const selectUserSchema = createSelectSchema(users);
export const insertUserSchema = createInsertSchema(users);

// Custom validation schemas for API requests
export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Name must be less than 255 characters")
    .trim(),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .trim()
    .toLowerCase(),
  phone: z
    .string()
    .min(1, "Phone is required")
    .max(20, "Phone must be less than 20 characters")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format")
    .trim(),
  roleId: z
    .number()
    .int("Role ID must be an integer")
    .positive("Role ID must be positive"),
  status: z
    .enum(["active", "inactive", "suspended"])
    .optional()
    .default("active"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, "Name cannot be empty")
    .max(255, "Name must be less than 255 characters")
    .trim()
    .optional(),
  email: z
    .string()
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters")
    .trim()
    .toLowerCase()
    .optional(),
  phone: z
    .string()
    .min(1, "Phone cannot be empty")
    .max(20, "Phone must be less than 20 characters")
    .regex(/^\+?[\d\s\-\(\)]+$/, "Invalid phone format")
    .trim()
    .optional(),
  roleId: z
    .number()
    .int("Role ID must be an integer")
    .positive("Role ID must be positive")
    .optional(),
  status: z.enum(["active", "inactive", "suspended"]).optional(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "suspended"], {
    required_error: "Status is required",
    invalid_type_error: "Status must be one of: active, inactive, suspended",
  }),
});

// Query parameter schemas
export const getUserByEmailParamsSchema = z.object({
  email: z.string().email("Invalid email format").min(1, "Email is required"),
});

export const getUserByIdParamsSchema = z.object({
  id: z
    .string()
    .regex(/^\d+$/, "ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const getUserByRoleParamsSchema = z.object({
  roleId: z
    .string()
    .regex(/^\d+$/, "Role ID must be a valid number")
    .transform((val) => parseInt(val, 10)),
});

export const getUsersQuerySchema = z.object({
  page: z
    .union([z.string(), z.number()])
    .optional()
    .default(1)
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? 1 : num;
    })
    .refine((val) => val >= 1, "Page must be at least 1"),
  limit: z
    .union([z.string(), z.number()])
    .optional()
    .default(10)
    .transform((val) => {
      const num = typeof val === "string" ? parseInt(val, 10) : val;
      return isNaN(num) ? 10 : num;
    })
    .refine((val) => val >= 1 && val <= 100, "Limit must be between 1 and 100"),
  search: z
    .string()
    .max(255, "Search term must be less than 255 characters")
    .optional(),
  orderBy: z
    .enum(["id", "name", "email", "phone", "status", "roleId"])
    .optional()
    .default("name"),
  orderDirection: z.enum(["asc", "desc"]).optional().default("asc"),
});

// Bulk create schema
export const bulkCreateUsersSchema = z.object({
  users: z
    .array(createUserSchema)
    .min(1, "At least one user is required")
    .max(50, "Cannot create more than 50 users at once"),
});

// Response transformation schemas
export const userResponseSchema = selectUserSchema.omit({
  // Exclude sensitive fields from response
  password: true,
});

export const usersListResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(userResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
  }),
});

export const userResponseWrapper = z.object({
  success: z.boolean(),
  data: userResponseSchema,
  message: z.string().optional(),
});

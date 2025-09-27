import { createSelectSchema, createInsertSchema } from "drizzle-valibot";
import * as v from "valibot";

import { userCredentials } from "../../db/schema/user-credentials.js";
import {
  userRegistrations,
  // registrationStatusEnum,
} from "../../db/schema/user-registrations.js";
import { users /* userStatusEnum */ } from "../../db/schema/users.js";

// Base schemas generated from Drizzle tables
export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users);
export const userCredentialsSelectSchema = createSelectSchema(userCredentials);
export const userCredentialsInsertSchema = createInsertSchema(userCredentials);
export const userRegistrationSelectSchema =
  createSelectSchema(userRegistrations);
export const userRegistrationInsertSchema =
  createInsertSchema(userRegistrations);

// Custom validation schemas for API endpoints

/**
 * Schema for creating a new user
 */
export const userCreateSchema = v.object({
  name: v.pipe(
    v.string("Name must be a string"),
    v.trim(),
    v.minLength(1, "Name is required"),
    v.maxLength(255, "Name must be 255 characters or less")
  ),
  email: v.pipe(
    v.string("Email must be a string"),
    v.trim(),
    v.toLowerCase(),
    v.email("Invalid email format"),
    v.maxLength(255, "Email must be 255 characters or less")
  ),
  phone: v.pipe(
    v.string("Phone must be a string"),
    v.trim(),
    v.minLength(1, "Phone is required"),
    v.maxLength(20, "Phone must be 20 characters or less"),
    v.regex(/^\+?[\d\s()-]+$/, "Invalid phone number format")
  ),
  roleId: v.pipe(
    v.number("Role ID must be a number"),
    v.integer("Role ID must be an integer"),
    v.minValue(1, "Role ID must be a positive integer")
  ),
  status: v.optional(
    v.picklist(["active", "inactive", "suspended"], "Invalid user status")
  ),
});

/**
 * Schema for updating user profile (partial update)
 */
export const userUpdateProfileSchema = v.object({
  name: v.optional(
    v.pipe(
      v.string("Name must be a string"),
      v.trim(),
      v.minLength(1, "Name is required"),
      v.maxLength(255, "Name must be 255 characters or less")
    )
  ),
  email: v.optional(
    v.pipe(
      v.string("Email must be a string"),
      v.trim(),
      v.toLowerCase(),
      v.email("Invalid email format"),
      v.maxLength(255, "Email must be 255 characters or less")
    )
  ),
  phone: v.optional(
    v.pipe(
      v.string("Phone must be a string"),
      v.trim(),
      v.minLength(1, "Phone is required"),
      v.maxLength(20, "Phone must be 20 characters or less"),
      v.regex(/^\+?[\d\s()-]+$/, "Invalid phone number format")
    )
  ),
});

/**
 * Schema for updating user status
 */
export const userStatusUpdateSchema = v.object({
  status: v.picklist(
    ["active", "inactive", "suspended"],
    "Status must be one of: active, inactive, suspended"
  ),
});

/**
 * Schema for bulk creating users
 */
export const userBulkCreateSchema = v.object({
  users: v.pipe(
    v.array(userCreateSchema, "Users must be an array"),
    v.minLength(1, "At least one user is required"),
    v.maxLength(100, "Maximum 100 users allowed per bulk operation")
  ),
});

/**
 * Schema for user query parameters
 */
export const userQuerySchema = v.object({
  page: v.optional(
    v.pipe(
      v.string("Page must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Page must be a number"),
      v.integer("Page must be an integer"),
      v.minValue(1, "Page must be at least 1")
    )
  ),
  limit: v.optional(
    v.pipe(
      v.string("Limit must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Limit must be a number"),
      v.integer("Limit must be an integer"),
      v.minValue(1, "Limit must be at least 1"),
      v.maxValue(100, "Limit must be at most 100")
    )
  ),
  search: v.optional(
    v.pipe(
      v.string("Search must be a string"),
      v.trim(),
      v.maxLength(255, "Search term must be 255 characters or less")
    )
  ),
  orderBy: v.optional(
    v.picklist(
      ["id", "name", "email", "phone", "status", "roleId"],
      "Invalid orderBy field"
    )
  ),
  orderDirection: v.optional(
    v.picklist(["asc", "desc"], "Order direction must be 'asc' or 'desc'")
  ),
  status: v.optional(
    v.picklist(["active", "inactive", "suspended"], "Invalid status filter")
  ),
});

/**
 * Schema for user query by role
 */
export const userByRoleQuerySchema = v.object({
  page: v.optional(
    v.pipe(
      v.string("Page must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Page must be a number"),
      v.integer("Page must be an integer"),
      v.minValue(1, "Page must be at least 1")
    )
  ),
  limit: v.optional(
    v.pipe(
      v.string("Limit must be a string"),
      v.transform(input => Number.parseInt(input, 10)),
      v.number("Limit must be a number"),
      v.integer("Limit must be an integer"),
      v.minValue(1, "Limit must be at least 1"),
      v.maxValue(100, "Limit must be at most 100")
    )
  ),
  orderBy: v.optional(
    v.picklist(
      ["id", "name", "email", "phone", "status"],
      "Invalid orderBy field"
    )
  ),
  orderDirection: v.optional(
    v.picklist(["asc", "desc"], "Order direction must be 'asc' or 'desc'")
  ),
});

/**
 * Schema for user registration
 */
export const userRegistrationCreateSchema = v.object({
  fullName: v.pipe(
    v.string("Full name must be a string"),
    v.trim(),
    v.minLength(1, "Full name is required"),
    v.maxLength(255, "Full name must be 255 characters or less")
  ),
  email: v.pipe(
    v.string("Email must be a string"),
    v.trim(),
    v.toLowerCase(),
    v.email("Invalid email format"),
    v.maxLength(255, "Email must be 255 characters or less")
  ),
  phone: v.optional(
    v.pipe(
      v.string("Phone must be a string"),
      v.trim(),
      v.maxLength(20, "Phone must be 20 characters or less"),
      v.regex(/^\+?[\d\s()-]+$/, "Invalid phone number format")
    )
  ),
  password: v.pipe(
    v.string("Password must be a string"),
    v.minLength(8, "Password must be at least 8 characters long"),
    v.maxLength(128, "Password must be 128 characters or less"),
    v.regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!$%&*?@])[\d!$%&*?@A-Za-z]/,
      "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
    )
  ),
});

/**
 * Schema for user credentials creation
 */
export const userCredentialsCreateSchema = v.object({
  userId: v.pipe(
    v.number("User ID must be a number"),
    v.integer("User ID must be an integer"),
    v.minValue(1, "User ID must be a positive integer")
  ),
  provider: v.pipe(
    v.string("Provider must be a string"),
    v.trim(),
    v.minLength(1, "Provider is required"),
    v.maxLength(100, "Provider must be 100 characters or less")
  ),
  identifier: v.pipe(
    v.string("Identifier must be a string"),
    v.trim(),
    v.minLength(1, "Identifier is required"),
    v.maxLength(255, "Identifier must be 255 characters or less")
  ),
  secretHash: v.pipe(
    v.string("Secret hash must be a string"),
    v.trim(),
    v.minLength(1, "Secret hash is required"),
    v.maxLength(255, "Secret hash must be 255 characters or less")
  ),
});

import { z } from "zod";

// UUID validation
export const uuidSchema = z.uuid();

// Common string fields
export const nameSchema = z.string().min(1).max(100);
export const codeSchema = z.string().min(1).max(50);
export const descriptionSchema = z.string().nullable().optional();
export const emailSchema = z.email().max(255).nullable().optional();
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone must be exactly 10 digits")
  .nullable()
  .optional();
export const addressSchema = z.string().nullable().optional();

// Numeric fields
export const intSchema = z.number().int();
export const positiveIntSchema = z.number().int().positive();
export const nonNegativeIntSchema = z.number().int().nonnegative();
export const decimalSchema = z.number();
export const positiveDecimalSchema = z.number().nonnegative();

// Date/time fields
export const dateSchema = z.union([
  z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  z.date(),
]);
export const timestampSchema = z.union([z.string().datetime(), z.date()]);

// Boolean
export const booleanSchema = z.boolean();

// JSON
export const jsonSchema = z.record(z.any()).or(z.array(z.any()));

// Standardized Response Wrappers
/**
 * Standard success response wrapper for single items
 * @param {z.ZodType} dataSchema - The schema for the data field
 * @returns {z.ZodObject} Success response schema
 */
export const successResponseSchema = (dataSchema) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: dataSchema,
  });

/**
 * Standard success response wrapper for lists with pagination
 * @param {z.ZodType} itemSchema - The schema for items in the data array
 * @returns {z.ZodObject} Success list response schema
 */
export const successListResponseSchema = (itemSchema) =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.array(itemSchema),
    pagination: z.object({
      page: z.number().int().positive(),
      limit: z.number().int().positive().max(100),
      total: z.number().int().nonnegative(),
      totalPages: z.number().int().nonnegative(),
      hasMore: z.boolean(),
    }),
  });

/**
 * Standard error response
 */
export const errorResponseSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  reasons: z.array(z.string()).optional(),
});

/**
 * Error response with stack trace (for development)
 */
export const errorResponseWithTraceSchema = z.object({
  success: z.literal(false),
  error: z.string(),
  reasons: z.array(z.string()).optional(),
  trace: z.string().optional(),
});

/**
 * Success response with no data (for delete operations)
 */
export const successNoDataResponseSchema = () =>
  z.object({
    success: z.literal(true),
    message: z.string(),
    data: z.null(),
  });

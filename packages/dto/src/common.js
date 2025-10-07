import { z } from "zod";

// Common field validators
export const idSchema = z.union([z.string(), z.number(), z.bigint()]);

export const nameSchema = z
  .string()
  .min(1, "Name is required")
  .max(100, "Name must be at most 100 characters");

export const descriptionSchema = z.string().optional();

export const codeSchema = z
  .string()
  .min(1, "Code is required")
  .max(50, "Code must be at most 50 characters");

export const emailSchema = z
  .string()
  .email("Invalid email format")
  .max(255, "Email must be at most 255 characters")
  .optional();

export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone must be exactly 10 digits")
  .optional();

export const addressSchema = z.string().optional();

export const timestampSchema = z.union([z.string().datetime(), z.date()]);

export const booleanSchema = z.boolean();

// Decimal/numeric field validator
export const decimalSchema = z.union([
  z.string().regex(/^\d+(\.\d+)?$/, "Must be a valid decimal number"),
  z.number(),
]);

export const positiveDecimalSchema = decimalSchema.refine(
  (val) => parseFloat(String(val)) >= 0,
  "Must be a positive number"
);

// Date validator
export const dateSchema = z.union([z.string().date(), z.date()]);

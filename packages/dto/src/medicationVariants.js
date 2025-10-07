import { z } from "zod";
import {
  nameSchema,
  idSchema,
  booleanSchema,
  positiveDecimalSchema,
} from "./common.js";

// Medication variant base schema
export const medicationVariantBaseSchema = z.object({
  medicationId: idSchema,
  sku: z.string().min(1).max(50),
  name: nameSchema,
  unit: z.string().min(1).max(50),
  unitFactor: positiveDecimalSchema.default("1.00"),
  barcode: z.string().max(50).optional(),
  sellPrice: positiveDecimalSchema,
  isActive: booleanSchema.default(true),
  isForSale: booleanSchema.default(false),
});

// Medication variant schema with ID
export const medicationVariantSchema = medicationVariantBaseSchema.extend({
  id: idSchema,
});

// Create schema
export const createMedicationVariantSchema = medicationVariantBaseSchema;

// Update schema
export const updateMedicationVariantSchema = medicationVariantBaseSchema
  .partial()
  .extend({
    medicationId: idSchema.optional(),
  });

// Query schema
export const medicationVariantQuerySchema = z.object({
  id: idSchema.optional(),
  medicationId: idSchema.optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  isActive: booleanSchema.optional(),
  isForSale: booleanSchema.optional(),
});

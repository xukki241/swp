import { z } from "zod";
import {
  nameSchema,
  descriptionSchema,
  idSchema,
  booleanSchema,
} from "./common.js";
import { medicationStatusSchema } from "./enums.js";

// Medication base schema
export const medicationBaseSchema = z.object({
  name: nameSchema,
  brand: z.string().max(100).optional(),
  description: descriptionSchema,
  isPrescriptionRequired: booleanSchema.default(false),
  isControlledSubstance: booleanSchema.default(false),
  status: medicationStatusSchema.default("active"),
});

// Medication schema with ID
export const medicationSchema = medicationBaseSchema.extend({
  id: idSchema,
});

// Medication create schema
export const createMedicationSchema = medicationBaseSchema;

// Medication update schema
export const updateMedicationSchema = medicationBaseSchema.partial();

// Medication query schema
export const medicationQuerySchema = z.object({
  id: idSchema.optional(),
  name: z.string().optional(),
  brand: z.string().optional(),
  status: medicationStatusSchema.optional(),
  isPrescriptionRequired: booleanSchema.optional(),
  isControlledSubstance: booleanSchema.optional(),
});

import { z } from "zod";
import {
  uuidSchema,
  nameSchema,
  descriptionSchema,
  booleanSchema,
  paginationSchema,
} from "../common/index.js";
import { medicationStatusEnum } from "../common/index.js";

// Medication schema
export const medicationSchema = z.object({
  id: uuidSchema,
  name: nameSchema,
  brand: z.string().max(100).nullable().optional(),
  description: descriptionSchema,
  isPrescriptionRequired: booleanSchema,
  isControlledSubstance: booleanSchema,
  status: medicationStatusEnum,
});

// POST /api/medications (batch)
export const createMedicationSchema = z.object({
  name: nameSchema,
  brand: z.string().max(100).optional(),
  description: descriptionSchema,
  is_prescription_required: booleanSchema.default(false),
  is_controlled_substance: booleanSchema.default(false),
  status: medicationStatusEnum.default("active"),
});

export const createMedicationsRequestSchema = z.array(createMedicationSchema);
export const createMedicationsResponseSchema = z.array(medicationSchema);

// GET /api/medications
export const listMedicationsQuerySchema = paginationSchema.extend({
  name: z.string().optional(),
  brand: z.string().optional(),
  status: medicationStatusEnum.optional(),
  isPrescriptionRequired: booleanSchema.optional(),
  isControlledSubstance: booleanSchema.optional(),
});

export const listMedicationsResponseSchema = z.object({
  data: z.array(medicationSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// GET /api/medications/:id
export const getMedicationResponseSchema = medicationSchema;

// PATCH /api/medications/:id
export const updateMedicationRequestSchema = createMedicationSchema.partial();
export const updateMedicationResponseSchema = medicationSchema;

// DELETE /api/medications/:id
export const deleteMedicationResponseSchema = z.object({
  message: z.string(),
});

// GET /api/medications/:id/suppliers
export const getMedicationSuppliersResponseSchema = z.array(z.any());

// GET /api/medications/:id/purchases
export const getMedicationPurchasesResponseSchema = z.array(z.any());

// GET /api/medications/:id/sales
export const getMedicationSalesResponseSchema = z.array(z.any());

// GET /api/medications/:id/inventory
export const getMedicationInventoryResponseSchema = z.array(z.any());

import { z } from "zod";
import {
  nonNegativeIntSchema,
  paginationSchema,
  uuidSchema,
} from "../common/index.js";
// Supplier medication variant schema
export const supplierMedicationVariantSchema = z.object({
  id: uuidSchema,
  supplierId: uuidSchema,
  medicationVariantId: uuidSchema,
  supplierSku: z.string().max(50).nullable().optional(),
  leadTimeDays: nonNegativeIntSchema.nullable().optional(),
  contractId: uuidSchema.nullable().optional(),
});

// POST /api/suppliers/:supplierId/medications (batch)
export const createSupplierMedicationSchema = z.object({
  medication_variant_id: uuidSchema,
  supplier_sku: z.string().max(50).optional(),
  lead_time_days: nonNegativeIntSchema.optional(),
  contract_id: uuidSchema.optional(),
});

export const createSupplierMedicationsRequestSchema = z.array(
  createSupplierMedicationSchema
);
export const createSupplierMedicationsResponseSchema = z.array(
  supplierMedicationVariantSchema
);

// GET /api/suppliers/:supplierId/medications
export const listSupplierMedicationsQuerySchema = paginationSchema;

export const listSupplierMedicationsResponseSchema = z.object({
  data: z.array(supplierMedicationVariantSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

// PATCH /api/suppliers/:supplierId/medications/:id
export const updateSupplierMedicationRequestSchema =
  createSupplierMedicationSchema.partial();
export const updateSupplierMedicationResponseSchema =
  supplierMedicationVariantSchema;

// DELETE /api/suppliers/:supplierId/medications/:id
export const deleteSupplierMedicationResponseSchema = z.object({
  message: z.string(),
});

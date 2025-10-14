import { z } from "zod";
import {
  uuidSchema,
  nonNegativeIntSchema,
  paginationSchema,
} from "../common/index.js";

// Supplier medication variant schema
export const supplierMedicationVariantSchema = z.object({
  id: uuidSchema,
  supplierId: uuidSchema,
  medicationVariantId: uuidSchema,
  supplierSku: z.string().max(50).nullable().optional(),
  leadTimeDays: nonNegativeIntSchema.nullable().optional(),
});

// POST /api/suppliers/:supplierId/medications (batch)
export const createSupplierMedicationVariantSchema = z.object({
  // Frontend gửi `medicationVariantId` là number
  medicationVariantId: z.number().int().positive(),

  // Frontend gửi `supplierSku` là string | null
  supplierSku: z.string().nullable().optional(),

  // Frontend gửi `leadTimeDays` là number | null
  leadTimeDays: z.number().int().positive().nullable().optional(),
});

export const createSupplierMedicationsRequestSchema = z.array(
  createSupplierMedicationVariantSchema
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
  createSupplierMedicationVariantSchema.partial();
export const updateSupplierMedicationResponseSchema =
  supplierMedicationVariantSchema;

// DELETE /api/suppliers/:supplierId/medications/:id
export const deleteSupplierMedicationResponseSchema = z.object({
  message: z.string(),
});

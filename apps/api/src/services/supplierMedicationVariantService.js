import { and, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";

export const supplierMedicationVariantService = {
  // Create a new supplier medication variant
  async create(data) {
    const [smv] = await db
      .insert(supplierMedicationVariants)
      .values(data)
      .returning();
    return smv;
  },

  // Get all supplier medication variants with optional filtering
  async getAll(filters = {}) {
    const {
      supplierId,
      medicationVariantId,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: supplierMedicationVariants.id,
        supplierId: supplierMedicationVariants.supplierId,
        medicationVariantId: supplierMedicationVariants.medicationVariantId,
        supplierSku: supplierMedicationVariants.supplierSku,
        leadTimeDays: supplierMedicationVariants.leadTimeDays,
        supplierName: suppliers.name,
        purchasePrice: supplierMedicationVariants.purchasePrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(supplierMedicationVariants)
      .leftJoin(
        suppliers,
        eq(supplierMedicationVariants.supplierId, suppliers.id)
      )
      .leftJoin(
        medicationVariants,
        eq(
          supplierMedicationVariants.medicationVariantId,
          medicationVariants.id
        )
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      );

    const conditions = [];

    if (supplierId) {
      conditions.push(eq(supplierMedicationVariants.supplierId, supplierId));
    }

    if (medicationVariantId) {
      conditions.push(
        eq(supplierMedicationVariants.medicationVariantId, medicationVariantId)
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  // Get supplier medication variant by ID
  async getById(id) {
    const [smv] = await db
      .select({
        id: supplierMedicationVariants.id,
        supplierId: supplierMedicationVariants.supplierId,
        medicationVariantId: supplierMedicationVariants.medicationVariantId,
        supplierSku: supplierMedicationVariants.supplierSku,
        leadTimeDays: supplierMedicationVariants.leadTimeDays,
        supplierName: suppliers.name,
        purchasePrice: supplierMedicationVariants.purchasePrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(supplierMedicationVariants)
      .leftJoin(
        suppliers,
        eq(supplierMedicationVariants.supplierId, suppliers.id)
      )
      .leftJoin(
        medicationVariants,
        eq(
          supplierMedicationVariants.medicationVariantId,
          medicationVariants.id
        )
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(eq(supplierMedicationVariants.id, id));
    return smv;
  },

  // Update supplier medication variant
  async update(id, data) {
    const [smv] = await db
      .update(supplierMedicationVariants)
      .set(data)
      .where(eq(supplierMedicationVariants.id, id))
      .returning();
    return smv;
  },

  // Delete supplier medication variant
  async delete(id) {
    const [smv] = await db
      .delete(supplierMedicationVariants)
      .where(eq(supplierMedicationVariants.id, id))
      .returning();
    return smv;
  },
};

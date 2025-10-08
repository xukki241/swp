import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";

export const supplierService = {
  async create(supplierData) {
    const { medicationVariants: variants, ...supplierInfo } = supplierData;

    return await db.transaction(async (tx) => {
      // ✅ Tạo supplier
      const [supplier] = await tx
        .insert(suppliers)
        .values(supplierInfo)
        .returning();

      // ✅ Nếu có danh sách thuốc, insert liên kết
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantsToInsert = variants.map((variant) => ({
          supplierId: supplier.id,
          medicationVariantId: Number(variant.medicationVariantId),
          supplierSku: variant.supplierSku,
          leadTimeDays: Number(variant.leadTimeDays),
        }));

        await tx.insert(supplierMedicationVariants).values(variantsToInsert);
      }

      // ✅ Trả về supplier cùng danh sách thuốc
      const result = await tx
        .select({
          id: suppliers.id,
          name: suppliers.name,
          contactName: suppliers.contactName,
          email: suppliers.email,
          phone: suppliers.phone,
          address: suppliers.address,
          status: suppliers.status,
        })
        .from(suppliers)
        .where(eq(suppliers.id, supplier.id));

      const supplierVariants = await tx
        .select({
          id: supplierMedicationVariants.id,
          medicationVariantId: supplierMedicationVariants.medicationVariantId,
          supplierSku: supplierMedicationVariants.supplierSku,
          leadTimeDays: supplierMedicationVariants.leadTimeDays,
        })
        .from(supplierMedicationVariants)
        .where(eq(supplierMedicationVariants.supplierId, supplier.id));

      return { ...result[0], medicationVariants: supplierVariants };
    });
  },

  async getAll(filters = {}) {
    const { search, status, limit = 100, offset = 0 } = filters;

    let query = db.select().from(suppliers);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(suppliers.name, `%${search}%`),
          ilike(suppliers.contactName, `%${search}%`),
          ilike(suppliers.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(suppliers.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  async getById(id) {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));

    if (!supplier) {
      return null;
    }

    // Get all medication variants for this supplier
    const variants = await db
      .select({
        id: supplierMedicationVariants.id,
        medicationVariantId: supplierMedicationVariants.medicationVariantId,
        supplierSku: supplierMedicationVariants.supplierSku,
        leadTimeDays: supplierMedicationVariants.leadTimeDays,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(supplierMedicationVariants)
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
      .where(eq(supplierMedicationVariants.supplierId, id));

    return {
      ...supplier,
      medicationVariants: variants,
    };
  },

  async update(id, supplierData) {
    const { medicationVariants: variants, ...supplierInfo } = supplierData;

    return await db.transaction(async (tx) => {
      // Update supplier info
      const [supplier] = await tx
        .update(suppliers)
        .set(supplierInfo)
        .where(eq(suppliers.id, id))
        .returning();

      if (!supplier) {
        return null;
      }

      // If medication variants are provided, replace all existing ones
      if (variants && Array.isArray(variants)) {
        // Delete existing variants
        await tx
          .delete(supplierMedicationVariants)
          .where(eq(supplierMedicationVariants.supplierId, id));

        // Insert new variants if any
        if (variants.length > 0) {
          const variantsToInsert = variants.map((variant) => ({
            supplierId: id,
            medicationVariantId: variant.medicationVariantId,
            supplierSku: variant.supplierSku,
            leadTimeDays: variant.leadTimeDays,
          }));

          await tx.insert(supplierMedicationVariants).values(variantsToInsert);
        }
      }

      // Return updated supplier with medication variants
      const [updatedSupplier] = await tx
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, id));

      const updatedVariants = await tx
        .select({
          id: supplierMedicationVariants.id,
          medicationVariantId: supplierMedicationVariants.medicationVariantId,
          supplierSku: supplierMedicationVariants.supplierSku,
          leadTimeDays: supplierMedicationVariants.leadTimeDays,
          medicationName: medications.name,
          variantName: medicationVariants.name,
        })
        .from(supplierMedicationVariants)
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
        .where(eq(supplierMedicationVariants.supplierId, id));

      return {
        ...updatedSupplier,
        medicationVariants: updatedVariants,
      };
    });
  },

  async delete(id) {
    return await db.transaction(async (tx) => {
      // Delete all medication variants first
      await tx
        .delete(supplierMedicationVariants)
        .where(eq(supplierMedicationVariants.supplierId, id));

      // Delete the supplier
      const [supplier] = await tx
        .delete(suppliers)
        .where(eq(suppliers.id, id))
        .returning();
      return supplier;
    });
  },
};

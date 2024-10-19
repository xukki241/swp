import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";

export const supplierService = {
  async create(suppliersData) {
    try {
      return await db.transaction(async (tx) => {
        const createdSuppliers = [];

        for (const supplierData of suppliersData) {
          const { medicationVariants: variants, ...supplierInfo } =
            supplierData;

          const [supplier] = await tx
            .insert(suppliers)
            .values(supplierInfo)
            .returning();

          let supplierVariants = [];

          if (variants && Array.isArray(variants) && variants.length > 0) {
            const variantsToInsert = variants.map((variant) => ({
              supplierId: supplier.id,
              medicationVariantId: variant.medication_variant_id,
              supplierSku: variant.supplier_sku,
              leadTimeDays: variant.lead_time_days
                ? Number(variant.lead_time_days)
                : null,
            }));

            supplierVariants = await tx
              .insert(supplierMedicationVariants)
              .values(variantsToInsert)
              .returning();
          }

          createdSuppliers.push({
            ...supplier,
            medicationVariants: supplierVariants,
          });
        }

        return createdSuppliers;
      });
    } catch (error) {
      console.error("Error creating suppliers:", error.message);
      throw new Error(`Failed to create suppliers: ${error.message}`);
    }
  },

  async getAll(filters = {}) {
    try {
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
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      throw error;
    }
  },

  async getById(id) {
    try {
      const [supplier] = await db
        .select()
        .from(suppliers)
        .where(eq(suppliers.id, id));

      if (!supplier) {
        return null;
      }

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
    } catch (error) {
      console.error(`Loading supplier with ID ${id}:`, error);
      throw error;
    }
  },

  async update(id, supplierData) {
    try {
      const { medicationVariants: variants, ...supplierInfo } = supplierData;

      return await db.transaction(async (tx) => {
        const [supplier] = await tx
          .update(suppliers)
          .set(supplierInfo)
          .where(eq(suppliers.id, id))
          .returning();

        if (!supplier) {
          return null;
        }

        if (Array.isArray(variants)) {
          const existingVariants = await tx
            .select()
            .from(supplierMedicationVariants)
            .where(eq(supplierMedicationVariants.supplierId, id));
          const incomingMedicationVariantIds = new Set(
            variants.map(
              (v) => v.medicationVariantId || v.medication_variant_id
            )
          );

          for (const variant of variants) {
            const variantId =
              variant.medicationVariantId || variant.medication_variant_id;
            const sku = variant.supplierSku || variant.supplier_sku;
            const leadTime = variant.leadTimeDays || variant.lead_time_days;

            if (!variantId) {
              console.warn("⚠️ Skipping variant without ID:", variant);
              continue;
            }

            const existing = existingVariants.find(
              (ev) => ev.medicationVariantId === variantId
            );

            if (existing) {
              await tx
                .update(supplierMedicationVariants)
                .set({
                  supplierSku: sku,
                  leadTimeDays: leadTime,
                })
                .where(eq(supplierMedicationVariants.id, existing.id));
            } else {
              await tx.insert(supplierMedicationVariants).values({
                supplierId: id,
                medicationVariantId: variantId,
                supplierSku: sku,
                leadTimeDays: leadTime,
              });
            }
          }

          for (const old of existingVariants) {
            if (!incomingMedicationVariantIds.has(old.medicationVariantId)) {
              try {
                await tx
                  .delete(supplierMedicationVariants)
                  .where(eq(supplierMedicationVariants.id, old.id));
              } catch (e) {
                console.warn(
                  `⚠️ Variant ${old.id} is in use and cannot be deleted. Error: ${e.message}`
                );
              }
            }
          }
        }

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
    } catch (error) {
      console.error(`Error updating supplier with ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await db.transaction(async (tx) => {
        await tx
          .delete(supplierMedicationVariants)
          .where(eq(supplierMedicationVariants.supplierId, id));
        const [supplier] = await tx
          .delete(suppliers)
          .where(eq(suppliers.id, id))
          .returning();
        return supplier;
      });
    } catch (error) {
      console.error(`Error deleting supplier with ID ${id}:`, error);
      throw error;
    }
  },
};

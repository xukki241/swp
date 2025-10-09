import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";

export const supplierService = {
  async create(supplierData) {
    try {
      const { medicationVariants: variants, ...supplierInfo } = supplierData;

      return await db.transaction(async (tx) => {
        // ✅ Tạo nhà cung cấp
        const [supplier] = await tx
          .insert(suppliers)
          .values(supplierInfo)
          .returning();

        // ✅ Nếu có danh sách thuốc, hãy chèn liên kết
        if (variants && Array.isArray(variants) && variants.length > 0) {
          const variantsToInsert = variants.map((variant) => ({
            supplierId: supplier.id,
            medicationVariantId: Number(variant.medicationVariantId),
            supplierSku: variant.supplierSku,
            leadTimeDays: Number(variant.leadTimeDays),
          }));

          await tx.insert(supplierMedicationVariants).values(variantsToInsert);
        }

        // ✅ Trả lại nhà cung cấp cùng với danh sách thuốc
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
    } catch (error) {
      console.error("Lỗi khi tạo nhà cung cấp:", error.message);
      throw error;
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
      console.error("Lỗi khi lấy tất cả nhà cung cấp:", error);
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

      // Lấy tất cả các biến thể thuốc cho nhà cung cấp này
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
      console.error(`Lỗi khi lấy nhà cung cấp theo ID ${id}:`, error);
      throw error;
    }
  },

  async update(id, supplierData) {
    try {
      const { medicationVariants: variants, ...supplierInfo } = supplierData;

      return await db.transaction(async (tx) => {
        // Cập nhật thông tin nhà cung cấp
        const [supplier] = await tx
          .update(suppliers)
          .set(supplierInfo)
          .where(eq(suppliers.id, id))
          .returning();

        if (!supplier) {
          return null;
        }

        // Nếu các biến thể thuốc được cung cấp, hãy thay thế tất cả các biến thể hiện có
        if (variants && Array.isArray(variants)) {
          // Xóa các biến thể hiện có
          await tx
            .delete(supplierMedicationVariants)
            .where(eq(supplierMedicationVariants.supplierId, id));

          // Chèn các biến thể mới nếu có
          if (variants.length > 0) {
            const variantsToInsert = variants.map((variant) => ({
              supplierId: id,
              medicationVariantId: variant.medicationVariantId,
              supplierSku: variant.supplierSku,
              leadTimeDays: variant.leadTimeDays,
            }));

            await tx
              .insert(supplierMedicationVariants)
              .values(variantsToInsert);
          }
        }

        // Trả lại nhà cung cấp đã cập nhật với các biến thể thuốc
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
      console.error(`Lỗi khi cập nhật nhà cung cấp có ID ${id}:`, error);
      throw error;
    }
  },

  async delete(id) {
    try {
      return await db.transaction(async (tx) => {
        // Xóa tất cả các biến thể thuốc trước
        await tx
          .delete(supplierMedicationVariants)
          .where(eq(supplierMedicationVariants.supplierId, id));

        // Xóa nhà cung cấp
        const [supplier] = await tx
          .delete(suppliers)
          .where(eq(suppliers.id, id))
          .returning();
        return supplier;
      });
    } catch (error) {
      console.error(`Lỗi khi xóa nhà cung cấp có ID ${id}:`, error);
      throw error;
    }
  },
};

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
        // ✅ 1. Cập nhật thông tin nhà cung cấp
        const [supplier] = await tx
          .update(suppliers)
          .set(supplierInfo)
          .where(eq(suppliers.id, id))
          .returning();

        if (!supplier) {
          return null;
        }

        // ✅ 2. Nếu có danh sách thuốc kèm theo, thực hiện logic UPSERT
        if (Array.isArray(variants)) {
          // Lấy danh sách thuốc hiện có của nhà cung cấp này
          const existingVariants = await tx
            .select()
            .from(supplierMedicationVariants)
            .where(eq(supplierMedicationVariants.supplierId, id));

          const incomingMedicationVariantIds = new Set(
            variants.map((v) => v.medicationVariantId)
          );

          // === PHẦN LOGIC ĐƯỢC THAY ĐỔI ===
          // Vòng lặp qua danh sách thuốc gửi lên từ frontend
          for (const variant of variants) {
            // Tìm xem thuốc này đã tồn tại trong DB cho nhà cung cấp này chưa
            const existing = existingVariants.find(
              (ev) => ev.medicationVariantId === variant.medicationVariantId
            );

            if (existing) {
              // Nếu ĐÃ TỒN TẠI -> Cập nhật thông tin (SKU, thời gian giao hàng)
              await tx
                .update(supplierMedicationVariants)
                .set({
                  supplierSku: variant.supplierSku,
                  leadTimeDays: variant.leadTimeDays,
                })
                .where(eq(supplierMedicationVariants.id, existing.id));
            } else {
              // Nếu CHƯA TỒN TẠI -> Thêm mới bản ghi liên kết
              await tx.insert(supplierMedicationVariants).values({
                supplierId: id,
                medicationVariantId: variant.medicationVariantId,
                supplierSku: variant.supplierSku,
                leadTimeDays: variant.leadTimeDays,
              });
            }
          }
          // === KẾT THÚC PHẦN THAY ĐỔI ===

          // 🔻 Xóa những variant không còn trong danh sách mới
          for (const old of existingVariants) {
            if (!incomingMedicationVariantIds.has(old.medicationVariantId)) {
              // Giữ lại logic xóa cũ của bạn vì nó đã xử lý trường hợp thuốc đang được sử dụng
              try {
                await tx
                  .delete(supplierMedicationVariants)
                  .where(eq(supplierMedicationVariants.id, old.id));
              } catch (e) {
                console.warn(
                  `⚠️ Variant ${old.id} đang được sử dụng và không thể xóa. Lỗi: ${e.message}`
                );
              }
            }
          }
        }

        // ✅ 3. Trả lại supplier đã cập nhật (giữ nguyên)
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

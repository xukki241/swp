import { and, eq, ilike, ne, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { files } from "../db/schema/files.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";

export const supplierService = {
  async create(suppliersArray) {
    if (!Array.isArray(suppliersArray)) {
      throw new Error("Payload must be an array of suppliers.");
    }

    const results = [];
    for (const supplierData of suppliersArray) {
      const validationErrors = [];
      const {
        name,
        email,
        contactName,
        phone,
        address,
        status,
        medicationVariants: variantsToCreate,
      } = supplierData;

      if (name !== undefined && !name.trim()) {
        validationErrors.push("Supplier name cannot be empty.");
      }
      if (email !== undefined) {
        if (!email.trim()) {
          validationErrors.push("Email is required.");
        } else if (!/\S+@\S+\.\S+/.test(email)) {
          validationErrors.push("Email format is invalid.");
        }
      }
      if (phone !== undefined && !phone.trim()) {
        validationErrors.push("Phone number is required.");
      }
      if (address !== undefined && !address.trim()) {
        validationErrors.push("Address is required.");
      }
      if (variantsToCreate && Array.isArray(variantsToCreate)) {
        for (const [vIndex, variant] of variantsToCreate.entries()) {
          if (
            variant.medication_variant_id !== undefined &&
            !variant.medication_variant_id
          ) {
            validationErrors.push(
              `Medication #${vIndex + 1}: Medication Variant must be selected.`
            );
          }
          if (
            variant.supplier_sku !== undefined &&
            !variant.supplier_sku.trim()
          ) {
            validationErrors.push(
              `Medication #${vIndex + 1}: Supplier SKU is required.`
            );
          }
        }
      }

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join("\n"));
      }

      try {
        if (email) {
          const existingSupplier = await db.query.suppliers.findFirst({
            where: eq(suppliers.email, email.trim()),
          });
          if (existingSupplier) {
            throw new Error("Supplier with this email already exists.");
          }
        }
        if (phone) {
          const existingSupplier = await db.query.suppliers.findFirst({
            where: eq(suppliers.phone, phone.trim()),
          });
          if (existingSupplier) {
            throw new Error("Supplier with this phone number already exists.");
          }
        }
        // Create supplier
        const [newSupplier] = await db
          .insert(suppliers)
          .values({
            name: name?.trim() ?? "",
            contactName: contactName?.trim() ?? "",
            email: email?.trim() ?? "",
            phone: phone?.trim() ?? "",
            address: address?.trim() ?? "",
            status: status || "active",
          })
          .returning();

        // Create medication variants if any
        if (
          variantsToCreate &&
          Array.isArray(variantsToCreate) &&
          variantsToCreate.length > 0
        ) {
          const variantsToInsert = variantsToCreate.map((variant) => ({
            supplierId: newSupplier.id,
            medicationVariantId: variant.medication_variant_id,
            supplierSku: variant.supplier_sku?.trim(),
            leadTimeDays: variant.lead_time_days ?? null,
            purchasePrice: variant.purchase_price,
            contractId: variant.contract_id ?? null,
          }));
          await db.insert(supplierMedicationVariants).values(variantsToInsert);
        }

        results.push(newSupplier);
      } catch (error) {
        throw new Error(error.message || "Failed to create supplier");
      }
    }
    return results;
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
          medicationId: medicationVariants.medicationId,
          medicationName: medications.name,
          purchasePrice: supplierMedicationVariants.purchasePrice,
          contractId: supplierMedicationVariants.contractId,
          contractFilename: files.filename,
          contractFileType: files.fileType,
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
        .leftJoin(files, eq(supplierMedicationVariants.contractId, files.id))
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
    const validationErrors = [];
    const {
      name,
      email,
      phone,
      address,
      status,
      medicationVariants: variantsToUpdate,
    } = supplierData;

    // Validate chỉ khi trường được truyền lên
    if (name !== undefined && !name.trim()) {
      validationErrors.push("Supplier name cannot be empty.");
    }
    if (email !== undefined) {
      if (!email.trim()) {
        validationErrors.push("Email is required.");
      } else if (!/\S+@\S+\.\S+/.test(email)) {
        validationErrors.push("Email format is invalid.");
      }
    }
    if (phone !== undefined && !phone.trim()) {
      validationErrors.push("Phone number is required.");
    }
    if (address !== undefined && !address.trim()) {
      validationErrors.push("Address is required.");
    }
    if (variantsToUpdate && Array.isArray(variantsToUpdate)) {
      for (const [vIndex, variant] of variantsToUpdate.entries()) {
        if (
          variant.medication_variant_id !== undefined &&
          !variant.medication_variant_id
        ) {
          validationErrors.push(
            `Medication #${vIndex + 1}: Medication Variant must be selected.`
          );
        }
        if (
          variant.supplier_sku !== undefined &&
          !variant.supplier_sku.trim()
        ) {
          validationErrors.push(
            `Medication #${vIndex + 1}: Supplier SKU is required.`
          );
        }
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join("\n"));
    }

    try {
      // Kiểm tra supplier tồn tại
      const existingSupplier = await db.query.suppliers.findFirst({
        where: eq(suppliers.id, id),
      });
      if (!existingSupplier) {
        throw new Error("Supplier not found.");
      }

      // Kiểm tra email trùng lặp (nếu email thay đổi)
      if (email && email.trim() !== existingSupplier.email) {
        const emailExists = await db.query.suppliers.findFirst({
          where: eq(suppliers.email, email.trim()),
        });
        if (emailExists) {
          throw new Error("Supplier with this email already exists.");
        }
      }
      if (phone && phone.trim() !== existingSupplier.phone) {
        const phoneExists = await db.query.suppliers.findFirst({
          where: and(
            eq(suppliers.phone, phone.trim()),
            ne(suppliers.id, id) // Đảm bảo không so sánh với chính nó
          ),
        });
        if (phoneExists) {
          throw new Error("Supplier with this phone number already exists.");
        }
      }

      // Update supplier
      const [updatedSupplier] = await db
        .update(suppliers)
        .set({
          name: name?.trim(),
          email: email?.trim(),
          phone: phone?.trim(),
          address: address?.trim(),
          status: status || existingSupplier.status,
        })
        .where(eq(suppliers.id, id))
        .returning();

      // Update medication variants: xóa hết cũ, thêm mới
      if (variantsToUpdate && Array.isArray(variantsToUpdate)) {
        await db
          .delete(supplierMedicationVariants)
          .where(eq(supplierMedicationVariants.supplierId, id));
        if (variantsToUpdate.length > 0) {
          const variantsToInsert = variantsToUpdate.map((variant) => ({
            supplierId: id,
            medicationVariantId: variant.medication_variant_id,
            supplierSku: variant.supplier_sku?.trim(),
            leadTimeDays: variant.lead_time_days ?? null,
            purchasePrice: variant.purchase_price,
            contractId: variant.contract_id ?? null,
          }));
          await db.insert(supplierMedicationVariants).values(variantsToInsert);
        }
      }

      return updatedSupplier;
    } catch (error) {
      throw new Error(error.message || "Failed to update supplier");
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

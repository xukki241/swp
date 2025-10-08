import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";

export const purchaseOrderItemService = {
  // Create a new purchase order item
  async create(data) {
    const [item] = await db.insert(purchaseOrderItems).values(data).returning();
    return item;
  },

  // Get all purchase order items with optional filtering
  async getAll(filters = {}) {
    const { purchaseOrderId, limit = 100, offset = 0 } = filters;

    let query = db
      .select({
        id: purchaseOrderItems.id,
        purchaseOrderId: purchaseOrderItems.purchaseOrderId,
        supplierMedicationVariantId:
          purchaseOrderItems.supplierMedicationVariantId,
        quantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        totalPrice: purchaseOrderItems.totalPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderItems)
      .leftJoin(
        supplierMedicationVariants,
        eq(
          purchaseOrderItems.supplierMedicationVariantId,
          supplierMedicationVariants.id
        )
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

    if (purchaseOrderId) {
      query = query.where(
        eq(purchaseOrderItems.purchaseOrderId, purchaseOrderId)
      );
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  // Get purchase order item by ID
  async getById(id) {
    const [item] = await db
      .select({
        id: purchaseOrderItems.id,
        purchaseOrderId: purchaseOrderItems.purchaseOrderId,
        supplierMedicationVariantId:
          purchaseOrderItems.supplierMedicationVariantId,
        quantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        totalPrice: purchaseOrderItems.totalPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderItems)
      .leftJoin(
        supplierMedicationVariants,
        eq(
          purchaseOrderItems.supplierMedicationVariantId,
          supplierMedicationVariants.id
        )
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
      .where(eq(purchaseOrderItems.id, id));
    return item;
  },

  // Update purchase order item
  async update(id, data) {
    const [item] = await db
      .update(purchaseOrderItems)
      .set(data)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return item;
  },

  // Delete purchase order item
  async delete(id) {
    const [item] = await db
      .delete(purchaseOrderItems)
      .where(eq(purchaseOrderItems.id, id))
      .returning();
    return item;
  },
};

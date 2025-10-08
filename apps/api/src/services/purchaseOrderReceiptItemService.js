import { eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { purchaseOrderReceiptItems } from "../db/schema/purchaseOrderReceiptItems.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";

export const purchaseOrderReceiptItemService = {
  // Create a new purchase order receipt item
  async create(data) {
    const [item] = await db
      .insert(purchaseOrderReceiptItems)
      .values(data)
      .returning();
    return item;
  },

  // Get all purchase order receipt items with optional filtering
  async getAll(filters = {}) {
    const { purchaseOrderReceiptId, limit = 100, offset = 0 } = filters;

    let query = db
      .select({
        id: purchaseOrderReceiptItems.id,
        purchaseOrderReceiptId:
          purchaseOrderReceiptItems.purchaseOrderReceiptId,
        purchaseOrderItemId: purchaseOrderReceiptItems.purchaseOrderItemId,
        quantity: purchaseOrderReceiptItems.quantity,
        orderedQuantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderReceiptItems)
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderReceiptItems.purchaseOrderItemId, purchaseOrderItems.id)
      )
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

    if (purchaseOrderReceiptId) {
      query = query.where(
        eq(
          purchaseOrderReceiptItems.purchaseOrderReceiptId,
          purchaseOrderReceiptId
        )
      );
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  // Get purchase order receipt item by ID
  async getById(id) {
    const [item] = await db
      .select({
        id: purchaseOrderReceiptItems.id,
        purchaseOrderReceiptId:
          purchaseOrderReceiptItems.purchaseOrderReceiptId,
        purchaseOrderItemId: purchaseOrderReceiptItems.purchaseOrderItemId,
        quantity: purchaseOrderReceiptItems.quantity,
        orderedQuantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderReceiptItems)
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderReceiptItems.purchaseOrderItemId, purchaseOrderItems.id)
      )
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
      .where(eq(purchaseOrderReceiptItems.id, id));
    return item;
  },

  // Update purchase order receipt item
  async update(id, data) {
    const [item] = await db
      .update(purchaseOrderReceiptItems)
      .set(data)
      .where(eq(purchaseOrderReceiptItems.id, id))
      .returning();
    return item;
  },

  // Delete purchase order receipt item
  async delete(id) {
    const [item] = await db
      .delete(purchaseOrderReceiptItems)
      .where(eq(purchaseOrderReceiptItems.id, id))
      .returning();
    return item;
  },
};

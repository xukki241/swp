import { eq, and, gte, lte } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";

export const purchaseOrderService = {
  // Create a new purchase order with items
  async create(data) {
    return await db.transaction(async (tx) => {
      const { items, ...poData } = data;

      // Create purchase order
      const [po] = await tx
        .insert(purchaseOrders)
        .values({
          ...poData,
          orderDate: poData.orderDate ? new Date(poData.orderDate) : new Date(),
          expectedDate: poData.expectedDate
            ? new Date(poData.expectedDate)
            : null,
        })
        .returning();

      // Create items if provided
      let createdItems = [];
      if (items && Array.isArray(items) && items.length > 0) {
        const itemsToCreate = items.map((item) => ({
          ...item,
          purchaseOrderId: po.id,
        }));
        createdItems = await tx
          .insert(purchaseOrderItems)
          .values(itemsToCreate)
          .returning();
      }

      return {
        ...po,
        items: createdItems,
      };
    });
  },

  // Get all purchase orders with optional filtering
  async getAll(filters = {}) {
    const {
      supplierId,
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        createdBy: purchaseOrders.createdBy,
        supplierName: suppliers.name,
        createdByName: users.name,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(users, eq(purchaseOrders.createdBy, users.id));

    const conditions = [];

    if (supplierId) {
      conditions.push(eq(purchaseOrders.supplierId, supplierId));
    }

    if (status) {
      conditions.push(eq(purchaseOrders.status, status));
    }

    if (startDate) {
      conditions.push(gte(purchaseOrders.orderDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(purchaseOrders.orderDate, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  // Get purchase order by ID with items
  async getById(id) {
    const [po] = await db
      .select({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        createdBy: purchaseOrders.createdBy,
        supplierName: suppliers.name,
        createdByName: users.name,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
      .where(eq(purchaseOrders.id, id));

    if (!po) {
      return null;
    }

    // Fetch items for this purchase order
    const items = await db
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
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return {
      ...po,
      items,
    };
  },

  // Update purchase order with optional items
  async update(id, data) {
    return await db.transaction(async (tx) => {
      const { items, ...poData } = data;

      // Update purchase order
      const [po] = await tx
        .update(purchaseOrders)
        .set(poData)
        .where(eq(purchaseOrders.id, id))
        .returning();

      if (!po) {
        return null;
      }

      // If items are provided, replace existing ones
      let updatedItems = [];
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx
          .delete(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, id));

        // Create new items
        if (items.length > 0) {
          const itemsToCreate = items.map((item) => ({
            ...item,
            purchaseOrderId: po.id,
          }));
          updatedItems = await tx
            .insert(purchaseOrderItems)
            .values(itemsToCreate)
            .returning();
        }
      } else {
        // If no items provided, fetch existing ones
        updatedItems = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, id));
      }

      return {
        ...po,
        items: updatedItems,
      };
    });
  },

  // Delete purchase order
  async delete(id) {
    const [po] = await db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return po;
  },
};

import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { purchaseOrderReceiptItems } from "../db/schema/purchaseOrderReceiptItems.js";
import { purchaseOrderReceipts } from "../db/schema/purchaseOrderReceipts.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";
import logger from "../utils/logger.js";

export const purchaseOrderReceiptService = {
  // Create a new purchase order receipt with items
  async create(data) {
    logger.info("purchaseOrderReceiptService.create called with:", {
      data,
      dataKeys: Object.keys(data),
      receivedDate: data.receivedDate,
      receivedDateType: typeof data.receivedDate,
      receivedBy: data.receivedBy,
      purchaseOrderId: data.purchaseOrderId,
    });

    return await db.transaction(async (tx) => {
      const { items, ...receiptData } = data;

      // Convert receivedDate string to Date object if needed
      if (
        receiptData.receivedDate &&
        typeof receiptData.receivedDate === "string"
      ) {
        receiptData.receivedDate = new Date(receiptData.receivedDate);
        logger.info("Converted receivedDate to Date object:", {
          original: data.receivedDate,
          converted: receiptData.receivedDate,
          type: typeof receiptData.receivedDate,
        });
      }

      logger.info("Inserting receipt with data:", {
        receiptData,
        receiptDataKeys: Object.keys(receiptData),
        receivedDateFinal: receiptData.receivedDate,
        receivedDateType: typeof receiptData.receivedDate,
      });

      // Create purchase order receipt
      const [receipt] = await tx
        .insert(purchaseOrderReceipts)
        .values(receiptData)
        .returning();

      // Create items if provided
      let createdItems = [];
      if (items && Array.isArray(items) && items.length > 0) {
        const itemsToCreate = items.map((item) => ({
          ...item,
          purchaseOrderReceiptId: receipt.id,
        }));
        createdItems = await tx
          .insert(purchaseOrderReceiptItems)
          .values(itemsToCreate)
          .returning();
      }

      return {
        ...receipt,
        items: createdItems,
      };
    });
  },

  // Get all purchase order receipts with optional filtering
  async getAll(filters = {}) {
    const {
      purchaseOrderId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: purchaseOrderReceipts.id,
        purchaseOrderId: purchaseOrderReceipts.purchaseOrderId,
        receivedDate: purchaseOrderReceipts.receivedDate,
        receivedBy: purchaseOrderReceipts.receivedBy,
        receivedByName: users.name,
        poOrderDate: purchaseOrders.orderDate,
        poStatus: purchaseOrders.status,
        supplierName: suppliers.name,
      })
      .from(purchaseOrderReceipts)
      .leftJoin(
        purchaseOrders,
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrders.id)
      )
      .leftJoin(users, eq(purchaseOrderReceipts.receivedBy, users.id))
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id));

    const conditions = [];

    if (purchaseOrderId) {
      conditions.push(
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrderId)
      );
    }

    if (startDate) {
      conditions.push(
        gte(purchaseOrderReceipts.receivedDate, new Date(startDate))
      );
    }

    if (endDate) {
      conditions.push(
        lte(purchaseOrderReceipts.receivedDate, new Date(endDate))
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Calculate total amount for each receipt
    const receiptsWithTotals = await Promise.all(
      results.map(async (receipt) => {
        const items = await db
          .select({
            quantity: purchaseOrderReceiptItems.quantity,
            unitPrice: purchaseOrderItems.unitPrice,
          })
          .from(purchaseOrderReceiptItems)
          .leftJoin(
            purchaseOrderItems,
            eq(
              purchaseOrderReceiptItems.purchaseOrderItemId,
              purchaseOrderItems.id
            )
          )
          .where(
            eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, receipt.id)
          );

        const totalAmount = items.reduce(
          (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
          0
        );

        return {
          ...receipt,
          totalAmount,
        };
      })
    );

    return receiptsWithTotals;
  },

  // Get purchase order receipt by ID with items
  async getById(id) {
    const [receipt] = await db
      .select({
        id: purchaseOrderReceipts.id,
        purchaseOrderId: purchaseOrderReceipts.purchaseOrderId,
        receivedDate: purchaseOrderReceipts.receivedDate,
        receivedBy: purchaseOrderReceipts.receivedBy,
        receivedByName: users.name,
        poOrderDate: purchaseOrders.orderDate,
        poStatus: purchaseOrders.status,
        supplierName: suppliers.name,
      })
      .from(purchaseOrderReceipts)
      .leftJoin(
        purchaseOrders,
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrders.id)
      )
      .leftJoin(users, eq(purchaseOrderReceipts.receivedBy, users.id))
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrderReceipts.id, id));

    if (!receipt) {
      return null;
    }

    // Fetch items for this purchase order receipt
    const items = await db
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
      .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));

    return {
      ...receipt,
      items,
    };
  },

  // Update purchase order receipt with optional items
  async update(id, data) {
    return await db.transaction(async (tx) => {
      const { items, ...receiptData } = data;

      // Update purchase order receipt
      const [receipt] = await tx
        .update(purchaseOrderReceipts)
        .set(receiptData)
        .where(eq(purchaseOrderReceipts.id, id))
        .returning();

      if (!receipt) {
        return null;
      }

      // If items are provided, replace existing ones
      let updatedItems = [];
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx
          .delete(purchaseOrderReceiptItems)
          .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));

        // Create new items
        if (items.length > 0) {
          const itemsToCreate = items.map((item) => ({
            ...item,
            purchaseOrderReceiptId: receipt.id,
          }));
          updatedItems = await tx
            .insert(purchaseOrderReceiptItems)
            .values(itemsToCreate)
            .returning();
        }
      } else {
        // If no items provided, fetch existing ones
        updatedItems = await tx
          .select()
          .from(purchaseOrderReceiptItems)
          .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));
      }

      return {
        ...receipt,
        items: updatedItems,
      };
    });
  },

  // Delete purchase order receipt
  async delete(id) {
    const [receipt] = await db
      .delete(purchaseOrderReceipts)
      .where(eq(purchaseOrderReceipts.id, id))
      .returning();
    return receipt;
  },
};

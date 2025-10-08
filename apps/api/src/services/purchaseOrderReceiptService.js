import { eq, gte, lte, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { purchaseOrderReceipts } from "../db/schema/purchaseOrderReceipts.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";

export const purchaseOrderReceiptService = {
  // Create a new purchase order receipt
  async create(data) {
    const [receipt] = await db
      .insert(purchaseOrderReceipts)
      .values(data)
      .returning();
    return receipt;
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
    return results;
  },

  // Get purchase order receipt by ID
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
    return receipt;
  },

  // Update purchase order receipt
  async update(id, data) {
    const [receipt] = await db
      .update(purchaseOrderReceipts)
      .set(data)
      .where(eq(purchaseOrderReceipts.id, id))
      .returning();
    return receipt;
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

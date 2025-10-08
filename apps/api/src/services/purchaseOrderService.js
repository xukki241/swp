import { eq, and, gte, lte } from "drizzle-orm";

import { db } from "../db/index.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";

export const purchaseOrderService = {
  // Create a new purchase order
  async create(data) {
    const [po] = await db.insert(purchaseOrders).values(data).returning();
    return po;
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

  // Get purchase order by ID
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
    return po;
  },

  // Update purchase order
  async update(id, data) {
    const [po] = await db
      .update(purchaseOrders)
      .set(data)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return po;
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

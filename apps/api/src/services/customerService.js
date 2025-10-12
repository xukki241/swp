import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { customers } from "../db/schema/customers.js";
import { salesOrders } from "../db/schema/salesOrders.js";

export const customerService = {
  /**
   * Create a new customer (single or batch)
   */
  async create(customerData) {
    // Support single object or array for batch creation
    if (Array.isArray(customerData)) {
      if (customerData.length === 0) {
        return [];
      }
      const results = await db
        .insert(customers)
        .values(customerData)
        .returning();
      return results;
    }

    const [customer] = await db
      .insert(customers)
      .values(customerData)
      .returning();

    return customer;
  },

  /**
   * Get all customers with optional filtering
   */
  async getAll(filters = {}) {
    const { search, limit = 100, offset = 0 } = filters;

    let query = db.select().from(customers);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(customers.name, `%${search}%`),
          ilike(customers.email, `%${search}%`),
          ilike(customers.phone, `%${search}%`)
        )
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  /**
   * Get customer by ID
   */
  async getById(id) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.id, id));

    if (!customer) {
      return null;
    }

    // Get customer's sales orders
    const orders = await db
      .select({
        id: salesOrders.id,
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
        paymentMethod: salesOrders.paymentMethod,
      })
      .from(salesOrders)
      .where(eq(salesOrders.customerId, id))
      .orderBy(salesOrders.orderDate);

    return {
      ...customer,
      orders,
    };
  },

  /**
   * Get customer by email
   */
  async getByEmail(email) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.email, email));

    return customer;
  },

  /**
   * Get customer by phone
   */
  async getByPhone(phone) {
    const [customer] = await db
      .select()
      .from(customers)
      .where(eq(customers.phone, phone));

    return customer;
  },

  /**
   * Update customer
   */
  async update(id, customerData) {
    const [customer] = await db
      .update(customers)
      .set(customerData)
      .where(eq(customers.id, id))
      .returning();

    return customer;
  },

  /**
   * Delete customer
   */
  async delete(id) {
    // Check if customer has sales orders
    const orders = await db
      .select()
      .from(salesOrders)
      .where(eq(salesOrders.customerId, id));

    if (orders.length > 0) {
      throw new Error(
        `Cannot delete customer. They have ${orders.length} sales order(s) associated with them.`
      );
    }

    const [customer] = await db
      .delete(customers)
      .where(eq(customers.id, id))
      .returning();

    return customer;
  },
};

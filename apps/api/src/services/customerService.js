import { and, eq, ilike, or } from "drizzle-orm";

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

    const results = await db.query.customers.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      limit,
      offset,
    });

    return results;
  },

  /**
   * Get customer by ID
   */
  async getById(id) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.id, id),
      with: {
        orders: {
          orderBy: (orders, { asc }) => [asc(orders.orderDate)],
        },
      },
    });

    return customer;
  },

  /**
   * Get customer by email
   */
  async getByEmail(email) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.email, email),
      with: {
        orders: {
          orderBy: (orders, { asc }) => [asc(orders.orderDate)],
        },
      },
    });

    return customer;
  },

  /**
   * Get customer by phone
   */
  async getByPhone(phone) {
    const customer = await db.query.customers.findFirst({
      where: eq(customers.phone, phone),
      with: {
        orders: {
          orderBy: (orders, { asc }) => [asc(orders.orderDate)],
        },
      },
    });

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
    // Check if customer has sales orders using db.query API
    const orders = await db.query.salesOrders.findMany({
      where: eq(salesOrders.customerId, id),
      columns: {
        id: true,
      },
    });

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

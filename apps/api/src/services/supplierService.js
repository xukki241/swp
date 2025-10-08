import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { suppliers } from "../db/schema/suppliers.js";
export const supplierService = {
  // Create a new supplier
  async create(supplierData) {
    const [supplier] = await db
      .insert(suppliers)
      .values(supplierData)
      .returning();
    return supplier;
  },

  // Get all suppliers with optional filtering
  async getAll(filters = {}) {
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
  },

  // Get supplier by ID
  async getById(id) {
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, id));
    return supplier;
  },

  // Update supplier
  async update(id, supplierData) {
    const [supplier] = await db
      .update(suppliers)
      .set(supplierData)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  },

  // Delete supplier
  async delete(id) {
    const [supplier] = await db
      .delete(suppliers)
      .where(eq(suppliers.id, id))
      .returning();
    return supplier;
  },
};

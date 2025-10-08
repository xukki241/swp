import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/index.js";
/**
 * Get all medications with optional search and filters
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name or brand
 * @param {string} options.status - Filter by status
 * @returns {Promise<Array>} List of medications
 */
export const getAllMedications = async ({ search, status } = {}) => {
  try {
    let query = db.select().from(medications);
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(medications.name, `%${search}%`),
          ilike(medications.brand, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(medications.status, status));
    }
    if (conditions.length > 0) {
      query = query.where(
        conditions.length > 1 ? and(...conditions) : conditions[0]
      );
    }
    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch medications: ${error.message}`);
  }
};
/**
 * Get medication by ID
 * @param {bigint} id - Medication ID
 * @returns {Promise<Object|null>} Medication object or null
 */
export const getMedicationById = async (id) => {
  try {
    const result = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch medication: ${error.message}`);
  }
};

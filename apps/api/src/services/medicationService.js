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
/**
 * Create a new medication
 * @param {Object} medicationData - Medication data
 * @returns {Promise<Object>} Created medication
 */
export const createMedication = async (medicationData) => {
  try {
    const result = await db
      .insert(medications)
      .values(medicationData)
      .returning();
    return result[0];
  } catch (error) {
    throw new Error(`Failed to create medication: ${error.message}`);
  }
};
/**
 * Update medication by ID
 * @param {bigint} id - Medication ID
 * @param {Object} medicationData - Medication data to update
 * @returns {Promise<Object|null>} Updated medication or null
 */
export const updateMedication = async (id, medicationData) => {
  try {
    const result = await db
      .update(medications)
      .set(medicationData)
      .where(eq(medications.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to update medication: ${error.message}`);
  }
};
/**
 * Delete medication by ID
 * @param {bigint} id - Medication ID
 * @returns {Promise<Object|null>} Deleted medication or null
 */
export const deleteMedication = async (id) => {
  try {
    const result = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete medication: ${error.message}`);
  }
};

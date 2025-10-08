import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medicationVariants } from "../db/schema/index.js";
/**
 * Get all medication variants with optional search and filters
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, sku, or barcode
 * @param {bigint} options.medicationId - Filter by medication ID
 * @param {boolean} options.isActive - Filter by active status
 * @returns {Promise<Array>} List of medication variants
 */
export const getAllMedicationVariants = async ({
  search,
  medicationId,
  isActive,
} = {}) => {
  try {
    let query = db.select().from(medicationVariants);
    const conditions = [];
    if (search) {
      conditions.push(
        or(
          ilike(medicationVariants.name, `%${search}%`),
          ilike(medicationVariants.sku, `%${search}%`),
          ilike(medicationVariants.barcode, `%${search}%`)
        )
      );
    }
    if (medicationId) {
      conditions.push(eq(medicationVariants.medicationId, medicationId));
    }
    if (isActive !== undefined) {
      conditions.push(eq(medicationVariants.isActive, isActive));
    }
    if (conditions.length > 0) {
      query = query.where(
        conditions.length > 1 ? and(...conditions) : conditions[0]
      );
    }
    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch medication variants: ${error.message}`);
  }
};
/**
 * Get medication variant by ID
 * @param {bigint} id - Medication variant ID
 * @returns {Promise<Object|null>} Medication variant object or null
 */
export const getMedicationVariantById = async (id) => {
  try {
    const result = await db
      .select()
      .from(medicationVariants)
      .where(eq(medicationVariants.id, id))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch medication variant: ${error.message}`);
  }
};
/**
 * Get medication variant by SKU
 * @param {string} sku - Medication variant SKU
 * @returns {Promise<Object|null>} Medication variant object or null
 */
export const getMedicationVariantBySku = async (sku) => {
  try {
    const result = await db
      .select()
      .from(medicationVariants)
      .where(eq(medicationVariants.sku, sku))
      .limit(1);
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to fetch medication variant: ${error.message}`);
  }
};

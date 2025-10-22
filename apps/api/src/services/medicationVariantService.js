import { and, eq, ilike, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { medicationVariants } from "../db/schema/index.js";
/**
 * Get all medication variants with optional search and filters
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, sku, or barcode
 * @param {number} options.medicationId - Filter by medication ID
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
 * @param {number} id - Medication variant ID
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
/**
 * Create a new medication variant
 * @param {Object} variantData - Medication variant data
 * @returns {Promise<Object>} Created medication variant
 */
export const createMedicationVariant = async (variantData) => {
  try {
    const result = await db
      .insert(medicationVariants)
      .values(variantData)
      .returning();
    return result[0];
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Medication variant with this SKU already exists");
    }
    throw new Error(`Failed to create medication variant: ${error.message}`);
  }
};
/**
 * Update medication variant by ID
 * @param {number} id - Medication variant ID
 * @param {Object} variantData - Medication variant data to update
 * @returns {Promise<Object|null>} Updated medication variant or null
 */
export const updateMedicationVariant = async (id, variantData) => {
  try {
    const result = await db
      .update(medicationVariants)
      .set(variantData)
      .where(eq(medicationVariants.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    if (error.code === "23505") {
      throw new Error("Medication variant with this SKU already exists");
    }
    throw new Error(`Failed to update medication variant: ${error.message}`);
  }
};
/**
 * Delete medication variant by ID
 * @param {number} id - Medication variant ID
 * @returns {Promise<Object|null>} Deleted medication variant or null
 */
export const deleteMedicationVariant = async (id) => {
  try {
    const result = await db
      .delete(medicationVariants)
      .where(eq(medicationVariants.id, id))
      .returning();
    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete medication variant: ${error.message}`);
  }
};

/**
 * Search medication variants for POS with inventory data
 * @param {Object} options - Query options
 * @param {string} options.search - Search term
 * @returns {Promise<Array>} List of variants with medication name and available quantity
 */
export const searchVariantsForSale = async ({ search } = {}) => {
  try {
    const { medications, inventory } = await import("../db/schema/index.js");
    const { sql } = await import("drizzle-orm");

    const conditions = [
      eq(medicationVariants.isActive, true),
      eq(medicationVariants.isForSale, true),
    ];

    // Add search filter if provided
    if (search) {
      conditions.push(
        or(
          ilike(medicationVariants.name, `%${search}%`),
          ilike(medicationVariants.sku, `%${search}%`),
          ilike(medicationVariants.barcode, `%${search}%`),
          ilike(medications.name, `%${search}%`)
        )
      );
    }

    const query = db
      .select({
        id: medicationVariants.id,
        medicationId: medicationVariants.medicationId,
        medicationName: medications.name,
        variantName: medicationVariants.name,
        sku: medicationVariants.sku,
        barcode: medicationVariants.barcode,
        sellPrice: medicationVariants.sellPrice,
        unit: medicationVariants.unit,
        isActive: medicationVariants.isActive,
        isForSale: medicationVariants.isForSale,
        availableQuantity: sql`COALESCE(SUM(${inventory.quantity} - ${inventory.quantityReserved}), 0)`,
      })
      .from(medicationVariants)
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .leftJoin(
        inventory,
        eq(medicationVariants.id, inventory.medicationVariantId)
      )
      .where(and(...conditions))
      .groupBy(
        medicationVariants.id,
        medicationVariants.medicationId,
        medications.name,
        medicationVariants.name,
        medicationVariants.sku,
        medicationVariants.barcode,
        medicationVariants.sellPrice,
        medicationVariants.unit,
        medicationVariants.isActive,
        medicationVariants.isForSale
      );

    const result = await query;

    // Convert availableQuantity to number explicitly
    return result.map((item) => ({
      ...item,
      availableQuantity: Number(item.availableQuantity) || 0,
    }));
  } catch (error) {
    throw new Error(`Failed to search variants for sale: ${error.message}`);
  }
};

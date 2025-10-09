import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications, medicationVariants } from "../db/schema/index.js";

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
        conditions.length === 1 ? conditions[0] : and(...conditions)
      );
    }

    const result = await query;
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch medications: ${error.message}`);
  }
};

/**
 * Get medication by ID with variants
 * @param {number} id - Medication ID
 * @returns {Promise<Object|null>} Medication object with variants or null
 */
export const getMedicationById = async (id) => {
  try {
    const medication = await db
      .select()
      .from(medications)
      .where(eq(medications.id, id))
      .limit(1);

    if (!medication[0]) {
      return null;
    }

    // Fetch variants for this medication
    const variants = await db
      .select()
      .from(medicationVariants)
      .where(eq(medicationVariants.medicationId, id));

    return {
      ...medication[0],
      variants,
    };
  } catch (error) {
    throw new Error(`Failed to fetch medication: ${error.message}`);
  }
};

/**
 * Create a new medication with optional variants
 * @param {Object} medicationData - Medication data
 * @param {Array} medicationData.variants - Optional array of medication variants
 * @returns {Promise<Object>} Created medication with variants
 */
export const createMedication = async (medicationData) => {
  try {
    return await db.transaction(async (tx) => {
      // Extract variants from medication data
      const { variants, ...medData } = medicationData;

      // Create medication
      const [medication] = await tx
        .insert(medications)
        .values(medData)
        .returning();

      // Create variants if provided
      let createdVariants = [];
      if (variants && Array.isArray(variants) && variants.length > 0) {
        const variantsToCreate = variants.map((variant) => ({
          ...variant,
          medicationId: medication.id,
        }));
        createdVariants = await tx
          .insert(medicationVariants)
          .values(variantsToCreate)
          .returning();
      }

      return {
        ...medication,
        variants: createdVariants,
      };
    });
  } catch (error) {
    throw new Error(`Failed to create medication: ${error.message}`);
  }
};

/**
 * Update medication by ID with optional variants
 * @param {number} id - Medication ID
 * @param {Object} medicationData - Medication data to update
 * @param {Array} medicationData.variants - Optional array of medication variants to replace existing ones
 * @returns {Promise<Object|null>} Updated medication with variants or null
 */
export const updateMedication = async (id, medicationData) => {
  try {
    return await db.transaction(async (tx) => {
      const { variants, ...medData } = medicationData;

      // Update medication
      const [medication] = await tx
        .update(medications)
        .set(medData)
        .where(eq(medications.id, id))
        .returning();

      if (!medication) {
        return null;
      }

      // If variants are provided, replace existing ones
      let updatedVariants = [];
      if (variants && Array.isArray(variants)) {
        // Delete existing variants
        await tx
          .delete(medicationVariants)
          .where(eq(medicationVariants.medicationId, id));

        // Create new variants
        if (variants.length > 0) {
          const variantsToCreate = variants.map((variant) => ({
            ...variant,
            medicationId: medication.id,
          }));
          updatedVariants = await tx
            .insert(medicationVariants)
            .values(variantsToCreate)
            .returning();
        }
      } else {
        // If no variants provided, fetch existing ones
        updatedVariants = await tx
          .select()
          .from(medicationVariants)
          .where(eq(medicationVariants.medicationId, id));
      }

      return {
        ...medication,
        variants: updatedVariants,
      };
    });
  } catch (error) {
    throw new Error(`Failed to update medication: ${error.message}`);
  }
};

/**
 * Delete medication by ID
 * @param {number} id - Medication ID
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

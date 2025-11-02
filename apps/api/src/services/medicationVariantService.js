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
 * Search medication variants for POS with inventory data and FEFO locations
 * @param {Object} options - Query options
 * @param {string} options.search - Search term
 * @returns {Promise<Array>} List of variants with medication name, available quantity, and bin locations (FEFO order)
 */
export const searchVariantsForSale = async ({ search } = {}) => {
  try {
    const { medications, inventory } = await import("../db/schema/index.js");
    const { asc } = await import("drizzle-orm");

    let variantQuery = db
      .select({
        id: medicationVariants.id,
        medicationId: medicationVariants.medicationId,
        name: medicationVariants.name,
        sku: medicationVariants.sku,
        barcode: medicationVariants.barcode,
        sellPrice: medicationVariants.sellPrice,
        unit: medicationVariants.unit,
        isActive: medicationVariants.isActive,
        isForSale: medicationVariants.isForSale,
        medicationName: medications.name,
        isPrescriptionRequired: medications.isPrescriptionRequired,
      })
      .from(medicationVariants)
      .innerJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      );

    const conditions = [
      eq(medicationVariants.isActive, true),
      eq(medicationVariants.isForSale, true),
    ];

    // Add search filter if provided - search in both variant name and medication name
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

    variantQuery = variantQuery.where(and(...conditions));
    const variants = await variantQuery;

    // For each variant, get inventory items sorted by FEFO (expiry date ascending)
    const variantsWithLocations = await Promise.all(
      variants.map(async (variant) => {
        const inventoryItems = await db.query.inventory.findMany({
          where: eq(inventory.medicationVariantId, variant.id),
          with: {
            bin: {
              with: {
                rack: {
                  with: {
                    zone: true,
                  },
                },
              },
            },
          },
          orderBy: asc(inventory.expiryDate),
        });

        // Calculate total available quantity
        const totalAvailable = inventoryItems.reduce((sum, item) => {
          return sum + (item.quantity - item.quantityReserved);
        }, 0);

        // Filter to only available stock and format location info
        const availableLocations = inventoryItems
          .filter((item) => item.quantity - item.quantityReserved > 0)
          .map((item) => ({
            binId: item.binId,
            quantity: item.quantity - item.quantityReserved,
            batchNumber: item.batchNumber,
            expiryDate: item.expiryDate,
            location: item.bin
              ? {
                  zone: item.bin.rack?.zone?.name || "N/A",
                  rack: item.bin.rack?.code || "N/A",
                  bin: `${item.bin.level || ""}${item.bin.number || ""}`,
                  fullLocation: item.bin.rack?.zone?.name
                    ? `${item.bin.rack.zone.name} - ${item.bin.rack.code} - Bin ${item.bin.level || ""}${item.bin.number || ""}`
                    : "Location N/A",
                }
              : null,
          }));

        return {
          id: variant.id,
          medicationId: variant.medicationId,
          medicationName: variant.medicationName || "",
          variantName: variant.name,
          sku: variant.sku,
          barcode: variant.barcode,
          sellPrice: variant.sellPrice,
          unit: variant.unit,
          isActive: variant.isActive,
          isForSale: variant.isForSale,
          isPrescriptionRequired: variant.isPrescriptionRequired || false,
          availableQuantity: totalAvailable,
          locations: availableLocations, // FEFO sorted locations
        };
      })
    );

    return variantsWithLocations;
  } catch (error) {
    throw new Error(`Failed to search variants for sale: ${error.message}`);
  }
};

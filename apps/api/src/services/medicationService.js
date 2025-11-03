import { and, count, eq, ilike, or, sum } from "drizzle-orm";

import { db } from "../db/index.js";
import {
  inventory,
  medications,
  medicationVariants,
  purchaseOrderItems,
  purchaseOrders,
  salesOrderItems,
  salesOrders,
  supplierMedicationVariants,
  suppliers,
} from "../db/schema/index.js";

/**
 * Get all medications with optional search, filters and pagination
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name or brand
 * @param {string} options.status - Filter by status
 * @param {number} options.limit - Number of items per page
 * @param {number} options.offset - Number of items to skip
 * @returns {Promise<Object>} Object with data and total count
 */
export const getAllMedications = async ({
  search,
  status,
  limit = 100,
  offset = 0,
} = {}) => {
  try {
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

    const whereClause =
      conditions.length > 0
        ? conditions.length === 1
          ? conditions[0]
          : and(...conditions)
        : undefined;

    // Get total count
    let countQuery = db.select({ count: count() }).from(medications);
    if (whereClause) {
      countQuery = countQuery.where(whereClause);
    }
    const countResult = await countQuery;
    const total = Number(countResult[0]?.count || 0);

    // Get paginated data
    let dataQuery = db.select().from(medications);
    if (whereClause) {
      dataQuery = dataQuery.where(whereClause);
    }
    const data = await dataQuery
      .orderBy(medications.name)
      .limit(limit)
      .offset(offset);

    return { data, total };
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
    // Validate medication data
    if (!medicationData.name || medicationData.name.trim() === "") {
      throw new Error("Medication name is required and cannot be empty");
    }

    if (
      medicationData.brand !== undefined &&
      medicationData.brand !== null &&
      medicationData.brand.trim() === ""
    ) {
      throw new Error("Medication brand cannot be empty");
    }

    // Validate status if provided
    const validStatuses = ["active", "inactive", "discontinued"];
    if (
      medicationData.status &&
      !validStatuses.includes(medicationData.status)
    ) {
      throw new Error(
        `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Validate variants if provided
    const { variants, ...medData } = medicationData;
    if (variants && Array.isArray(variants) && variants.length > 0) {
      for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];

        if (!variant.name || variant.name.trim() === "") {
          throw new Error(
            `Variant at index ${i}: name is required and cannot be empty`
          );
        }

        if (!variant.sku || variant.sku.trim() === "") {
          throw new Error(
            `Variant at index ${i}: SKU is required and cannot be empty`
          );
        }
      }
    }

    return await db.transaction(async (tx) => {
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
    // Check if medication has any variants with inventory
    const variants = await db
      .select({ id: medicationVariants.id })
      .from(medicationVariants)
      .where(eq(medicationVariants.medicationId, id));

    if (variants.length > 0) {
      const variantIds = variants.map((v) => v.id);

      // Check if any variant has inventory
      const inventoryCheck = await db
        .select({
          totalQty: sum(inventory.quantity),
        })
        .from(inventory)
        .where(
          or(...variantIds.map((vid) => eq(inventory.medicationVariantId, vid)))
        );

      const totalQuantity = Number(inventoryCheck[0]?.totalQty || 0);

      if (totalQuantity > 0) {
        throw new Error(
          "Cannot delete medication that still has products in inventory. You can only edit the information."
        );
      }
    }

    const result = await db
      .delete(medications)
      .where(eq(medications.id, id))
      .returning();

    return result[0] || null;
  } catch (error) {
    throw new Error(`Failed to delete medication: ${error.message}`);
  }
};

/**
 * Get all suppliers for a medication
 * @param {number} medicationId - Medication ID
 * @returns {Promise<Array>} List of suppliers
 */
export const getMedicationSuppliers = async (medicationId) => {
  try {
    const result = await db
      .selectDistinct({
        id: suppliers.id,
        name: suppliers.name,
        contactName: suppliers.contactName,
        email: suppliers.email,
        phone: suppliers.phone,
        address: suppliers.address,
        status: suppliers.status,
      })
      .from(suppliers)
      .innerJoin(
        supplierMedicationVariants,
        eq(suppliers.id, supplierMedicationVariants.supplierId)
      )
      .innerJoin(
        medicationVariants,
        eq(
          supplierMedicationVariants.medicationVariantId,
          medicationVariants.id
        )
      )
      .where(eq(medicationVariants.medicationId, medicationId));

    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch suppliers for medication: ${error.message}`
    );
  }
};

/**
 * Get all purchase orders containing a medication
 * @param {number} medicationId - Medication ID
 * @returns {Promise<Array>} List of purchase orders
 */
export const getMedicationPurchases = async (medicationId) => {
  try {
    const result = await db
      .selectDistinct({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        supplierName: suppliers.name,
      })
      .from(purchaseOrders)
      .innerJoin(
        purchaseOrderItems,
        eq(purchaseOrders.id, purchaseOrderItems.purchaseOrderId)
      )
      .innerJoin(
        supplierMedicationVariants,
        eq(
          purchaseOrderItems.supplierMedicationVariantId,
          supplierMedicationVariants.id
        )
      )
      .innerJoin(
        medicationVariants,
        eq(
          supplierMedicationVariants.medicationVariantId,
          medicationVariants.id
        )
      )
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(medicationVariants.medicationId, medicationId));

    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch purchase orders for medication: ${error.message}`
    );
  }
};

/**
 * Get all sales orders containing a medication
 * @param {number} medicationId - Medication ID
 * @returns {Promise<Array>} List of sales orders
 */
export const getMedicationSales = async (medicationId) => {
  try {
    const result = await db
      .selectDistinct({
        id: salesOrders.id,
        customerId: salesOrders.customerId,
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
        paymentMethod: salesOrders.paymentMethod,
      })
      .from(salesOrders)
      .innerJoin(
        salesOrderItems,
        eq(salesOrders.id, salesOrderItems.salesOrderId)
      )
      .innerJoin(
        medicationVariants,
        eq(salesOrderItems.medicationVariantId, medicationVariants.id)
      )
      .where(eq(medicationVariants.medicationId, medicationId));

    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch sales orders for medication: ${error.message}`
    );
  }
};

/**
 * Get all medications with variants and available inventory
 * Only returns medications that have at least one variant with available stock
 * @param {Object} options - Query options
 * @param {string} options.search - Search term for name, brand or variant name
 * @param {boolean} options.inStockOnly - Filter to only show in-stock items (default: true)
 * @returns {Promise<Array>} List of medications with variants and inventory info
 */
export const getMedicationsWithInventory = async ({
  search,
  inStockOnly = true,
} = {}) => {
  try {
    // Get all medications with variants using query API
    const allMeds = await db.query.medications.findMany({
      with: {
        variants: {
          with: {
            inventory: true,
          },
        },
      },
    });

    // Filter medications
    let filtered = allMeds;

    // Filter by search term
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter((med) => {
        const medsMatch =
          med.name.toLowerCase().includes(searchLower) ||
          med.brand?.toLowerCase().includes(searchLower);
        const variantMatch = med.variants.some((v) =>
          v.name.toLowerCase().includes(searchLower)
        );
        return medsMatch || variantMatch;
      });
    }

    // Filter by in-stock status if requested
    if (inStockOnly) {
      filtered = filtered.filter((med) => {
        // Check if any variant has available inventory
        return med.variants.some((variant) => {
          const totalQty = variant.inventory.reduce(
            (sum, inv) => sum + (inv.quantity - inv.quantityReserved),
            0
          );
          return totalQty > 0;
        });
      });
    }

    // Add inventory summary to each variant
    const result = filtered.map((med) => ({
      ...med,
      variants: med.variants.map((variant) => {
        const totalQty = variant.inventory.reduce(
          (sum, inv) => sum + inv.quantity,
          0
        );
        const availableQty = variant.inventory.reduce(
          (sum, inv) => sum + (inv.quantity - inv.quantityReserved),
          0
        );
        return {
          ...variant,
          totalQuantity: totalQty,
          availableQuantity: availableQty,
          // Remove detailed inventory array from response to reduce payload
          // inventory: undefined,
        };
      }),
    }));

    return result;
  } catch (error) {
    throw new Error(
      `Failed to fetch medications with inventory: ${error.message}`
    );
  }
};

import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";

/**
 * Transform inventory item to reduce duplication
 * Removes redundant bin.code and bin.name that duplicate rack/zone info
 */
const transformInventoryItem = (item) => {
  if (!item.bin) {
    return item;
  }

  // eslint-disable-next-line no-unused-vars
  const { code, name, ...binRest } = item.bin;

  return {
    ...item,
    bin: {
      ...binRest,
      // Only keep id, level, number, description, and rack from bin
      // Remove redundant code/name that duplicate rack/zone info
    },
  };
};

export const inventoryService = {
  /**
   * Get all inventory items with filters and pagination
   */
  async getAll(filters = {}) {
    const {
      medicationVariantId,
      binId,
      batchNumber,
      expiryDateFrom,
      expiryDateTo,
      sortBy = "expiryDate",
      sortOrder = "asc",
      limit = 100,
      offset = 0,
    } = filters;

    const conditions = [];

    if (medicationVariantId) {
      conditions.push(eq(inventory.medicationVariantId, medicationVariantId));
    }

    if (binId) {
      conditions.push(eq(inventory.binId, binId));
    }

    if (batchNumber) {
      conditions.push(eq(inventory.batchNumber, batchNumber));
    }

    if (expiryDateFrom) {
      conditions.push(gte(inventory.expiryDate, expiryDateFrom));
    }

    if (expiryDateTo) {
      conditions.push(lte(inventory.expiryDate, expiryDateTo));
    }

    // Use query API for nested data
    const data = await db.query.inventory.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
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
      orderBy:
        sortOrder === "asc"
          ? inventory[sortBy] || inventory.expiryDate
          : desc(inventory[sortBy] || inventory.expiryDate),
      limit,
      offset,
    });

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)`.as("count") })
      .from(inventory)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return {
      data: data.map(transformInventoryItem),
      total: Number(countResult[0]?.count || 0),
    };
  },

  /**
   * Get inventory by ID
   * @param {string} id - UUID string
   */
  async getById(id) {
    const item = await db.query.inventory.findFirst({
      where: eq(inventory.id, id),
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
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
    });

    return item;
  },

  /**
   * Get inventory by medication variant ID
   */
  async getByMedicationVariantId(medicationVariantId) {
    const items = await db.query.inventory.findMany({
      where: eq(inventory.medicationVariantId, medicationVariantId),
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
    });

    return items;
  },

  /**
   * Get inventory by bin ID
   */
  async getByBinId(binId) {
    const items = await db.query.inventory.findMany({
      where: eq(inventory.binId, binId),
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
      },
    });

    return items;
  },

  /**
   * Get inventory by medication ID (aggregated from all variants)
   */
  async getByMedicationId(medicationId) {
    const items = await db.query.inventory.findMany({
      where: eq(medicationVariants.medicationId, medicationId),
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
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
    });

    return items;
  },

  /**
   * Update inventory item
   * @param {string} id - UUID string
   */
  async update(id, updateData) {
    const [item] = await db
      .update(inventory)
      .set(updateData)
      .where(eq(inventory.id, id))
      .returning();

    return item;
  },

  /**
   * Get inventory summary by medication variant with pagination
   * Returns total quantity and available quantity grouped by variant
   */
  async getSummaryByVariant(filters = {}) {
    const {
      sortBy = "medicationVariantId",
      sortOrder = "asc",
      limit = 100,
      offset = 0,
    } = filters;

    // Build data query
    let dataQuery = db
      .select({
        medicationVariantId: inventory.medicationVariantId,
        totalQuantity: sql`SUM(${inventory.quantity})`.as("total_quantity"),
        totalReserved: sql`SUM(${inventory.quantityReserved})`.as(
          "total_reserved"
        ),
        availableQuantity:
          sql`SUM(${inventory.quantity} - ${inventory.quantityReserved})`.as(
            "available_quantity"
          ),
      })
      .from(inventory)
      .groupBy(inventory.medicationVariantId);

    // Apply sorting
    const orderColumn =
      sortBy === "totalQuantity"
        ? sql`SUM(${inventory.quantity})`
        : inventory.medicationVariantId;
    dataQuery =
      sortOrder === "asc"
        ? dataQuery.orderBy(orderColumn)
        : dataQuery.orderBy(desc(orderColumn));

    // Get total count of unique variants
    const countResult = await db
      .select({
        count: sql`COUNT(DISTINCT ${inventory.medicationVariantId})`.as(
          "count"
        ),
      })
      .from(inventory);

    const totalCount = Number(countResult[0]?.count || 0);
    const data = await dataQuery.limit(limit).offset(offset);

    return {
      data,
      total: totalCount,
    };
  },

  /**
   * Get expiring inventory items with pagination
   * Returns ALL items that have age >= 1 year since manufacture date
   * Expiry date: uses actual expiry date or defaults to manufacture_date + 1 year
   */
  async getExpiring(filters = {}) {
    const {
      daysUntilExpiry = 30,
      sortBy = "expiryDate",
      sortOrder = "asc",
      limit = 100,
      offset = 0,
    } = filters;

    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysUntilExpiry);

    // Get all inventory items with nested relations
    const allItems = await db.query.inventory.findMany({
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
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
    });

    // Filter items that are >= 1 year old from manufacture date
    const filteredData = allItems.filter((item) => {
      if (!item.manufactureDate) {
        // No manufacture date, skip
        return false;
      }

      // Calculate the date that is 1 year after manufacture
      const oneYearAfterMfg = new Date(item.manufactureDate);
      oneYearAfterMfg.setFullYear(oneYearAfterMfg.getFullYear() + 1);

      // Return items that have reached or passed 1 year from manufacture date
      return today >= oneYearAfterMfg;
    });

    // Sort the filtered data by calculated expiry date
    filteredData.sort((a, b) => {
      const aDate = a.expiryDate
        ? new Date(a.expiryDate)
        : new Date(a.manufactureDate);
      if (!a.expiryDate && a.manufactureDate) {
        aDate.setFullYear(aDate.getFullYear() + 1);
      }

      const bDate = b.expiryDate
        ? new Date(b.expiryDate)
        : new Date(b.manufactureDate);
      if (!b.expiryDate && b.manufactureDate) {
        bDate.setFullYear(bDate.getFullYear() + 1);
      }

      if (sortOrder === "asc") {
        return aDate - bDate;
      } else {
        return bDate - aDate;
      }
    });

    const totalCount = filteredData.length;
    const data = filteredData.slice(offset, offset + limit);
    return {
      data,
      total: totalCount,
    };
  },

  /**
   * Get low stock items with pagination
   * Returns items where available quantity is below the threshold
   * Default threshold: 250 units
   * Note: Uses query API for nested relations, with aggregation query to filter variants
   */
  async getLowStock(filters = {}) {
    const {
      threshold = 250,
      sortBy = "medicationVariantId",
      sortOrder = "asc",
      limit = 100,
      offset = 0,
    } = filters;

    // Get all inventory items with nested relations
    const allItems = await db.query.inventory.findMany({
      with: {
        medicationVariant: {
          with: {
            medication: true,
          },
        },
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
    });

    // Filter to only items whose variants have low stock
    const lowStockVariantIds = await db
      .select({ medicationVariantId: inventory.medicationVariantId })
      .from(inventory)
      .groupBy(inventory.medicationVariantId)
      .having(
        sql`SUM(${inventory.quantity} - ${inventory.quantityReserved}) < ${threshold}`
      );

    const variantIdSet = new Set(
      lowStockVariantIds.map((v) => v.medicationVariantId)
    );
    const filteredItems = allItems.filter((item) =>
      variantIdSet.has(item.medicationVariantId)
    );

    // Sort and paginate in memory
    filteredItems.sort((a, b) => {
      const aVal = a[sortBy];
      const bVal = b[sortBy];
      if (sortOrder === "asc") {
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      } else {
        return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
      }
    });

    const data = filteredItems.slice(offset, offset + limit);
    const totalCount = filteredItems.length;

    return {
      data,
      total: totalCount,
    };
  },

  // Wrapper expected by controllers: getExpiringSoon(filters)
  async getExpiringSoon(filters = {}) {
    return await this.getExpiring(filters);
  },

  /**
   * Move inventory between bins
   * @param {Object} moveData - Movement details
   */
  async move(moveData) {
    const {
      fromInventoryId,
      toBinId,
      quantity,
      medicationVariantId,
      batchNumber,
      manufactureDate,
      expiryDate,
      purchaseOrderReceiptItemsId,
    } = moveData;

    return await db.transaction(async (tx) => {
      // Get source inventory using query API
      const fromInventory = await tx.query.inventory.findFirst({
        where: eq(inventory.id, fromInventoryId),
        columns: {
          id: true,
          quantity: true,
          medicationVariantId: true,
          binId: true,
        },
      });

      if (!fromInventory) {
        throw new Error("Source inventory not found");
      }

      // Update source inventory (reduce quantity)
      await tx
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} - ${quantity}`,
        })
        .where(eq(inventory.id, fromInventoryId));

      // Check if target bin already has this batch using query API
      const targetInventory = await tx.query.inventory.findFirst({
        where: and(
          eq(inventory.medicationVariantId, medicationVariantId),
          eq(inventory.binId, toBinId),
          eq(inventory.batchNumber, batchNumber)
        ),
        columns: {
          id: true,
          quantity: true,
        },
      });

      if (targetInventory) {
        // Update existing inventory in target bin
        await tx
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} + ${quantity}`,
          })
          .where(eq(inventory.id, targetInventory.id));
      } else {
        // Create new inventory record in target bin
        await tx.insert(inventory).values({
          medicationVariantId,
          purchaseOrderReceiptItemsId,
          binId: toBinId,
          batchNumber,
          manufactureDate,
          expiryDate,
          quantity,
          quantityReserved: 0,
        });
      }

      return { success: true };
    });
  },
};

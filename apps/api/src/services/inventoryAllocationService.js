import { and, asc, eq, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";
import logger from "../utils/logger.js";

/**
 * Service for automatic inventory allocation to warehouse bins using FIFO strategy
 * FIFO: First In First Out - allocate to first available bin
 */
export const inventoryAllocationService = {
  /**
   * Allocate inventory to warehouse bins using FIFO strategy or preferred bin
   * @param {Object} allocationData - Data for allocation
   * @param {string} allocationData.medicationVariantId - Medication variant ID
   * @param {string} allocationData.purchaseOrderReceiptItemId - Receipt item ID
   * @param {string} allocationData.batchNumber - Batch number
   * @param {Date} allocationData.manufactureDate - Manufacture date
   * @param {Date} allocationData.expiryDate - Expiry date
   * @param {number} allocationData.quantity - Total quantity to allocate
   * @param {string} [allocationData.preferredBinId] - Optional preferred bin ID
   * @param {Object} tx - Database transaction object
   * @returns {Promise<Array>} Array of created inventory records with location details
   */
  async allocateInventory(allocationData, tx = db) {
    const {
      medicationVariantId,
      purchaseOrderReceiptItemId,
      batchNumber,
      manufactureDate,
      expiryDate,
      quantity,
      preferredBinId,
    } = allocationData;

    logger.info("Starting inventory allocation", {
      medicationVariantId,
      batchNumber,
      quantity,
      preferredBinId,
    });

    // If preferredBinId is provided, get its zone to filter bins
    let preferredZoneId = null;
    if (preferredBinId) {
      const preferredBinInfo = await tx
        .select({
          zoneId: warehouseZones.id,
          zoneCode: warehouseZones.code,
          zoneName: warehouseZones.name,
        })
        .from(warehouseBins)
        .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
        .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
        .where(eq(warehouseBins.id, preferredBinId))
        .limit(1);

      if (preferredBinInfo.length > 0) {
        preferredZoneId = preferredBinInfo[0].zoneId;
        logger.info(
          `Preferred bin is in zone ${preferredBinInfo[0].zoneCode} - will only allocate within this zone`
        );
      }
    }

    // Build query conditions
    const queryConditions = [];
    if (preferredZoneId) {
      queryConditions.push(eq(warehouseZones.id, preferredZoneId));
    }

    // Get all bins with their current inventory status (filtered by zone if preferredBinId exists)
    const binsWithInventory = await tx
      .select({
        binId: warehouseBins.id,
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackId: warehouseRacks.id,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneId: warehouseZones.id,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
        hasInventory: sql`COUNT(${inventory.id}) > 0`.as("has_inventory"),
      })
      .from(warehouseBins)
      .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .leftJoin(inventory, eq(warehouseBins.id, inventory.binId))
      .where(queryConditions.length > 0 ? and(...queryConditions) : undefined)
      .groupBy(
        warehouseBins.id,
        warehouseBins.code,
        warehouseBins.name,
        warehouseBins.level,
        warehouseBins.number,
        warehouseRacks.id,
        warehouseRacks.code,
        warehouseRacks.name,
        warehouseZones.id,
        warehouseZones.code,
        warehouseZones.name
      )
      .orderBy(
        asc(warehouseZones.code),
        asc(warehouseRacks.code),
        asc(warehouseBins.level),
        asc(warehouseBins.number)
      );

    // Separate empty bins (for new batches) and bins with inventory (for existing batches)
    const emptyBins = binsWithInventory.filter((bin) => !bin.hasInventory);
    const occupiedBins = binsWithInventory.filter((bin) => bin.hasInventory);

    logger.info(
      `Found ${emptyBins.length} empty bins and ${occupiedBins.length} occupied bins${preferredZoneId ? " in selected zone" : ""}`
    );

    if (emptyBins.length === 0 && occupiedBins.length === 0) {
      throw new Error("No warehouse bins available for allocation");
    }

    // Check if this batch already exists in inventory
    const existingInventory = await tx
      .select({
        id: inventory.id,
        binId: inventory.binId,
        quantity: inventory.quantity,
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
      })
      .from(inventory)
      .innerJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .where(
        and(
          eq(inventory.medicationVariantId, medicationVariantId),
          eq(inventory.batchNumber, batchNumber)
        )
      );

    const allocatedInventory = [];

    if (existingInventory.length > 0) {
      // Batch exists - add to the first existing location
      const firstExisting = existingInventory[0];
      logger.info(
        `Batch ${batchNumber} already exists in bin ${firstExisting.binCode}, adding to existing inventory`
      );

      const [updated] = await tx
        .update(inventory)
        .set({
          quantity: sql`${inventory.quantity} + ${quantity}`,
        })
        .where(eq(inventory.id, firstExisting.id))
        .returning();

      // Get full location details for the updated inventory
      const [locationDetails] = await tx
        .select({
          id: inventory.id,
          medicationVariantId: inventory.medicationVariantId,
          purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
          binId: inventory.binId,
          binCode: warehouseBins.code,
          binName: warehouseBins.name,
          binLevel: warehouseBins.level,
          binNumber: warehouseBins.number,
          rackId: warehouseRacks.id,
          rackCode: warehouseRacks.code,
          rackName: warehouseRacks.name,
          zoneId: warehouseZones.id,
          zoneCode: warehouseZones.code,
          zoneName: warehouseZones.name,
          batchNumber: inventory.batchNumber,
          manufactureDate: inventory.manufactureDate,
          expiryDate: inventory.expiryDate,
          quantity: inventory.quantity,
          quantityReserved: inventory.quantityReserved,
        })
        .from(inventory)
        .innerJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
        .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
        .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
        .where(eq(inventory.id, updated.id));

      allocatedInventory.push(locationDetails);
    } else {
      // New batch - use preferred bin if provided and it's empty, otherwise use FIFO from empty bins
      let targetBin;

      if (preferredBinId) {
        // Find the preferred bin in empty bins
        targetBin = emptyBins.find((bin) => bin.binId === preferredBinId);
        if (targetBin) {
          logger.info(
            `Using preferred empty bin ${targetBin.binCode} in zone ${targetBin.zoneCode}`
          );
        } else {
          // Check if there are any empty bins in the zone
          if (emptyBins.length === 0) {
            const zoneInfo = await tx
              .select({
                zoneCode: warehouseZones.code,
                zoneName: warehouseZones.name,
              })
              .from(warehouseBins)
              .innerJoin(
                warehouseRacks,
                eq(warehouseBins.rackId, warehouseRacks.id)
              )
              .innerJoin(
                warehouseZones,
                eq(warehouseRacks.zoneId, warehouseZones.id)
              )
              .where(eq(warehouseBins.id, preferredBinId))
              .limit(1);

            const zoneName =
              zoneInfo.length > 0 ? zoneInfo[0].zoneCode : "selected";
            throw new Error(
              `Không còn chỗ trống trong khu ${zoneName}. Vui lòng chọn khu khác hoặc giải phóng chỗ trống.`
            );
          }

          logger.warn(
            `Preferred bin ${preferredBinId} is not empty, using first available empty bin in same zone`
          );
          targetBin = emptyBins[0];
        }
      } else {
        // No preference, use FIFO (first empty bin)
        if (emptyBins.length === 0) {
          throw new Error(
            "No empty bins available. Cannot allocate new batch to occupied bin."
          );
        }
        targetBin = emptyBins[0];
      }

      logger.info(
        `Allocating new batch ${batchNumber} to empty bin ${targetBin.binCode} in zone ${targetBin.zoneCode}`
      );

      const [created] = await tx
        .insert(inventory)
        .values({
          medicationVariantId,
          purchaseOrderReceiptItemsId: purchaseOrderReceiptItemId,
          binId: targetBin.binId,
          batchNumber,
          manufactureDate,
          expiryDate,
          quantity,
          quantityReserved: 0,
        })
        .returning();

      allocatedInventory.push({
        ...created,
        binCode: targetBin.binCode,
        binName: targetBin.binName,
        binLevel: targetBin.binLevel,
        binNumber: targetBin.binNumber,
        rackId: targetBin.rackId,
        rackCode: targetBin.rackCode,
        rackName: targetBin.rackName,
        zoneId: targetBin.zoneId,
        zoneCode: targetBin.zoneCode,
        zoneName: targetBin.zoneName,
      });
    }

    logger.info(
      `Successfully allocated ${quantity} units to ${allocatedInventory.length} location(s)`
    );

    return allocatedInventory;
  },

  /**
   * Get inventory allocation details for a receipt
   * @param {string} receiptId - Purchase order receipt ID
   * @returns {Promise<Array>} Array of inventory allocations with location details
   */
  async getReceiptAllocations(receiptId) {
    // Import purchaseOrderReceiptItems schema
    const { purchaseOrderReceiptItems } = await import(
      "../db/schema/purchaseOrderReceiptItems.js"
    );

    // First, get all receipt item IDs for this receipt
    const receiptItems = await db
      .select({
        id: purchaseOrderReceiptItems.id,
      })
      .from(purchaseOrderReceiptItems)
      .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, receiptId));

    if (receiptItems.length === 0) {
      return [];
    }

    const receiptItemIds = receiptItems.map((item) => item.id);

    // Then get all inventory allocations for these receipt items
    const allocations = await db
      .select({
        inventoryId: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        binId: warehouseBins.id,
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackId: warehouseRacks.id,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneId: warehouseZones.id,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
      })
      .from(inventory)
      .innerJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(
        sql`${inventory.purchaseOrderReceiptItemsId} IN (${sql.join(
          receiptItemIds.map((id) => sql`${id}`),
          sql`, `
        )})`
      );

    return allocations;
  },
};

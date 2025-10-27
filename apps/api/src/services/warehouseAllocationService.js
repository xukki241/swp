import { asc, eq, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

/**
 * Service for finding available warehouse bins for allocation
 */
export const warehouseAllocationService = {
  /**
   * Find the nearest available EMPTY bin in a specific zone, excluding already reserved bins
   * This mirrors the FIFO logic in inventoryAllocationService
   * @param {string} zoneId - Zone ID to search in
   * @param {Array<string>} excludeBinIds - Array of bin IDs to exclude (already reserved)
   * @returns {Promise<Object|null>} Available empty bin with full location details or null
   */
  async findNearestAvailableBinInZone(zoneId, excludeBinIds = []) {
    // Get bins in the zone with their inventory status
    const binsWithInventory = await db
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
      .where(eq(warehouseZones.id, zoneId))
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
        asc(warehouseRacks.code),
        asc(warehouseBins.level),
        asc(warehouseBins.number)
      );

    // Find first empty bin (FIFO) that is not in the exclude list
    const emptyBin = binsWithInventory.find(
      (bin) => !bin.hasInventory && !excludeBinIds.includes(bin.binId)
    );

    if (!emptyBin) {
      return null;
    }

    // Remove hasInventory field from result
    // eslint-disable-next-line no-unused-vars
    const { hasInventory, ...binDetails } = emptyBin;
    return binDetails;
  },

  /**
   * Find available bins for multiple items with their selected zones
   * Ensures each item gets a unique bin by tracking reserved bins
   * @param {Array} items - Array of {medicationVariantId, zoneId, quantity}
   * @returns {Promise<Array>} Array of items with assigned bin details
   */
  async findBinsForItems(items) {
    const results = [];
    const reservedBinIds = []; // Track bins already assigned in this batch

    for (const item of items) {
      const { zoneId, ...itemData } = item;

      if (!zoneId) {
        results.push({
          ...itemData,
          error: "No zone selected",
          bin: null,
        });
        continue;
      }

      // Find bin excluding already reserved bins
      const bin = await this.findNearestAvailableBinInZone(
        zoneId,
        reservedBinIds
      );

      if (!bin) {
        results.push({
          ...itemData,
          zoneId,
          error: "No available bins in selected zone",
          bin: null,
        });
      } else {
        // Mark this bin as reserved for subsequent items
        reservedBinIds.push(bin.binId);

        results.push({
          ...itemData,
          zoneId,
          bin,
        });
      }
    }

    return results;
  },
};

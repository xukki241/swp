import { asc, eq } from "drizzle-orm";

import { db } from "../db/index.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

/**
 * Service for finding available warehouse bins for allocation
 */
export const warehouseAllocationService = {
  /**
   * Find the nearest available bin in a specific zone
   * @param {string} zoneId - Zone ID to search in
   * @returns {Promise<Object|null>} Available bin with full location details or null
   */
  async findNearestAvailableBinInZone(zoneId) {
    // Get first available bin in the zone ordered by rack, level, number
    const [availableBin] = await db
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
      })
      .from(warehouseBins)
      .innerJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .innerJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(warehouseZones.id, zoneId))
      .orderBy(
        asc(warehouseRacks.code),
        asc(warehouseBins.level),
        asc(warehouseBins.number)
      )
      .limit(1);

    return availableBin || null;
  },

  /**
   * Find available bins for multiple items with their selected zones
   * @param {Array} items - Array of {medicationVariantId, zoneId, quantity}
   * @returns {Promise<Array>} Array of items with assigned bin details
   */
  async findBinsForItems(items) {
    const results = [];

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

      const bin = await this.findNearestAvailableBinInZone(zoneId);

      if (!bin) {
        results.push({
          ...itemData,
          zoneId,
          error: "No available bins in selected zone",
          bin: null,
        });
      } else {
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

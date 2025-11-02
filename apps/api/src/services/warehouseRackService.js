import { and, eq, gt, ilike, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

export const warehouseRackService = {
  async create(rackData) {
    // Support single object or array for batch creation
    if (Array.isArray(rackData)) {
      if (rackData.length === 0) {
        return [];
      }

      // Validate referenced zones exist
      const zoneIds = Array.from(new Set(rackData.map((r) => r.zoneId)));
      for (const zid of zoneIds) {
        const zone = await db.query.warehouseZones.findFirst({
          where: eq(warehouseZones.id, zid),
          columns: {
            id: true,
          },
        });

        if (!zone) {
          throw new Error(`Zone with ID ${zid} not found`);
        }
      }

      const results = await db
        .insert(warehouseRacks)
        .values(rackData)
        .returning();

      return results;
    }

    // Single create
    const zone = await db.query.warehouseZones.findFirst({
      where: eq(warehouseZones.id, rackData.zoneId),
      columns: {
        id: true,
      },
    });

    if (!zone) {
      throw new Error(`Zone with ID ${rackData.zoneId} not found`);
    }

    const [rack] = await db.insert(warehouseRacks).values(rackData).returning();

    return rack;
  },

  async getAll(filters = {}) {
    const { search, zoneId, limit = 100, offset = 0 } = filters;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(warehouseRacks.code, `%${search}%`),
          ilike(warehouseRacks.name, `%${search}%`)
        )
      );
    }

    if (zoneId) {
      conditions.push(eq(warehouseRacks.zoneId, zoneId));
    }

    const results = await db.query.warehouseRacks.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        zone: true,
        bins: {
          with: {
            inventoryEntries: {
              where: ({ quantity, quantityReserved }) =>
                gt(quantity, quantityReserved),
              orderBy: (entry, { asc }) => [asc(entry.expiryDate)],
              limit: 1,
            },
          },
        },
      },
      limit,
      offset,
    });

    return results;
  },

  async getById(id) {
    const rack = await db.query.warehouseRacks.findFirst({
      where: eq(warehouseRacks.id, id),
      with: {
        zone: true,
        bins: {
          with: {
            inventoryEntries: {
              where: ({ quantity, quantityReserved }) =>
                gt(quantity, quantityReserved),
              orderBy: (entry, { asc }) => [asc(entry.expiryDate)],
              limit: 1,
            },
          },
        },
      },
    });

    return rack;
  },

  async getByZoneId(zoneId) {
    const racks = await db.query.warehouseRacks.findMany({
      where: eq(warehouseRacks.zoneId, zoneId),
      with: {
        zone: true,
        bins: {
          with: {
            inventoryEntries: {
              where: ({ quantity, quantityReserved }) =>
                gt(quantity, quantityReserved),
              orderBy: (entry, { asc }) => [asc(entry.expiryDate)],
              limit: 1,
            },
          },
        },
      },
    });

    return racks;
  },

  async update(id, rackData) {
    // If zoneId is being updated, verify the new zone exists
    if (rackData.zoneId) {
      const zone = await db.query.warehouseZones.findFirst({
        where: eq(warehouseZones.id, rackData.zoneId),
        columns: {
          id: true,
        },
      });

      if (!zone) {
        throw new Error(`Zone with ID ${rackData.zoneId} not found`);
      }
    }

    const [rack] = await db
      .update(warehouseRacks)
      .set(rackData)
      .where(eq(warehouseRacks.id, id))
      .returning();

    return rack;
  },

  async delete(id) {
    // Check if rack has bins using db.query API
    const bins = await db.query.warehouseBins.findMany({
      where: eq(warehouseBins.rackId, id),
      columns: {
        id: true,
      },
    });

    if (bins.length > 0) {
      throw new Error(
        `Cannot delete rack. It has ${bins.length} bin(s) associated with it.`
      );
    }

    const [rack] = await db
      .delete(warehouseRacks)
      .where(eq(warehouseRacks.id, id))
      .returning();

    return rack;
  },
};

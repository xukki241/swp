import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import { warehouseBins } from "../../db/schema/warehouseBins.js";
import { warehouseRacks } from "../../db/schema/warehouseRacks.js";
import { warehouseZones } from "../../db/schema/warehouseZones.js";

export const warehouseBinService = {
  async create(binData) {
    // Support single object or array for batch creation
    if (Array.isArray(binData)) {
      if (binData.length === 0) {
        return [];
      }

      // Validate referenced racks exist
      const rackIds = Array.from(new Set(binData.map((b) => b.rackId)));
      for (const rid of rackIds) {
        const rack = await db.query.warehouseRacks.findFirst({
          where: eq(warehouseRacks.id, rid),
          columns: {
            id: true,
          },
        });

        if (!rack) {
          throw new Error(`Rack with ID ${rid} not found`);
        }
      }

      const results = await db
        .insert(warehouseBins)
        .values(binData)
        .returning();

      return results;
    }

    // Single create
    const rack = await db.query.warehouseRacks.findFirst({
      where: eq(warehouseRacks.id, binData.rackId),
      columns: {
        id: true,
      },
    });

    if (!rack) {
      throw new Error(`Rack with ID ${binData.rackId} not found`);
    }

    const [bin] = await db.insert(warehouseBins).values(binData).returning();

    return bin;
  },

  async getAll(filters = {}) {
    const { search, rackId, zoneId, level, limit = 100, offset = 0 } = filters;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(warehouseBins.code, `%${search}%`),
          ilike(warehouseBins.name, `%${search}%`)
        )
      );
    }

    if (rackId) {
      conditions.push(eq(warehouseBins.rackId, rackId));
    }

    if (level !== undefined && level !== null) {
      conditions.push(eq(warehouseBins.level, level));
    }

    let results = await db.query.warehouseBins.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        rack: {
          with: {
            zone: true,
          },
        },
      },
      limit,
      offset,
    });

    // Filter by zoneId if provided (post-query filtering since it's nested)
    if (zoneId) {
      results = results.filter((bin) => bin.rack?.zone?.id === zoneId);
    }

    return results;
  },

  async getById(id) {
    const bin = await db.query.warehouseBins.findFirst({
      where: eq(warehouseBins.id, id),
      with: {
        rack: {
          with: {
            zone: true,
          },
        },
      },
    });

    return bin;
  },

  async getByRackId(rackId) {
    const bins = await db.query.warehouseBins.findMany({
      where: eq(warehouseBins.rackId, rackId),
      with: {
        rack: {
          with: {
            zone: true,
          },
        },
      },
    });

    return bins;
  },

  async update(id, binData) {
    // If rackId is being updated, verify the new rack exists
    if (binData.rackId) {
      const rack = await db.query.warehouseRacks.findFirst({
        where: eq(warehouseRacks.id, binData.rackId),
        columns: {
          id: true,
        },
      });

      if (!rack) {
        throw new Error(`Rack with ID ${binData.rackId} not found`);
      }
    }

    const [bin] = await db
      .update(warehouseBins)
      .set(binData)
      .where(eq(warehouseBins.id, id))
      .returning();

    return bin;
  },

  async delete(id) {
    const [bin] = await db
      .delete(warehouseBins)
      .where(eq(warehouseBins.id, id))
      .returning();

    return bin;
  },
};

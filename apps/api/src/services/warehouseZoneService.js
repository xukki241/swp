import { and, eq, ilike, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

export const warehouseZoneService = {
  async create(zoneData) {
    // Support single object or array for batch creation
    if (Array.isArray(zoneData)) {
      if (zoneData.length === 0) {
        return [];
      }
      const results = await db
        .insert(warehouseZones)
        .values(zoneData)
        .returning();
      return results;
    }

    const [zone] = await db.insert(warehouseZones).values(zoneData).returning();

    return zone;
  },

  async getAll(filters = {}) {
    const { search, type, limit = 100, offset = 0 } = filters;

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(warehouseZones.code, `%${search}%`),
          ilike(warehouseZones.name, `%${search}%`),
          ilike(warehouseZones.location, `%${search}%`)
        )
      );
    }

    if (type) {
      conditions.push(eq(warehouseZones.type, type));
    }

    const results = await db.query.warehouseZones.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        racks: {
          with: {
            bins: true,
          },
        },
      },
      limit,
      offset,
    });

    return results;
  },

  async getById(id) {
    const zone = await db.query.warehouseZones.findFirst({
      where: eq(warehouseZones.id, id),
      with: {
        racks: {
          with: {
            bins: true,
          },
        },
      },
    });

    return zone;
  },

  async getByCode(code) {
    const zone = await db.query.warehouseZones.findFirst({
      where: eq(warehouseZones.code, code),
      with: {
        racks: {
          with: {
            bins: true,
          },
        },
      },
    });

    return zone;
  },

  async update(id, zoneData) {
    const [zone] = await db
      .update(warehouseZones)
      .set(zoneData)
      .where(eq(warehouseZones.id, id))
      .returning();

    return zone;
  },

  async delete(id) {
    // Check if zone has racks using db.query API
    const racks = await db.query.warehouseRacks.findMany({
      where: eq(warehouseRacks.zoneId, id),
      columns: {
        id: true,
      },
    });

    if (racks.length > 0) {
      throw new Error(
        `Cannot delete zone. It has ${racks.length} rack(s) associated with it.`
      );
    }

    const [zone] = await db
      .delete(warehouseZones)
      .where(eq(warehouseZones.id, id))
      .returning();

    return zone;
  },
};

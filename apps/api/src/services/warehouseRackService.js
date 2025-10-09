import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

export const warehouseRackService = {
  async create(rackData) {
    // Verify zone exists
    const [zone] = await db
      .select()
      .from(warehouseZones)
      .where(eq(warehouseZones.id, rackData.zoneId));

    if (!zone) {
      throw new Error(`Zone with ID ${rackData.zoneId} not found`);
    }

    const [rack] = await db.insert(warehouseRacks).values(rackData).returning();

    return rack;
  },

  async getAll(filters = {}) {
    const { search, zoneId, limit = 100, offset = 0 } = filters;

    let query = db
      .select({
        id: warehouseRacks.id,
        zoneId: warehouseRacks.zoneId,
        code: warehouseRacks.code,
        name: warehouseRacks.name,
        description: warehouseRacks.description,
        zoneName: warehouseZones.name,
        zoneCode: warehouseZones.code,
        zoneType: warehouseZones.type,
      })
      .from(warehouseRacks)
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id));

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(warehouseRacks.code, `%${search}%`),
          ilike(warehouseRacks.name, `%${search}%`),
          ilike(warehouseZones.name, `%${search}%`)
        )
      );
    }

    if (zoneId) {
      conditions.push(eq(warehouseRacks.zoneId, zoneId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  async getById(id) {
    const [rack] = await db
      .select({
        id: warehouseRacks.id,
        zoneId: warehouseRacks.zoneId,
        code: warehouseRacks.code,
        name: warehouseRacks.name,
        description: warehouseRacks.description,
        zoneName: warehouseZones.name,
        zoneCode: warehouseZones.code,
        zoneType: warehouseZones.type,
      })
      .from(warehouseRacks)
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(warehouseRacks.id, id));

    if (!rack) {
      return null;
    }

    // Get all bins in this rack
    const bins = await db
      .select({
        id: warehouseBins.id,
        code: warehouseBins.code,
        name: warehouseBins.name,
        level: warehouseBins.level,
        number: warehouseBins.number,
        description: warehouseBins.description,
      })
      .from(warehouseBins)
      .where(eq(warehouseBins.rackId, id));

    return {
      ...rack,
      bins,
    };
  },

  async getByZoneId(zoneId) {
    const racks = await db
      .select()
      .from(warehouseRacks)
      .where(eq(warehouseRacks.zoneId, zoneId));

    return racks;
  },

  async update(id, rackData) {
    // If zoneId is being updated, verify the new zone exists
    if (rackData.zoneId) {
      const [zone] = await db
        .select()
        .from(warehouseZones)
        .where(eq(warehouseZones.id, rackData.zoneId));

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
    // Check if rack has bins
    const bins = await db
      .select()
      .from(warehouseBins)
      .where(eq(warehouseBins.rackId, id));

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

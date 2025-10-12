import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../db/index.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

export const warehouseBinService = {
  async create(binData) {
    // Verify rack exists
    const [rack] = await db
      .select()
      .from(warehouseRacks)
      .where(eq(warehouseRacks.id, binData.rackId));

    if (!rack) {
      throw new Error(`Rack with ID ${binData.rackId} not found`);
    }

    const [bin] = await db.insert(warehouseBins).values(binData).returning();

    return bin;
  },

  async getAll(filters = {}) {
    const { search, rackId, zoneId, level, limit = 100, offset = 0 } = filters;

    let query = db
      .select({
        id: warehouseBins.id,
        rackId: warehouseBins.rackId,
        code: warehouseBins.code,
        name: warehouseBins.name,
        level: warehouseBins.level,
        number: warehouseBins.number,
        description: warehouseBins.description,
        rackName: warehouseRacks.name,
        rackCode: warehouseRacks.code,
        zoneName: warehouseZones.name,
        zoneCode: warehouseZones.code,
        zoneType: warehouseZones.type,
      })
      .from(warehouseBins)
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id));

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          ilike(warehouseBins.code, `%${search}%`),
          ilike(warehouseBins.name, `%${search}%`),
          ilike(warehouseRacks.name, `%${search}%`)
        )
      );
    }

    if (rackId) {
      conditions.push(eq(warehouseBins.rackId, rackId));
    }

    if (zoneId) {
      conditions.push(eq(warehouseRacks.zoneId, zoneId));
    }

    if (level !== undefined && level !== null) {
      conditions.push(eq(warehouseBins.level, level));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  async getById(id) {
    const [bin] = await db
      .select({
        id: warehouseBins.id,
        rackId: warehouseBins.rackId,
        code: warehouseBins.code,
        name: warehouseBins.name,
        level: warehouseBins.level,
        number: warehouseBins.number,
        description: warehouseBins.description,
        rackName: warehouseRacks.name,
        rackCode: warehouseRacks.code,
        zoneName: warehouseZones.name,
        zoneCode: warehouseZones.code,
        zoneType: warehouseZones.type,
      })
      .from(warehouseBins)
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(warehouseBins.id, id));

    return bin;
  },

  async getByRackId(rackId) {
    const bins = await db
      .select()
      .from(warehouseBins)
      .where(eq(warehouseBins.rackId, rackId));

    return bins;
  },

  async update(id, binData) {
    // If rackId is being updated, verify the new rack exists
    if (binData.rackId) {
      const [rack] = await db
        .select()
        .from(warehouseRacks)
        .where(eq(warehouseRacks.id, binData.rackId));

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

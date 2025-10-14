import { eq, ilike, or, and } from "drizzle-orm";

import { db } from "../../db/index.js";
import { warehouseRacks } from "../../db/schema/warehouseRacks.js";
import { warehouseZones } from "../../db/schema/warehouseZones.js";

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

    let query = db.select().from(warehouseZones);

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

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  async getById(id) {
    const [zone] = await db
      .select()
      .from(warehouseZones)
      .where(eq(warehouseZones.id, id));

    if (!zone) {
      return null;
    }

    // Get all racks in this zone
    const racks = await db
      .select({
        id: warehouseRacks.id,
        code: warehouseRacks.code,
        name: warehouseRacks.name,
        description: warehouseRacks.description,
      })
      .from(warehouseRacks)
      .where(eq(warehouseRacks.zoneId, id));

    return {
      ...zone,
      racks,
    };
  },

  async getByCode(code) {
    const [zone] = await db
      .select()
      .from(warehouseZones)
      .where(eq(warehouseZones.code, code));

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
    // Check if zone has racks
    const racks = await db
      .select()
      .from(warehouseRacks)
      .where(eq(warehouseRacks.zoneId, id));

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

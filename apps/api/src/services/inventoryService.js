import { eq, and, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { warehouseBins } from "../db/schema/warehouseBins.js";
import { warehouseRacks } from "../db/schema/warehouseRacks.js";
import { warehouseZones } from "../db/schema/warehouseZones.js";

export const inventoryService = {
  /**
   * Get all inventory items with filters
   */
  async getAll(filters = {}) {
    const {
      medicationVariantId,
      binId,
      batchNumber,
      expiryDateFrom,
      expiryDateTo,
      zoneId,
      rackId,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Medication Variant details
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        variantPrice: medicationVariants.price,
        // Medication details
        medicationId: medications.id,
        medicationName: medications.name,
        medicationCode: medications.code,
        medicationActiveIngredient: medications.activeIngredient,
        // Warehouse location details
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
        zoneType: warehouseZones.type,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id));

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

    if (zoneId) {
      conditions.push(eq(warehouseRacks.zoneId, zoneId));
    }

    if (rackId) {
      conditions.push(eq(warehouseBins.rackId, rackId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  /**
   * Get inventory by ID
   */
  async getById(id) {
    const [item] = await db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Medication Variant details
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        variantPrice: medicationVariants.price,
        // Medication details
        medicationId: medications.id,
        medicationName: medications.name,
        medicationCode: medications.code,
        medicationActiveIngredient: medications.activeIngredient,
        // Warehouse location details
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
        zoneType: warehouseZones.type,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(inventory.id, id));

    return item;
  },

  /**
   * Get inventory by medication variant ID
   */
  async getByMedicationVariantId(medicationVariantId) {
    const items = await db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Warehouse location details
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
        zoneType: warehouseZones.type,
      })
      .from(inventory)
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(inventory.medicationVariantId, medicationVariantId));

    return items;
  },

  /**
   * Get inventory by bin ID
   */
  async getByBinId(binId) {
    const items = await db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Medication Variant details
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        variantPrice: medicationVariants.price,
        // Medication details
        medicationId: medications.id,
        medicationName: medications.name,
        medicationCode: medications.code,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(eq(inventory.binId, binId));

    return items;
  },

  /**
   * Get inventory by medication ID (aggregated from all variants)
   */
  async getByMedicationId(medicationId) {
    const items = await db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        purchaseOrderReceiptItemsId: inventory.purchaseOrderReceiptItemsId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        manufactureDate: inventory.manufactureDate,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Medication Variant details
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        variantPrice: medicationVariants.price,
        // Warehouse location details
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        binLevel: warehouseBins.level,
        binNumber: warehouseBins.number,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
        zoneType: warehouseZones.type,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(eq(medicationVariants.medicationId, medicationId));

    return items;
  },

  /**
   * Update inventory item
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
   * Get inventory summary by medication variant
   * Returns total quantity and available quantity grouped by variant
   */
  async getSummaryByVariant(filters = {}) {
    const { medicationId, zoneId, rackId } = filters;

    let query = db
      .select({
        medicationVariantId: inventory.medicationVariantId,
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        medicationId: medications.id,
        medicationName: medications.name,
        medicationCode: medications.code,
        totalQuantity: sql`SUM(${inventory.quantity})`.as("total_quantity"),
        totalReserved: sql`SUM(${inventory.quantityReserved})`.as(
          "total_reserved"
        ),
        totalAvailable:
          sql`SUM(${inventory.quantity} - ${inventory.quantityReserved})`.as(
            "total_available"
          ),
        batchCount: sql`COUNT(DISTINCT ${inventory.batchNumber})`.as(
          "batch_count"
        ),
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .groupBy(
        inventory.medicationVariantId,
        medicationVariants.name,
        medicationVariants.sku,
        medicationVariants.unit,
        medications.id,
        medications.name,
        medications.code
      );

    const conditions = [];

    if (medicationId) {
      conditions.push(eq(medicationVariants.medicationId, medicationId));
    }

    if (zoneId) {
      conditions.push(eq(warehouseRacks.zoneId, zoneId));
    }

    if (rackId) {
      conditions.push(eq(warehouseBins.rackId, rackId));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query;
    return results;
  },

  /**
   * Get expiring inventory items
   * Returns items that will expire within the specified number of days
   */
  async getExpiring(daysUntilExpiry = 30) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + daysUntilExpiry);

    const items = await db
      .select({
        id: inventory.id,
        medicationVariantId: inventory.medicationVariantId,
        binId: inventory.binId,
        batchNumber: inventory.batchNumber,
        expiryDate: inventory.expiryDate,
        quantity: inventory.quantity,
        quantityReserved: inventory.quantityReserved,
        quantityAvailable:
          sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
            "quantity_available"
          ),
        // Medication Variant details
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        // Medication details
        medicationName: medications.name,
        medicationCode: medications.code,
        // Warehouse location details
        binCode: warehouseBins.code,
        binName: warehouseBins.name,
        rackCode: warehouseRacks.code,
        rackName: warehouseRacks.name,
        zoneCode: warehouseZones.code,
        zoneName: warehouseZones.name,
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .leftJoin(warehouseBins, eq(inventory.binId, warehouseBins.id))
      .leftJoin(warehouseRacks, eq(warehouseBins.rackId, warehouseRacks.id))
      .leftJoin(warehouseZones, eq(warehouseRacks.zoneId, warehouseZones.id))
      .where(
        and(
          gte(inventory.expiryDate, today.toISOString().split("T")[0]),
          lte(inventory.expiryDate, futureDate.toISOString().split("T")[0])
        )
      )
      .orderBy(inventory.expiryDate);

    return items;
  },

  /**
   * Get low stock items
   * Returns items where available quantity is below the threshold
   */
  async getLowStock(threshold = 10) {
    const items = await db
      .select({
        medicationVariantId: inventory.medicationVariantId,
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
        medicationName: medications.name,
        medicationCode: medications.code,
        totalQuantity: sql`SUM(${inventory.quantity})`.as("total_quantity"),
        totalReserved: sql`SUM(${inventory.quantityReserved})`.as(
          "total_reserved"
        ),
        totalAvailable:
          sql`SUM(${inventory.quantity} - ${inventory.quantityReserved})`.as(
            "total_available"
          ),
      })
      .from(inventory)
      .leftJoin(
        medicationVariants,
        eq(inventory.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .groupBy(
        inventory.medicationVariantId,
        medicationVariants.name,
        medicationVariants.sku,
        medicationVariants.unit,
        medications.name,
        medications.code
      )
      .having(
        sql`SUM(${inventory.quantity} - ${inventory.quantityReserved}) < ${threshold}`
      );

    return items;
  },
};

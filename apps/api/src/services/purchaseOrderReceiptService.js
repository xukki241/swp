import { and, eq, gte, inArray, lte } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { purchaseOrderReceiptItems } from "../db/schema/purchaseOrderReceiptItems.js";
import { purchaseOrderReceipts } from "../db/schema/purchaseOrderReceipts.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";
import logger from "../utils/logger.js";

import { inventoryAllocationService } from "./inventoryAllocationService.js";

export const purchaseOrderReceiptService = {
  // Create a new purchase order receipt with items
  async create(data) {
    logger.info("purchaseOrderReceiptService.create called with:", {
      data,
      dataKeys: Object.keys(data),
      receivedDate: data.receivedDate,
      receivedDateType: typeof data.receivedDate,
      receivedBy: data.receivedBy,
      purchaseOrderId: data.purchaseOrderId,
    });

    return await db.transaction(async (tx) => {
      const { items, ...receiptData } = data;

      // Convert receivedDate string to Date object if needed
      if (
        receiptData.receivedDate &&
        typeof receiptData.receivedDate === "string"
      ) {
        receiptData.receivedDate = new Date(receiptData.receivedDate);
        logger.info("Converted receivedDate to Date object:", {
          original: data.receivedDate,
          converted: receiptData.receivedDate,
          type: typeof receiptData.receivedDate,
        });
      }

      logger.info("Inserting receipt with data:", {
        receiptData,
        receiptDataKeys: Object.keys(receiptData),
        receivedDateFinal: receiptData.receivedDate,
        receivedDateType: typeof receiptData.receivedDate,
      });

      // Create purchase order receipt
      const [receipt] = await tx
        .insert(purchaseOrderReceipts)
        .values(receiptData)
        .returning();

      // Create items if provided
      let createdItems = [];
      const inventoryAllocations = [];

      if (items && Array.isArray(items) && items.length > 0) {
        logger.info("Incoming items data:", {
          itemsCount: items.length,
          firstItem: items[0],
        });

        // Separate batch data and bin preference from receipt item data
        const batchDataMap = new Map();
        const binPreferenceMap = new Map();
        const itemsToCreate = items.map((item) => {
          const {
            batchNumber,
            manufactureDate,
            expiryDate,
            binId,
            purchaseOrderItemId,
            quantity,
          } = item;

          // Store batch data separately keyed by purchaseOrderItemId
          batchDataMap.set(purchaseOrderItemId, {
            batchNumber: batchNumber || "NO-BATCH",
            manufactureDate: manufactureDate || null,
            expiryDate: expiryDate || null,
          });

          // Store preferred bin ID if provided
          if (binId) {
            binPreferenceMap.set(purchaseOrderItemId, binId);
          }

          // Only return fields that exist in database schema
          return {
            purchaseOrderReceiptId: receipt.id,
            purchaseOrderItemId,
            quantity,
          };
        });

        logger.info("Items to create:", {
          itemsToCreateCount: itemsToCreate.length,
          firstItemToCreate: itemsToCreate[0],
          batchDataMapSize: batchDataMap.size,
          binPreferenceMapSize: binPreferenceMap.size,
        });

        createdItems = await tx
          .insert(purchaseOrderReceiptItems)
          .values(itemsToCreate)
          .returning();

        logger.info("Created receipt items:", {
          createdItemsCount: createdItems.length,
          firstCreatedItem: createdItems[0],
        });

        // Automatically allocate inventory to warehouse bins for each item
        logger.info(
          `Creating inventory allocations for ${createdItems.length} receipt items`
        );

        for (const receiptItem of createdItems) {
          // Get medication variant ID from purchase order item
          const [poItem] = await tx
            .select({
              supplierMedicationVariantId:
                purchaseOrderItems.supplierMedicationVariantId,
            })
            .from(purchaseOrderItems)
            .where(eq(purchaseOrderItems.id, receiptItem.purchaseOrderItemId));

          if (poItem) {
            const [smv] = await tx
              .select({
                medicationVariantId:
                  supplierMedicationVariants.medicationVariantId,
              })
              .from(supplierMedicationVariants)
              .where(
                eq(
                  supplierMedicationVariants.id,
                  poItem.supplierMedicationVariantId
                )
              );

            if (smv) {
              // Get batch data and bin preference for this item
              const batchData = batchDataMap.get(
                receiptItem.purchaseOrderItemId
              );
              const preferredBinId = binPreferenceMap.get(
                receiptItem.purchaseOrderItemId
              );

              logger.info("Found supplier medication variant:", {
                smv,
                receiptItemId: receiptItem.id,
                purchaseOrderItemId: receiptItem.purchaseOrderItemId,
                batchData,
                preferredBinId,
              });

              const allocated =
                await inventoryAllocationService.allocateInventory(
                  {
                    medicationVariantId: smv.medicationVariantId,
                    purchaseOrderReceiptItemId: receiptItem.id,
                    batchNumber: batchData?.batchNumber || "NO-BATCH",
                    manufactureDate: batchData?.manufactureDate || null,
                    expiryDate: batchData?.expiryDate || null,
                    quantity: receiptItem.quantity,
                    preferredBinId, // Pass the preferred bin ID
                  },
                  tx
                );

              inventoryAllocations.push(...allocated);
              logger.info(
                `Allocated ${receiptItem.quantity} units to ${allocated.length} location(s)`
              );
            } else {
              logger.warn(
                `Supplier medication variant not found for PO item ${poItem.id}`
              );
            }
          }
        }
      }

      // Update Purchase Order status to RECEIVED
      await tx
        .update(purchaseOrders)
        .set({ status: "received" })
        .where(eq(purchaseOrders.id, receipt.purchaseOrderId));

      logger.info(
        `Updated purchase order ${receipt.purchaseOrderId} status to RECEIVED`
      );

      return {
        ...receipt,
        items: createdItems,
        inventoryAllocations, // Include allocation details in response
      };
    });
  },

  // Get all purchase order receipts with optional filtering
  async getAll(filters = {}) {
    const {
      purchaseOrderId,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: purchaseOrderReceipts.id,
        purchaseOrderId: purchaseOrderReceipts.purchaseOrderId,
        receivedDate: purchaseOrderReceipts.receivedDate,
        receivedBy: purchaseOrderReceipts.receivedBy,
        receivedByName: users.name,
        poOrderDate: purchaseOrders.orderDate,
        poStatus: purchaseOrders.status,
        supplierName: suppliers.name,
      })
      .from(purchaseOrderReceipts)
      .leftJoin(
        purchaseOrders,
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrders.id)
      )
      .leftJoin(users, eq(purchaseOrderReceipts.receivedBy, users.id))
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id));

    const conditions = [];

    if (purchaseOrderId) {
      conditions.push(
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrderId)
      );
    }

    if (startDate) {
      conditions.push(
        gte(purchaseOrderReceipts.receivedDate, new Date(startDate))
      );
    }

    if (endDate) {
      conditions.push(
        lte(purchaseOrderReceipts.receivedDate, new Date(endDate))
      );
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);

    // Calculate total amount for each receipt
    const receiptsWithTotals = await Promise.all(
      results.map(async (receipt) => {
        const items = await db
          .select({
            quantity: purchaseOrderReceiptItems.quantity,
            unitPrice: purchaseOrderItems.unitPrice,
          })
          .from(purchaseOrderReceiptItems)
          .leftJoin(
            purchaseOrderItems,
            eq(
              purchaseOrderReceiptItems.purchaseOrderItemId,
              purchaseOrderItems.id
            )
          )
          .where(
            eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, receipt.id)
          );

        const totalAmount = items.reduce(
          (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
          0
        );

        return {
          ...receipt,
          totalAmount,
        };
      })
    );

    return receiptsWithTotals;
  },

  // Get purchase order receipt by ID with items
  async getById(id) {
    const [receipt] = await db
      .select({
        id: purchaseOrderReceipts.id,
        purchaseOrderId: purchaseOrderReceipts.purchaseOrderId,
        receivedDate: purchaseOrderReceipts.receivedDate,
        receivedBy: purchaseOrderReceipts.receivedBy,
        receivedByName: users.name,
        poOrderDate: purchaseOrders.orderDate,
        poStatus: purchaseOrders.status,
        supplierName: suppliers.name,
      })
      .from(purchaseOrderReceipts)
      .leftJoin(
        purchaseOrders,
        eq(purchaseOrderReceipts.purchaseOrderId, purchaseOrders.id)
      )
      .leftJoin(users, eq(purchaseOrderReceipts.receivedBy, users.id))
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrderReceipts.id, id));

    if (!receipt) {
      return null;
    }

    // Fetch items for this purchase order receipt
    const items = await db
      .select({
        id: purchaseOrderReceiptItems.id,
        purchaseOrderReceiptId:
          purchaseOrderReceiptItems.purchaseOrderReceiptId,
        purchaseOrderItemId: purchaseOrderReceiptItems.purchaseOrderItemId,
        quantity: purchaseOrderReceiptItems.quantity,
        orderedQuantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderReceiptItems)
      .leftJoin(
        purchaseOrderItems,
        eq(purchaseOrderReceiptItems.purchaseOrderItemId, purchaseOrderItems.id)
      )
      .leftJoin(
        supplierMedicationVariants,
        eq(
          purchaseOrderItems.supplierMedicationVariantId,
          supplierMedicationVariants.id
        )
      )
      .leftJoin(
        medicationVariants,
        eq(
          supplierMedicationVariants.medicationVariantId,
          medicationVariants.id
        )
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));

    return {
      ...receipt,
      items,
    };
  },

  // Update purchase order receipt with optional items
  async update(id, data) {
    return await db.transaction(async (tx) => {
      const { items, ...receiptData } = data;

      // Update purchase order receipt
      const [receipt] = await tx
        .update(purchaseOrderReceipts)
        .set(receiptData)
        .where(eq(purchaseOrderReceipts.id, id))
        .returning();

      if (!receipt) {
        return null;
      }

      // If items are provided, replace existing ones
      let updatedItems = [];
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx
          .delete(purchaseOrderReceiptItems)
          .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));

        // Create new items
        if (items.length > 0) {
          const itemsToCreate = items.map((item) => ({
            ...item,
            purchaseOrderReceiptId: receipt.id,
          }));
          updatedItems = await tx
            .insert(purchaseOrderReceiptItems)
            .values(itemsToCreate)
            .returning();
        }
      } else {
        // If no items provided, fetch existing ones
        updatedItems = await tx
          .select()
          .from(purchaseOrderReceiptItems)
          .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));
      }

      return {
        ...receipt,
        items: updatedItems,
      };
    });
  },

  // Delete purchase order receipt
  async delete(id) {
    logger.info(`Deleting receipt with ID: ${id}`);

    return await db.transaction(async (tx) => {
      // Get all receipt items
      const receiptItems = await tx
        .select({ id: purchaseOrderReceiptItems.id })
        .from(purchaseOrderReceiptItems)
        .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id));

      logger.info(
        `Found ${receiptItems.length} receipt items to delete for receipt ${id}`
      );

      if (receiptItems.length > 0) {
        const receiptItemIds = receiptItems.map((item) => item.id);

        // Delete inventory records first
        const deletedInventory = await tx
          .delete(inventory)
          .where(inArray(inventory.purchaseOrderReceiptItemsId, receiptItemIds))
          .returning();

        logger.info(
          `Deleted ${deletedInventory.length} inventory records for receipt ${id}`
        );

        // Delete receipt items
        const deletedItems = await tx
          .delete(purchaseOrderReceiptItems)
          .where(eq(purchaseOrderReceiptItems.purchaseOrderReceiptId, id))
          .returning();

        logger.info(
          `Deleted ${deletedItems.length} receipt items for receipt ${id}`
        );
      }

      // Delete receipt
      const [receipt] = await tx
        .delete(purchaseOrderReceipts)
        .where(eq(purchaseOrderReceipts.id, id))
        .returning();

      logger.info(`Successfully deleted receipt ${id}`);

      return receipt;
    });
  },
};

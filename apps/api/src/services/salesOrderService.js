import { and, desc, eq, gte, lte, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { inventory } from "../db/schema/inventory.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { salesOrderItems } from "../db/schema/salesOrderItems.js";
import { salesOrders } from "../db/schema/salesOrders.js";

export const salesOrderService = {
  /**
   * Create a new sales order with items
   * Automatically reserves inventory using FIFO (First Expiry First Out)
   */
  async create(orderData, userId) {
    return await db.transaction(async (tx) => {
      const { items, ...soData } = orderData;

      if (!items || items.length === 0) {
        throw new Error("Sales order must have at least one item");
      }

      // Validate all items and check inventory availability
      const itemsToCreate = [];
      let totalAmount = 0;

      for (const item of items) {
        const { medication_variant_id, quantity } = item;

        // Get medication variant details using query API
        const variant = await tx.query.medicationVariants.findFirst({
          where: eq(medicationVariants.id, medication_variant_id),
          columns: {
            id: true,
            name: true,
            sku: true,
            sellPrice: true,
            isForSale: true,
            isActive: true,
          },
        });

        if (!variant) {
          throw new Error(
            `Medication variant with ID ${medication_variant_id} not found`
          );
        }

        if (!variant.isActive || !variant.isForSale) {
          throw new Error(
            `Medication variant ${variant.name} (${variant.sku}) is not available for sale`
          );
        }

        // Check available inventory (FEFO - First Expired First Out)
        // Note: Using .select() for inventory FEFO queries in transactions
        // because we need precise control over orderBy with multiple columns and computed columns
        const availableInventory = await tx
          .select({
            id: inventory.id,
            quantity: inventory.quantity,
            quantityReserved: inventory.quantityReserved,
            quantityAvailable:
              sql`${inventory.quantity} - ${inventory.quantityReserved}`.as(
                "quantity_available"
              ),
            expiryDate: inventory.expiryDate,
            batchNumber: inventory.batchNumber,
          })
          .from(inventory)
          .where(
            and(
              eq(inventory.medicationVariantId, medication_variant_id),
              sql`${inventory.quantity} - ${inventory.quantityReserved} > 0`
            )
          )
          .orderBy(inventory.expiryDate, inventory.batchNumber);

        const totalAvailable = availableInventory.reduce(
          (sum, inv) => sum + Number(inv.quantityAvailable),
          0
        );

        if (totalAvailable < quantity) {
          throw new Error(
            `Insufficient inventory for ${variant.name} (${variant.sku}). ` +
            `Requested: ${quantity}, Available: ${totalAvailable}`
          );
        }

        // Reserve inventory using FEFO
        let remainingQuantity = quantity;
        for (const inv of availableInventory) {
          if (remainingQuantity <= 0) {
            break;
          }

          const availableInBatch = Number(inv.quantityAvailable);
          const toReserve = Math.min(remainingQuantity, availableInBatch);

          await tx
            .update(inventory)
            .set({
              quantityReserved: sql`${inventory.quantityReserved} + ${toReserve}`,
            })
            .where(eq(inventory.id, inv.id));

          remainingQuantity -= toReserve;
        }

        // Calculate item total
        const unitPrice = Number(variant.sellPrice);
        const totalPrice = unitPrice * quantity;
        totalAmount += totalPrice;

        itemsToCreate.push({
          medicationVariantId: medication_variant_id,
          quantity,
          unitPrice,
          totalPrice,
        });
      }

      // Create sales order
      const [order] = await tx
        .insert(salesOrders)
        .values({
          customerId: soData.customer_id,
          paymentMethod: soData.payment_method || "cash",
          totalAmount: totalAmount,
          status: "pending",
          salespersonId: userId || null,
          prescriptionId: soData.prescription_id || null,
          orderDate: new Date(),
        })
        .returning();

      // Create sales order items
      const createdItems = await tx
        .insert(salesOrderItems)
        .values(
          itemsToCreate.map((item) => ({
            ...item,
            salesOrderId: order.id,
          }))
        )
        .returning();

      // Query the order again with relations to get customer and salesperson info
      const orderWithRelations = await tx.query.salesOrders.findFirst({
        where: eq(salesOrders.id, order.id),
        with: {
          customer: true,
          salesperson: true,
        },
      });

      return {
        ...orderWithRelations,
        items: createdItems,
      };
    });
  },

  /**
   * Get all sales orders with optional filtering and pagination
   */
  async getAll(filters = {}) {
    const {
      customerId,
      status,
      paymentMethod,
      salespersonId,
      orderDateFrom,
      orderDateTo,
      sortBy = "orderDate",
      sortOrder = "desc",
      limit = 100,
      offset = 0,
    } = filters;

    const conditions = [];

    if (customerId) {
      conditions.push(eq(salesOrders.customerId, customerId));
    }

    if (status) {
      conditions.push(eq(salesOrders.status, status));
    }

    if (paymentMethod) {
      conditions.push(eq(salesOrders.paymentMethod, paymentMethod));
    }

    if (salespersonId) {
      conditions.push(eq(salesOrders.salespersonId, salespersonId));
    }

    if (orderDateFrom) {
      conditions.push(gte(salesOrders.orderDate, new Date(orderDateFrom)));
    }

    if (orderDateTo) {
      conditions.push(lte(salesOrders.orderDate, new Date(orderDateTo)));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)`.as("count") })
      .from(salesOrders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = Number(countResult[0]?.count || 0);

    // Get data with relations
    const data = await db.query.salesOrders.findMany({
      where: conditions.length > 0 ? and(...conditions) : undefined,
      with: {
        customer: true,
        salesperson: true,
      },
      orderBy:
        sortOrder === "asc"
          ? salesOrders[sortBy] || salesOrders.orderDate
          : desc(salesOrders[sortBy] || salesOrders.orderDate),
      limit,
      offset,
    });

    return {
      data,
      total: totalCount,
    };
  },

  /**
   * Get sales order by ID with items
   * @param {string} id - UUID string
   */
  async getById(id) {
    const order = await db.query.salesOrders.findFirst({
      where: eq(salesOrders.id, id),
      with: {
        customer: true,
        salesperson: true,
        items: {
          with: {
            medicationVariant: {
              with: {
                medication: true,
              },
            },
          },
        },
      },
    });

    return order;
  },

  /**
   * Update sales order status
   * When completed: deduct from inventory
   * When cancelled: unreserve inventory
   * @param {string} id - UUID string
   */
  async update(id, updateData) {
    return await db.transaction(async (tx) => {
      // Get current order using query API
      const currentOrder = await tx.query.salesOrders.findFirst({
        where: eq(salesOrders.id, id),
        columns: {
          id: true,
          status: true,
          customerId: true,
          totalAmount: true,
        },
      });

      if (!currentOrder) {
        return null;
      }

      const { status: newStatus } = updateData;

      // Handle status transitions
      if (newStatus && newStatus !== currentOrder.status) {
        // Get order items using query API
        const items = await tx.query.salesOrderItems.findMany({
          where: eq(salesOrderItems.salesOrderId, id),
          columns: {
            id: true,
            medicationVariantId: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        });

        // If completing order: deduct inventory
        if (newStatus === "completed" && currentOrder.status === "pending") {
          for (const item of items) {
            // Deduct reserved quantity from inventory (FEFO)
            let remainingQuantity = Number(item.quantity);

            // Note: Using .select() for inventory FEFO queries in transactions
            // because we need precise control over orderBy and column selection
            const inventoryRecords = await tx
              .select({
                id: inventory.id,
                quantity: inventory.quantity,
                quantityReserved: inventory.quantityReserved,
              })
              .from(inventory)
              .where(
                and(
                  eq(inventory.medicationVariantId, item.medicationVariantId),
                  sql`${inventory.quantityReserved} > 0`
                )
              )
              .orderBy(inventory.expiryDate);

            for (const inv of inventoryRecords) {
              if (remainingQuantity <= 0) {
                break;
              }

              const reserved = Number(inv.quantityReserved);
              const toDeduct = Math.min(remainingQuantity, reserved);

              await tx
                .update(inventory)
                .set({
                  quantity: sql`${inventory.quantity} - ${toDeduct}`,
                  quantityReserved: sql`${inventory.quantityReserved} - ${toDeduct}`,
                })
                .where(eq(inventory.id, inv.id));

              remainingQuantity -= toDeduct;
            }
          }
        }

        // If cancelling order: unreserve inventory
        if (newStatus === "cancelled") {
          for (const item of items) {
            let remainingQuantity = Number(item.quantity);

            // Note: Using .select() for inventory FEFO queries in transactions
            // because we need precise control over orderBy and column selection
            const inventoryRecords = await tx
              .select({
                id: inventory.id,
                quantityReserved: inventory.quantityReserved,
              })
              .from(inventory)
              .where(
                and(
                  eq(inventory.medicationVariantId, item.medicationVariantId),
                  sql`${inventory.quantityReserved} > 0`
                )
              )
              .orderBy(inventory.expiryDate);

            for (const inv of inventoryRecords) {
              if (remainingQuantity <= 0) {
                break;
              }

              const reserved = Number(inv.quantityReserved);
              const toUnreserve = Math.min(remainingQuantity, reserved);

              await tx
                .update(inventory)
                .set({
                  quantityReserved: sql`${inventory.quantityReserved} - ${toUnreserve}`,
                })
                .where(eq(inventory.id, inv.id));

              remainingQuantity -= toUnreserve;
            }
          }
        }
      }

      // Update order
      const [updatedOrder] = await tx
        .update(salesOrders)
        .set(updateData)
        .where(eq(salesOrders.id, id))
        .returning();

      // Query order with relations for complete data (needed for email)
      const orderWithRelations = await tx.query.salesOrders.findFirst({
        where: eq(salesOrders.id, id),
        with: {
          customer: true,
          salesperson: true,
          items: {
            with: {
              medicationVariant: {
                with: {
                  medication: true,
                },
              },
            },
          },
        },
      });

      // Enrich items with medication names
      if (orderWithRelations?.items) {
        orderWithRelations.items = orderWithRelations.items.map((item) => ({
          ...item,
          medicationName: item.medicationVariant?.medication?.name || "Unknown",
          variantName: item.medicationVariant?.name || "",
          sellPrice: item.unitPrice,
        }));
      }

      return orderWithRelations || updatedOrder;
    });
  },

  /**
   * Delete (cancel) sales order
   * Unreserves all inventory
   * @param {string} id - UUID string
   */
  async delete(id) {
    return await db.transaction(async (tx) => {
      // Get order items to unreserve inventory using query API
      const items = await tx.query.salesOrderItems.findMany({
        where: eq(salesOrderItems.salesOrderId, id),
        columns: {
          id: true,
          medicationVariantId: true,
          quantity: true,
        },
      });

      // Unreserve inventory for all items
      for (const item of items) {
        let remainingQuantity = Number(item.quantity);

        // Note: For inventory updates within transactions, we still need .select()
        // because db.query doesn't support orderBy with multiple columns directly
        // in a way that's compatible with transaction context
        const inventoryRecords = await tx
          .select({
            id: inventory.id,
            quantityReserved: inventory.quantityReserved,
          })
          .from(inventory)
          .where(
            and(
              eq(inventory.medicationVariantId, item.medicationVariantId),
              sql`${inventory.quantityReserved} > 0`
            )
          )
          .orderBy(inventory.expiryDate);

        for (const inv of inventoryRecords) {
          if (remainingQuantity <= 0) {
            break;
          }

          const reserved = Number(inv.quantityReserved);
          const toUnreserve = Math.min(remainingQuantity, reserved);

          await tx
            .update(inventory)
            .set({
              quantityReserved: sql`${inventory.quantityReserved} - ${toUnreserve}`,
            })
            .where(eq(inventory.id, inv.id));

          remainingQuantity -= toUnreserve;
        }
      }

      // Delete order items
      await tx
        .delete(salesOrderItems)
        .where(eq(salesOrderItems.salesOrderId, id));

      // Delete order
      const [deletedOrder] = await tx
        .delete(salesOrders)
        .where(eq(salesOrders.id, id))
        .returning();

      return deletedOrder;
    });
  },
};

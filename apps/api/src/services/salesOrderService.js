import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

import { db } from "../db/index.js";
import { customers } from "../db/schema/customers.js";
import { inventory } from "../db/schema/inventory.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { salesOrderItems } from "../db/schema/salesOrderItems.js";
import { salesOrders } from "../db/schema/salesOrders.js";
import { users } from "../db/schema/users.js";

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

        // Get medication variant details
        const [variant] = await tx
          .select({
            id: medicationVariants.id,
            name: medicationVariants.name,
            sku: medicationVariants.sku,
            sellPrice: medicationVariants.sellPrice,
            isForSale: medicationVariants.isForSale,
            isActive: medicationVariants.isActive,
          })
          .from(medicationVariants)
          .where(eq(medicationVariants.id, medication_variant_id));

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

      return {
        ...order,
        items: createdItems,
      };
    });
  },

  /**
   * Get all sales orders with optional filtering
   */
  async getAll(filters = {}) {
    const {
      customerId,
      status,
      paymentMethod,
      salespersonId,
      orderDateFrom,
      orderDateTo,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: salesOrders.id,
        customerId: salesOrders.customerId,
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
        paymentMethod: salesOrders.paymentMethod,
        salespersonId: salesOrders.salespersonId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        salespersonName: users.name,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(users, eq(salesOrders.salespersonId, users.id))
      .orderBy(desc(salesOrders.orderDate));

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

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  /**
   * Get sales order by ID with items
   */
  async getById(id) {
    const [order] = await db
      .select({
        id: salesOrders.id,
        customerId: salesOrders.customerId,
        orderDate: salesOrders.orderDate,
        totalAmount: salesOrders.totalAmount,
        status: salesOrders.status,
        paymentMethod: salesOrders.paymentMethod,
        salespersonId: salesOrders.salespersonId,
        customerName: customers.name,
        customerEmail: customers.email,
        customerPhone: customers.phone,
        customerAddress: customers.address,
        salespersonName: users.name,
      })
      .from(salesOrders)
      .leftJoin(customers, eq(salesOrders.customerId, customers.id))
      .leftJoin(users, eq(salesOrders.salespersonId, users.id))
      .where(eq(salesOrders.id, id));

    if (!order) {
      return null;
    }

    // Fetch items for this sales order
    const items = await db
      .select({
        id: salesOrderItems.id,
        salesOrderId: salesOrderItems.salesOrderId,
        medicationVariantId: salesOrderItems.medicationVariantId,
        quantity: salesOrderItems.quantity,
        unitPrice: salesOrderItems.unitPrice,
        totalPrice: salesOrderItems.totalPrice,
        medicationName: medications.name,
        medicationCode: medications.code,
        variantName: medicationVariants.name,
        variantSku: medicationVariants.sku,
        variantUnit: medicationVariants.unit,
      })
      .from(salesOrderItems)
      .leftJoin(
        medicationVariants,
        eq(salesOrderItems.medicationVariantId, medicationVariants.id)
      )
      .leftJoin(
        medications,
        eq(medicationVariants.medicationId, medications.id)
      )
      .where(eq(salesOrderItems.salesOrderId, id));

    return {
      ...order,
      items,
    };
  },

  /**
   * Update sales order status
   * When completed: deduct from inventory
   * When cancelled: unreserve inventory
   */
  async update(id, updateData) {
    return await db.transaction(async (tx) => {
      // Get current order
      const [currentOrder] = await tx
        .select()
        .from(salesOrders)
        .where(eq(salesOrders.id, id));

      if (!currentOrder) {
        return null;
      }

      const { status: newStatus } = updateData;

      // Handle status transitions
      if (newStatus && newStatus !== currentOrder.status) {
        // Get order items
        const items = await tx
          .select()
          .from(salesOrderItems)
          .where(eq(salesOrderItems.salesOrderId, id));

        // If completing order: deduct inventory
        if (newStatus === "completed" && currentOrder.status === "pending") {
          for (const item of items) {
            // Deduct reserved quantity from inventory (FEFO)
            let remainingQuantity = Number(item.quantity);

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

      return updatedOrder;
    });
  },

  /**
   * Delete (cancel) sales order
   * Unreserves all inventory
   */
  async delete(id) {
    return await db.transaction(async (tx) => {
      // Get order items to unreserve inventory
      const items = await tx
        .select()
        .from(salesOrderItems)
        .where(eq(salesOrderItems.salesOrderId, id));

      // Unreserve inventory for all items
      for (const item of items) {
        let remainingQuantity = Number(item.quantity);

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

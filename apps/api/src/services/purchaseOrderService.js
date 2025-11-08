import { and, eq, gte, lte } from "drizzle-orm";

import { db } from "../db/index.js";
import { medications } from "../db/schema/medications.js";
import { medicationVariants } from "../db/schema/medicationVariants.js";
import { purchaseOrderItems } from "../db/schema/purchaseOrderItems.js";
import { purchaseOrders } from "../db/schema/purchaseOrders.js";
import { supplierMedicationVariants } from "../db/schema/supplierMedicationVariants.js";
import { suppliers } from "../db/schema/suppliers.js";
import { users } from "../db/schema/users.js";

export const purchaseOrderService = {
  // Create a new purchase order with items
  async create(data, userId) {
    return await db.transaction(async (tx) => {
      const createdOrders = [];

      for (const order of data) {
        const { supplier_id, expected_date, items } = order;

        // basic validation
        if (!supplier_id) {
          throw new Error("supplier_id is required for each purchase order");
        }
        if (!Array.isArray(items) || items.length === 0) {
          throw new Error("items must be a non-empty array");
        }

        // ✅ Tính tổng tiền, đảm bảo numbers
        const totalAmount = items.reduce((sum, item) => {
          const q = Number(item.quantity);
          const p = Number(item.unit_price);
          if (Number.isNaN(q) || Number.isNaN(p)) {
            throw new Error(
              "item.quantity and item.unit_price must be numbers"
            );
          }
          return sum + q * p;
        }, 0);

        // Parse expected_date safely
        const parseExpectedDate = (val) => {
          if (val === undefined || val === null) {
            return null;
          }
          if (typeof val === "string") {
            const s = val.trim();
            if (s === "") {
              return null;
            }
            const d = new Date(s);
            if (isNaN(d.getTime())) {
              return null;
            }
            return d;
          }
          if (val instanceof Date) {
            if (isNaN(val.getTime())) {
              return null;
            }
            return val;
          }
          // other types - ignore
          return null;
        };

        const parsedExpectedDate = parseExpectedDate(expected_date);

        // Create purchase order
        const [po] = await tx
          .insert(purchaseOrders)
          .values({
            supplierId: supplier_id,
            orderDate: new Date(),
            expectedDate: parsedExpectedDate,
            status: "pending",
            totalAmount: totalAmount,
            createdBy: userId,
          })
          .returning();

        // ✅ Tạo items
        const createdItems = await tx
          .insert(purchaseOrderItems)
          .values(
            items.map((item) => ({
              purchaseOrderId: po.id,
              supplierMedicationVariantId: item.supplier_medication_variant_id,
              quantity: Number(item.quantity),
              unitPrice: Number(item.unit_price),
              totalPrice: Number(item.quantity) * Number(item.unit_price),
            }))
          )
          .returning();

        createdOrders.push({ ...po, items: createdItems });
      }

      return createdOrders;
    });
  },

  // Get all purchase orders with optional filtering
  async getAll(filters = {}) {
    const {
      supplierId,
      status,
      startDate,
      endDate,
      limit = 100,
      offset = 0,
    } = filters;

    let query = db
      .select({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        createdBy: purchaseOrders.createdBy,
        supplierName: suppliers.name,
        createdByName: users.name,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(users, eq(purchaseOrders.createdBy, users.id));

    const conditions = [];

    if (supplierId) {
      conditions.push(eq(purchaseOrders.supplierId, supplierId));
    }

    if (status) {
      conditions.push(eq(purchaseOrders.status, status));
    }

    if (startDate) {
      conditions.push(gte(purchaseOrders.orderDate, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(purchaseOrders.orderDate, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query.limit(limit).offset(offset);
    return results;
  },

  // Get purchase order by ID with items
  async getById(id) {
    const [po] = await db
      .select({
        id: purchaseOrders.id,
        supplierId: purchaseOrders.supplierId,
        orderDate: purchaseOrders.orderDate,
        expectedDate: purchaseOrders.expectedDate,
        status: purchaseOrders.status,
        totalAmount: purchaseOrders.totalAmount,
        createdBy: purchaseOrders.createdBy,
        supplierName: suppliers.name,
        createdByName: users.name,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
      .where(eq(purchaseOrders.id, id));

    if (!po) {
      return null;
    }

    // Fetch items for this purchase order
    const items = await db
      .select({
        id: purchaseOrderItems.id,
        purchaseOrderId: purchaseOrderItems.purchaseOrderId,
        supplierMedicationVariantId:
          purchaseOrderItems.supplierMedicationVariantId,
        quantity: purchaseOrderItems.quantity,
        unitPrice: purchaseOrderItems.unitPrice,
        totalPrice: purchaseOrderItems.totalPrice,
        medicationName: medications.name,
        variantName: medicationVariants.name,
      })
      .from(purchaseOrderItems)
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
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    return {
      ...po,
      items,
    };
  },

  // Update purchase order with optional items
  async update(id, data) {
    return await db.transaction(async (tx) => {
      const { items, ...poData } = data;

      // Update purchase order
      const [po] = await tx
        .update(purchaseOrders)
        .set(poData)
        .where(eq(purchaseOrders.id, id))
        .returning();

      if (!po) {
        return null;
      }

      // If items are provided, replace existing ones
      let updatedItems = [];
      if (items && Array.isArray(items)) {
        // Delete existing items
        await tx
          .delete(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, id));

        // Create new items
        if (items.length > 0) {
          const itemsToCreate = items.map((item) => ({
            ...item,
            purchaseOrderId: po.id,
          }));
          updatedItems = await tx
            .insert(purchaseOrderItems)
            .values(itemsToCreate)
            .returning();
        }
      } else {
        // If no items provided, fetch existing ones
        updatedItems = await tx
          .select()
          .from(purchaseOrderItems)
          .where(eq(purchaseOrderItems.purchaseOrderId, id));
      }

      return {
        ...po,
        items: updatedItems,
      };
    });
  },

  // Delete purchase order
  async delete(id) {
    const [po] = await db
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning();
    return po;
  },

  // Confirm purchase order (supplier confirmation)
  async confirmOrder(purchaseOrderId, token) {
    const { verifyConfirmationToken, sendConfirmationNotificationEmail } =
      await import("../utils/purchaseOrderEmail.js");

    // Verify token
    if (!verifyConfirmationToken(token, purchaseOrderId)) {
      throw new Error(
        "Invalid or expired confirmation token. Please contact the buyer for a new link."
      );
    }

    return await db.transaction(async (tx) => {
      // Get purchase order with all related data
      const [po] = await tx
        .select({
          id: purchaseOrders.id,
          orderDate: purchaseOrders.orderDate,
          expectedDate: purchaseOrders.expectedDate,
          status: purchaseOrders.status,
          totalAmount: purchaseOrders.totalAmount,
          supplierName: suppliers.name,
          supplierEmail: suppliers.email,
          supplierContact: suppliers.contactName,
          buyerEmail: users.email,
          buyerName: users.name,
        })
        .from(purchaseOrders)
        .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
        .leftJoin(users, eq(purchaseOrders.createdBy, users.id))
        .where(eq(purchaseOrders.id, purchaseOrderId));

      if (!po) {
        throw new Error("Purchase order not found");
      }

      // Check if already confirmed/ordered
      if (po.status === "ordered") {
        throw new Error("This purchase order has already been confirmed");
      }

      // Check if cancelled
      if (po.status === "cancelled") {
        throw new Error("This purchase order has been cancelled");
      }

      // Update status to "ordered"
      const [updatedPo] = await tx
        .update(purchaseOrders)
        .set({
          status: "ordered",
          updatedAt: new Date(),
        })
        .where(eq(purchaseOrders.id, purchaseOrderId))
        .returning();

      // Generate order number from ID (first 8 chars)
      const orderNumber = purchaseOrderId.substring(0, 8).toUpperCase();

      // Send notification email to owner/buyer
      if (po.buyerEmail) {
        try {
          await sendConfirmationNotificationEmail({
            ownerEmail: po.buyerEmail,
            ownerName: po.buyerName || "Owner",
            supplierName: po.supplierName,
            supplierEmail: po.supplierEmail,
            orderNumber,
            orderDate: po.orderDate
              ? new Date(po.orderDate).toLocaleDateString("vi-VN")
              : "N/A",
            expectedDeliveryDate: po.expectedDate
              ? new Date(po.expectedDate).toLocaleDateString("vi-VN")
              : "N/A",
            totalAmount: po.totalAmount,
            confirmedAt: new Date().toLocaleString("vi-VN"),
          });
        } catch (emailError) {
          // Log error but don't fail the confirmation
          console.error("Failed to send confirmation email:", emailError);
        }
      }

      return {
        success: true,
        orderNumber,
        purchaseOrder: updatedPo,
      };
    });
  },
};

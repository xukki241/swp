import {
  bigint,
  text,
  pgTable,
  pgEnum,
  timestamp,
  date,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { suppliers } from "./suppliers.js";
import { purchaseOrderItems } from "./purchase-order-items.js";

export const purchaseOrderStatusEnum = pgEnum("purchase_order_status", [
  "draft",
  "submitted",
  "partially_received",
  "completed",
  "cancelled",
]);

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    supplierId: bigint("supplier_id", { mode: "number" })
      .notNull()
      .references(() => suppliers.id, { onDelete: "restrict" }),
    orderDate: timestamp("order_date").defaultNow(),
    expectedDeliveryDate: date("expected_delivery_date"),
    status: purchaseOrderStatusEnum("status").default("draft"),
    notes: text("notes"),
  },
  (table) => [
    index("idx_purchase_orders_user_id").on(table.userId),
    index("idx_purchase_orders_supplier_id").on(table.supplierId),
    index("idx_purchase_orders_order_date").on(table.orderDate),
    index("idx_purchase_orders_status").on(table.status),
    index("idx_purchase_orders_expected_delivery_date").on(
      table.expectedDeliveryDate
    ),
  ]
);

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    user: one(users, {
      fields: [purchaseOrders.userId],
      references: [users.id],
    }),
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    items: many(purchaseOrderItems),
  })
);

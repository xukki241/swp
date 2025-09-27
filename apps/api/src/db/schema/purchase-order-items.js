import {
  bigint,
  integer,
  decimal,
  pgTable,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { medicationVariants } from "./medication-variants.js";
import { purchaseOrders } from "./purchase-orders.js";

export const purchaseOrderItems = pgTable(
  "purchase_order_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    purchaseOrderId: bigint("purchase_order_id", { mode: "number" })
      .notNull()
      .references(() => purchaseOrders.id, { onDelete: "cascade" }),
    medicationVariantId: bigint("medication_variant_id", { mode: "number" })
      .notNull()
      .references(() => medicationVariants.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
    receivedQuantity: integer("received_quantity").default(0),
  },
  table => [
    unique().on(table.purchaseOrderId, table.medicationVariantId),
    index("idx_purchase_order_items_purchase_order_id").on(
      table.purchaseOrderId
    ),
    index("idx_purchase_order_items_medication_variant_id").on(
      table.medicationVariantId
    ),
  ]
);

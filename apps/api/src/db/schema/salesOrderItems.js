import { pgTable, bigint, integer } from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { salesOrders } from "./salesOrders.js";

export const salesOrderItems = pgTable("sales_order_items", {
  id: identityPrimaryKey(),
  salesOrderId: bigint("sales_order_id", { mode: "number" })
    .notNull()
    .references(() => salesOrders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  medicationVariantId: bigint("medication_variant_id", { mode: "number" })
    .notNull()
    .references(() => medicationVariants.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  quantity: integer("quantity").notNull(),
  unitPrice: decimalColumn("unit_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
  totalPrice: decimalColumn("total_price", {
    precision: 10,
    scale: 2,
  }).notNull(),
});

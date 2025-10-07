import { pgTable, bigint, integer } from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common";
import { purchaseOrders } from "./purchaseOrders";
import { supplierMedicationVariants } from "./supplierMedicationVariants";

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: identityPrimaryKey(),
  purchaseOrderId: bigint("purchase_order_id", { mode: "bigint" })
    .notNull()
    .references(() => purchaseOrders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  supplierMedicationVariantId: bigint("supplier_medication_variant_id", {
    mode: "bigint",
  })
    .notNull()
    .references(() => supplierMedicationVariants.id, {
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

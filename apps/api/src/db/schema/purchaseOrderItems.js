import { pgTable } from "drizzle-orm/pg-core";

import {
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  int,
} from "./common.js";
import { purchaseOrders } from "./purchaseOrders.js";
import { supplierMedicationVariants } from "./supplierMedicationVariants.js";

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: identityPrimaryKey(),
  purchaseOrderId: foreignKey("purchase_order_id", purchaseOrders.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }).notNull(),
  supplierMedicationVariantId: foreignKey(
    "supplier_medication_variant_id",
    supplierMedicationVariants.id,
    {
      onDelete: "restrict",
      onUpdate: "cascade",
    }
  ).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimalColumn("unit_price").notNull(),
  totalPrice: decimalColumn("total_price").notNull(),
});

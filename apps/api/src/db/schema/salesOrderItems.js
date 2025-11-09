import { pgTable } from "drizzle-orm/pg-core";

import {
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  int,
} from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { salesOrders } from "./salesOrders.js";

export const salesOrderItems = pgTable("sales_order_items", {
  id: identityPrimaryKey(),
  salesOrderId: foreignKey("sales_order_id", salesOrders.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }).notNull(),
  medicationVariantId: foreignKey(
    "medication_variant_id",
    medicationVariants.id,
    {
      onDelete: "restrict",
      onUpdate: "cascade",
    }
  ).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimalColumn("unit_price").notNull(),
  totalPrice: decimalColumn("total_price").notNull(),
});

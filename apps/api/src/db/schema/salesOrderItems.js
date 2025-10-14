import { pgTable } from "drizzle-orm/pg-core";

import {
  decimalColumn,
  identityPrimaryKey,
  foreignKey,
  int,
} from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { salesOrders } from "./salesOrders.js";

export const salesOrderItems = pgTable("sales_order_items", {
  id: identityPrimaryKey(),
  salesOrderId: foreignKey("sales_order_id", salesOrders.id).notNull(),
  medicationVariantId: foreignKey(
    "medication_variant_id",
    medicationVariants.id
  ).notNull(),
  quantity: int("quantity").notNull(),
  unitPrice: decimalColumn("unit_price").notNull(),
  totalPrice: decimalColumn("total_price").notNull(),
});

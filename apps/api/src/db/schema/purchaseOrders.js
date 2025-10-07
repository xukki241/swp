import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common.js";
import { purchaseOrderStatus } from "./enums.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";

export const purchaseOrders = pgTable("purchase_orders", {
  id: identityPrimaryKey(),
  supplierId: bigint("supplier_id", { mode: "bigint" })
    .notNull()
    .references(() => suppliers.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  expectedDate: timestamp("expected_date"),
  status: purchaseOrderStatus("status").notNull().default("pending"),
  totalAmount: decimalColumn("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default(0),
  createdBy: bigint("created_by", { mode: "bigint" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
});

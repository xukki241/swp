import { pgTable, timestamp } from "drizzle-orm/pg-core";

import {
  createdAt,
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
} from "./common.js";
import { purchaseOrderStatus } from "./enums.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";

export const purchaseOrders = pgTable("purchase_orders", {
  id: identityPrimaryKey(),
  supplierId: foreignKey("supplier_id", suppliers.id).notNull(),
  orderDate: createdAt("order_date"),
  expectedDate: timestamp("expected_date"),
  status: purchaseOrderStatus("status").notNull().default("pending"),
  totalAmount: decimalColumn("total_amount").notNull().default(0),
  createdBy: foreignKey("created_by", users.id),
});

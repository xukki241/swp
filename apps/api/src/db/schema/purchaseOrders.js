import { index, pgTable, timestamp } from "drizzle-orm/pg-core";

import {
  createdAt,
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  searchVector,
} from "./common.js";
import { purchaseOrderStatus } from "./enums.js";
import { suppliers } from "./suppliers.js";
import { users } from "./users.js";

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: identityPrimaryKey(),
    supplierId: foreignKey("supplier_id", suppliers.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }).notNull(),
    orderDate: createdAt("order_date"),
    expectedDate: timestamp("expected_date"),
    status: purchaseOrderStatus("status").notNull().default("pending"),
    totalAmount: decimalColumn("total_amount").notNull().default(0),
    createdBy: foreignKey("created_by", users.id, {
      onDelete: "set null",
      onUpdate: "cascade",
    }),
    searchVector: searchVector(),
  },
  (table) => [
    index("purchase_orders_search_vector_idx").using("gin", table.searchVector),
  ]
);

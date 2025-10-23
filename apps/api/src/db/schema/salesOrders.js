import { index, pgTable } from "drizzle-orm/pg-core";

import {
  createdAt,
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  searchVector,
} from "./common.js";
import { customers } from "./customers.js";
import { salesOrderPaymentMethod, salesOrderStatus } from "./enums.js";
import { files } from "./files.js";
import { users } from "./users.js";

export const salesOrders = pgTable("sales_orders", {
  id: identityPrimaryKey(),
  customerId: foreignKey("customer_id", customers.id).notNull(),
  orderDate: createdAt("order_date"),
  totalAmount: decimalColumn("total_amount").notNull().default(0),
  status: salesOrderStatus("status").notNull().default("pending"),
  paymentMethod: salesOrderPaymentMethod("payment_method")
    .notNull()
    .default("cash"),
  salespersonId: foreignKey("salesperson_id", users.id),
  prescriptionId: foreignKey("prescription_id", files.id),
  searchVector: searchVector(),
}, (table) => [
  index("sales_orders_search_vector_idx").using("gin", table.searchVector),
]);

import { pgTable } from "drizzle-orm/pg-core";

import {
  decimalColumn,
  identityPrimaryKey,
  foreignKey,
  createdAt,
} from "./common.js";
import { customers } from "./customers.js";
import { salesOrderPaymentMethod, salesOrderStatus } from "./enums.js";
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
});

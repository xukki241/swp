import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common.js";
import { customers } from "./customers.js";
import { salesOrderPaymentMethod, salesOrderStatus } from "./enums.js";
import { users } from "./users.js";

export const salesOrders = pgTable("sales_orders", {
  id: identityPrimaryKey(),
  customerId: bigint("customer_id", { mode: "number" })
    .notNull()
    .references(() => customers.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }),
  orderDate: timestamp("order_date").notNull().defaultNow(),
  totalAmount: decimalColumn("total_amount", { precision: 10, scale: 2 })
    .notNull()
    .default(0),
  status: salesOrderStatus("status").notNull().default("pending"),
  paymentMethod: salesOrderPaymentMethod("payment_method")
    .notNull()
    .default("cash"),
  salespersonId: bigint("salesperson_id", { mode: "number" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
});

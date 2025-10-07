import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common";
import { customers } from "./customers";
import { salesOrderPaymentMethod, salesOrderStatus } from "./enums";
import { users } from "./users";

export const salesOrders = pgTable("sales_orders", {
  id: identityPrimaryKey(),
  customerId: bigint("customer_id", { mode: "bigint" })
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
  salespersonId: bigint("salesperson_id", { mode: "bigint" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
});

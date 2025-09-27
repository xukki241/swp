import {
  bigint,
  varchar,
  text,
  decimal,
  timestamp,
  pgTable,
  pgEnum,
  index,
} from "drizzle-orm/pg-core";

import { customers } from "./customers.js";
import { users } from "./users.js";

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "insurance",
  "other",
]);

export const saleStatusEnum = pgEnum("sale_status", [
  "pending",
  "completed",
  "refunded",
  "cancelled",
]);

export const sales = pgTable(
  "sales",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    customerId: bigint("customer_id", { mode: "number" }).references(
      () => customers.id,
      { onDelete: "set null" }
    ),
    saleDate: timestamp("sale_date").defaultNow(),
    totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    paymentReference: varchar("payment_reference", { length: 255 }),
    status: saleStatusEnum("status").default("pending"),
    notes: text("notes"),
  },
  table => [
    index("idx_sales_user_id").on(table.userId),
    index("idx_sales_customer_id").on(table.customerId),
    index("idx_sales_sale_date").on(table.saleDate),
    index("idx_sales_status").on(table.status),
    index("idx_sales_payment_method").on(table.paymentMethod),
  ]
);

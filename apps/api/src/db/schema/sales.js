import {
  bigint,
  varchar,
  text,
  decimal,
  timestamp,
  pgTable,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { customers } from "./customers.js";
import { saleItems } from "./sale-items.js";

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

export const sales = pgTable("sales", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
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
});

export const salesRelations = relations(sales, ({ one, many }) => ({
  user: one(users, {
    fields: [sales.userId],
    references: [users.id],
  }),
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  items: many(saleItems),
}));

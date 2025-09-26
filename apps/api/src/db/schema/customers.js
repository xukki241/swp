import {
  bigint,
  varchar,
  text,
  pgTable,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales.js";

export const customerTypeEnum = pgEnum("customer_type", [
  "retail",
  "wholesale",
]);

export const customers = pgTable(
  "customers",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    type: customerTypeEnum("type").default("retail"),
    name: varchar("name", { length: 255 }).notNull(),
    companyName: varchar("company_name", { length: 255 }),
    taxId: varchar("tax_id", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 20 }),
    address: text("address"),
  },
  (table) => [unique().on(table.email), unique().on(table.phone)]
);

export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

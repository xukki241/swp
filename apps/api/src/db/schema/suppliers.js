import { pgTable, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { supplierStatus } from "./enums.js";

export const suppliers = pgTable(
  "suppliers",
  {
    id: identityPrimaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    contactName: varchar("contact_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 10 }),
    address: text("address"),
    status: supplierStatus("status").notNull().default("active"),
  },
  (table) => [
    uniqueIndex("suppliers_email_unique").on(table.email),
    uniqueIndex("suppliers_phone_unique").on(table.phone),
  ]
);

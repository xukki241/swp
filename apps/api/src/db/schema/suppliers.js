import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { address, email, identityPrimaryKey, name, phone } from "./common.js";
import { supplierStatus } from "./enums.js";

export const suppliers = pgTable(
  "suppliers",
  {
    id: identityPrimaryKey(),
    name: name(),
    contactName: varchar("contact_name", { length: 100 }),
    email: email(),
    phone: phone(),
    address: address(),
    status: supplierStatus("status").notNull().default("active"),
  },
  (table) => [
    uniqueIndex("suppliers_email_unique").on(table.email),
    uniqueIndex("suppliers_phone_unique").on(table.phone),
  ]
);

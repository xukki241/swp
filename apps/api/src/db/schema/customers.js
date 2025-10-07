import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { address, email, identityPrimaryKey, name, phone } from "./common";

export const customers = pgTable(
  "customers",
  {
    id: identityPrimaryKey(),
    name: name(),
    email: email(),
    phone: phone(),
    address: address(),
  },
  (table) => [
    uniqueIndex("customers_email_unique").on(table.email),
    uniqueIndex("customers_phone_unique").on(table.phone),
  ]
);

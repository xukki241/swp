import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import {
  address,
  email,
  identityPrimaryKey,
  name,
  phone,
  searchVector,
} from "./common.js";

export const customers = pgTable(
  "customers",
  {
    id: identityPrimaryKey(),
    name: name(),
    email: email(),
    phone: phone(),
    address: address(),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex("customers_email_unique").on(table.email),
    uniqueIndex("customers_phone_unique").on(table.phone),
    index("customers_search_vector_idx").using("gin", table.searchVector),
  ]
);

import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import { address, email, identityPrimaryKey, name, phone, searchVector } from "./common.js";
import { userRole, userStatus } from "./enums.js";

export const users = pgTable(
  "users",
  {
    id: identityPrimaryKey(),
    name: name(),
    email: email(),
    phone: phone(),
    address: address(),
    status: userStatus("status").notNull().default("active"),
    role: userRole("role").notNull().default("staff"),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    index("users_search_vector_idx").using("gin", table.searchVector),
  ]
);

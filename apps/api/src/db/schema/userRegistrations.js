import { pgTable, varchar, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey, name, email, phone, address } from "./common.js";
import { userRegistrationStatus } from "./enums.js";

export const userRegistrations = pgTable(
  "user_registrations",
  {
    id: identityPrimaryKey(),
    name: name(),
    email: email().notNull(),
    phone: phone().notNull(),
    address: address().notNull(),
    password: varchar("password", { length: 255 }).notNull(),
    status: userRegistrationStatus("status").notNull().default("pending"),
  },
  (table) => [
    uniqueIndex("user_registrations_email_unique").on(table.email),
    uniqueIndex("user_registrations_phone_unique").on(table.phone),
  ]
);

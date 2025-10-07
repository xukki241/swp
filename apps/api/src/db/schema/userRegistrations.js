import { pgTable, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common";
import { userRegistrationStatus } from "./enums";

export const userRegistrations = pgTable(
  "user_registrations",
  {
    id: identityPrimaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    address: text("address").notNull(),
    status: userRegistrationStatus("status").notNull().default("pending"),
  },
  (table) => [
    uniqueIndex("user_registrations_email_unique").on(table.email),
    uniqueIndex("user_registrations_phone_unique").on(table.phone),
  ]
);

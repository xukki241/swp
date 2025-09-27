import {
  bigint,
  varchar,
  pgTable,
  pgEnum,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

export const registrationStatusEnum = pgEnum("registration_status", [
  "pending_verification",
  "verified",
  "rejected",
]);

export const userRegistrations = pgTable(
  "user_registrations",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    fullName: varchar("full_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    registrationDate: timestamp("registration_date", {
      withTimezone: true,
    }).defaultNow(),
    status: registrationStatusEnum("status").default("pending_verification"),
  },
  table => [unique().on(table.email)]
);

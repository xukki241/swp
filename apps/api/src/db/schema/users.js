import {
  pgEnum,
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  sql,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Enums
export const user_role = pgEnum("user_role", ["owner", "staff", "sales"]);
export const user_registration_status = pgEnum("user_registration_status", [
  "pending",
  "approved",
  "rejected",
]);
export const user_status = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
]);

// Users table
export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    address: text("address").notNull(),
    status: user_status("status").notNull().default("active"),
    role: user_role("role"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    // Unique constraints moved out as indexes
    uniqueIndex().on(table.email),
    uniqueIndex().on(table.phone),
  ]
);

// User credentials
export const user_credentials = pgTable(
  "user_credentials",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    secret: varchar("secret", { length: 255 }).notNull(),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    // Composite unique (user_id, provider)
    uniqueIndex().on(table.user_id, table.provider),
    // Index to speed up queries by user_id
    index().on(table.user_id),
  ]
);

// User registrations (pending approvals)
export const user_registrations = pgTable(
  "user_registrations",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 10 }).notNull(),
    address: text("address").notNull(),
    status: user_registration_status("status").notNull().default("pending"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    // Unique constraints for registrations
    uniqueIndex().on(table.email),
    uniqueIndex().on(table.phone),
  ]
);

// Misc tables (notifications, audit_logs) were removed from this schema file.
// They can be added in separate schema files if needed.

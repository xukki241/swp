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

// Supplier enums
export const supplier_status = pgEnum("supplier_status", [
  "active",
  "inactive",
  "blacklisted",
]);

// Suppliers table
export const suppliers = pgTable(
  "suppliers",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    contact_name: varchar("contact_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 10 }),
    address: text("address"),
    status: supplier_status("status").notNull().default("active"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [uniqueIndex().on(table.email), uniqueIndex().on(table.phone)]
);

// Supplier medication variants
export const supplier_medication_variants = pgTable(
  "supplier_medication_variants",
  {
    id: serial("id").primaryKey(),
    supplier_id: integer("supplier_id").notNull(),
    medication_variant_id: integer("medication_variant_id").notNull(),
    supplier_sku: varchar("supplier_sku", { length: 50 }),
    lead_time_days: integer("lead_time_days"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    uniqueIndex().on(table.supplier_id, table.medication_variant_id),
    index().on(table.supplier_id),
    index().on(table.medication_variant_id),
  ]
);

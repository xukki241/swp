import {
  pgEnum,
  pgTable,
  serial,
  integer,
  varchar,
  text,
  timestamp,
  boolean,
  numeric,
  sql,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";

// Medication enums
export const medication_status = pgEnum("medication_status", [
  "active",
  "inactive",
  "discontinued",
]);

// Medications table
export const medications = pgTable(
  "medications",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    brand: varchar("brand", { length: 100 }),
    description: text("description"),
    status: medication_status("status").notNull().default("active"),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [index().on(table.name)]
);

// Medication variants
export const medication_variants = pgTable(
  "medication_variants",
  {
    id: serial("id").primaryKey(),
    medication_id: integer("medication_id").notNull(),
    sku: varchar("sku", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    unit_factor: numeric("unit_factor", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("1.00"),
    quantity_factor: numeric("quantity_factor", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("1.00"),
    barcode: varchar("barcode", { length: 50 }),
    retail_price: numeric("retail_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    wholesale_price: numeric("wholesale_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    is_active: boolean("is_active").notNull().default(true),
    created_at: timestamp("created_at").notNull().defaultNow(),
    updated_at: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => sql`now()`),
  },
  (table) => [
    uniqueIndex().on(table.sku),
    uniqueIndex().on(table.barcode),
    index().on(table.medication_id),
  ]
);

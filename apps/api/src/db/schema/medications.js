import {
  bigint,
  varchar,
  text,
  pgTable,
  pgEnum,
  // boolean,
  // decimal,
  // integer,
  // unique,
  index,
} from "drizzle-orm/pg-core";

export const medicationStatusEnum = pgEnum("medication_status", [
  "active",
  "inactive",
  "discontinued",
]);

export const medications = pgTable(
  "medications",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    brand: varchar("brand", { length: 255 }),
    description: text("description"),
    status: medicationStatusEnum("status").default("active"),
  },
  table => [
    index("idx_medications_name").on(table.name),
    index("idx_medications_brand").on(table.brand),
    index("idx_medications_status").on(table.status),
  ]
);

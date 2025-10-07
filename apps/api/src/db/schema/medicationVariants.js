import {
  pgTable,
  bigint,
  varchar,
  uniqueIndex,
  boolean,
} from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common.js";
import { medications } from "./medications.js";

export const medicationVariants = pgTable(
  "medication_variants",
  {
    id: identityPrimaryKey(),
    medicationId: bigint("medication_id", { mode: "bigint" })
      .notNull()
      .references(() => medications.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    sku: varchar("sku", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    unit: varchar("unit", { length: 50 }).notNull(),
    unitFactor: decimalColumn("unit_factor", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default("1.00"),
    barcode: varchar("barcode", { length: 50 }),
    sellPrice: decimalColumn("sell_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    isForSale: boolean("is_for_sale").notNull().default(false),
  },
  (table) => [
    uniqueIndex("medication_variants_sku_unique").on(table.sku),
    uniqueIndex("medication_variants_barcode_unique").on(table.barcode),
  ]
);

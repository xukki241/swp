import { index, pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import {
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  isActive,
  name,
  searchVector,
} from "./common.js";
import { medications } from "./medications.js";

export const medicationVariants = pgTable(
  "medication_variants",
  {
    id: identityPrimaryKey(),
    medicationId: foreignKey("medication_id", medications.id).notNull(),
    sku: varchar("sku", { length: 50 }).notNull(),
    name: name(),
    unit: varchar("unit", { length: 50 }).notNull(),
    unitFactor: decimalColumn("unit_factor").notNull().default(1.0),
    barcode: varchar("barcode", { length: 50 }),
    sellPrice: decimalColumn("sell_price").notNull(),
    isActive: isActive(),
    isForSale: isActive("is_for_sale").default(false),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex("medication_variants_sku_unique").on(table.sku),
    uniqueIndex("medication_variants_barcode_unique").on(table.barcode),
    index("medication_variants_search_vector_idx").using(
      "gin",
      table.searchVector
    ),
  ]
);

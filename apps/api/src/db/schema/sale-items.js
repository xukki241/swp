import {
  bigint,
  integer,
  decimal,
  pgTable,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { medicationVariants } from "./medication-variants.js";
import { sales } from "./sales.js";

export const saleItems = pgTable(
  "sale_items",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    saleId: bigint("sale_id", { mode: "number" })
      .notNull()
      .references(() => sales.id, { onDelete: "cascade" }),
    medicationVariantId: bigint("medication_variant_id", { mode: "number" })
      .notNull()
      .references(() => medicationVariants.id, { onDelete: "restrict" }),
    lotId: bigint("lot_id", { mode: "number" }),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  },
  table => [
    unique().on(table.saleId, table.medicationVariantId, table.lotId),
    index("idx_sale_items_sale_id").on(table.saleId),
    index("idx_sale_items_medication_variant_id").on(table.medicationVariantId),
    index("idx_sale_items_lot_id").on(table.lotId),
  ]
);

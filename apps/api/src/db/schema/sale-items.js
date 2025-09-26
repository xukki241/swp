import { bigint, integer, decimal, pgTable, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { sales } from "./sales.js";
import { medicationVariants } from "./medication-variants.js";
import { inventoryLots } from "./inventory.js";

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
    lotId: bigint("lot_id", { mode: "number" }).references(
      () => inventoryLots.id,
      { onDelete: "set null" }
    ),
    quantity: integer("quantity").notNull(),
    unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  },
  (table) => [unique().on(table.saleId, table.medicationVariantId, table.lotId)]
);

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  medicationVariant: one(medicationVariants, {
    fields: [saleItems.medicationVariantId],
    references: [medicationVariants.id],
  }),
  lot: one(inventoryLots, {
    fields: [saleItems.lotId],
    references: [inventoryLots.id],
  }),
}));

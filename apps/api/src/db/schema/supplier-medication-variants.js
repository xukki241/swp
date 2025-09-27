import { relations } from "drizzle-orm";
import {
  bigint,
  varchar,
  integer,
  decimal,
  pgTable,
  unique,
} from "drizzle-orm/pg-core";

import { medicationVariants } from "./medication-variants.js";
import { suppliers } from "./suppliers.js";

export const supplierMedicationVariants = pgTable(
  "supplier_medication_variants",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    supplierId: bigint("supplier_id", { mode: "number" })
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    medicationVariantId: bigint("medication_variant_id", { mode: "number" })
      .notNull()
      .references(() => medicationVariants.id, { onDelete: "cascade" }),
    supplierSku: varchar("supplier_sku", { length: 100 }),
    leadTimeDays: integer("lead_time_days"),
    costPrice: decimal("cost_price", { precision: 10, scale: 2 }).notNull(),
  },
  table => [unique().on(table.supplierId, table.medicationVariantId)]
);

export const supplierMedicationVariantsRelations = relations(
  supplierMedicationVariants,
  ({ one }) => ({
    supplier: one(suppliers, {
      fields: [supplierMedicationVariants.supplierId],
      references: [suppliers.id],
    }),
    medicationVariant: one(medicationVariants, {
      fields: [supplierMedicationVariants.medicationVariantId],
      references: [medicationVariants.id],
    }),
  })
);

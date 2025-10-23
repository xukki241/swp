import {
  integer,
  numeric,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey } from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { suppliers } from "./suppliers.js";

export const supplierMedicationVariants = pgTable(
  "supplier_medication_variants",
  {
    id: identityPrimaryKey(),
    supplierId: foreignKey("supplier_id", suppliers.id).notNull(),
    medicationVariantId: foreignKey(
      "medication_variant_id",
      medicationVariants.id
    ).notNull(),

    supplierSku: varchar("supplier_sku", { length: 50 }),
    leadTimeDays: integer("lead_time_days"),
    purchasePrice: numeric("purchase_price", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    uniqueIndex(
      "supplier_medication_variants_supplier_id_medication_variant_id_unique"
    ).on(table.supplierId, table.medicationVariantId),
  ]
);

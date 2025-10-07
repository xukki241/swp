import {
  pgTable,
  bigint,
  varchar,
  integer,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { suppliers } from "./suppliers.js";

export const supplierMedicationVariants = pgTable(
  "supplier_medication_variants",
  {
    id: identityPrimaryKey(),
    supplierId: bigint("supplier_id", { mode: "bigint" })
      .notNull()
      .references(() => suppliers.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    medicationVariantId: bigint("medication_variant_id", { mode: "bigint" })
      .notNull()
      .references(() => medicationVariants.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    supplierSku: varchar("supplier_sku", { length: 50 }),
    leadTimeDays: integer("lead_time_days"),
  },
  (table) => [
    uniqueIndex(
      "supplier_medication_variants_supplier_id_medication_variant_id_unique"
    ).on(table.supplierId, table.medicationVariantId),
  ]
);

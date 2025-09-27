import {
  bigint,
  varchar,
  text,
  pgTable,
  boolean,
  decimal,
  integer,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { medications } from "./medications.js";
import { supplierMedicationVariants } from "./supplier-medication-variants.js";
import { purchaseOrderItems } from "./purchase-order-items.js";
import { inventoryLots } from "./inventory.js";
import { saleItems } from "./sale-items.js";

export const medicationVariants = pgTable(
  "medication_variants",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    medicationId: bigint("medication_id", { mode: "number" })
      .notNull()
      .references(() => medications.id, { onDelete: "cascade" }),
    sku: varchar("sku", { length: 100 }).notNull(),
    unitConversionFactor: integer("unit_conversion_factor").default(1),
    barcode: varchar("barcode", { length: 100 }),
    price: decimal("price", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true),
  },
  (table) => [
    unique().on(table.sku),
    unique().on(table.barcode),
    index("idx_medication_variants_medication_id").on(table.medicationId),
    index("idx_medication_variants_sku").on(table.sku),
    index("idx_medication_variants_barcode").on(table.barcode),
    index("idx_medication_variants_is_active").on(table.isActive),
  ]
);

export const medicationVariantsRelations = relations(
  medicationVariants,
  ({ one, many }) => ({
    medication: one(medications, {
      fields: [medicationVariants.medicationId],
      references: [medications.id],
    }),
    supplierVariants: many(supplierMedicationVariants),
    purchaseOrderItems: many(purchaseOrderItems),
    inventoryLots: many(inventoryLots),
    saleItems: many(saleItems),
  })
);

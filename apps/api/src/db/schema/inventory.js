import {
  pgTable,
  bigint,
  varchar,
  date,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { decimalColumn, identityPrimaryKey } from "./common";
import { medicationVariants } from "./medicationVariants";
import { purchaseOrderReceiptItems } from "./purchaseOrderReceiptItems";
import { warehouseBins } from "./warehouseBins";

export const inventory = pgTable(
  "inventory",
  {
    id: identityPrimaryKey(),
    medicationVariantId: bigint("medication_variant_id", { mode: "bigint" })
      .notNull()
      .references(() => medicationVariants.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    purchaseOrderReceiptItemsId: bigint("purchase_order_receipt_items_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => purchaseOrderReceiptItems.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    binId: bigint("bin_id", { mode: "bigint" })
      .notNull()
      .references(() => warehouseBins.id, {
        onDelete: "restrict",
        onUpdate: "cascade",
      }),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    manufactureDate: date("manufacture_date"),
    expiryDate: date("expiry_date"),
    quantity: decimalColumn("quantity", { precision: 10, scale: 2 }).notNull(),
    quantityReserved: decimalColumn("quantity_reserved", {
      precision: 10,
      scale: 2,
    })
      .notNull()
      .default(0),
  },
  (table) => [
    uniqueIndex(
      "inventory_medication_variant_id_bin_id_batch_number_unique"
    ).on(table.medicationVariantId, table.binId, table.batchNumber),
  ]
);

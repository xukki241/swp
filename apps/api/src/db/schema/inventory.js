import {
  date,
  index,
  pgTable,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

import {
  decimalColumn,
  foreignKey,
  identityPrimaryKey,
  searchVector,
} from "./common.js";
import { medicationVariants } from "./medicationVariants.js";
import { purchaseOrderReceiptItems } from "./purchaseOrderReceiptItems.js";
import { warehouseBins } from "./warehouseBins.js";

export const inventory = pgTable(
  "inventory",
  {
    id: identityPrimaryKey(),
    medicationVariantId: foreignKey(
      "medication_variant_id",
      medicationVariants.id
    ).notNull(),
    purchaseOrderReceiptItemsId: foreignKey(
      "purchase_order_receipt_items_id",
      purchaseOrderReceiptItems.id
    ).notNull(),
    binId: foreignKey("bin_id", warehouseBins.id).notNull(),
    batchNumber: varchar("batch_number", { length: 100 }).notNull(),
    manufactureDate: date("manufacture_date"),
    expiryDate: date("expiry_date"),
    quantity: decimalColumn("quantity").notNull(),
    quantityReserved: decimalColumn("quantity_reserved").notNull().default(0),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex(
      "inventory_medication_variant_id_bin_id_batch_number_unique"
    ).on(table.medicationVariantId, table.binId, table.batchNumber),
    index("inventory_search_vector_idx").using("gin", table.searchVector),
  ]
);

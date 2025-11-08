import { pgTable } from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey, int } from "./common.js";
import { purchaseOrderItems } from "./purchaseOrderItems.js";
import { purchaseOrderReceipts } from "./purchaseOrderReceipts.js";

export const purchaseOrderReceiptItems = pgTable(
  "purchase_order_receipt_items",
  {
    id: identityPrimaryKey(),
    purchaseOrderReceiptId: foreignKey(
      "purchase_order_receipt_id",
      purchaseOrderReceipts.id,
      {
        onDelete: "restrict",
        onUpdate: "cascade",
      }
    ).notNull(),
    purchaseOrderItemId: foreignKey(
      "purchase_order_item_id",
      purchaseOrderItems.id,
      {
        onDelete: "restrict",
        onUpdate: "cascade",
      }
    ).notNull(),
    quantity: int("quantity").notNull(),
  }
);

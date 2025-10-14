import { pgTable } from "drizzle-orm/pg-core";

import { identityPrimaryKey, foreignKey, int } from "./common.js";
import { purchaseOrderItems } from "./purchaseOrderItems.js";
import { purchaseOrderReceipts } from "./purchaseOrderReceipts.js";

export const purchaseOrderReceiptItems = pgTable(
  "purchase_order_receipt_items",
  {
    id: identityPrimaryKey(),
    purchaseOrderReceiptId: foreignKey(
      "purchase_order_receipt_id",
      purchaseOrderReceipts.id
    ).notNull(),
    purchaseOrderItemId: foreignKey(
      "purchase_order_item_id",
      purchaseOrderItems.id
    ).notNull(),
    quantity: int("quantity").notNull(),
  }
);

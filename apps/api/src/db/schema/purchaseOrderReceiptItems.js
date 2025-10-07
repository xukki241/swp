import { pgTable, bigint, integer } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common";
import { purchaseOrderItems } from "./purchaseOrderItems";
import { purchaseOrderReceipts } from "./purchaseOrderReceipts";

export const purchaseOrderReceiptItems = pgTable(
  "purchase_order_receipt_items",
  {
    id: identityPrimaryKey(),
    purchaseOrderReceiptId: bigint("purchase_order_receipt_id", {
      mode: "bigint",
    })
      .notNull()
      .references(() => purchaseOrderReceipts.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    purchaseOrderItemId: bigint("purchase_order_item_id", { mode: "bigint" })
      .notNull()
      .references(() => purchaseOrderItems.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    quantity: integer("quantity").notNull(),
  }
);

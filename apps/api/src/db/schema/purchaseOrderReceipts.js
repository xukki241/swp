import { pgTable, timestamp } from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey } from "./common.js";
import { purchaseOrders } from "./purchaseOrders.js";
import { users } from "./users.js";

export const purchaseOrderReceipts = pgTable("purchase_order_receipts", {
  id: identityPrimaryKey(),
  purchaseOrderId: foreignKey("purchase_order_id", purchaseOrders.id, {
    onDelete: "restrict",
    onUpdate: "cascade",
  }).notNull(),
  receivedDate: timestamp("received_date").notNull(),
  receivedBy: foreignKey("received_by", users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
});

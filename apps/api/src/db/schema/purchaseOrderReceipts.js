import { pgTable } from "drizzle-orm/pg-core";

import { identityPrimaryKey, foreignKey, createdAt } from "./common.js";
import { purchaseOrders } from "./purchaseOrders.js";
import { users } from "./users.js";

export const purchaseOrderReceipts = pgTable("purchase_order_receipts", {
  id: identityPrimaryKey(),
  purchaseOrderId: foreignKey("purchase_order_id", purchaseOrders.id).notNull(),
  receivedDate: createdAt("received_date"),
  receivedBy: foreignKey("received_by", users.id),
});

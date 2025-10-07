import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { purchaseOrders } from "./purchaseOrders.js";
import { users } from "./users.js";

export const purchaseOrderReceipts = pgTable("purchase_order_receipts", {
  id: identityPrimaryKey(),
  purchaseOrderId: bigint("purchase_order_id", { mode: "number" })
    .notNull()
    .references(() => purchaseOrders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  receivedDate: timestamp("received_date").notNull().defaultNow(),
  receivedBy: bigint("received_by", { mode: "number" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
});

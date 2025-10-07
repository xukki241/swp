import { pgTable, bigint, timestamp } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common";
import { purchaseOrders } from "./purchaseOrders";
import { users } from "./users";

export const purchaseOrderReceipts = pgTable("purchase_order_receipts", {
  id: identityPrimaryKey(),
  purchaseOrderId: bigint("purchase_order_id", { mode: "bigint" })
    .notNull()
    .references(() => purchaseOrders.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  receivedDate: timestamp("received_date").notNull().defaultNow(),
  receivedBy: bigint("received_by", { mode: "bigint" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
});

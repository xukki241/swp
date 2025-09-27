import {
  bigint,
  varchar,
  date,
  timestamp,
  integer,
  pgTable,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { medicationVariants } from "./medication-variants.js";
import { users } from "./users.js";
import { saleItems } from "./sale-items.js";

export const inventoryTransactionTypeEnum = pgEnum(
  "inventory_transaction_type",
  ["purchase", "sale", "adjustment", "return"]
);

export const inventoryLots = pgTable(
  "inventory_lots",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    medicationVariantId: bigint("medication_variant_id", { mode: "number" })
      .notNull()
      .references(() => medicationVariants.id, { onDelete: "cascade" }),
    lotNumber: varchar("lot_number", { length: 100 }).notNull(),
    expirationDate: date("expiration_date"),
    receivedDate: timestamp("received_date").defaultNow(),
  },
  (table) => [
    unique().on(table.medicationVariantId, table.lotNumber),
    index("idx_inventory_lots_medication_variant_id").on(
      table.medicationVariantId
    ),
    index("idx_inventory_lots_expiration_date").on(table.expirationDate),
    index("idx_inventory_lots_received_date").on(table.receivedDate),
  ]
);

export const inventoryLevels = pgTable(
  "inventory_levels",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    lotId: bigint("lot_id", { mode: "number" }).references(
      () => inventoryLots.id,
      { onDelete: "set null" }
    ),
    quantityOnHand: integer("quantity_on_hand").default(0),
  },
  (table) => [index("idx_inventory_levels_lot_id").on(table.lotId)]
);

export const inventoryTransactions = pgTable(
  "inventory_transactions",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "set null" }),
    lotId: bigint("lot_id", { mode: "number" }).references(
      () => inventoryLots.id,
      { onDelete: "set null" }
    ),
    transactionType: inventoryTransactionTypeEnum("transaction_type").notNull(),
    quantityChanged: integer("quantity_changed").notNull(),
    transactionDate: timestamp("transaction_date").defaultNow(),
    reference: varchar("reference", { length: 255 }),
  },
  (table) => [
    index("idx_inventory_transactions_user_id").on(table.userId),
    index("idx_inventory_transactions_lot_id").on(table.lotId),
    index("idx_inventory_transactions_transaction_date").on(
      table.transactionDate
    ),
    index("idx_inventory_transactions_transaction_type").on(
      table.transactionType
    ),
  ]
);

export const inventoryLotsRelations = relations(
  inventoryLots,
  ({ one, many }) => ({
    medicationVariant: one(medicationVariants, {
      fields: [inventoryLots.medicationVariantId],
      references: [medicationVariants.id],
    }),
    levels: many(inventoryLevels),
    transactions: many(inventoryTransactions),
    saleItems: many(saleItems),
  })
);

export const inventoryLevelsRelations = relations(
  inventoryLevels,
  ({ one }) => ({
    lot: one(inventoryLots, {
      fields: [inventoryLevels.lotId],
      references: [inventoryLots.id],
    }),
  })
);

export const inventoryTransactionsRelations = relations(
  inventoryTransactions,
  ({ one }) => ({
    user: one(users, {
      fields: [inventoryTransactions.userId],
      references: [users.id],
    }),
    lot: one(inventoryLots, {
      fields: [inventoryTransactions.lotId],
      references: [inventoryLots.id],
    }),
  })
);

import {
  pgTable,
  bigint,
  varchar,
  integer,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { warehouseRacks } from "./warehouseRacks.js";

export const warehouseBins = pgTable(
  "warehouse_bins",
  {
    id: identityPrimaryKey(),
    rackId: bigint("rack_id", { mode: "number" })
      .notNull()
      .references(() => warehouseRacks.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    level: integer("level").notNull(),
    number: integer("number").notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("warehouse_bins_rack_id_code_unique").on(
      table.rackId,
      table.code
    ),
    uniqueIndex("warehouse_bins_rack_id_level_number_unique").on(
      table.rackId,
      table.level,
      table.number
    ),
  ]
);

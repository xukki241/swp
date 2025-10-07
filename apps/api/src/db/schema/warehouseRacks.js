import {
  pgTable,
  bigint,
  varchar,
  text,
  uniqueIndex,
} from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { warehouseZones } from "./warehouseZones.js";

export const warehouseRacks = pgTable(
  "warehouse_racks",
  {
    id: identityPrimaryKey(),
    zoneId: bigint("zone_id", { mode: "number" })
      .notNull()
      .references(() => warehouseZones.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    description: text("description"),
  },
  (table) => [
    uniqueIndex("warehouse_racks_zone_id_code_unique").on(
      table.zoneId,
      table.code
    ),
  ]
);

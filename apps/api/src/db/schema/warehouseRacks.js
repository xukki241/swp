import { pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import {
  code,
  description,
  foreignKey,
  identityPrimaryKey,
  name,
} from "./common.js";
import { warehouseZones } from "./warehouseZones.js";

export const warehouseRacks = pgTable(
  "warehouse_racks",
  {
    id: identityPrimaryKey(),
    zoneId: foreignKey("zone_id", warehouseZones.id).notNull(),
    code: code(),
    name: name(),
    description: description(),
  },
  (table) => [
    uniqueIndex("warehouse_racks_zone_id_code_unique").on(
      table.zoneId,
      table.code
    ),
  ]
);

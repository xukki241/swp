import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import {
  code,
  description,
  foreignKey,
  identityPrimaryKey,
  name,
  searchVector,
} from "./common.js";
import { warehouseZones } from "./warehouseZones.js";

export const warehouseRacks = pgTable(
  "warehouse_racks",
  {
    id: identityPrimaryKey(),
    zoneId: foreignKey("zone_id", warehouseZones.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }).notNull(),
    code: code(),
    name: name(),
    description: description(),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex("warehouse_racks_zone_id_code_unique").on(
      table.zoneId,
      table.code
    ),
    index("warehouse_racks_search_vector_idx").using("gin", table.searchVector),
  ]
);

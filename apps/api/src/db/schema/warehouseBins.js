import { index, pgTable, uniqueIndex } from "drizzle-orm/pg-core";

import {
  code,
  description,
  foreignKey,
  identityPrimaryKey,
  int,
  name,
  searchVector,
} from "./common.js";
import { warehouseRacks } from "./warehouseRacks.js";

export const warehouseBins = pgTable(
  "warehouse_bins",
  {
    id: identityPrimaryKey(),
    rackId: foreignKey("rack_id", warehouseRacks.id, {
      onDelete: "restrict",
      onUpdate: "cascade",
    }).notNull(),
    code: code(),
    name: name(),
    level: int("level").notNull(),
    number: int("number").notNull(),
    description: description(),
    searchVector: searchVector(),
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
    index("warehouse_bins_search_vector_idx").using("gin", table.searchVector),
  ]
);

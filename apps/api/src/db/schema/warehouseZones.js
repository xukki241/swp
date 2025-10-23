import { index, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { code, description, identityPrimaryKey, name, searchVector } from "./common.js";
import { warehouseZoneType } from "./enums.js";

export const warehouseZones = pgTable(
  "warehouse_zones",
  {
    id: identityPrimaryKey(),
    code: code(),
    name: name(),
    type: warehouseZoneType("type").notNull().default("normal"),
    location: text("location"),
    description: description(),
    searchVector: searchVector(),
  },
  (table) => [
    uniqueIndex("warehouse_zones_code_unique").on(table.code),
    index("warehouse_zones_search_vector_idx").using("gin", table.searchVector),
  ]
);

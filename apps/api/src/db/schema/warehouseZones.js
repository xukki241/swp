import { pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey, code, name, description } from "./common.js";
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
  },
  (table) => [uniqueIndex("warehouse_zones_code_unique").on(table.code)]
);

import { pgTable, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { warehouseZoneType } from "./enums.js";

export const warehouseZones = pgTable(
  "warehouse_zones",
  {
    id: identityPrimaryKey(),
    code: varchar("code", { length: 50 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    type: warehouseZoneType("type").notNull().default("normal"),
    location: text("location"),
    description: text("description"),
  },
  (table) => [uniqueIndex("warehouse_zones_code_unique").on(table.code)]
);

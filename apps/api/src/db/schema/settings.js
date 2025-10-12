import { pgTable, varchar, uniqueIndex, jsonb } from "drizzle-orm/pg-core";

import { identityPrimaryKey, description } from "./common.js";

export const settings = pgTable(
  "settings",
  {
    id: identityPrimaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    group: varchar("group", { length: 100 }).notNull().default("general"),
    value: jsonb("value").notNull(),
    description: description(),
  },
  (table) => [uniqueIndex("settings_key_unique").on(table.key)]
);

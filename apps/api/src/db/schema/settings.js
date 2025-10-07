import { pgTable, varchar, text, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common";

export const settings = pgTable(
  "settings",
  {
    id: identityPrimaryKey(),
    key: varchar("key", { length: 100 }).notNull(),
    value: text("value").notNull(),
    description: text("description"),
  },
  (table) => [uniqueIndex("settings_key_unique").on(table.key)]
);

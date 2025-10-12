import { pgTable, varchar, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey, foreignKey } from "./common.js";
import { users } from "./users.js";

export const userCredentials = pgTable(
  "user_credentials",
  {
    id: identityPrimaryKey(),
    userId: foreignKey("user_id", users.id).notNull(),
    provider: varchar("provider", { length: 50 }).notNull(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    secret: varchar("secret", { length: 255 }).notNull(),
  },
  (table) => [
    uniqueIndex("user_credentials_user_id_provider_unique").on(
      table.userId,
      table.provider
    ),
  ]
);

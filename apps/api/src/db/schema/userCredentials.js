import { pgTable, bigint, varchar, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const userCredentials = pgTable(
  "user_credentials",
  {
    id: identityPrimaryKey(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
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

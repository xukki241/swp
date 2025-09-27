import { bigint, varchar, pgTable, unique } from "drizzle-orm/pg-core";

import { users } from "./users.js";

export const userCredentials = pgTable(
  "user_credentials",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    userId: bigint("user_id", { mode: "number" })
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: varchar("provider", { length: 100 }).notNull(),
    identifier: varchar("identifier", { length: 255 }).notNull(),
    secretHash: varchar("secret_hash", { length: 255 }).notNull(),
  },
  table => [
    unique().on(table.userId, table.provider),
    unique().on(table.provider, table.identifier),
  ]
);

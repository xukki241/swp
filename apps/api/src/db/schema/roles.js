import { bigint, varchar, integer, pgTable, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./users.js";

export const roles = pgTable(
  "roles",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  (table) => [unique().on(table.name)]
);

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

import {
  bigint,
  varchar,
  /* integer, */ pgTable,
  unique,
} from "drizzle-orm/pg-core";

export const roles = pgTable(
  "roles",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 100 }).notNull(),
  },
  table => [unique().on(table.name)]
);

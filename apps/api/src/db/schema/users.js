import {
  bigint,
  varchar,
  pgTable,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";

import { roles } from "./roles.js";

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
]);

export const users = pgTable(
  "users",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    phone: varchar("phone", { length: 20 }).notNull(),
    status: userStatusEnum("status").default("active"),
    roleId: bigint("role_id", { mode: "number" })
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
  },
  table => [
    unique().on(table.email),
    unique().on(table.phone),
    index("idx_users_role_id").on(table.roleId),
    index("idx_users_status").on(table.status),
    index("idx_users_email").on(table.email),
  ]
);

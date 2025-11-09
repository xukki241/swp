import { jsonb, pgTable, uuid, varchar } from "drizzle-orm/pg-core";

import { createdAt, foreignKey, identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const auditLogs = pgTable("audit_logs", {
  id: identityPrimaryKey(),
  userId: foreignKey("user_id", users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb("changes"),
  createdAt: createdAt(),
});

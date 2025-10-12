import { pgTable, varchar, jsonb, uuid } from "drizzle-orm/pg-core";

import { identityPrimaryKey, foreignKey, createdAt } from "./common.js";
import { users } from "./users.js";

export const auditLogs = pgTable("audit_logs", {
  id: identityPrimaryKey(),
  userId: foreignKey("user_id", users.id),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: uuid("entity_id"),
  changes: jsonb("changes"),
  createdAt: createdAt(),
});

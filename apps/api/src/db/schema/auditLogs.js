import {
  pgTable,
  bigint,
  varchar,
  jsonb,
  timestamp,
} from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const auditLogs = pgTable("audit_logs", {
  id: identityPrimaryKey(),
  userId: bigint("user_id", { mode: "bigint" }).references(() => users.id, {
    onDelete: "set null",
    onUpdate: "cascade",
  }),
  action: varchar("action", { length: 100 }).notNull(),
  entity: varchar("entity", { length: 100 }).notNull(),
  entityId: bigint("entity_id", { mode: "bigint" }),
  changes: jsonb("changes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

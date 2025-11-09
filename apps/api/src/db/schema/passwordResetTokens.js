import {
  boolean,
  pgEnum,
  pgTable,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const resetMethod = pgEnum("reset_method", ["email", "sms"]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: identityPrimaryKey(),
  userId: foreignKey("user_id", users.id, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }).notNull(),
  token: varchar("token", { length: 6 }).notNull(),
  method: resetMethod("method").notNull().default("email"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

import {
  pgTable,
  varchar,
  timestamp,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";

import { identityPrimaryKey, foreignKey } from "./common.js";
import { users } from "./users.js";

export const resetMethod = pgEnum("reset_method", ["email", "sms"]);

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: identityPrimaryKey(),
  userId: foreignKey("user_id", users.id).notNull(),
  token: varchar("token", { length: 6 }).notNull(),
  method: resetMethod("method").notNull().default("email"),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  isUsed: boolean("is_used").notNull().default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

import { boolean, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

import { createdAt, foreignKey, identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const refreshTokens = pgTable("refresh_tokens", {
    id: identityPrimaryKey(),
    userId: foreignKey("user_id", users.id).notNull(),
    tokenHash: varchar("token_hash", { length: 255 }).notNull(), // Store hashed token
    expiresAt: timestamp("expires_at").notNull(),
    lastUsedAt: timestamp("last_used_at"),
    deviceInfo: text("device_info"), // Browser, OS info
    ipAddress: varchar("ip_address", { length: 50 }),
    isRevoked: boolean("is_revoked").default(false).notNull(),
    createdAt: createdAt(),
});

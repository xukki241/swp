import { boolean, pgTable, text } from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const notifications = pgTable("notifications", {
  id: identityPrimaryKey(),
  userId: foreignKey("user_id", users.id).notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

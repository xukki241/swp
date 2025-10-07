import { pgTable, bigint, text, boolean } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const notifications = pgTable("notifications", {
  id: identityPrimaryKey(),
  userId: bigint("user_id", { mode: "bigint" })
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
});

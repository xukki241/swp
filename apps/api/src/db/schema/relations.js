import { relations } from "drizzle-orm";

import { users, user_credentials } from "./users.js";

export const userRelations = relations(users, ({ many }) => {
  return {
    credentials: many(user_credentials),
  };
});

export const userCredentialsRelations = relations(
  user_credentials,
  ({ one }) => {
    return {
      user: one(users, {
        fields: [user_credentials.user_id],
        references: [users.id],
        onDelete: "cascade",
      }),
    };
  }
);

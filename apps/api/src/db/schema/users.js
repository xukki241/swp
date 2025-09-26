import { bigint, varchar, pgTable, pgEnum, unique } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { roles } from "./roles.js";
import { userCredentials } from "./user-credentials.js";
import { sales } from "./sales.js";
import { purchaseOrders } from "./purchase-orders.js";
import { inventoryTransactions } from "./inventory.js";

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
  (table) => [unique().on(table.email), unique().on(table.phone)]
);

export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  credentials: many(userCredentials),
  sales: many(sales),
  purchaseOrders: many(purchaseOrders),
  inventoryTransactions: many(inventoryTransactions),
}));

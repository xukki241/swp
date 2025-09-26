import { bigint, varchar, text, pgTable, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { supplierMedicationVariants } from "./supplier-medication-variants.js";
import { purchaseOrders } from "./purchase-orders.js";

export const supplierStatusEnum = pgEnum("supplier_status", [
  "active",
  "inactive",
  "blacklisted",
]);

export const suppliers = pgTable("suppliers", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  contactName: varchar("contact_name", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  contactPhone: varchar("contact_phone", { length: 20 }),
  address: text("address"),
  status: supplierStatusEnum("status").default("active"),
});

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  medicationVariants: many(supplierMedicationVariants),
  purchaseOrders: many(purchaseOrders),
}));

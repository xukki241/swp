import { relations } from "drizzle-orm";

// Import all tables (in alphabetical order to satisfy import/order)
import { customers } from "./customers.js";
import { inventoryLots } from "./inventory.js";
import { medicationVariants } from "./medication-variants.js";
import { medications } from "./medications.js";
import { purchaseOrderItems } from "./purchase-order-items.js";
import { purchaseOrders } from "./purchase-orders.js";
import { reportsDaily } from "./reports.js";
import { roles } from "./roles.js";
import { saleItems } from "./sale-items.js";
import { sales } from "./sales.js";
import { supplierMedicationVariants } from "./supplier-medication-variants.js";
import { suppliers } from "./suppliers.js";
import { userCredentials } from "./user-credentials.js";
import { userRegistrations } from "./user-registrations.js";
import { users } from "./users.js";

// User Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  role: one(roles, {
    fields: [users.roleId],
    references: [roles.id],
  }),
  credentials: many(userCredentials),
  sales: many(sales),
  purchaseOrders: many(purchaseOrders),
  inventoryTransactions: many(inventoryLots),
}));

export const rolesRelations = relations(roles, ({ many }) => ({
  users: many(users),
}));

export const userCredentialsRelations = relations(
  userCredentials,
  ({ one }) => ({
    user: one(users, {
      fields: [userCredentials.userId],
      references: [users.id],
    }),
  })
);

export const userRegistrationsRelations = relations(
  userRegistrations,
  ({ one }) => ({
    role: one(roles, {
      fields: [userRegistrations.roleId],
      references: [roles.id],
    }),
  })
);

// Customer Relations
export const customersRelations = relations(customers, ({ many }) => ({
  sales: many(sales),
}));

// Medication Relations
export const medicationsRelations = relations(medications, ({ many }) => ({
  variants: many(medicationVariants),
}));

export const medicationVariantsRelations = relations(
  medicationVariants,
  ({ one, many }) => ({
    medication: one(medications, {
      fields: [medicationVariants.medicationId],
      references: [medications.id],
    }),
    supplierVariants: many(supplierMedicationVariants),
    purchaseOrderItems: many(purchaseOrderItems),
    inventoryRecords: many(inventoryLots),
    saleItems: many(saleItems),
  })
);

// Supplier Relations
export const suppliersRelations = relations(suppliers, ({ many }) => ({
  medicationVariants: many(supplierMedicationVariants),
  purchaseOrders: many(purchaseOrders),
}));

export const supplierMedicationVariantsRelations = relations(
  supplierMedicationVariants,
  ({ one }) => ({
    supplier: one(suppliers, {
      fields: [supplierMedicationVariants.supplierId],
      references: [suppliers.id],
    }),
    medicationVariant: one(medicationVariants, {
      fields: [supplierMedicationVariants.medicationVariantId],
      references: [medicationVariants.id],
    }),
  })
);

// Purchase Order Relations
export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    createdBy: one(users, {
      fields: [purchaseOrders.createdBy],
      references: [users.id],
    }),
    items: many(purchaseOrderItems),
  })
);

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    medicationVariant: one(medicationVariants, {
      fields: [purchaseOrderItems.medicationVariantId],
      references: [medicationVariants.id],
    }),
  })
);

// Inventory Relations
export const inventoryLotsRelations = relations(inventoryLots, ({ one }) => ({
  medicationVariant: one(medicationVariants, {
    fields: [inventoryLots.medicationVariantId],
    references: [medicationVariants.id],
  }),
  createdBy: one(users, {
    fields: [inventoryLots.createdBy],
    references: [users.id],
  }),
}));

// Sales Relations
export const salesRelations = relations(sales, ({ one, many }) => ({
  customer: one(customers, {
    fields: [sales.customerId],
    references: [customers.id],
  }),
  soldBy: one(users, {
    fields: [sales.soldBy],
    references: [users.id],
  }),
  items: many(saleItems),
}));

export const saleItemsRelations = relations(saleItems, ({ one }) => ({
  sale: one(sales, {
    fields: [saleItems.saleId],
    references: [sales.id],
  }),
  medicationVariant: one(medicationVariants, {
    fields: [saleItems.medicationVariantId],
    references: [medicationVariants.id],
  }),
}));

// Reports Relations
export const reportsDailyRelations = relations(
  reportsDaily,
  ({ one: _one }) => ({
    // Note: reportsDaily table doesn't have a generatedBy field in the current schema
    // This relation would need to be added to the table definition if needed
  })
);

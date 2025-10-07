import { relations } from "drizzle-orm";

import { auditLogs } from "./auditLogs.js";
import { customers } from "./customers.js";
import { fileAttachments } from "./fileAttachments.js";
import { files } from "./files.js";
import { inventory } from "./inventory.js";
import { medications } from "./medications.js";
import { medicationVariants } from "./medicationVariants.js";
import { notifications } from "./notifications.js";
import { purchaseOrderItems } from "./purchaseOrderItems.js";
import { purchaseOrderReceiptItems } from "./purchaseOrderReceiptItems.js";
import { purchaseOrderReceipts } from "./purchaseOrderReceipts.js";
import { purchaseOrders } from "./purchaseOrders.js";
import { salesOrderItems } from "./salesOrderItems.js";
import { salesOrders } from "./salesOrders.js";
import { supplierMedicationVariants } from "./supplierMedicationVariants.js";
import { suppliers } from "./suppliers.js";
import { userCredentials } from "./userCredentials.js";
import { users } from "./users.js";
import { warehouseBins } from "./warehouseBins.js";
import { warehouseRacks } from "./warehouseRacks.js";
import { warehouseZones } from "./warehouseZones.js";

export const usersRelations = relations(users, ({ many }) => ({
  credentials: many(userCredentials),
  createdPurchaseOrders: many(purchaseOrders),
  receivedPurchaseOrderReceipts: many(purchaseOrderReceipts),
  salesOrders: many(salesOrders),
  uploadedFiles: many(files),
  notifications: many(notifications),
  auditLogs: many(auditLogs),
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
    supplierLinks: many(supplierMedicationVariants),
    purchaseOrderItems: many(purchaseOrderItems),
    salesOrderItems: many(salesOrderItems),
    inventoryEntries: many(inventory),
  })
);

export const suppliersRelations = relations(suppliers, ({ many }) => ({
  supplierMedicationVariants: many(supplierMedicationVariants),
  purchaseOrders: many(purchaseOrders),
}));

export const supplierMedicationVariantsRelations = relations(
  supplierMedicationVariants,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [supplierMedicationVariants.supplierId],
      references: [suppliers.id],
    }),
    medicationVariant: one(medicationVariants, {
      fields: [supplierMedicationVariants.medicationVariantId],
      references: [medicationVariants.id],
    }),
    purchaseOrderItems: many(purchaseOrderItems),
  })
);

export const purchaseOrdersRelations = relations(
  purchaseOrders,
  ({ one, many }) => ({
    supplier: one(suppliers, {
      fields: [purchaseOrders.supplierId],
      references: [suppliers.id],
    }),
    createdByUser: one(users, {
      fields: [purchaseOrders.createdBy],
      references: [users.id],
    }),
    items: many(purchaseOrderItems),
    receipts: many(purchaseOrderReceipts),
  })
);

export const purchaseOrderItemsRelations = relations(
  purchaseOrderItems,
  ({ one, many }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderItems.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    supplierMedicationVariant: one(supplierMedicationVariants, {
      fields: [purchaseOrderItems.supplierMedicationVariantId],
      references: [supplierMedicationVariants.id],
    }),
    receiptItems: many(purchaseOrderReceiptItems),
  })
);

export const purchaseOrderReceiptsRelations = relations(
  purchaseOrderReceipts,
  ({ one, many }) => ({
    purchaseOrder: one(purchaseOrders, {
      fields: [purchaseOrderReceipts.purchaseOrderId],
      references: [purchaseOrders.id],
    }),
    receivedByUser: one(users, {
      fields: [purchaseOrderReceipts.receivedBy],
      references: [users.id],
    }),
    items: many(purchaseOrderReceiptItems),
  })
);

export const purchaseOrderReceiptItemsRelations = relations(
  purchaseOrderReceiptItems,
  ({ one, many }) => ({
    receipt: one(purchaseOrderReceipts, {
      fields: [purchaseOrderReceiptItems.purchaseOrderReceiptId],
      references: [purchaseOrderReceipts.id],
    }),
    purchaseOrderItem: one(purchaseOrderItems, {
      fields: [purchaseOrderReceiptItems.purchaseOrderItemId],
      references: [purchaseOrderItems.id],
    }),
    inventoryEntries: many(inventory),
  })
);

export const inventoryRelations = relations(inventory, ({ one }) => ({
  medicationVariant: one(medicationVariants, {
    fields: [inventory.medicationVariantId],
    references: [medicationVariants.id],
  }),
  purchaseOrderReceiptItem: one(purchaseOrderReceiptItems, {
    fields: [inventory.purchaseOrderReceiptItemsId],
    references: [purchaseOrderReceiptItems.id],
  }),
  bin: one(warehouseBins, {
    fields: [inventory.binId],
    references: [warehouseBins.id],
  }),
}));

export const warehouseZonesRelations = relations(
  warehouseZones,
  ({ many }) => ({
    racks: many(warehouseRacks),
  })
);

export const warehouseRacksRelations = relations(
  warehouseRacks,
  ({ one, many }) => ({
    zone: one(warehouseZones, {
      fields: [warehouseRacks.zoneId],
      references: [warehouseZones.id],
    }),
    bins: many(warehouseBins),
  })
);

export const warehouseBinsRelations = relations(
  warehouseBins,
  ({ one, many }) => ({
    rack: one(warehouseRacks, {
      fields: [warehouseBins.rackId],
      references: [warehouseRacks.id],
    }),
    inventoryEntries: many(inventory),
  })
);

export const customersRelations = relations(customers, ({ many }) => ({
  orders: many(salesOrders),
}));

export const salesOrdersRelations = relations(salesOrders, ({ one, many }) => ({
  customer: one(customers, {
    fields: [salesOrders.customerId],
    references: [customers.id],
  }),
  salesperson: one(users, {
    fields: [salesOrders.salespersonId],
    references: [users.id],
  }),
  items: many(salesOrderItems),
}));

export const salesOrderItemsRelations = relations(
  salesOrderItems,
  ({ one }) => ({
    salesOrder: one(salesOrders, {
      fields: [salesOrderItems.salesOrderId],
      references: [salesOrders.id],
    }),
    medicationVariant: one(medicationVariants, {
      fields: [salesOrderItems.medicationVariantId],
      references: [medicationVariants.id],
    }),
  })
);

export const filesRelations = relations(files, ({ one, many }) => ({
  uploadedByUser: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
  }),
  attachments: many(fileAttachments),
}));

export const fileAttachmentsRelations = relations(
  fileAttachments,
  ({ one }) => ({
    file: one(files, {
      fields: [fileAttachments.fileId],
      references: [files.id],
    }),
  })
);

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, {
    fields: [auditLogs.userId],
    references: [users.id],
  }),
}));

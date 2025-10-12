import { z } from "zod";

// User enums
export const userRoleEnum = z.enum(["owner", "staff"]);
export const userStatusEnum = z.enum(["active", "inactive", "suspended"]);
export const userRegistrationStatusEnum = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export const resetMethodEnum = z.enum(["email", "sms"]);

// Warehouse enums
export const warehouseZoneTypeEnum = z.enum([
  "normal",
  "cold",
  "hazard",
  "quarantine",
]);

// Medication enums
export const medicationStatusEnum = z.enum([
  "active",
  "inactive",
  "discontinued",
]);

// Supplier enums
export const supplierStatusEnum = z.enum(["active", "inactive", "blacklisted"]);

// Purchase order enums
export const purchaseOrderStatusEnum = z.enum([
  "pending",
  "ordered",
  "received",
  "cancelled",
]);

// Sales order enums
export const salesOrderStatusEnum = z.enum([
  "pending",
  "paid",
  "delivered",
  "cancelled",
]);
export const salesOrderPaymentMethodEnum = z.enum([
  "cash",
  "bank_transfer",
  "credit_card",
  "mobile_payment",
]);

// Report enums
export const reportTypeEnum = z.enum([
  "inventory",
  "sales",
  "purchase",
  "custom",
]);

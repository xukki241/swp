import { z } from "zod";

// User enums
export const userRoleSchema = z.enum(["owner", "staff", "sales"]);

export const userStatusSchema = z.enum(["active", "inactive", "suspended"]);

export const userRegistrationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);

// Warehouse enums
export const warehouseZoneTypeSchema = z.enum([
  "normal",
  "cold",
  "hazard",
  "quarantine",
]);

// Medication enums
export const medicationStatusSchema = z.enum([
  "active",
  "inactive",
  "discontinued",
]);

// Report enums
export const reportTypeSchema = z.enum([
  "inventory",
  "sales",
  "purchase",
  "custom",
]);

// Supplier enums
export const supplierStatusSchema = z.enum([
  "active",
  "inactive",
  "blacklisted",
]);

// Purchase order enums
export const purchaseOrderStatusSchema = z.enum([
  "pending",
  "ordered",
  "received",
  "cancelled",
]);

// Sales order enums
export const salesOrderStatusSchema = z.enum([
  "pending",
  "paid",
  "delivered",
  "cancelled",
]);

export const salesOrderPaymentMethodSchema = z.enum([
  "cash",
  "bank_transfer",
  "credit_card",
  "mobile_payment",
]);

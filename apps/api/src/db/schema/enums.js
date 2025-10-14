import { pgEnum } from "drizzle-orm/pg-core";

export const userRole = pgEnum("user_role", ["owner", "staff"]);

export const userStatus = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
]);

export const userRegistrationStatus = pgEnum("user_registration_status", [
  "pending",
  "approved",
  "rejected",
]);

export const warehouseZoneType = pgEnum("warehouse_zone_type", [
  "normal",
  "cold",
  "hazard",
  "quarantine",
]);

export const medicationStatus = pgEnum("medication_status", [
  "active",
  "inactive",
  "discontinued",
]);

export const reportType = pgEnum("report_type", [
  "inventory",
  "sales",
  "purchase",
  "custom",
  "sales_summary",
  "inventory_on_hand",
  "expiry_dates",
  "low_stock",
  "daily_sales",
  "weekly_sales",
  "monthly_sales",
]);

export const supplierStatus = pgEnum("supplier_status", [
  "active",
  "inactive",
  "blacklisted",
]);

export const purchaseOrderStatus = pgEnum("purchase_order_status", [
  "pending",
  "ordered",
  "received",
  "cancelled",
]);

export const salesOrderStatus = pgEnum("sales_order_status", [
  "pending",
  "paid",
  "delivered",
  "cancelled",
]);

export const salesOrderPaymentMethod = pgEnum("sales_order_payment_method", [
  "cash",
  "bank_transfer",
  "credit_card",
  "mobile_payment",
]);

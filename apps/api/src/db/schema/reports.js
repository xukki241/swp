import { bigint, date, pgTable, jsonb, unique } from "drizzle-orm/pg-core";

export const reportsDaily = pgTable(
  "reports_daily",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    reportDate: date("report_date").notNull(),
    salesSummary: jsonb("sales_summary"),
    inventoryValues: jsonb("inventory_values"),
    lowStockItemsAlert: jsonb("low_stock_items_alert"),
    expiringLotsAlert: jsonb("expiring_lots_alert"),
  },
  table => [unique().on(table.reportDate)]
);

export const reportsWeekly = pgTable(
  "reports_weekly",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    weekStartDate: date("week_start_date").notNull(),
    salesSummary: jsonb("sales_summary"),
    productPerformance: jsonb("product_performance"),
  },
  table => [unique().on(table.weekStartDate)]
);

export const reportsMonthly = pgTable(
  "reports_monthly",
  {
    id: bigint("id", { mode: "number" })
      .primaryKey()
      .generatedAlwaysAsIdentity(),
    monthStartDate: date("month_start_date").notNull(),
    salesSummary: jsonb("sales_summary"),
  },
  table => [unique().on(table.monthStartDate)]
);

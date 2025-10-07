import { pgTable, jsonb, timestamp } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { reportType } from "./enums.js";

export const reports = pgTable("reports", {
  id: identityPrimaryKey(),
  type: reportType("type").notNull(),
  reportDate: timestamp("report_date").notNull().defaultNow(),
  data: jsonb("data").notNull(),
  parameters: jsonb("parameters"),
});

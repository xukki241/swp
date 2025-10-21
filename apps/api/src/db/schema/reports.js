import { jsonb, pgTable } from "drizzle-orm/pg-core";

import { createdAt, identityPrimaryKey } from "./common.js";
import { reportType } from "./enums.js";

export const reports = pgTable("reports", {
  id: identityPrimaryKey(),
  type: reportType("type").notNull(),
  reportDate: createdAt("report_date"),
  data: jsonb("data").notNull(),
  parameters: jsonb("parameters"),
});

import { pgTable, varchar, text, boolean } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { medicationStatus } from "./enums.js";

export const medications = pgTable("medications", {
  id: identityPrimaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  brand: varchar("brand", { length: 100 }),
  description: text("description"),
  isPrescriptionRequired: boolean("is_prescription_required")
    .notNull()
    .default(false),
  isControlledSubstance: boolean("is_controlled_substance")
    .notNull()
    .default(false),
  status: medicationStatus("status").notNull().default("active"),
});

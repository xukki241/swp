import { pgTable, varchar, boolean } from "drizzle-orm/pg-core";

import { identityPrimaryKey, name, description } from "./common.js";
import { medicationStatus } from "./enums.js";

export const medications = pgTable("medications", {
  id: identityPrimaryKey(),
  name: name(),
  brand: varchar("brand", { length: 100 }),
  description: description(),
  isPrescriptionRequired: boolean("is_prescription_required")
    .notNull()
    .default(false),
  isControlledSubstance: boolean("is_controlled_substance")
    .notNull()
    .default(false),
  status: medicationStatus("status").notNull().default("active"),
});

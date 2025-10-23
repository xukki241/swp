import { boolean, pgTable, varchar } from "drizzle-orm/pg-core";

import { description, foreignKey, identityPrimaryKey, name } from "./common.js";
import { medicationStatus } from "./enums.js";
import { files } from "./files.js";

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
  imageId: foreignKey("image_id", files.id),
});

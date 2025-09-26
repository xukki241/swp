import {
  bigint,
  varchar,
  text,
  pgTable,
  pgEnum,
  boolean,
  decimal,
  integer,
  unique,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { medicationVariants } from "./medication-variants.js";

export const medicationStatusEnum = pgEnum("medication_status", [
  "active",
  "inactive",
  "discontinued",
]);

export const medications = pgTable("medications", {
  id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
  name: varchar("name", { length: 255 }).notNull(),
  brand: varchar("brand", { length: 255 }),
  description: text("description"),
  status: medicationStatusEnum("status").default("active"),
});

export const medicationsRelations = relations(medications, ({ many }) => ({
  variants: many(medicationVariants),
}));

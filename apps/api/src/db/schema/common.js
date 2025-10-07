import { sql } from "drizzle-orm";
import {
  varchar,
  bigint,
  boolean,
  timestamp,
  text,
  numeric,
} from "drizzle-orm/pg-core";

export const id = bigint("id", { mode: "number" })
  .primaryKey()
  .generatedAlwaysAsIdentity();

export const name = (columnName = "name") =>
  varchar(columnName, { length: 100 }).notNull();

export const description = (columnName = "description") => text(columnName);

export const code = (columnName = "code") =>
  varchar(columnName, { length: 50 }).notNull();

export const email = (columnName = "email") =>
  varchar(columnName, { length: 255 });

export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 10 });

export const address = (columnName = "address") => text(columnName);

export const createdAt = (columnName = "created_at") =>
  timestamp(columnName).notNull().defaultNow();

export const updatedAt = (columnName = "updated_at") =>
  timestamp(columnName)
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`);

export const isActive = (columnName = "is_active") =>
  boolean(columnName).notNull().default(true);

export const identityPrimaryKey = (columnName = "id") =>
  bigint(columnName, { mode: "number" })
    .primaryKey()
    .primaryKey()
    .notNull()
    .generatedAlwaysAsIdentity();

export const foreignKey = (columnName, references) =>
  bigint(columnName, { mode: "number" }).references(references, {
    onDelete: "cascade",
    onUpdate: "cascade",
  });

export const decimalColumn = (
  columnName,
  config = { precision: 10, scale: 2 }
) => numeric(columnName, config);

export const basicInfo = {
  name,
  email,
  phone,
  address,
};

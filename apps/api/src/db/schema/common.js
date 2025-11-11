import { sql } from "drizzle-orm";
import {
  boolean,
  customType,
  doublePrecision,
  integer,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const id = uuid("id").primaryKey().defaultRandom();

export const name = (columnName = "name") =>
  varchar(columnName, { length: 100 }).notNull();

export const description = (columnName = "description") => text(columnName);

export const code = (columnName = "code") =>
  varchar(columnName, { length: 50 }).notNull();

export const email = (columnName = "email") =>
  varchar(columnName, { length: 255 });

export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 20 });

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
  uuid(columnName).primaryKey().defaultRandom();

export const foreignKey = (columnName, references, actions) =>
  uuid(columnName).references(
    () => references,
    actions ?? {
      onDelete: "restrict",
      onUpdate: "cascade",
    }
  );

export const int = (columnName) => integer(columnName);

export const decimalColumn = (columnName) => doublePrecision(columnName);

// Custom bytea type for storing binary data (blobs)
const bytea = customType({
  dataType() {
    return "bytea";
  },
  toDriver(value) {
    return value; // Buffer stays as Buffer
  },
});

export const blobColumn = (columnName) => bytea(columnName);

// Custom tsvector type for PostgreSQL Full-Text Search
const tsvector = customType({
  dataType() {
    return "tsvector";
  },
});

export const searchVector = (columnName = "search_vector") =>
  tsvector(columnName);

export const basicInfo = {
  name,
  email,
  phone,
  address,
};

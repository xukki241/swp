import { pgTable, bigint, varchar, uniqueIndex } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common";
import { files } from "./files";

export const fileAttachments = pgTable(
  "file_attachments",
  {
    id: identityPrimaryKey(),
    fileId: bigint("file_id", { mode: "bigint" })
      .notNull()
      .references(() => files.id, {
        onDelete: "cascade",
        onUpdate: "cascade",
      }),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: bigint("entity_id", { mode: "bigint" }).notNull(),
  },
  (table) => [
    uniqueIndex("file_attachments_file_id_entity_type_entity_id_unique").on(
      table.fileId,
      table.entityType,
      table.entityId
    ),
  ]
);

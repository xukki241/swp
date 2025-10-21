import { pgTable, uniqueIndex, varchar } from "drizzle-orm/pg-core";

import { foreignKey, identityPrimaryKey, int } from "./common.js";
import { files } from "./files.js";

export const fileAttachments = pgTable(
  "file_attachments",
  {
    id: identityPrimaryKey(),
    fileId: foreignKey("file_id", files.id).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: int("entity_id").notNull(),
  },
  (table) => [
    uniqueIndex("file_attachments_file_id_entity_type_entity_id_unique").on(
      table.fileId,
      table.entityType,
      table.entityId
    ),
  ]
);

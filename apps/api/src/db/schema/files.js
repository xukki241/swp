import { pgTable, text, varchar } from "drizzle-orm/pg-core";

import { createdAt, foreignKey, identityPrimaryKey, int } from "./common.js";
import { users } from "./users.js";

export const files = pgTable("files", {
  id: identityPrimaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: int("file_size").notNull(),
  storagePath: text("storage_path").notNull(),
  uploadedBy: foreignKey("uploaded_by", users.id),
  uploadedAt: createdAt("uploaded_at"),
});

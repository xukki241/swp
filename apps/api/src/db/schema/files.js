import { pgTable, bigint, varchar, text, timestamp } from "drizzle-orm/pg-core";

import { identityPrimaryKey } from "./common.js";
import { users } from "./users.js";

export const files = pgTable("files", {
  id: identityPrimaryKey(),
  filename: varchar("filename", { length: 255 }).notNull(),
  fileType: varchar("file_type", { length: 50 }).notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  fileSize: bigint("file_size", { mode: "bigint" }).notNull(),
  storagePath: text("storage_path").notNull(),
  uploadedBy: bigint("uploaded_by", { mode: "bigint" }).references(
    () => users.id,
    {
      onDelete: "set null",
      onUpdate: "cascade",
    }
  ),
  uploadedAt: timestamp("uploaded_at").notNull().defaultNow(),
});

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "../db/index.js";
import { files } from "../db/schema/index.js";

export const fileService = {
  /**
   * Create a new file entry in database
   * @param {Object} fileData - File data including blob
   * @returns {Promise<Object>} Created file record
   */
  async create(fileData) {
    const [file] = await db
      .insert(files)
      .values({
        filename: fileData.filename,
        fileType: fileData.fileType,
        mimeType: fileData.mimeType,
        fileSize: fileData.fileSize,
        blob: fileData.blob,
        uploadedBy: fileData.uploadedBy || null,
        uploadedAt: new Date(),
      })
      .returning();

    // Return without blob for metadata response
    // eslint-disable-next-line no-unused-vars
    const { blob, ...metadata } = file;
    return metadata;
  },

  /**
   * Get file metadata by ID (without blob)
   * @param {string} id - File ID (UUID)
   * @returns {Promise<Object|null>} File metadata
   */
  async getById(id) {
    const [file] = await db
      .select({
        id: files.id,
        filename: files.filename,
        fileType: files.fileType,
        mimeType: files.mimeType,
        fileSize: files.fileSize,
        uploadedBy: files.uploadedBy,
        uploadedAt: files.uploadedAt,
      })
      .from(files)
      .where(eq(files.id, id));

    return file || null;
  },

  /**
   * Get file with blob for download
   * @param {string} id - File ID (UUID)
   * @returns {Promise<Object|null>} Full file record with blob
   */
  async getFileWithBlob(id) {
    const [file] = await db.select().from(files).where(eq(files.id, id));

    return file || null;
  },

  /**
   * List all files with pagination and filtering
   * @param {Object} filters - Query filters
   * @returns {Promise<Object>} Paginated file list
   */
  async getAll(filters = {}) {
    const { fileType, uploadedBy, limit = 50, offset = 0 } = filters;

    const conditions = [];

    if (fileType) {
      conditions.push(eq(files.fileType, fileType));
    }

    if (uploadedBy) {
      conditions.push(eq(files.uploadedBy, uploadedBy));
    }

    // Get total count
    const countResult = await db
      .select({ count: sql`count(*)`.as("count") })
      .from(files)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalCount = Number(countResult[0]?.count || 0);

    // Get data (without blob)
    const data = await db
      .select({
        id: files.id,
        filename: files.filename,
        fileType: files.fileType,
        mimeType: files.mimeType,
        fileSize: files.fileSize,
        uploadedBy: files.uploadedBy,
        uploadedAt: files.uploadedAt,
      })
      .from(files)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(files.uploadedAt))
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: totalCount,
    };
  },

  /**
   * Delete file by ID
   * @param {string} id - File ID (UUID)
   * @returns {Promise<Object|null>} Deleted file metadata
   */
  async delete(id) {
    const [deletedFile] = await db
      .delete(files)
      .where(eq(files.id, id))
      .returning({
        id: files.id,
        filename: files.filename,
        fileType: files.fileType,
        mimeType: files.mimeType,
        fileSize: files.fileSize,
        uploadedBy: files.uploadedBy,
        uploadedAt: files.uploadedAt,
      });

    return deletedFile || null;
  },

  /**
   * Check if file exists
   * @param {string} id - File ID (UUID)
   * @returns {Promise<boolean>}
   */
  async exists(id) {
    const [result] = await db
      .select({ count: sql`count(*)`.as("count") })
      .from(files)
      .where(eq(files.id, id));

    return Number(result?.count || 0) > 0;
  },
};

import { z } from "zod";
import { timestampSchema, uuidSchema } from "../common/index.js";

// File schema
export const fileSchema = z.object({
  id: uuidSchema,
  filename: z.string().max(255),
  fileType: z.string().max(50),
  mimeType: z.string().max(100),
  fileSize: z.number().int().nonnegative(),
  uploadedBy: uuidSchema.nullable().optional(),
  uploadedAt: timestampSchema,
});

// File without blob (for listing)
export const fileMetadataSchema = fileSchema;

// POST /api/files - Upload file
export const uploadFileRequestSchema = z.object({
  // File will be in req.file from multer
  // No body validation needed for multipart
});

export const uploadFileResponseSchema = fileSchema;

// GET /api/files/:id - Get file metadata
export const getFileMetadataResponseSchema = fileMetadataSchema;

// GET /api/files/:id/download - Download file (returns blob)
// No response schema needed (returns binary data)

// DELETE /api/files/:id - Delete file
export const deleteFileResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// GET /api/files - List files
export const listFilesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(50).optional(),
  fileType: z.string().optional(),
  uploadedBy: uuidSchema.optional(),
});

export const listFilesResponseSchema = z.object({
  data: z.array(fileMetadataSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    totalPages: z.number(),
    hasMore: z.boolean(),
  }),
});

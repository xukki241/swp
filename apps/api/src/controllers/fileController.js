import asyncHandler from "express-async-handler";
import path from "path";

import { fileService } from "../services/fileService.js";
import logger from "../utils/logger.js";

export const fileController = {
  /**
   /**
oad a file
   * POST /api/files
   */
  upload: asyncHandler(async (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded. Please provide a file.",
      });
    }

    const userId = req.user?.id; // Get user ID from auth middleware
    const file = req.file;

    // Log file metadata only (not binary content)
    logger.info(
      `File upload: ${file.originalname} (${file.mimetype}, ${file.size} bytes) by user ${userId || "anonymous"}`
    );

    // Extract file type from extension
    const fileExtension = path.extname(file.originalname).substring(1);

    // Create file record in database
    const fileData = {
      filename: file.originalname,
      fileType: fileExtension || "unknown",
      mimeType: file.mimetype,
      fileSize: file.size,
      blob: file.buffer, // Store file buffer as blob
      uploadedBy: userId,
    };

    const createdFile = await fileService.create(fileData);

    logger.info(`File uploaded successfully: ID ${createdFile.id}`);

    res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: createdFile,
    });
  }),

  /**
   * Upload multiple files
   * POST /api/files/batch
   */
  uploadMultiple: asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded. Please provide files.",
      });
    }

    const userId = req.user?.id;
    const uploadedFiles = [];

    logger.info(
      `Batch file upload started: ${req.files.length} file(s) by user ${userId || "anonymous"}`
    );

    // Process each file
    for (const file of req.files) {
      const fileExtension = path.extname(file.originalname).substring(1);

      const fileData = {
        filename: file.originalname,
        fileType: fileExtension || "unknown",
        mimeType: file.mimetype,
        fileSize: file.size,
        blob: file.buffer,
        uploadedBy: userId,
      };

      const createdFile = await fileService.create(fileData);
      uploadedFiles.push(createdFile);
    }

    logger.info(
      `Batch upload completed: ${uploadedFiles.length} file(s) uploaded`
    );

    res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles,
    });
  }),

  /**
   * Get file metadata by ID
   * GET /api/files/:id
   */
  getById: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await fileService.getById(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    res.json({
      success: true,
      data: file,
    });
  }),

  /**
   * Download file
   * GET /api/files/:id/download
   */
  download: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await fileService.getFileWithBlob(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set response headers for file download
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(file.filename)}"`
    );
    res.setHeader("Content-Length", file.fileSize);

    // Send the blob data
    res.send(file.blob);
  }),

  /**
   * View/display file in browser (inline)
   * GET /api/files/:id/view
   */
  view: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const file = await fileService.getFileWithBlob(id);

    if (!file) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    // Set response headers for inline display
    res.setHeader("Content-Type", file.mimeType);
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${encodeURIComponent(file.filename)}"`
    );
    res.setHeader("Content-Length", file.fileSize);

    // Send the blob data
    res.send(file.blob);
  }),

  /**
   * List files with pagination
   * GET /api/files
   */
  getAll: asyncHandler(async (req, res) => {
    const page = req.query.page ? Number.parseInt(req.query.page) : 1;
    const limit = req.query.limit ? Number.parseInt(req.query.limit) : 50;
    const offset = (page - 1) * limit;

    const filters = {
      fileType: req.query.fileType,
      uploadedBy: req.query.uploadedBy,
      limit,
      offset,
    };

    const result = await fileService.getAll(filters);

    res.json({
      success: true,
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
        hasMore: offset + result.data.length < result.total,
      },
    });
  }),

  /**
   * Delete file
   * DELETE /api/files/:id
   */
  delete: asyncHandler(async (req, res) => {
    const { id } = req.params;

    const deletedFile = await fileService.delete(id);

    if (!deletedFile) {
      return res.status(404).json({
        success: false,
        message: "File not found",
      });
    }

    logger.info(`File deleted: ${deletedFile.filename} (ID: ${id})`);

    res.json({
      success: true,
      message: "File deleted successfully",
      data: deletedFile,
    });
  }),
};

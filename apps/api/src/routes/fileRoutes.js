import { listFilesQuerySchema, uuidSchema } from "@pharmaflow/dto";
import { validateParams, validateQuery } from "@pharmaflow/dto/middleware";
import express from "express";
import { z } from "zod";

import { fileController } from "../controllers/fileController.js";
import { authenticate, authorize } from "../middleware/checkAuth.js";
import {
  handleMulterError,
  uploadMultiple,
  uploadSingle,
} from "../middleware/upload.js";

export const fileRouter = express.Router();

// All routes require authentication
fileRouter.use(authenticate);

// Param validation schema for routes with :id
const idParamSchema = z.object({
  id: uuidSchema,
});

/**
 * @route   POST /api/files
 * @desc    Upload a single file
 * @access  Private (Authenticated)
 */
fileRouter.post("/", uploadSingle, handleMulterError, fileController.upload);

/**
 * @route   POST /api/files/batch
 * @desc    Upload multiple files (max 10)
 * @access  Private (Authenticated)
 */
fileRouter.post(
  "/batch",
  uploadMultiple,
  handleMulterError,
  fileController.uploadMultiple
);

/**
 * @route   GET /api/files
 * @desc    List all files with pagination
 * @access  Private (Authenticated)
 */
fileRouter.get("/", validateQuery(listFilesQuerySchema), fileController.getAll);

/**
 * @route   GET /api/files/:id
 * @desc    Get file metadata by ID
 * @access  Private (Authenticated)
 */
fileRouter.get("/:id", validateParams(idParamSchema), fileController.getById);

/**
 * @route   GET /api/files/:id/download
 * @desc    Download file
 * @access  Private (Authenticated)
 */
fileRouter.get(
  "/:id/download",
  validateParams(idParamSchema),
  fileController.download
);

/**
 * @route   GET /api/files/:id/view
 * @desc    View file in browser (inline)
 * @access  Private (Authenticated)
 */
fileRouter.get("/:id/view", validateParams(idParamSchema), fileController.view);

/**
 * @route   DELETE /api/files/:id
 * @desc    Delete file
 * @access  Private (Owner only)
 */
fileRouter.delete(
  "/:id",
  authorize("owner"),
  validateParams(idParamSchema),
  fileController.delete
);

export default fileRouter;

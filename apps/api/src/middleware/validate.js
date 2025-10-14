import { z } from "zod";

import logger from "../utils/logger.js";

/**
 * Validation middleware factory using Zod schemas
 * @param {Object} schemas - Object containing schemas for body, query, or params
 * @param {z.ZodSchema} schemas.body - Zod schema for request body
 * @param {z.ZodSchema} schemas.query - Zod schema for query parameters
 * @param {z.ZodSchema} schemas.params - Zod schema for URL parameters
 * @returns {Function} Express middleware
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      // ✅ Validate request body if schema provided
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body);
      }

      // ✅ Validate query parameters if schema provided
      if (schemas.query) {
        // Instead of modifying req.query, you can create a new property
        // or reassign it if your Express version allows.
        // For broader compatibility, let's use a new property.
        req.validatedQuery = await schemas.query.parseAsync(req.query);
      }

      // ✅ Validate URL parameters if schema provided
      if (schemas.params) {
        req.params = await schemas.params.parseAsync(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        logger.warn("Validation error:", {
          path: req.path,
          errors: error.errors,
        });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      // If it's not a Zod error, pass to error handler
      logger.error("Unexpected error in validation middleware:", error);
      next(error);
    }
  };
};

/**
 * Validate request body only
 * @param {z.ZodSchema} schema - Zod schema for request body
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate query parameters only
 * @param {z.ZodSchema} schema - Zod schema for query parameters
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => validate({ query: schema });

/**
 * Validate URL parameters only
 * @param {z.ZodSchema} schema - Zod schema for URL parameters
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => validate({ params: schema });

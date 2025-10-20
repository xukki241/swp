import { z } from "zod";

import logger from "../utils/logger.js";

/**
 * Validation middleware factory using Zod schemas
 * Parses and replaces request body, query, params, and headers with validated data
 * @param {Object} schemas - Object containing schemas for body, query, params, or headers
 * @param {z.ZodSchema} schemas.body - Zod schema for request body
 * @param {z.ZodSchema} schemas.query - Zod schema for query parameters
 * @param {z.ZodSchema} schemas.params - Zod schema for URL parameters
 * @param {z.ZodSchema} schemas.headers - Zod schema for request headers
 * @returns {Function} Express middleware
 */
export const validate = (schemas) => {
  return async (req, res, next) => {
    try {
      // Validate and replace request body if schema provided
      if (schemas.body) {
        const parsed = await schemas.body.parseAsync(req.body);
        req.body = parsed;
      }

      // Validate and replace query parameters if schema provided
      if (schemas.query) {
        const parsed = await schemas.query.parseAsync(req.query);
        // Create a new object to replace query (avoid read-only issues)
        Object.keys(req.query).forEach((key) => delete req.query[key]);
        Object.assign(req.query, parsed);
      }

      // Validate and replace URL parameters if schema provided
      if (schemas.params) {
        const parsed = await schemas.params.parseAsync(req.params);
        // Create a new object to replace params (avoid read-only issues)
        Object.keys(req.params).forEach((key) => delete req.params[key]);
        Object.assign(req.params, parsed);
      }

      // Validate and replace headers if schema provided
      if (schemas.headers) {
        const parsed = await schemas.headers.parseAsync(req.headers);
        // Store parsed headers in a custom property to avoid modifying actual headers
        req.validatedHeaders = parsed;
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
          errors: (error.errors || []).map((err) => ({
            field: err.path ? err.path.join(".") : "unknown",
            message: err.message || "Validation error",
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
 * Validate and replace request body only
 * @param {z.ZodSchema} schema - Zod schema for request body
 * @returns {Function} Express middleware
 */
export const validateBody = (schema) => validate({ body: schema });

/**
 * Validate and replace query parameters only
 * @param {z.ZodSchema} schema - Zod schema for query parameters
 * @returns {Function} Express middleware
 */
export const validateQuery = (schema) => validate({ query: schema });

/**
 * Validate and replace URL parameters only
 * @param {z.ZodSchema} schema - Zod schema for URL parameters
 * @returns {Function} Express middleware
 */
export const validateParams = (schema) => validate({ params: schema });

/**
 * Validate headers only
 * @param {z.ZodSchema} schema - Zod schema for request headers
 * @returns {Function} Express middleware
 */
export const validateHeaders = (schema) => validate({ headers: schema });

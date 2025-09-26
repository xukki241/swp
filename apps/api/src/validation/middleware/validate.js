import { z } from "zod";

/**
 * Generic validation middleware factory
 * @param {Object} schemas - Object containing validation schemas for different parts of the request
 * @param {z.ZodSchema} schemas.body - Schema for request body validation
 * @param {z.ZodSchema} schemas.params - Schema for request params validation
 * @param {z.ZodSchema} schemas.query - Schema for request query validation
 * @returns {Function} Express middleware function
 */
export const validate = (schemas = {}) => {
  return async (req, res, next) => {
    try {
      const validationResults = {};

      // Validate request body
      if (schemas.body) {
        try {
          validationResults.body = await schemas.body.parseAsync(req.body);
          req.body = validationResults.body;
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: "Invalid request body",
            details: formatZodErrors(error),
          });
        }
      }

      // Validate request params
      if (schemas.params) {
        try {
          validationResults.params = await schemas.params.parseAsync(
            req.params
          );
          // Store validated params in a custom property instead of overwriting req.params
          req.validatedParams = validationResults.params;
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: "Invalid request parameters",
            details: formatZodErrors(error),
          });
        }
      }

      // Validate request query
      if (schemas.query) {
        try {
          validationResults.query = await schemas.query.parseAsync(req.query);
          // Store validated query in a custom property instead of overwriting req.query
          req.validatedQuery = validationResults.query;
        } catch (error) {
          return res.status(400).json({
            success: false,
            error: "Validation Error",
            message: "Invalid query parameters",
            details: formatZodErrors(error),
          });
        }
      }

      next();
    } catch (error) {
      console.error("Validation middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Internal Server Error",
        message: "An error occurred during validation",
      });
    }
  };
};

/**
 * Format Zod validation errors into a more readable format
 * @param {z.ZodError} error - Zod validation error
 * @returns {Array} Formatted error messages
 */
const formatZodErrors = (error) => {
  if (!(error instanceof z.ZodError)) {
    return [
      {
        field: "unknown",
        message: error.message || "Unknown validation error",
      },
    ];
  }

  // Check if errors array exists and is not empty
  if (!error.errors || !Array.isArray(error.errors)) {
    return [{ field: "unknown", message: "Validation error occurred" }];
  }

  return error.errors.map((err) => {
    const path = err.path && err.path.length > 0 ? err.path.join(".") : "root";
    return {
      field: path,
      message: err.message || "Validation error",
      code: err.code || "unknown",
      ...(err.received && { received: err.received }),
      ...(err.expected && { expected: err.expected }),
    };
  });
};

/**
 * Convenience middleware creators for common validation scenarios
 */

/**
 * Validate only request body
 * @param {z.ZodSchema} bodySchema - Schema for request body
 * @returns {Function} Express middleware function
 */
export const validateBody = (bodySchema) => {
  return validate({ body: bodySchema });
};

/**
 * Validate only request params
 * @param {z.ZodSchema} paramsSchema - Schema for request params
 * @returns {Function} Express middleware function
 */
export const validateParams = (paramsSchema) => {
  return validate({ params: paramsSchema });
};

/**
 * Validate only request query
 * @param {z.ZodSchema} querySchema - Schema for request query
 * @returns {Function} Express middleware function
 */
export const validateQuery = (querySchema) => {
  return validate({ query: querySchema });
};

/**
 * Validate request body and params
 * @param {z.ZodSchema} bodySchema - Schema for request body
 * @param {z.ZodSchema} paramsSchema - Schema for request params
 * @returns {Function} Express middleware function
 */
export const validateBodyAndParams = (bodySchema, paramsSchema) => {
  return validate({ body: bodySchema, params: paramsSchema });
};

/**
 * Validate request body and query
 * @param {z.ZodSchema} bodySchema - Schema for request body
 * @param {z.ZodSchema} querySchema - Schema for request query
 * @returns {Function} Express middleware function
 */
export const validateBodyAndQuery = (bodySchema, querySchema) => {
  return validate({ body: bodySchema, query: querySchema });
};

/**
 * Validate request params and query
 * @param {z.ZodSchema} paramsSchema - Schema for request params
 * @param {z.ZodSchema} querySchema - Schema for request query
 * @returns {Function} Express middleware function
 */
export const validateParamsAndQuery = (paramsSchema, querySchema) => {
  return validate({ params: paramsSchema, query: querySchema });
};

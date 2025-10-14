import { ZodError } from "zod";

/**
 * Format Zod validation errors into a user-friendly structure
 * @param {ZodError} error - Zod validation error
 * @returns {Object} Formatted error object
 */
function formatZodError(error) {
  const formattedErrors = {};

  error.errors.forEach((err) => {
    const path = err.path.join(".");
    if (!formattedErrors[path]) {
      formattedErrors[path] = [];
    }
    formattedErrors[path].push(err.message);
  });

  return {
    error: "Validation failed",
    details: formattedErrors,
    issues: error.errors.map((err) => ({
      path: err.path,
      message: err.message,
      code: err.code,
    })),
  };
}

/**
 * Create validation middleware for request body
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export function validateBody(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Create validation middleware for query parameters
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export function validateQuery(schema) {
  return (req, res, next) => {
    try {
      // Just validate without reassigning - req.query is read-only in some cases
      schema.parse(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Create validation middleware for route parameters
 * @param {ZodSchema} schema - Zod schema to validate against
 * @returns {Function} Express middleware
 */
export function validateParams(schema) {
  return (req, res, next) => {
    try {
      // Just validate without reassigning - req.params is read-only in some cases
      schema.parse(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Create validation middleware for multiple parts of request
 * @param {Object} schemas - Object with body, query, and/or params schemas
 * @param {ZodSchema} [schemas.body] - Schema for request body
 * @param {ZodSchema} [schemas.query] - Schema for query parameters
 * @param {ZodSchema} [schemas.params] - Schema for route parameters
 * @returns {Function} Express middleware
 */
export function validate(schemas) {
  return (req, res, next) => {
    try {
      if (schemas.body) {
        req.body = schemas.body.parse(req.body);
      }

      if (schemas.query) {
        // Just validate without reassigning - req.query is read-only
        schemas.query.parse(req.query);
      }

      if (schemas.params) {
        // Just validate without reassigning - req.params is read-only
        schemas.params.parse(req.params);
      }

      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Async validation middleware with error handling
 * @param {Function} validationFn - Async validation function
 * @returns {Function} Express middleware
 */
export function asyncValidate(validationFn) {
  return async (req, res, next) => {
    try {
      await validationFn(req);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json(formatZodError(error));
      }
      next(error);
    }
  };
}

/**
 * Safe parse validation (non-throwing)
 * Attaches validation results to req.validation
 * @param {ZodSchema} schema - Zod schema to validate against
 * @param {string} target - Target to validate ('body', 'query', or 'params')
 * @returns {Function} Express middleware
 */
export function safeValidate(schema, target = "body") {
  return (req, res, next) => {
    const result = schema.safeParse(req[target]);

    if (!req.validation) {
      req.validation = {};
    }

    req.validation[target] = result;

    if (!result.success) {
      return res.status(400).json(formatZodError(result.error));
    }

    // Only assign if target is body (writable), not query or params
    if (target === "body") {
      req[target] = result.data;
    }
    next();
  };
}

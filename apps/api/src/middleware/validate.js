import * as v from "valibot";

/**
 * Format validation errors for API response
 */
const formatValidationErrors = (issues) => {
  return issues.map((issue) => ({
    field: issue.path?.map((p) => p.key).join(".") || "root",
    message: issue.message,
    received: issue.received,
    expected: issue.expected,
  }));
};

/**
 * Generic validation middleware factory
 * @param {Object} schemas - Object containing validation schemas for different parts of the request
 * @param {Object} schemas.body - Schema for request body validation
 * @param {Object} schemas.params - Schema for request params validation
 * @param {Object} schemas.query - Schema for request query validation
 * @param {Object} schemas.headers - Schema for request headers validation
 */
export const validate = (schemas) => {
  return (req, res, next) => {
    const errors = [];

    // Validate request body
    if (schemas.body) {
      try {
        const result = v.safeParse(schemas.body, req.body);
        if (!result.success) {
          errors.push({
            location: "body",
            errors: formatValidationErrors(result.issues),
          });
        } else {
          req.body = result.output;
        }
      } catch (error) {
        errors.push({
          location: "body",
          errors: [{ field: "root", message: "Invalid request body format" }],
        });
      }
    }

    // Validate request params
    if (schemas.params) {
      try {
        const result = v.safeParse(schemas.params, req.params);
        if (!result.success) {
          errors.push({
            location: "params",
            errors: formatValidationErrors(result.issues),
          });
        } else {
          req.params = result.output;
        }
      } catch (error) {
        errors.push({
          location: "params",
          errors: [{ field: "root", message: "Invalid request params format" }],
        });
      }
    }

    // Validate request query
    if (schemas.query) {
      try {
        const result = v.safeParse(schemas.query, req.query);
        if (!result.success) {
          errors.push({
            location: "query",
            errors: formatValidationErrors(result.issues),
          });
        } else {
          req.query = result.output;
        }
      } catch (error) {
        errors.push({
          location: "query",
          errors: [{ field: "root", message: "Invalid request query format" }],
        });
      }
    }

    // Validate request headers
    if (schemas.headers) {
      try {
        const result = v.safeParse(schemas.headers, req.headers);
        if (!result.success) {
          errors.push({
            location: "headers",
            errors: formatValidationErrors(result.issues),
          });
        } else {
          req.headers = { ...req.headers, ...result.output };
        }
      } catch (error) {
        errors.push({
          location: "headers",
          errors: [
            { field: "root", message: "Invalid request headers format" },
          ],
        });
      }
    }

    // If there are validation errors, return them
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        message: "The request contains invalid data",
        details: errors,
      });
    }

    next();
  };
};

/**
 * Body validation middleware
 * @param {Object} schema - Valibot schema for body validation
 */
export const validateBody = (schema) => {
  return validate({ body: schema });
};

/**
 * Params validation middleware
 * @param {Object} schema - Valibot schema for params validation
 */
export const validateParams = (schema) => {
  return validate({ params: schema });
};

/**
 * Query validation middleware
 * @param {Object} schema - Valibot schema for query validation
 */
export const validateQuery = (schema) => {
  return validate({ query: schema });
};

/**
 * Headers validation middleware
 * @param {Object} schema - Valibot schema for headers validation
 */
export const validateHeaders = (schema) => {
  return validate({ headers: schema });
};

import logger from "../utils/logger.js";

/**
 * Not Found Handler
 * Handles 404 errors for routes that don't exist
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * Error Handler
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  // Log the error
  logger.error(err);

  res.status(statusCode).json({
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

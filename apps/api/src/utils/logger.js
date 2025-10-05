import { createLogger, format, transports } from "winston";

import config from "../config/environment.js";

const { combine, timestamp: timestampFn, printf, colorize, errors } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} ${level}: ${stack || message}`;
});

const logger = createLogger({
  level: config.isDevelopment ? "debug" : "info",
  format: combine(
    errors({ stack: true }),
    timestampFn({ format: "YYYY-MM-DD HH:mm:ss" }),
    logFormat
  ),
  transports: [
    new transports.Console({
      format: combine(colorize({ all: true })),
    }),
  ],
});

// morgan-compatible stream
logger.stream = {
  write: (message) => {
    // morgan adds a newline at the end of each message
    logger.info(message.trim());
  },
};

export default logger;

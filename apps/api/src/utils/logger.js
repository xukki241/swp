import fs from "fs";
import path from "path";

import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

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
    // daily rotate for combined logs
    new DailyRotateFile({
      filename: path.join(getLogsDir(), "combined-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "7d",
      level: "info",
    }),
    // daily rotate for error logs
    new DailyRotateFile({
      filename: path.join(getLogsDir(), "error-%DATE%.log"),
      datePattern: "YYYY-MM-DD",
      zippedArchive: false,
      maxFiles: "7d",
      level: "error",
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

function getLogsDir() {
  // place logs in the current working directory under ./logs
  const dir = path.resolve(process.cwd(), "logs");
  try {
    fs.mkdirSync(dir, { recursive: true });
  } catch {
    // if creation fails, fall back to cwd
  }
  return dir;
}

export default logger;

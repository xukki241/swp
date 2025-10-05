import app from "./app.js";
import config from "./config/environment.js";
import logger from "./utils/logger.js";

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  logger.info(
    `${config.name} (v${config.version}) is running on http://localhost:${PORT}`
  );
  logger.debug(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    logger.info("Server closed");

    /* eslint-disable-next-line n/no-process-exit */
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    logger.error("Forced shutdown after timeout");

    /* eslint-disable-next-line n/no-process-exit */
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;

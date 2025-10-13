// Register module aliases so imports using '@' map to the src/ directory
import "module-alias/register.js";

import app from "./app.js";
import config from "./config/environment.js";
import { closeConnection, testConnection } from "./db/connection.js";
import logger from "./utils/logger.js";
import { initializeScheduler } from "./utils/scheduler.js";

const PORT = config.port;

// Start the server callback
async function startServer() {
  logger.info(
    `${config.name} (v${config.version}) is running on http://localhost:${PORT}`
  );
  logger.debug(`Environment: ${config.nodeEnv}`);

  if (config.isDevelopment) {
    logger.debug("CORS Origin:", config.corsOrigin);
    logger.debug("CORS Methods:", config.corsMethods);
    logger.debug("CORS Credentials:", config.corsCredentials);
  }

  await testConnection();

  // Initialize scheduled report jobs
  initializeScheduler();

  logger.info("Application started successfully");
}

// Graceful shutdown
async function gracefulShutdown(signal) {
  logger.info(`\n${signal} received. Starting graceful shutdown...`);

  // Close database connections
  await closeConnection();

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
}

const server = app.listen(PORT, startServer);

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;

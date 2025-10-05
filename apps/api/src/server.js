import app from "./app.js";
import config from "./config/environment.js";

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log(
    `${config.name} (v${config.version}) is running on http://localhost:${PORT}`
  );
  console.log(`Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  server.close(() => {
    console.log("Server closed");

    /* eslint-disable-next-line n/no-process-exit */
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error("Forced shutdown after timeout");

    /* eslint-disable-next-line n/no-process-exit */
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default server;

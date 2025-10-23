import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config/environment.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import { apiRouter } from "./routes/index.js";
import logger from "./utils/logger.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: config.corsMethods,
    credentials: config.corsCredentials === "true",
  })
);
// Use morgan for HTTP request logging, routed through winston
// Skip logging for file upload routes to avoid logging binary data
app.use(
  morgan(config.isDevelopment ? "dev" : "combined", {
    stream: logger.stream,
    skip: (req) => req.path.startsWith("/api/files") && req.method === "POST",
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.json({
    name: config.name,
    version: config.version,
    environment: config.nodeEnv,
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.use("/api", apiRouter);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

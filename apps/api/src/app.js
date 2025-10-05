import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config/environment.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    methods: config.corsMethods,
    credentials: config.corsCredentials === "true",
  })
);
app.use(morgan(config.isDevelopment ? "dev" : "combined"));

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

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

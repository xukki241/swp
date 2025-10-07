import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config/environment.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middleware/errorHandler.js";
import authRoutes from "./routes/authRoutes.js";
import registrationRoutes from "./routes/registrationRoutes.js";
import userRoutes from "./routes/userRoutes.js";
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
app.use(
  morgan(config.isDevelopment ? "dev" : "combined", { stream: logger.stream })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/registrations", registrationRoutes);
app.use("/api/users", userRoutes);

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

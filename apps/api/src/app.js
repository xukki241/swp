import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import config from "./config/environment.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import {
  authRoutes,
  medicationRoutes,
  purchaseOrderRoutes,
  registrationRoutes,
  supplierRoutes,
  userRoutes,
  warehouseBinRoutes,
  warehouseRackRoutes,
  warehouseZoneRoutes,
} from "./routes/index.js";
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
app.use("/api/medications", medicationRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/purchase-orders", purchaseOrderRoutes);
app.use("/api/warehouse-zones", warehouseZoneRoutes);
app.use("/api/warehouse-racks", warehouseRackRoutes);
app.use("/api/warehouse-bins", warehouseBinRoutes);

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

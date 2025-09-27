import express from "express";

import { usersRoutes } from "./routes/index.js";

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", usersRoutes);

// Basic routes
app.get("/", (request, res) => {
  res.json({
    message: "Welcome to the API!",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health", (request, res) => {
  res.json({
    status: "healthy",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// 404 handler
app.use((request, res) => {
  res.status(404).json({
    error: "Route not found",
    path: request.originalUrl,
    method: request.method,
  });
});

// Error handler
app.use((error, request, res, _next) => {
  console.error(error.stack);
  res.status(500).json({
    error: "Something went wrong!",
    message: error.message,
  });
});

export default app;

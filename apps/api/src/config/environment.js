import "dotenv/config";

import { getEnv, getEnvAsNumber } from "../utils/env.js";

import pkg from "./package-json.js";

/**
 * Application configuration
 */
const config = {
  // Application
  name: getEnv("APP_NAME", pkg.displayName || pkg.name),
  version: getEnv("APP_VERSION", pkg.version),

  // Server
  port: getEnvAsNumber("PORT", 80),
  nodeEnv: getEnv("NODE_ENV", "development"),
  isDevelopment: getEnv("NODE_ENV", "development") === "development",
  isProduction: getEnv("NODE_ENV", "development") === "production",

  // API
  apiPrefix: getEnv("API_PREFIX", "/api"),

  // CORS
  corsOrigin: getEnv("CORS_ORIGIN", "*"),
  corsMethods: getEnv("CORS_METHODS", "GET,HEAD,PUT,PATCH,POST,DELETE"),
  corsCredentials: getEnv("CORS_CREDENTIALS", "true"),

  // Database
  databaseUrl: getEnv(
    "DATABASE_URL",
    "postgresql://postgres:postgres@localhost:5432/pharmaflow"
  ),
  allowAutoMigration:
    getEnv("DATABASE_ALLOW_AUTO_MIGRATION", "false") === "true",

  // JWT
  jwtSecret: getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
  jwtExpiresIn: getEnv("JWT_EXPIRES_IN", "24h"),

  // Email (SMTP)
  smtpHost: getEnv("SMTP_HOST", "smtp.gmail.com"),
  smtpPort: getEnvAsNumber("SMTP_PORT", 587),
  smtpUser: getEnv("SMTP_USER", ""),
  smtpPass: getEnv("SMTP_PASS", ""),
  smtpFrom: getEnv("SMTP_FROM", "noreply@pharmaflow.com"),

  // Frontend URL
  frontendUrl: getEnv("FRONTEND_URL", "http://localhost:3000"),

  // Backend/API URL (for email links, webhooks, etc.)
  apiUrl: getEnv("API_URL", "http://localhost:3000"),
};
// SMS Configuration removed - only email OTP supported

export default config;

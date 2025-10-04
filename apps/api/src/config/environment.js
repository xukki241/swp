import "dotenv/config";

import { getEnvAsNumber, getEnv } from "../utils/env.js";
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
};

export default config;

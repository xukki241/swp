import "dotenv/config";

/**
 * Environment configuration with environment variables and fallback values
 */
const environment = {
  // Server configuration
  port: Number.parseInt(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  // Database configuration
  database: {
    // Use DATABASE_URL if provided, otherwise construct from individual components
    url:
      process.env.DATABASE_URL ||
      `postgresql://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "5432"}/${process.env.DB_NAME || "pharmacy_db"}`,

    // Pool configuration
    poolSize: Number.parseInt(process.env.DB_POOL_SIZE) || 20,
    idleTimeout: Number.parseInt(process.env.DB_IDLE_TIMEOUT) || 30_000,
    connectionTimeout:
      Number.parseInt(process.env.DB_CONNECTION_TIMEOUT) || 2000,

    // SSL configuration
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  },

  // Migration configuration
  migrations: {
    folder: "./src/db/migrations",
  },
};

/**
 * Validate required configuration
 */
function validateConfig() {
  const requiredFields = ["database.url"];

  const missing = [];

  for (const field of requiredFields) {
    const keys = field.split(".");
    let value = environment;
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        break;
      }
    }
    if (!value) {
      missing.push(field);
    }
  }

  if (missing.length > 0) {
    throw new Error(`Missing required configuration: ${missing.join(", ")}`);
  }
}

// Validate configuration on import
try {
  validateConfig();
} catch (error) {
  console.error("Configuration validation failed:", error.message);
  if (environment.nodeEnv !== "test") {
    throw error;
  }
}

// Backwards compatibility
const env = environment;

export { environment, validateConfig, env };
export default environment;

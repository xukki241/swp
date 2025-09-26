import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

import * as schema from "./schema/index.js";
import { env } from "../config/env.js";

const { Pool } = pg;

// Create connection pool using DATABASE_URL or individual config values
const pool = new Pool({
  connectionString: env.database.url,
  ssl: env.database.ssl,
  max: env.database.poolSize,
  idleTimeoutMillis: env.database.idleTimeout,
  connectionTimeoutMillis: env.database.connectionTimeout,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Auto-migrate on startup
async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: env.migrations.folder });
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  }
}

// Initialize database and run migrations
export async function initializeDatabase() {
  try {
    // Test connection
    await pool.query("SELECT NOW()");
    console.log("🔗 Database connection established successfully");

    // Run migrations
    await runMigrations();

    return db;
  } catch (error) {
    console.error("Database initialization failed:", error);
    throw error;
  }
}

// Auto-initialize if not in test environment
if (process.env.NODE_ENV !== "test") {
  initializeDatabase().catch((error) => {
    console.error("Fatal database error:", error);
    process.exit(1);
  });
}

// Export pool for direct access if needed
export { pool };

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("Closing database pool...");
  await pool.end();
  process.exit(0);
});

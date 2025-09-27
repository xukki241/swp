import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import pg from "pg";

import { env as environment } from "../config/env.js";

import * as schema from "./schema/index.js";

const { Pool } = pg;

// Create connection pool using DATABASE_URL or individual config values
const pool = new Pool({
  connectionString: environment.database.url,
  ssl: environment.database.ssl,
  max: environment.database.poolSize,
  idleTimeoutMillis: environment.database.idleTimeout,
  connectionTimeoutMillis: environment.database.connectionTimeout,
});

// Create drizzle instance
const db = drizzle(pool, { schema });

// Auto-migrate on startup
async function runMigrations() {
  try {
    console.log("Running database migrations...");
    await migrate(db, { migrationsFolder: environment.migrations.folder });
    console.log("Database migrations completed successfully");
  } catch (error) {
    console.error("Database migration failed:", error);
    throw error;
  }
}

// Initialize database and run migrations
async function initializeDatabase() {
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
  initializeDatabase().catch(error => {
    console.error("Fatal database error:", error);
    throw new Error(`Database initialization failed: ${error.message}`);
  });
}

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Closing database pool...");
  await pool.end();
  throw new Error("Application terminated");
});

process.on("SIGTERM", async () => {
  console.log("Closing database pool...");
  await pool.end();
  throw new Error("Application terminated");
});

export { db, pool, initializeDatabase };

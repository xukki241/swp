import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

import config from "../config/environment.js";
import logger from "../utils/logger.js";

/**
 * Run database migrations
 * This function applies all pending migrations to the database
 */
export async function runMigrations() {
  if (!config.allowAutoMigration) {
    logger.info("Database auto-migration is disabled. Skipping migrations.");
    return;
  }

  const pool = new Pool({
    connectionString: config.databaseUrl,
  });

  const db = drizzle(pool);

  try {
    logger.info("Starting database migrations...");

    await migrate(db, {
      migrationsFolder: "./src/db/migrations",
    });

    logger.info("✓ Database migrations completed successfully");
  } catch (error) {
    logger.error("✗ Database migration failed:", error);
    throw error;
  } finally {
    await pool.end();
  }
}

export default runMigrations;

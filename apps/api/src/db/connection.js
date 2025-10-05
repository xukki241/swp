import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

import config from "../config/environment.js";
import logger from "../utils/logger.js";

import * as schema from "./schema/index.js";

export const pool = new Pool({
  connectionString: config.databaseUrl,

  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

export const db = drizzle(pool, { schema });

export const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query("SELECT NOW()");
    client.release();
    logger.info("Database connection successful");
    return true;
  } catch (error) {
    logger.error("Database connection failed:", error.message);
    return false;
  }
};

export async function closeConnection() {
  await pool.end();
}

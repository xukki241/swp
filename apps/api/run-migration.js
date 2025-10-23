import fs from "fs";
import path from "path";
import pg from "pg";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read DATABASE_URL from .env file
const envPath = path.join(__dirname, ".env");
let databaseUrl = "postgresql://postgres:postgres@localhost:5432/pharmaflow";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/DATABASE_URL=(.+)/);
  if (match) {
    databaseUrl = match[1].trim();
  }
}

console.log("Connecting to database...");

const client = new pg.Client({ connectionString: databaseUrl });

try {
  await client.connect();
  console.log("Connected successfully!");

  // Run the migration
  console.log("\nRunning migration: Fix files.blob column type...");

  const migrationSQL = `
    -- Check if blob column is text type
    DO $$
    BEGIN
      IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'files' 
          AND column_name = 'blob' 
          AND data_type = 'text'
      ) THEN
        -- Drop any existing data (since text can't convert to bytea directly)
        DELETE FROM files WHERE blob IS NOT NULL;
        
        -- Alter column type
        ALTER TABLE files ALTER COLUMN blob TYPE bytea USING NULL;
        
        RAISE NOTICE 'Column files.blob type changed from text to bytea';
      ELSE
        RAISE NOTICE 'Column files.blob is already bytea type';
      END IF;
    END $$;
  `;

  await client.query(migrationSQL);
  console.log("✅ Migration completed successfully!");

  // Verify the change
  const result = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'files' AND column_name = 'blob'
  `);

  console.log("\nCurrent schema:");
  console.table(result.rows);
} catch (error) {
  console.error("❌ Migration failed:", error.message);
  process.exit(1);
} finally {
  await client.end();
}

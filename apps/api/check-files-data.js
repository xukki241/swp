import pg from "pg";

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/pharmaflow",
});

await client.connect();

// Check if there's any data in the files table
const countResult = await client.query("SELECT COUNT(*) FROM files");
console.log(`Files table has ${countResult.rows[0].count} rows`);

// If there's data, we might need to handle it differently
if (parseInt(countResult.rows[0].count) > 0) {
  console.log(
    "Warning: Files table has data. Migration might fail if data is not valid."
  );
  const sample = await client.query("SELECT id, filename FROM files LIMIT 5");
  console.table(sample.rows);
}

await client.end();

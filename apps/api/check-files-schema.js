import pg from "pg";

const client = new pg.Client({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:123@localhost:5432/pharmaflow",
});

await client.connect();

const result = await client.query(`
  SELECT column_name, data_type, character_maximum_length 
  FROM information_schema.columns 
  WHERE table_name = 'files' 
  ORDER BY ordinal_position
`);

console.log("Files table schema:");
console.table(result.rows);

await client.end();

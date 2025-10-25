# Apply Full-Text Search Migration

## Overview

The FTS migration now runs **automatically when the application starts**. The server will:

1. Test database connection
2. Run all pending migrations (including FTS migration 0004)
3. Start the API server

If migrations fail, the server will not start.

## Prerequisites

- PostgreSQL database running (local Docker or Azure)
- Database connection string in `.env` file

## ✅ Automatic Migration (Recommended)

Simply start the application and migrations will run automatically:

```bash
cd apps/api
npm start

# Or for development with auto-reload
npm run dev
```

**Server logs will show:**

```
[info] Database connection successful
[info] Starting database migrations...
[info] ✓ Database migrations completed successfully
[info] Application started successfully
```

**Migration 0004 includes:**

- PostgreSQL extensions (pg_trgm, unaccent)
- search_vector tsvector columns on 11 tables
- GIN indexes for FTS performance
- Automatic trigger functions
- Backfill of existing data

## Manual Migration Options

If you need to run migrations manually (e.g., in CI/CD or troubleshooting):

### Option 1: Using Drizzle Kit

```bash
cd apps/api

# Apply all pending migrations
npm run db:migrate

# Or push schema directly
npm run db:push
```

### Option 2: Local Docker Database

1. **Start Docker database:**

   ```bash
   docker-compose up -d db
   ```

2. **Create `.env` file in `apps/api/`** (if not exists):

   ```bash
   cp apps/api/.env.example apps/api/.env
   ```

3. **Update DATABASE_URL in `.env`:**

   ```
   DATABASE_URL=postgresql://pharmaflow:pharmaflow_password@localhost:5432/pharmaflow_db
   ```

4. **Start the app** (migrations run automatically):
   ```bash
   cd apps/api
   npm start
   ```

### Option 3: Azure Database

1. **Ensure VPN/network access to Azure database**

2. **Verify DATABASE_URL in `.env`:**

   ```
   DATABASE_URL=postgresql://username:password@your-server.postgres.database.azure.com:5432/dbname?ssl=true
   ```

3. **Start the app** (migrations run automatically):
   ```bash
   cd apps/api
   npm start
   ```

### Option 4: Direct SQL Execution

If you prefer to run migrations using SQL directly:

```bash
# Using psql
psql "$DATABASE_URL" -f apps/api/src/db/migrations/0004_cold_emma_frost.sql

# Using Docker exec
docker exec -i pharmaflow-db psql -U pharmaflow -d pharmaflow_db < apps/api/src/db/migrations/0004_cold_emma_frost.sql
```

## Verification

After migration (automatic or manual), verify it worked:

### Check Extensions

```sql
-- Check if extensions are installed
SELECT extname, extversion FROM pg_extension
WHERE extname IN ('pg_trgm', 'unaccent');
```

### Check Columns and Indexes

```sql
-- Check if search_vector column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'search_vector';

-- Check if GIN index exists
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users' AND indexname = 'users_search_vector_idx';

-- Check if trigger exists
SELECT trigger_name, event_manipulation
FROM information_schema.triggers
WHERE trigger_name = 'users_search_vector_trigger';
```

### Test Search Functionality

```sql
-- Test FTS query
SELECT name, email, ts_rank(search_vector, to_tsquery('english', 'admin:*')) as rank
FROM users
WHERE search_vector @@ to_tsquery('english', 'admin:*')
ORDER BY rank DESC
LIMIT 5;

-- Check if data is populated
SELECT name, search_vector IS NOT NULL as has_fts
FROM users
LIMIT 5;
```

## Test API Endpoints

Once migration is complete and API is running:

```bash
# Set your auth token
TOKEN="your_jwt_token_here"

# Get available entity types
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3000/api/search/entities

# Global search
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search?q=test&limit=10"

# Search medications
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/medications?q=aspirin"

# Get autocomplete suggestions
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/suggestions/users?q=john&limit=5"

# Unified search (all results sorted by rank)
curl -H "Authorization: Bearer $TOKEN" \
  "http://localhost:3000/api/search/unified?q=john&globalLimit=20"
```

## Troubleshooting

### Migration Failed on Startup

**Error:** `Failed to run migrations. Server will not start.`

**Solution:**

1. Check database connection: `psql "$DATABASE_URL" -c "SELECT 1;"`
2. Check migration file exists: `ls apps/api/src/db/migrations/0004_cold_emma_frost.sql`
3. Check for conflicting migrations in the database
4. Review error logs in `apps/api/logs/`

### Extension Installation Failed

**Error:** `extension "pg_trgm" does not exist`

**Solution:**

```sql
-- Connect as superuser
CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS unaccent;
```

For Azure PostgreSQL:

- Extensions may require admin privileges
- Check Azure portal for extension management

### Connection Timeout

**Problem:** Cannot connect to database

**Solution:**

- Check if database is running: `docker ps` or Azure portal
- Verify network connectivity
- Check DATABASE_URL format in .env file
- For Azure: ensure firewall rules allow your IP

### Search Not Working

**Problem:** Search returns no results

**Solution:**

1. Verify triggers are created:

   ```sql
   \d+ users  -- in psql
   ```

2. Check if search_vector is populated:

   ```sql
   SELECT search_vector FROM users LIMIT 1;
   ```

3. Manually trigger update:
   ```sql
   UPDATE users SET id = id;
   ```

### Skip Auto-Migration in Tests

The auto-migration is disabled when `NODE_ENV=test`. For manual control:

```javascript
// In test setup
import { runMigrations } from "./src/db/migrate.js";

beforeAll(async () => {
  await runMigrations();
});
```

## Rollback (If Needed)

To rollback the FTS migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS users_search_vector_trigger ON users;
DROP TRIGGER IF EXISTS customers_search_vector_trigger ON customers;
DROP TRIGGER IF EXISTS suppliers_search_vector_trigger ON suppliers;
DROP TRIGGER IF EXISTS medications_search_vector_trigger ON medications;
DROP TRIGGER IF EXISTS medication_variants_search_vector_trigger ON medication_variants;
DROP TRIGGER IF EXISTS inventory_search_vector_trigger ON inventory;
DROP TRIGGER IF EXISTS purchase_orders_search_vector_trigger ON purchase_orders;
DROP TRIGGER IF EXISTS sales_orders_search_vector_trigger ON sales_orders;
DROP TRIGGER IF EXISTS warehouse_zones_search_vector_trigger ON warehouse_zones;
DROP TRIGGER IF EXISTS warehouse_racks_search_vector_trigger ON warehouse_racks;
DROP TRIGGER IF EXISTS warehouse_bins_search_vector_trigger ON warehouse_bins;

-- Drop functions
DROP FUNCTION IF EXISTS users_search_vector_update();
DROP FUNCTION IF EXISTS customers_search_vector_update();
DROP FUNCTION IF EXISTS suppliers_search_vector_update();
DROP FUNCTION IF EXISTS medications_search_vector_update();
DROP FUNCTION IF EXISTS medication_variants_search_vector_update();
DROP FUNCTION IF EXISTS inventory_search_vector_update();
DROP FUNCTION IF EXISTS purchase_orders_search_vector_update();
DROP FUNCTION IF EXISTS sales_orders_search_vector_update();
DROP FUNCTION IF EXISTS warehouse_zones_search_vector_update();
DROP FUNCTION IF EXISTS warehouse_racks_search_vector_update();
DROP FUNCTION IF EXISTS warehouse_bins_search_vector_update();

-- Drop indexes
DROP INDEX IF EXISTS users_search_vector_idx;
DROP INDEX IF EXISTS customers_search_vector_idx;
DROP INDEX IF EXISTS suppliers_search_vector_idx;
DROP INDEX IF EXISTS medications_search_vector_idx;
DROP INDEX IF EXISTS medication_variants_search_vector_idx;
DROP INDEX IF EXISTS inventory_search_vector_idx;
DROP INDEX IF EXISTS purchase_orders_search_vector_idx;
DROP INDEX IF EXISTS sales_orders_search_vector_idx;
DROP INDEX IF EXISTS warehouse_zones_search_vector_idx;
DROP INDEX IF EXISTS warehouse_racks_search_vector_idx;
DROP INDEX IF EXISTS warehouse_bins_search_vector_idx;

-- Drop columns
ALTER TABLE users DROP COLUMN IF EXISTS search_vector;
ALTER TABLE customers DROP COLUMN IF EXISTS search_vector;
ALTER TABLE suppliers DROP COLUMN IF EXISTS search_vector;
ALTER TABLE medications DROP COLUMN IF EXISTS search_vector;
ALTER TABLE medication_variants DROP COLUMN IF EXISTS search_vector;
ALTER TABLE inventory DROP COLUMN IF EXISTS search_vector;
ALTER TABLE purchase_orders DROP COLUMN IF EXISTS search_vector;
ALTER TABLE sales_orders DROP COLUMN IF EXISTS search_vector;
ALTER TABLE warehouse_zones DROP COLUMN IF EXISTS search_vector;
ALTER TABLE warehouse_racks DROP COLUMN IF EXISTS search_vector;
ALTER TABLE warehouse_bins DROP COLUMN IF EXISTS search_vector;
```

## Production Deployment

### Docker Deployment

Migrations run automatically in the container on startup. Ensure:

1. **DATABASE_URL is set** in environment variables
2. **Network access** to database
3. **Sufficient permissions** to create extensions and tables

```yaml
# docker-compose.yml
services:
  api:
    environment:
      - DATABASE_URL=postgresql://user:pass@db:5432/dbname
      - NODE_ENV=production
```

### CI/CD Pipeline

```yaml
# Example GitLab CI
deploy:
  script:
    - docker build -t pharmaflow-api .
    - docker run --rm pharmaflow-api npm run db:migrate
    - docker deploy pharmaflow-api
```

Or let the app handle migrations on startup (recommended for simplicity).

## Summary

- ✅ **Automatic migrations** on app startup (recommended)
- ✅ **Manual migrations** via `npm run db:migrate` or direct SQL
- ✅ **Extensions included**: pg_trgm, unaccent for fuzzy search
- ✅ **Auto-backfill** of existing data
- ✅ **Production-ready** with error handling and logging

For more details on using the search API, see [FULL_TEXT_SEARCH_GUIDE.md](apps/api/FULL_TEXT_SEARCH_GUIDE.md)

# Apply Full-Text Search Migration

## Prerequisites
- PostgreSQL database running (local Docker or Azure)
- Database connection string in `.env` file

## Option 1: Local Docker Database

1. **Start Docker database:**
   ```bash
   docker-compose up -d db
   ```

2. **Create `.env` file in `apps/api/`** (if not exists):
   ```bash
   # Copy from example
   cp apps/api/.env.example apps/api/.env
   ```

3. **Update DATABASE_URL in `.env`:**
   ```
   DATABASE_URL=postgresql://pharmaflow:pharmaflow_password@localhost:5432/pharmaflow_db
   ```

4. **Apply schema changes:**
   ```bash
   cd apps/api
   npm run db:push
   ```

5. **Run custom migration SQL:**
   ```bash
   # Option A: Using psql directly
   psql postgresql://pharmaflow:pharmaflow_password@localhost:5432/pharmaflow_db -f src/db/migrations/0002_add_full_text_search.sql
   
   # Option B: Using Docker exec
   docker exec -i pharmaflow-db psql -U pharmaflow -d pharmaflow_db < src/db/migrations/0002_add_full_text_search.sql
   ```

## Option 2: Azure Database

1. **Ensure VPN/network access to Azure database**

2. **Verify DATABASE_URL in `.env`:**
   ```
   DATABASE_URL=postgresql://username:password@your-server.postgres.database.azure.com:5432/dbname?ssl=true
   ```

3. **Apply schema changes:**
   ```bash
   cd apps/api
   npm run db:push
   ```

4. **Run custom migration SQL:**
   ```bash
   psql "$DATABASE_URL" -f src/db/migrations/0002_add_full_text_search.sql
   ```

## Option 3: Manual SQL Execution

If you have database access through a GUI tool (pgAdmin, DBeaver, etc.):

1. Open `apps/api/src/db/migrations/0002_add_full_text_search.sql`
2. Execute the entire SQL script in your database

## Verification

After applying the migration, verify it worked:

```sql
-- Check if search_vector column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name = 'search_vector';

-- Check if GIN index exists
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'users' AND indexname = 'users_search_vector_idx';

-- Check if trigger exists
SELECT trigger_name 
FROM information_schema.triggers 
WHERE trigger_name = 'users_search_vector_trigger';

-- Test search functionality
SELECT name, email, ts_rank(search_vector, to_tsquery('english', 'admin:*')) as rank
FROM users
WHERE search_vector @@ to_tsquery('english', 'admin:*')
ORDER BY rank DESC
LIMIT 5;
```

## Test API Endpoints

Once migration is complete and API is running:

```bash
# Get available entity types
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3000/api/search/entities

# Global search
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/search?q=test"

# Search medications
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/search/medications?q=aspirin"

# Get suggestions
curl -H "Authorization: Bearer YOUR_TOKEN" "http://localhost:3000/api/search/suggestions/users?q=john"
```

## Troubleshooting

### Connection Timeout
- Check if database is running: `docker ps` or check Azure portal
- Verify network connectivity
- Check DATABASE_URL in .env file

### Migration Errors
- Ensure no conflicting columns exist
- Check PostgreSQL version (requires 9.6+)
- Review error logs for specific issues

### Search Not Working
- Verify triggers are created: `\d+ users` in psql
- Check if search_vector is populated: `SELECT search_vector FROM users LIMIT 1;`
- Manually trigger update: `UPDATE users SET id = id;`

## Rollback (If Needed)

To rollback the migration:

```sql
-- Drop triggers
DROP TRIGGER IF EXISTS users_search_vector_trigger ON users;
DROP TRIGGER IF EXISTS customers_search_vector_trigger ON customers;
-- ... (repeat for all tables)

-- Drop functions
DROP FUNCTION IF EXISTS users_search_vector_update();
DROP FUNCTION IF EXISTS customers_search_vector_update();
-- ... (repeat for all tables)

-- Drop indexes
DROP INDEX IF EXISTS users_search_vector_idx;
DROP INDEX IF EXISTS customers_search_vector_idx;
-- ... (repeat for all tables)

-- Drop columns
ALTER TABLE users DROP COLUMN IF EXISTS search_vector;
ALTER TABLE customers DROP COLUMN IF EXISTS search_vector;
-- ... (repeat for all tables)
```


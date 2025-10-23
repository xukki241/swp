# Full-Text Search (FTS) Implementation Guide

## Overview

This project implements PostgreSQL Full-Text Search (FTS) across all major database tables using Drizzle ORM. The implementation provides powerful search capabilities with relevance ranking, autocomplete suggestions, and unified cross-entity search.

## Architecture

### Components

1. **Database Layer**
   - Custom `tsvector` type in Drizzle schema
   - `search_vector` columns on all searchable tables
   - GIN indexes for optimal search performance
   - Automatic triggers to maintain search vectors

2. **Service Layer**
   - `searchService.js` - Core search logic with configurable entity types
   - Support for single-entity and multi-entity searches
   - Relevance ranking using PostgreSQL's `ts_rank`

3. **Controller Layer**
   - `searchController.js` - HTTP request handlers
   - Input validation and error handling
   - Response formatting

4. **Routes Layer**
   - `searchRoutes.js` - RESTful API endpoints
   - Authentication middleware
   - Route documentation

## Database Schema

### Search Vector Column

Each searchable table includes:

```javascript
searchVector: searchVector(); // tsvector column
```

With a GIN index:

```javascript
index("table_name_search_vector_idx").using("gin", table.searchVector);
```

### Searchable Tables

- `users` - name, email, phone, address, role, status
- `customers` - name, email, phone, address
- `suppliers` - name, contact_name, email, phone, address, status
- `medications` - name, brand, description, status
- `medication_variants` - name, sku, barcode, unit
- `inventory` - batch_number, manufacture_date, expiry_date
- `purchase_orders` - id, status, order_date, expected_date
- `sales_orders` - id, status, payment_method, order_date
- `warehouse_zones` - name, description
- `warehouse_racks` - name, description
- `warehouse_bins` - name, description

### Weight System

Search vectors use PostgreSQL's weight system (A-D) for relevance:

- **Weight A** (Highest): Primary identifiers (name, SKU, barcode)
- **Weight B**: Secondary identifiers (email, brand, contact info)
- **Weight C**: Supporting information (phone, status, dates)
- **Weight D** (Lowest): Descriptive text (description, address)

## Migration

### Running the Migration

Apply the FTS migration:

```bash
# Using drizzle-kit
npx drizzle-kit push:pg

# Or run SQL directly
psql -d your_database -f apps/api/src/db/migrations/0002_add_full_text_search.sql
```

### What the Migration Does

1. Adds `search_vector` column to each table
2. Creates GIN index on each search vector
3. Creates trigger function for automatic updates
4. Attaches triggers to tables
5. Backfills existing data

### Automatic Updates

Triggers automatically update search vectors on INSERT or UPDATE operations. No manual maintenance required.

## API Endpoints

All search endpoints require authentication.

### 1. Global Search

Search across all or specified entity types with results grouped by entity.

```http
GET /api/search?q=query&entities=users,medications&limit=10&minRank=0.01
```

**Query Parameters:**

- `q` (required) - Search query string
- `entities` (optional) - Comma-separated list of entity types
- `limit` (optional) - Results per entity type (default: 10)
- `minRank` (optional) - Minimum relevance score (default: 0.01)

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "query": "aspirin",
    "totalResults": 15,
    "results": {
      "medications": [
        {
          "id": "uuid",
          "name": "Aspirin",
          "brand": "Bayer",
          "rank": 0.9876,
          "entityType": "medications"
        }
      ],
      "medicationVariants": [...]
    }
  }
}
```

### 2. Unified Search

Search across all entities with results sorted by relevance (not grouped).

```http
GET /api/search/unified?q=query&globalLimit=20
```

**Query Parameters:**

- `q` (required) - Search query string
- `entities` (optional) - Comma-separated list of entity types
- `limit` (optional) - Results per entity type (default: 10)
- `globalLimit` (optional) - Total results to return (default: 50)
- `minRank` (optional) - Minimum relevance score (default: 0.01)

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "query": "john",
    "totalResults": 8,
    "results": [
      {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "rank": 0.9876,
        "entityType": "users"
      },
      {
        "id": "uuid",
        "name": "Johnson Supply Co.",
        "rank": 0.8765,
        "entityType": "suppliers"
      }
    ]
  }
}
```

### 3. Entity-Specific Search

Search within a specific entity type.

```http
GET /api/search/medications?q=aspirin&limit=50
```

**Path Parameters:**

- `entityType` - Entity type to search (users, customers, medications, etc.)

**Query Parameters:**

- `q` (required) - Search query string
- `limit` (optional) - Maximum results (default: 50)
- `minRank` (optional) - Minimum relevance score (default: 0.01)

**Response:**

```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "query": "aspirin",
    "entityType": "medications",
    "totalResults": 5,
    "results": [
      {
        "id": "uuid",
        "name": "Aspirin",
        "brand": "Bayer",
        "description": "Pain reliever",
        "rank": 0.9876,
        "entityType": "medications"
      }
    ]
  }
}
```

### 4. Search Suggestions (Autocomplete)

Get quick suggestions for autocomplete functionality.

```http
GET /api/search/suggestions/medications?q=asp&limit=5
```

**Path Parameters:**

- `entityType` - Entity type for suggestions

**Query Parameters:**

- `q` (required) - Search query string
- `limit` (optional) - Number of suggestions (default: 5)

**Response:**

```json
{
  "success": true,
  "message": "Suggestions retrieved successfully",
  "data": {
    "query": "asp",
    "entityType": "medications",
    "suggestions": [
      {
        "id": "uuid",
        "name": "Aspirin",
        "rank": 0.9876
      }
    ]
  }
}
```

### 5. Get Entity Types

Get list of all searchable entity types.

```http
GET /api/search/entities
```

**Response:**

```json
{
  "success": true,
  "message": "Entity types retrieved successfully",
  "data": {
    "entityTypes": [
      "users",
      "customers",
      "suppliers",
      "medications",
      "medicationVariants",
      "inventory",
      "purchaseOrders",
      "salesOrders",
      "warehouseZones",
      "warehouseRacks",
      "warehouseBins"
    ],
    "count": 11
  }
}
```

## Usage Examples

### Frontend Integration

#### Basic Search

```javascript
// Search across all entities
const searchResults = await fetch("/api/search?q=aspirin", {
  headers: { Authorization: `Bearer ${token}` },
});

const data = await searchResults.json();
console.log(data.data.results);
```

#### Autocomplete

```javascript
// Get suggestions as user types
const getSuggestions = async (query, entityType) => {
  const response = await fetch(
    `/api/search/suggestions/${entityType}?q=${encodeURIComponent(query)}&limit=5`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.json();
};

// Usage in input handler
const handleInputChange = debounce(async (value) => {
  if (value.length >= 2) {
    const suggestions = await getSuggestions(value, "medications");
    displaySuggestions(suggestions.data.suggestions);
  }
}, 300);
```

#### Filtered Search

```javascript
// Search only specific entity types
const response = await fetch(
  "/api/search?q=john&entities=users,customers&limit=20",
  { headers: { Authorization: `Bearer ${token}` } }
);
```

### Backend Integration

```javascript
import { globalSearch, searchByEntity } from "./services/searchService.js";

// Search from another service
const results = await searchByEntity("medications", "aspirin", {
  limit: 10,
  minRank: 0.1,
});

// Multi-entity search
const allResults = await globalSearch("john doe", {
  entities: ["users", "customers"],
  limit: 5,
});
```

## Performance Considerations

### Indexing

- GIN indexes provide fast FTS queries
- Index size increases with data volume
- Automatic updates via triggers (minimal overhead)

### Query Optimization

1. **Use specific entity types** when possible
2. **Set reasonable limits** (default: 10-50)
3. **Filter by minRank** to exclude low-relevance results
4. **Use autocomplete** for user input (limit: 5)

### Best Practices

```javascript
// ✅ Good - Specific search with reasonable limit
await searchByEntity("medications", query, { limit: 20 });

// ✅ Good - Filtered global search
await globalSearch(query, { entities: ["users", "customers"], limit: 10 });

// ❌ Avoid - Unrestricted search
await globalSearch(query, { limit: 1000 });

// ❌ Avoid - Very low minRank
await searchByEntity("users", query, { minRank: 0.0001, limit: 500 });
```

## Search Query Syntax

### Basic Search

```
aspirin          # Single word
john doe         # Multiple words (AND)
```

### Special Characters

The service automatically converts queries to PostgreSQL tsquery format:

- Spaces → AND operator
- Words get prefix matching (word:\*)

### Examples

| User Input      | PostgreSQL tsquery    | Description             |
| --------------- | --------------------- | ----------------------- |
| `aspirin`       | `aspirin:*`           | Prefix match            |
| `john doe`      | `john:* & doe:*`      | Both words must match   |
| `bayer aspirin` | `bayer:* & aspirin:*` | Both words in any order |

## Extending Search

### Adding New Searchable Tables

1. **Update Schema** (e.g., `newTable.js`):

```javascript
import { index, pgTable } from "drizzle-orm/pg-core";
import { identityPrimaryKey, name, searchVector } from "./common.js";

export const newTable = pgTable(
  "new_table",
  {
    id: identityPrimaryKey(),
    name: name(),
    searchVector: searchVector(),
  },
  (table) => [
    index("new_table_search_vector_idx").using("gin", table.searchVector),
  ]
);
```

2. **Create Migration SQL**:

```sql
ALTER TABLE new_table ADD COLUMN search_vector tsvector;

CREATE INDEX new_table_search_vector_idx ON new_table USING GIN (search_vector);

CREATE FUNCTION new_table_search_vector_update() RETURNS trigger AS $$
BEGIN
  NEW.search_vector := setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A');
  RETURN NEW;
END
$$ LANGUAGE plpgsql;

CREATE TRIGGER new_table_search_vector_trigger
  BEFORE INSERT OR UPDATE ON new_table
  FOR EACH ROW EXECUTE FUNCTION new_table_search_vector_update();
```

3. **Add to searchService.js**:

```javascript
import { newTable } from "../db/schema/index.js";

const SEARCH_ENTITIES = {
  // ... existing entities
  newTable: {
    table: newTable,
    selectFields: {
      id: newTable.id,
      name: newTable.name,
    },
    rankField: newTable.searchVector,
  },
};
```

### Customizing Search Weights

Adjust weights in migration SQL:

```sql
NEW.search_vector :=
  setweight(to_tsvector('english', COALESCE(NEW.name, '')), 'A') ||      -- Most important
  setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') || -- Important
  setweight(to_tsvector('english', COALESCE(NEW.notes, '')), 'C');       -- Less important
```

## Troubleshooting

### Search Returns No Results

1. **Check if migration ran**: `SELECT search_vector FROM users LIMIT 1;`
2. **Verify GIN index**: `\d users` in psql
3. **Check search query**: Ensure it's not empty
4. **Try lower minRank**: Set `minRank=0.001`

### Slow Search Performance

1. **Verify indexes exist**: Check GIN indexes are created
2. **Reduce result limit**: Use pagination
3. **Filter entity types**: Search specific entities
4. **Check database stats**: Run `ANALYZE` on tables

### Trigger Not Firing

1. **Verify trigger exists**: `\d+ table_name` in psql
2. **Check function**: `\df table_search_vector_update`
3. **Test manually**: `UPDATE table SET search_vector = ...`

### Search Vector Not Updated

Manually refresh:

```sql
UPDATE users SET id = id;  -- Triggers search_vector update
```

## Testing

### Manual Testing

```bash
# Test global search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/search?q=test&limit=5"

# Test entity search
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/search/medications?q=aspirin"

# Test suggestions
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/search/suggestions/users?q=john&limit=5"

# Get entity types
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:3000/api/search/entities"
```

### Unit Testing

Create tests in `tests/unit/searchService.test.js`:

```javascript
import { describe, it, expect } from "vitest";
import {
  globalSearch,
  searchByEntity,
} from "../../src/services/searchService.js";

describe("Search Service", () => {
  it("should search medications", async () => {
    const results = await searchByEntity("medications", "aspirin");
    expect(results).toBeInstanceOf(Array);
  });

  it("should return global search results", async () => {
    const results = await globalSearch("test", { limit: 5 });
    expect(results).toHaveProperty("medications");
  });
});
```

## Security

- All search endpoints require authentication
- Input is sanitized for SQL injection (Drizzle ORM parameterization)
- Rate limiting recommended for production
- Consider implementing per-user search quotas

## Future Enhancements

1. **Fuzzy Matching** - Handle typos and misspellings
2. **Search Analytics** - Track popular queries
3. **Search History** - Store user search history
4. **Advanced Filters** - Date ranges, price ranges, etc.
5. **Highlighting** - Highlight matched terms in results
6. **Faceted Search** - Filter results by categories
7. **Multi-language** - Support languages beyond English

## References

- [PostgreSQL Full-Text Search Documentation](https://www.postgresql.org/docs/current/textsearch.html)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
- [GIN Indexes](https://www.postgresql.org/docs/current/gin.html)
- [ts_rank Function](https://www.postgresql.org/docs/current/textsearch-controls.html#TEXTSEARCH-RANKING)

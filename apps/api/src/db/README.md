# Database Layer

This directory contains all database-related code including schemas, migrations, and seeding
utilities.

## Overview

- **ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL
- **Migrations**: Automatic migration generation and application
- **Seeding**: Database seeding for development and testing

## Directory Structure

```
db/
├── schema/             # Database schema definitions
│   ├── *.js            # Schema files
│   └── index.js        # Schema exports
├── migrations/         # Generated SQL migrations
├── connection.js       # Database connection setup
└── seed.js            # Database seeding script
```

## Schema Development

### Creating a New Schema

1. **Create schema file** in `src/db/schema/`

```javascript
// src/db/schema/products.js
import { pgTable, serial, varchar, decimal, timestamp, integer } from "drizzle-orm/pg-core";
import { suppliers } from "./suppliers.js";

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: varchar("description", { length: 1000 }),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  supplierId: integer("supplier_id").references(() => suppliers.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

2. **Export from index.js**

```javascript
// src/db/schema/index.js
export * from "./products.js";
```

3. **Generate migration**

```bash
pnpm db:generate
```

4. **Apply migration**

```bash
pnpm db:migrate
```

### Schema Best Practices

- Use descriptive table and column names
- Include created_at and updated_at timestamps
- Use proper data types (varchar with limits, decimal for money, etc.)
- Define foreign key relationships
- Use enums for status fields
- Add indexes for frequently queried columns

### Common Column Patterns

```javascript
// Standard ID column
id: serial("id").primaryKey();

// Timestamps
createdAt: timestamp("created_at").defaultNow();
updatedAt: timestamp("updated_at").defaultNow();

// Status enum
export const statusEnum = pgEnum("status", ["active", "inactive", "pending"]);
status: statusEnum("status").default("active");

// Foreign key reference
userId: integer("user_id").references(() => users.id);

// Money/decimal fields
price: decimal("price", { precision: 10, scale: 2 });

// Text fields with limits
name: varchar("name", { length: 255 }).notNull();
description: varchar("description", { length: 1000 });
```

## Migrations

### Available Commands

```bash
# Generate new migration from schema changes
pnpm db:generate

# Apply pending migrations
pnpm db:migrate

# Push schema directly (development only - skips migrations)
pnpm db:push

# Open database studio for inspection
pnpm db:studio

# Drop database (destructive - use with caution)
pnpm db:drop
```

### Migration Workflow

1. **Modify schema files** in `src/db/schema/`
2. **Generate migration**: `pnpm db:generate`
3. **Review generated SQL** in `src/db/migrations/`
4. **Apply migration**: `pnpm db:migrate`

### Migration Best Practices

- Always review generated SQL before applying
- Test migrations on a copy of production data
- Use transactions for complex migrations
- Never edit applied migrations
- Keep migrations small and focused

## Database Connection

The connection is configured in `connection.js` using environment variables:

```javascript
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.js";

const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });
```

### Environment Variables

Required in `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/pharmacy_db
```

## Database Seeding

### Running Seeds

```bash
# Seed database with initial data
pnpm db:seed
```

### Adding Seed Data

Edit `seed.js` to add initial data:

```javascript
// Example seed data
await db.insert(roles).values([
  { name: "Admin", description: "System administrator" },
  { name: "Manager", description: "Pharmacy manager" },
  { name: "Staff", description: "Pharmacy staff" },
]);
```

### Seed Data Guidelines

- Use realistic but fake data
- Include all required relationships
- Consider using libraries like Faker.js for generating data
- Ensure seeds are idempotent (can be run multiple times)

## Querying Examples

### Basic Queries

```javascript
import { db } from "../db/connection.js";
import { users, roles } from "../db/schema/index.js";

// Find all active users
const activeUsers = await db.select().from(users).where(eq(users.status, "active"));

// Find user with role
const usersWithRoles = await db
  .select({
    id: users.id,
    name: users.name,
    roleName: roles.name,
  })
  .from(users)
  .leftJoin(roles, eq(users.roleId, roles.id));

// Insert new user
const [newUser] = await db
  .insert(users)
  .values({
    name: "John Doe",
    email: "john@example.com",
    roleId: 1,
  })
  .returning();
```

### Advanced Queries

```javascript
import { and, or, like, gte, count } from "drizzle-orm";

// Complex filtering
const results = await db
  .select()
  .from(users)
  .where(
    and(eq(users.status, "active"), or(like(users.name, "%john%"), like(users.email, "%john%")))
  );

// Pagination
const page = 1;
const limit = 10;
const offset = (page - 1) * limit;

const paginatedUsers = await db.select().from(users).limit(limit).offset(offset);

// Counting
const totalUsers = await db.select({ count: count() }).from(users);
```

## Troubleshooting

### Common Issues

**Connection Errors**

- Verify DATABASE_URL is correct
- Ensure PostgreSQL is running
- Check firewall and network settings

**Migration Errors**

- Review SQL syntax in generated migrations
- Check for constraint violations
- Ensure proper column types and constraints

**Schema Issues**

- Verify imports and exports
- Check for circular dependencies
- Ensure proper type definitions

### Debug Commands

```bash
# Check database connection
pnpm db:studio

# View migration status
# Check migrations table in database studio

# Reset database (development only)
pnpm db:drop && pnpm db:migrate && pnpm db:seed
```

## Performance Considerations

- Add indexes for frequently queried columns
- Use pagination for large result sets
- Consider database connection pooling for production
- Monitor query performance with EXPLAIN
- Use appropriate data types to minimize storage

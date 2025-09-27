# Services Layer

This directory contains the business logic layer of the application. Services handle data processing, business rules, and coordination between controllers and the database.

## Overview

- **Pattern**: Factory pattern for standardized CRUD operations
- **Responsibility**: Business logic, data validation, and database interactions
- **Architecture**: Service objects that encapsulate domain-specific operations
- **Hooks**: Before/after hooks for custom business logic

## Directory Structure

```
services/
├── common/
│   ├── factory.js        # CRUD service factory
│   └── index.js         # Common exports
├── users.service.js     # User-specific business logic
└── index.js            # Service exports
```

## CRUD Service Factory

The factory creates standardized services with full CRUD operations and utility methods using Drizzle ORM.

### Basic Usage

```javascript
// src/services/products.service.js
import { crudServiceFactory } from './common/factory.js';
import { products } from '../db/schema/index.js';

export const productsService = crudServiceFactory(products, {
  entityName: 'Product',
  searchableFields: ['name', 'description'],
  defaultOrderBy: 'name',
  defaultOrderDirection: 'asc'
});
```

### Advanced Configuration

```javascript
// src/services/users.service.js
import { crudServiceFactory } from './common/factory.js';
import { users } from '../db/schema/index.js';
import bcrypt from 'bcrypt';
import { emailService } from './email.service.js';

export const usersService = crudServiceFactory(users, {
  entityName: 'User',
  searchableFields: ['name', 'email', 'phone'],
  defaultOrderBy: 'createdAt',
  defaultOrderDirection: 'desc',
  
  // Hash password before creating user
  beforeCreate: async (data) => {
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return data;
  },
  
  // Send welcome email after user creation
  afterCreate: async (user, originalData) => {
    await emailService.sendWelcomeEmail(user.email, user.name);
  },
  
  // Prevent password updates through regular update
  beforeUpdate: async (id, data) => {
    delete data.password;
    return data;
  },
  
  // Check business rules before deletion
  beforeDelete: async (id) => {
    const user = await usersService.findById(id);
    if (user.role === 'admin') {
      const adminCount = await usersService.countRecords({ role: 'admin' });
      if (adminCount <= 1) {
        throw new Error('Cannot delete the last admin user');
      }
    }
  }
});

// Add custom methods to the service
usersService.findByEmail = async (email) => {
  return await usersService.findOne({ email });
};

usersService.updatePassword = async (userId, newPassword) => {
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  return await usersService.updateById(userId, { password: hashedPassword });
};

usersService.findByRole = async (roleId, options = {}) => {
  return await usersService.findMany({
    ...options,
    where: { roleId }
  });
};
```

## Available Service Methods

### CRUD Operations

| Method | Description | Parameters |
|--------|-------------|------------|
| `create(data)` | Create new record | `data` - Object with record data |
| `findById(id)` | Find record by ID | `id` - Record identifier |
| `findOne(conditions)` | Find single record by conditions | `conditions` - Where conditions object |
| `findMany(options)` | Find multiple records with pagination | `options` - Query options object |
| `updateById(id, data)` | Update record by ID | `id` - Record ID, `data` - Update data |
| `updateMany(conditions, data)` | Update multiple records | `conditions` - Where conditions, `data` - Update data |
| `deleteById(id)` | Delete record by ID | `id` - Record identifier |
| `deleteMany(conditions)` | Delete multiple records | `conditions` - Where conditions |

### Utility Operations

| Method | Description | Parameters |
|--------|-------------|------------|
| `countRecords(conditions)` | Count records matching conditions | `conditions` - Where conditions (optional) |
| `exists(conditions)` | Check if record exists | `conditions` - Where conditions object |

### Query Options for findMany

```javascript
const options = {
  where: {               // Filter conditions
    status: 'active',
    roleId: 2
  },
  search: 'john',        // Search term (searches in searchableFields)
  page: 1,               // Page number (1-based)
  limit: 20,             // Records per page
  orderBy: 'name',       // Field to sort by
  orderDirection: 'asc'  // Sort direction: 'asc' or 'desc'
};

const result = await usersService.findMany(options);
```

### Return Format for findMany

```javascript
{
  data: [                // Array of records
    { id: 1, name: 'John', ... },
    { id: 2, name: 'Jane', ... }
  ],
  pagination: {
    page: 1,             // Current page
    limit: 20,           // Records per page
    total: 150,          // Total record count
    totalPages: 8,       // Total pages
    hasNext: true,       // Has next page
    hasPrev: false       // Has previous page
  }
}
```

## Custom Service Methods

Add domain-specific methods to extend the factory-generated service:

```javascript
// src/services/orders.service.js
import { crudServiceFactory } from './common/factory.js';
import { orders, orderItems } from '../db/schema/index.js';
import { db } from '../db/connection.js';

export const ordersService = crudServiceFactory(orders, {
  entityName: 'Order',
  searchableFields: ['orderNumber', 'customerName'],
  defaultOrderBy: 'createdAt',
  defaultOrderDirection: 'desc'
});

// Custom methods for order-specific business logic
ordersService.findWithItems = async (orderId) => {
  const order = await db
    .select({
      id: orders.id,
      orderNumber: orders.orderNumber,
      customerName: orders.customerName,
      total: orders.total,
      status: orders.status,
      createdAt: orders.createdAt,
      items: sql`json_agg(${orderItems}.*)`
    })
    .from(orders)
    .leftJoin(orderItems, eq(orders.id, orderItems.orderId))
    .where(eq(orders.id, orderId))
    .groupBy(orders.id);
    
  return order[0] || null;
};

ordersService.updateStatus = async (orderId, status) => {
  // Add business logic for status transitions
  const order = await ordersService.findById(orderId);
  if (!order) {
    throw new Error('Order not found');
  }
  
  // Validate status transition
  const validTransitions = {
    'pending': ['confirmed', 'cancelled'],
    'confirmed': ['processing', 'cancelled'],
    'processing': ['shipped', 'cancelled'],
    'shipped': ['delivered'],
    'delivered': [],
    'cancelled': []
  };
  
  if (!validTransitions[order.status]?.includes(status)) {
    throw new Error(`Cannot transition from ${order.status} to ${status}`);
  }
  
  return await ordersService.updateById(orderId, { 
    status,
    updatedAt: new Date()
  });
};

ordersService.calculateTotal = async (orderId) => {
  const result = await db
    .select({
      total: sql`SUM(${orderItems.quantity} * ${orderItems.price})`
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));
    
  return result[0]?.total || 0;
};
```

## Service Hooks

Hooks allow you to inject custom business logic at specific points in CRUD operations:

### Available Hooks

- `beforeCreate(data)` - Modify data before creation
- `afterCreate(created, originalData)` - Execute logic after creation
- `beforeUpdate(id, data)` - Modify data before update
- `afterUpdate(updated, originalData)` - Execute logic after update
- `beforeDelete(id)` - Execute logic before deletion
- `afterDelete(deleted)` - Execute logic after deletion

### Hook Examples

```javascript
// Audit logging
afterCreate: async (record, originalData) => {
  await auditService.log({
    action: 'CREATE',
    table: 'users',
    recordId: record.id,
    data: originalData,
    timestamp: new Date()
  });
},

// Business rule validation
beforeDelete: async (id) => {
  const user = await usersService.findById(id);
  const activeOrders = await ordersService.countRecords({
    userId: id,
    status: ['pending', 'processing']
  });
  
  if (activeOrders > 0) {
    throw new Error('Cannot delete user with active orders');
  }
},

// Data enrichment
beforeCreate: async (data) => {
  // Generate unique identifier
  data.code = await generateUniqueCode();
  
  // Set default values
  data.createdAt = new Date();
  data.status = data.status || 'active';
  
  return data;
}
```

## Error Handling

Services should throw descriptive errors that controllers can handle appropriately:

```javascript
// Good error handling in custom methods
usersService.authenticate = async (email, password) => {
  try {
    const user = await usersService.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }
    
    if (user.status !== 'active') {
      throw new Error('Account is not active');
    }
    
    return user;
  } catch (error) {
    // Re-throw with context
    throw new Error(`Authentication failed: ${error.message}`);
  }
};
```

## Database Queries

### Basic Queries

```javascript
// Using the factory methods
const activeUsers = await usersService.findMany({
  where: { status: 'active' },
  orderBy: 'name',
  orderDirection: 'asc'
});

// Count records
const totalUsers = await usersService.countRecords();
const activeUserCount = await usersService.countRecords({ status: 'active' });

// Check existence
const emailExists = await usersService.exists({ email: 'user@example.com' });
```

### Advanced Queries

For complex queries that don't fit the factory pattern, use direct database access:

```javascript
import { db } from '../db/connection.js';
import { users, roles, orders } from '../db/schema/index.js';
import { eq, and, gte, count, desc } from 'drizzle-orm';

// Complex join query
usersService.getUserStats = async () => {
  return await db
    .select({
      userId: users.id,
      userName: users.name,
      roleName: roles.name,
      orderCount: count(orders.id),
      lastOrderDate: sql`MAX(${orders.createdAt})`
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(orders, eq(users.id, orders.userId))
    .groupBy(users.id, users.name, roles.name)
    .orderBy(desc(count(orders.id)));
};

// Aggregation query
usersService.getActiveUsersByRole = async () => {
  return await db
    .select({
      roleId: users.roleId,
      roleName: roles.name,
      userCount: count()
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .where(eq(users.status, 'active'))
    .groupBy(users.roleId, roles.name);
};
```

## Transaction Handling

For operations that require multiple database operations, use transactions:

```javascript
import { db } from '../db/connection.js';

ordersService.createOrderWithItems = async (orderData, items) => {
  return await db.transaction(async (tx) => {
    try {
      // Create the order
      const [order] = await tx
        .insert(orders)
        .values(orderData)
        .returning();
      
      // Create order items
      const orderItemsData = items.map(item => ({
        ...item,
        orderId: order.id
      }));
      
      const createdItems = await tx
        .insert(orderItems)
        .values(orderItemsData)
        .returning();
      
      // Update inventory
      for (const item of items) {
        await tx
          .update(inventory)
          .set({
            quantity: sql`${inventory.quantity} - ${item.quantity}`
          })
          .where(eq(inventory.productId, item.productId));
      }
      
      return {
        order,
        items: createdItems
      };
    } catch (error) {
      // Transaction will be automatically rolled back
      throw new Error(`Failed to create order: ${error.message}`);
    }
  });
};
```

## Testing Services

```javascript
// tests/unit/services/users.service.test.js
import { describe, test, expect, vi, beforeEach } from '@jest/globals';
import { usersService } from '../../../src/services/users.service.js';
import { db } from '../../../src/db/connection.js';

// Mock the database
vi.mock('../../../src/db/connection.js');

describe('Users Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('create', () => {
    test('should create user with hashed password', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      };
      
      const mockUser = {
        id: 1,
        ...userData,
        password: 'hashed_password'
      };
      
      db.insert.mockReturnValue({
        values: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([mockUser])
        })
      });
      
      const result = await usersService.create(userData);
      
      expect(result).toEqual(mockUser);
      expect(result.password).not.toBe(userData.password);
    });
  });
  
  describe('findByEmail', () => {
    test('should find user by email', async () => {
      const email = 'john@example.com';
      const mockUser = { id: 1, email, name: 'John' };
      
      db.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([mockUser])
        })
      });
      
      const result = await usersService.findByEmail(email);
      
      expect(result).toEqual(mockUser);
    });
  });
});
```

## Performance Considerations

1. **Indexing**: Ensure database indexes for frequently queried fields
2. **Pagination**: Always paginate large result sets
3. **Query Optimization**: Use appropriate joins and avoid N+1 queries
4. **Caching**: Implement caching for frequently accessed data
5. **Connection Pooling**: Use database connection pooling

## Best Practices

1. **Single Responsibility**: Each service should handle one domain entity
2. **Error Handling**: Throw descriptive errors with context
3. **Validation**: Validate data before database operations
4. **Transactions**: Use transactions for multi-step operations
5. **Hooks**: Use hooks for cross-cutting concerns (logging, notifications)
6. **Testing**: Write unit tests for all custom methods
7. **Documentation**: Document complex business logic

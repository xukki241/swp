# Controllers Layer

This directory contains all HTTP request handlers that process incoming API requests and coordinate responses.

## Overview

- **Pattern**: Factory pattern for standardized CRUD operations
- **Responsibility**: Handle HTTP requests, validation, and response formatting
- **Error Handling**: Consistent error response format across all endpoints
- **Hooks**: Before/after hooks for custom business logic

## Directory Structure

```
controllers/
├── common/
│   ├── factory.js      # CRUD controller factory
│   └── index.js        # Common exports
├── users.controller.js # User-specific controllers
└── index.js           # Controller exports
```

## CRUD Controller Factory

The factory creates standardized controllers with full CRUD operations and additional utility methods.

### Basic Usage

```javascript
// src/controllers/products.controller.js
import { crudControllerFactory } from './common/factory.js';
import { productsService } from '../services/index.js';

export const productsController = crudControllerFactory(productsService, {
  entityName: 'Product',
  allowedSortFields: ['name', 'price', 'createdAt'],
  transformResponse: (product) => ({
    ...product,
    // Remove sensitive fields or add computed properties
  })
});
```

### Advanced Configuration

```javascript
export const usersController = crudControllerFactory(usersService, {
  entityName: 'User',
  allowedSortFields: ['name', 'email', 'createdAt'],
  
  // Transform response to hide sensitive data
  transformResponse: (user) => ({
    ...user,
    password: undefined, // Remove password from response
    email: user.email?.toLowerCase(),
  }),
  
  // Hooks for custom logic
  beforeCreate: async (data, req) => {
    // Hash password before creating user
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 10);
    }
    return data;
  },
  
  afterCreate: async (user, originalData, req) => {
    // Send welcome email after user creation
    await emailService.sendWelcomeEmail(user.email);
  },
  
  beforeUpdate: async (id, data, req) => {
    // Prevent updating certain fields
    delete data.createdAt;
    delete data.id;
    return data;
  },
  
  beforeDelete: async (id, req) => {
    // Check if user can be deleted
    const user = await usersService.findById(id);
    if (user.role === 'admin') {
      throw new Error('Cannot delete admin users');
    }
  }
});
```

## Available Controller Methods

### Standard CRUD Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `create` | `POST /resource` | Create new record |
| `getById` | `GET /resource/:id` | Get record by ID |
| `getMany` | `GET /resource` | Get multiple records with pagination |
| `updateById` | `PUT /resource/:id` | Update entire record |
| `patchById` | `PATCH /resource/:id` | Partially update record |
| `deleteById` | `DELETE /resource/:id` | Delete record by ID |

### Utility Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| `count` | `GET /resource/count` | Count total records |
| `existsById` | `HEAD /resource/:id` | Check if record exists |
| `bulkCreate` | `POST /resource/bulk` | Create multiple records |

### Query Parameters for getMany

```javascript
// GET /users?page=1&limit=10&search=john&orderBy=name&orderDirection=asc&status=active
{
  page: 1,           // Page number (default: 1)
  limit: 10,         // Records per page (default: 10, max: 100)
  search: 'john',    // Search term (searches searchable fields)
  orderBy: 'name',   // Sort field (must be in allowedSortFields)
  orderDirection: 'asc', // Sort direction: 'asc' or 'desc'
  status: 'active',  // Any additional filters
  // ... other filter fields
}
```

## Response Formats

### Success Responses

```javascript
// Single record (create, getById, updateById, etc.)
{
  "success": true,
  "data": { /* record data */ },
  "message": "User created successfully"
}

// Multiple records (getMany)
{
  "success": true,
  "data": [/* array of records */],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}

// Count response
{
  "success": true,
  "data": {
    "count": 42
  }
}

// Bulk operations
{
  "success": true,
  "data": {
    "created": [/* successful records */],
    "errors": [/* failed records with errors */],
    "summary": {
      "total": 5,
      "successful": 3,
      "failed": 2
    }
  },
  "message": "Bulk create completed: 3/5 User records created"
}
```

### Error Responses

```javascript
// Validation error
{
  "success": false,
  "error": "Validation Error",
  "message": "Invalid request data",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}

// Not found error
{
  "success": false,
  "error": "Not found",
  "message": "User with ID 123 not found"
}

// Server error
{
  "success": false,
  "error": "Internal Server Error",
  "message": "Failed to create user"
}
```

## Custom Controllers

For complex business logic that doesn't fit the CRUD pattern, create custom controllers:

```javascript
// src/controllers/auth.controller.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { usersService } from '../services/index.js';

export const authController = {
  async login(req, res) {
    try {
      const { email, password } = req.body;
      
      // Find user by email
      const user = await usersService.findByEmail(email);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          error: 'Authentication failed',
          message: 'Invalid credentials'
        });
      }
      
      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      
      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role
          }
        },
        message: 'Login successful'
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        error: error.message,
        message: 'Login failed'
      });
    }
  },
  
  async logout(req, res) {
    // Implement logout logic (token blacklisting, etc.)
    res.json({
      success: true,
      message: 'Logout successful'
    });
  },
  
  async refreshToken(req, res) {
    // Implement token refresh logic
  }
};
```

## Controller Hooks

Hooks allow you to inject custom logic at specific points in the CRUD operations:

### Available Hooks

- `beforeCreate(data, req)` - Modify data before creation
- `afterCreate(created, originalData, req)` - Execute logic after creation
- `beforeUpdate(id, data, req)` - Modify data before update
- `afterUpdate(updated, originalData, req)` - Execute logic after update
- `beforeDelete(id, req)` - Execute logic before deletion
- `afterDelete(deleted, req)` - Execute logic after deletion

### Hook Examples

```javascript
// Password hashing before create/update
beforeCreate: async (data, req) => {
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return data;
},

// Audit logging after operations
afterCreate: async (user, originalData, req) => {
  await auditService.log({
    action: 'CREATE_USER',
    userId: req.user?.id,
    targetId: user.id,
    timestamp: new Date()
  });
},

// Validation before delete
beforeDelete: async (id, req) => {
  const user = await usersService.findById(id);
  if (user.role === 'admin' && req.user.role !== 'super_admin') {
    throw new Error('Insufficient permissions to delete admin user');
  }
}
```

## Error Handling Best Practices

1. **Consistent Error Format**: Always use the standard error response format
2. **Appropriate HTTP Status Codes**: Use proper status codes (400, 401, 404, 500, etc.)
3. **Security**: Don't expose sensitive information in error messages
4. **Logging**: Log errors for debugging but don't expose stack traces to clients

```javascript
// Good error handling
async function create(req, res) {
  try {
    // ... operation logic
  } catch (error) {
    // Log detailed error for debugging
    console.error('Error creating user:', error);
    
    // Send user-friendly error response
    if (error.code === '23505') { // PostgreSQL unique violation
      return res.status(409).json({
        success: false,
        error: 'Conflict',
        message: 'Email already exists'
      });
    }
    
    // Generic error response
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: 'Failed to create user'
    });
  }
}
```

## Testing Controllers

```javascript
// tests/unit/controllers/users.controller.test.js
import { describe, test, expect, vi, beforeEach } from '@jest/globals';
import { usersController } from '../../../src/controllers/users.controller.js';

// Mock the service
const mockUsersService = {
  create: vi.fn(),
  findById: vi.fn(),
  findMany: vi.fn(),
  updateById: vi.fn(),
  deleteById: vi.fn()
};

// Mock request and response objects
const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  res.send = vi.fn().mockReturnValue(res);
  return res;
};

describe('Users Controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  describe('create', () => {
    test('should create user successfully', async () => {
      const req = mockRequest({ name: 'John Doe', email: 'john@example.com' });
      const res = mockResponse();
      
      mockUsersService.create.mockResolvedValue({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com'
      });
      
      await usersController.create(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        data: expect.objectContaining({
          name: 'John Doe',
          email: 'john@example.com'
        }),
        message: 'User created successfully'
      });
    });
  });
});
```

## Performance Considerations

1. **Pagination**: Always paginate large result sets
2. **Field Selection**: Only return necessary fields
3. **Caching**: Implement caching for frequently accessed data
4. **Rate Limiting**: Add rate limiting to prevent abuse
5. **Validation**: Validate input early to prevent unnecessary processing

## Security Best Practices

1. **Input Validation**: Always validate and sanitize input
2. **Authentication**: Verify user identity
3. **Authorization**: Check user permissions
4. **Data Sanitization**: Remove sensitive data from responses
5. **Rate Limiting**: Prevent abuse and DoS attacks

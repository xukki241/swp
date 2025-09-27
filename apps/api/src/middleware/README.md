# Middleware Layer

This directory contains custom Express middleware functions that handle cross-cutting concerns like validation, authentication, logging, and error handling.

## Overview

- **Purpose**: Cross-cutting concerns that apply to multiple routes
- **Pattern**: Express middleware functions with `(req, res, next)` signature
- **Validation**: Valibot-based request validation middleware
- **Composition**: Middleware can be composed and reused across routes

## Directory Structure

```
middleware/
├── validate.js     # Request validation middleware
└── index.js       # Middleware exports
```

## Validation Middleware

The validation middleware provides flexible request validation using Valibot schemas.

### Basic Usage

```javascript
import { validate, validateBody, validateParams } from '../middleware/validate.js';
import { userCreateSchema, idParamSchema } from '../validation/schemas/index.js';

// Validate request body
router.post('/users', 
  validateBody(userCreateSchema),
  usersController.create
);

// Validate URL parameters
router.get('/users/:id',
  validateParams(idParamSchema),
  usersController.getById
);

// Validate multiple parts of the request
router.put('/users/:id',
  validate({
    params: idParamSchema,
    body: userUpdateSchema,
    query: paginationSchema
  }),
  usersController.update
);
```

### Available Validation Functions

| Function | Purpose | Parameters |
|----------|---------|------------|
| `validate(schemas)` | Validate multiple request parts | Object with body, params, query, headers schemas |
| `validateBody(schema)` | Validate request body only | Valibot schema |
| `validateParams(schema)` | Validate URL parameters only | Valibot schema |
| `validateQuery(schema)` | Validate query parameters only | Valibot schema |
| `validateHeaders(schema)` | Validate request headers only | Valibot schema |

### Validation Response Format

```javascript
// Validation error response
{
  "success": false,
  "error": "Validation failed",
  "message": "The request contains invalid data",
  "details": [
    {
      "location": "body",
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format",
          "received": "invalid-email",
          "expected": "string"
        },
        {
          "field": "name",
          "message": "Name is required",
          "received": "",
          "expected": "string"
        }
      ]
    },
    {
      "location": "params",
      "errors": [
        {
          "field": "id",
          "message": "ID must be a positive integer",
          "received": "-1",
          "expected": "number"
        }
      ]
    }
  ]
}
```

## Authentication Middleware

Create authentication middleware for protecting routes:

```javascript
// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { usersService } from '../services/index.js';

/**
 * JWT Authentication middleware
 */
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is missing or invalid'
      });
    }
    
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = await usersService.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'User not found'
      });
    }
    
    if (user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Authentication failed',
        message: 'Account is not active'
      });
    }
    
    // Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({
      success: false,
      error: 'Authentication failed',
      message: 'Invalid or expired token'
    });
  }
};

/**
 * Optional authentication middleware
 * Sets req.user if token is valid, but doesn't fail if no token
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await usersService.findById(decoded.userId);
      
      if (user && user.status === 'active') {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
};
```

## Authorization Middleware

Create role-based authorization middleware:

```javascript
// src/middleware/authorize.js

/**
 * Role-based authorization middleware
 * @param {string|Array<string>} allowedRoles - Required role(s)
 */
export const authorize = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is required'
      });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Authorization failed',
        message: 'Insufficient permissions'
      });
    }
    
    next();
  };
};

/**
 * Permission-based authorization middleware
 * @param {string|Array<string>} requiredPermissions - Required permission(s)
 */
export const requirePermissions = (requiredPermissions) => {
  const permissions = Array.isArray(requiredPermissions) 
    ? requiredPermissions 
    : [requiredPermissions];
  
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is required'
      });
    }
    
    // Get user permissions (this would depend on your permission system)
    const userPermissions = await getUserPermissions(req.user.id);
    
    const hasAllPermissions = permissions.every(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAllPermissions) {
      return res.status(403).json({
        success: false,
        error: 'Authorization failed',
        message: 'Required permissions missing'
      });
    }
    
    next();
  };
};

/**
 * Resource ownership middleware
 * Ensures user can only access their own resources
 */
export const requireOwnership = (resourceIdParam = 'id', userIdField = 'userId') => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Access token is required'
      });
    }
    
    const resourceId = req.params[resourceIdParam];
    
    // For resources that have a userId field
    if (userIdField === 'userId') {
      // Check if resource belongs to the authenticated user
      const resource = await getResourceById(resourceId); // Implement this
      
      if (!resource || resource.userId !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Authorization failed',
          message: 'Access denied to this resource'
        });
      }
    } else {
      // For user resources, check if the ID matches
      if (parseInt(resourceId) !== req.user.id) {
        return res.status(403).json({
          success: false,
          error: 'Authorization failed',
          message: 'Access denied to this resource'
        });
      }
    }
    
    next();
  };
};
```

## Rate Limiting Middleware

Implement rate limiting to prevent abuse:

```javascript
// src/middleware/rateLimit.js
const rateLimitStore = new Map();

/**
 * Simple in-memory rate limiting middleware
 * @param {Object} options - Rate limit options
 * @param {number} options.windowMs - Time window in milliseconds
 * @param {number} options.max - Maximum requests per window
 * @param {string} options.message - Error message
 */
export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes
    max = 100,                  // 100 requests per window
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip
  } = options;
  
  return (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const windowStart = now - windowMs;
    
    // Get or create record for this key
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, []);
    }
    
    const requests = rateLimitStore.get(key);
    
    // Remove old requests outside the current window
    const recentRequests = requests.filter(time => time > windowStart);
    
    // Check if limit exceeded
    if (recentRequests.length >= max) {
      return res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: message,
        retryAfter: Math.ceil(windowMs / 1000)
      });
    }
    
    // Add current request
    recentRequests.push(now);
    rateLimitStore.set(key, recentRequests);
    
    // Add headers
    res.set({
      'X-RateLimit-Limit': max,
      'X-RateLimit-Remaining': Math.max(0, max - recentRequests.length - 1),
      'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
    });
    
    next();
  };
};

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, requests] of rateLimitStore.entries()) {
    const recentRequests = requests.filter(time => time > now - 24 * 60 * 60 * 1000);
    if (recentRequests.length === 0) {
      rateLimitStore.delete(key);
    } else {
      rateLimitStore.set(key, recentRequests);
    }
  }
}, 60 * 60 * 1000); // Cleanup every hour
```

## Logging Middleware

Add request logging:

```javascript
// src/middleware/logging.js
import { format } from 'date-fns';

/**
 * Request logging middleware
 */
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  
  // Log request
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl} - ${req.ip}`);
  
  // Override res.end to log response
  const originalEnd = res.end;
  res.end = function(...args) {
    const duration = Date.now() - start;
    const statusCode = res.statusCode;
    const statusClass = Math.floor(statusCode / 100);
    
    let logLevel = 'INFO';
    if (statusClass === 4) logLevel = 'WARN';
    if (statusClass === 5) logLevel = 'ERROR';
    
    console.log(`[${timestamp}] ${logLevel} ${req.method} ${req.originalUrl} ${statusCode} - ${duration}ms`);
    
    originalEnd.apply(this, args);
  };
  
  next();
};

/**
 * Error logging middleware
 */
export const errorLogger = (error, req, res, next) => {
  const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
  
  console.error(`[${timestamp}] ERROR ${req.method} ${req.originalUrl}:`);
  console.error(error.stack);
  
  // Don't modify the error, just log it
  next(error);
};
```

## CORS Middleware

Handle Cross-Origin Resource Sharing:

```javascript
// src/middleware/cors.js

/**
 * CORS middleware
 * @param {Object} options - CORS options
 */
export const cors = (options = {}) => {
  const {
    origin = process.env.CORS_ORIGIN || '*',
    methods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders = ['Content-Type', 'Authorization'],
    credentials = true
  } = options;
  
  return (req, res, next) => {
    // Set CORS headers
    res.set({
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': methods.join(', '),
      'Access-Control-Allow-Headers': allowedHeaders.join(', '),
      'Access-Control-Allow-Credentials': credentials
    });
    
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }
    
    next();
  };
};
```

## Error Handling Middleware

Centralized error handling:

```javascript
// src/middleware/errorHandler.js

/**
 * Global error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('Unhandled error:', error);
  
  // Default error response
  let status = 500;
  let message = 'Internal server error';
  let details = null;
  
  // Handle specific error types
  if (error.name === 'ValidationError') {
    status = 400;
    message = 'Validation failed';
    details = error.details;
  } else if (error.name === 'UnauthorizedError') {
    status = 401;
    message = 'Authentication required';
  } else if (error.name === 'ForbiddenError') {
    status = 403;
    message = 'Access forbidden';
  } else if (error.name === 'NotFoundError') {
    status = 404;
    message = 'Resource not found';
  } else if (error.code === '23505') { // PostgreSQL unique violation
    status = 409;
    message = 'Resource already exists';
  } else if (error.code === '23503') { // PostgreSQL foreign key violation
    status = 400;
    message = 'Invalid reference';
  }
  
  // Don't expose error details in production
  const response = {
    success: false,
    error: error.name || 'Error',
    message: message
  };
  
  if (details) {
    response.details = details;
  }
  
  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }
  
  res.status(status).json(response);
};

/**
 * 404 handler for unmatched routes
 */
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};
```

## Usage Examples

### Route with Multiple Middleware

```javascript
// src/routes/users.routes.js
import { Router } from 'express';
import { 
  validate, 
  authenticate, 
  authorize, 
  rateLimit 
} from '../middleware/index.js';
import { 
  userCreateSchema, 
  userUpdateSchema, 
  idParamSchema 
} from '../validation/schemas/index.js';
import { usersController } from '../controllers/index.js';

const router = Router();

// Apply middleware in order
router.post('/users',
  rateLimit({ max: 10, windowMs: 60 * 1000 }), // 10 requests per minute
  authenticate,                                  // Must be authenticated
  authorize(['admin', 'manager']),              // Must have admin or manager role
  validate({ body: userCreateSchema }),         // Validate request body
  usersController.create                        // Controller function
);

router.get('/users/:id',
  authenticate,
  validate({ params: idParamSchema }),
  requireOwnership('id'),                       // Can only access own profile
  usersController.getById
);

export default router;
```

### Global Middleware Setup

```javascript
// src/app.js
import express from 'express';
import { 
  requestLogger, 
  cors, 
  errorHandler, 
  notFoundHandler 
} from './middleware/index.js';

const app = express();

// Global middleware (order matters!)
app.use(requestLogger);           // Log all requests
app.use(cors());                 // Enable CORS
app.use(express.json());         // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Routes
app.use('/api', routes);

// Error handling (must be last)
app.use(notFoundHandler);        // Handle 404s
app.use(errorHandler);           // Handle all other errors

export default app;
```

## Testing Middleware

```javascript
// tests/unit/middleware/validate.test.js
import { describe, test, expect, vi } from '@jest/globals';
import * as v from 'valibot';
import { validate } from '../../../src/middleware/validate.js';

const mockRequest = (body = {}, params = {}, query = {}) => ({
  body,
  params,
  query
});

const mockResponse = () => {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

const mockNext = vi.fn();

describe('Validation Middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  test('should pass validation with valid data', () => {
    const schema = v.object({
      name: v.string(),
      email: v.string()
    });
    
    const req = mockRequest({ name: 'John', email: 'john@example.com' });
    const res = mockResponse();
    
    const middleware = validate({ body: schema });
    middleware(req, res, mockNext);
    
    expect(mockNext).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
  
  test('should return 400 with validation errors', () => {
    const schema = v.object({
      name: v.string(),
      email: v.pipe(v.string(), v.email())
    });
    
    const req = mockRequest({ name: 123, email: 'invalid' });
    const res = mockResponse();
    
    const middleware = validate({ body: schema });
    middleware(req, res, mockNext);
    
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: 'Validation failed'
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });
});
```

## Best Practices

1. **Order Matters**: Apply middleware in the correct order (auth before authorization)
2. **Error Handling**: Always include error handling in async middleware
3. **Performance**: Keep middleware lightweight and fast
4. **Reusability**: Create configurable middleware functions
5. **Testing**: Test middleware functions independently
6. **Documentation**: Document middleware behavior and usage
7. **Security**: Validate and sanitize all inputs
8. **Logging**: Log important security events and errors

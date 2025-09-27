# Routes Layer

This directory contains all Express route definitions that map HTTP endpoints to controller
functions with appropriate middleware.

## Overview

- **Purpose**: Define API endpoints and map them to controllers
- **Pattern**: Express Router with middleware composition
- **Validation**: Request validation using middleware
- **Organization**: One route file per resource/entity

## Directory Structure

```
routes/
├── users.routes.js     # User-related routes
├── products.routes.js  # Product-related routes (example)
└── index.js           # Route exports and main router setup
```

## Route Organization

### Basic CRUD Routes Pattern

Follow RESTful conventions for standard CRUD operations:

```javascript
// src/routes/users.routes.js
import { Router } from "express";
import { userController } from "../controllers/index.js";
import { validate, validateBody, validateParams } from "../middleware/index.js";
import {
  userCreateSchema,
  userUpdateSchema,
  idParamSchema,
  userQuerySchema,
} from "../validation/index.js";

const router = Router();

// Standard CRUD routes
router.post(
  "/", // POST /users
  validateBody(userCreateSchema),
  userController.create
);

router.get(
  "/", // GET /users
  validateQuery(userQuerySchema),
  userController.getMany
);

router.get(
  "/:id", // GET /users/:id
  validateParams(idParamSchema),
  userController.getById
);

router.put(
  "/:id", // PUT /users/:id
  validate({
    params: idParamSchema,
    body: userUpdateSchema,
  }),
  userController.updateById
);

router.patch(
  "/:id", // PATCH /users/:id
  validate({
    params: idParamSchema,
    body: userPartialUpdateSchema,
  }),
  userController.patchById
);

router.delete(
  "/:id", // DELETE /users/:id
  validateParams(idParamSchema),
  userController.deleteById
);

export default router;
```

### RESTful URL Conventions

| HTTP Method | URL Pattern  | Purpose                    | Controller Method |
| ----------- | ------------ | -------------------------- | ----------------- |
| `GET`       | `/users`     | List users with pagination | `getMany`         |
| `POST`      | `/users`     | Create new user            | `create`          |
| `GET`       | `/users/:id` | Get specific user          | `getById`         |
| `PUT`       | `/users/:id` | Update entire user         | `updateById`      |
| `PATCH`     | `/users/:id` | Partially update user      | `patchById`       |
| `DELETE`    | `/users/:id` | Delete user                | `deleteById`      |
| `HEAD`      | `/users/:id` | Check if user exists       | `existsById`      |

### Utility Routes

Add utility endpoints for common operations:

```javascript
// Utility routes (place before parameterized routes)
router.get(
  "/count", // GET /users/count
  userController.count
);

router.get(
  "/active", // GET /users/active
  validateQuery(userQuerySchema),
  userController.getActive
);

router.post(
  "/bulk", // POST /users/bulk
  validateBody(userBulkCreateSchema),
  userController.bulkCreate
);

router.get(
  "/search", // GET /users/search
  validateQuery(userSearchSchema),
  userController.search
);
```

### Custom Resource Routes

For non-CRUD operations, use descriptive URLs:

```javascript
// Custom routes for specific operations
router.get(
  "/email/:email", // GET /users/email/:email
  validateParams(emailParamSchema),
  userController.getByEmail
);

router.patch(
  "/:id/status", // PATCH /users/:id/status
  validate({
    params: idParamSchema,
    body: statusUpdateSchema,
  }),
  userController.updateStatus
);

router.get(
  "/role/:roleId", // GET /users/role/:roleId
  validate({
    params: roleIdParamSchema,
    query: userQuerySchema,
  }),
  userController.getByRole
);

router.post(
  "/:id/avatar", // POST /users/:id/avatar
  validateParams(idParamSchema),
  upload.single("avatar"), // File upload middleware
  userController.updateAvatar
);

router.post(
  "/:id/password/reset", // POST /users/:id/password/reset
  validateParams(idParamSchema),
  userController.resetPassword
);
```

## Nested Resource Routes

For resources that belong to other resources:

```javascript
// src/routes/orders.routes.js
const router = Router();

// Order routes
router.get("/", orderController.getMany);
router.post("/", validateBody(orderCreateSchema), orderController.create);
router.get("/:id", validateParams(idParamSchema), orderController.getById);

// Nested resource: order items
router.get(
  "/:id/items", // GET /orders/:id/items
  validateParams(idParamSchema),
  orderItemController.getByOrderId
);

router.post(
  "/:id/items", // POST /orders/:id/items
  validate({
    params: idParamSchema,
    body: orderItemCreateSchema,
  }),
  orderItemController.create
);

router.put(
  "/:orderId/items/:itemId", // PUT /orders/:orderId/items/:itemId
  validate({
    params: orderItemParamsSchema,
    body: orderItemUpdateSchema,
  }),
  orderItemController.updateById
);

router.delete(
  "/:orderId/items/:itemId", // DELETE /orders/:orderId/items/:itemId
  validateParams(orderItemParamsSchema),
  orderItemController.deleteById
);
```

## Route Middleware Composition

### Authentication and Authorization

```javascript
import { authenticate, authorize, requireOwnership } from "../middleware/auth.js";

// Public routes (no authentication required)
router.post("/register", validateBody(userRegistrationSchema), userController.register);

router.post("/login", validateBody(userLoginSchema), userController.login);

// Protected routes (authentication required)
router.use(authenticate); // Apply authentication to all routes below

router.get("/profile", userController.getProfile);

router.patch("/profile", validateBody(userProfileUpdateSchema), userController.updateProfile);

// Admin-only routes
router.get(
  "/admin/users",
  authorize(["admin"]),
  validateQuery(userQuerySchema),
  userController.getMany
);

// Resource ownership protection
router.get(
  "/:id",
  validateParams(idParamSchema),
  requireOwnership("id"), // Can only access own profile
  userController.getById
);
```

### Rate Limiting

```javascript
import { rateLimit } from "../middleware/rateLimit.js";

// Apply different rate limits to different endpoints
router.post(
  "/login",
  rateLimit({ max: 5, windowMs: 15 * 60 * 1000 }), // 5 attempts per 15 minutes
  validateBody(userLoginSchema),
  userController.login
);

router.post(
  "/register",
  rateLimit({ max: 3, windowMs: 60 * 60 * 1000 }), // 3 registrations per hour
  validateBody(userRegistrationSchema),
  userController.register
);

router.post(
  "/",
  rateLimit({ max: 10, windowMs: 60 * 1000 }), // 10 creates per minute
  authenticate,
  authorize(["admin"]),
  validateBody(userCreateSchema),
  userController.create
);
```

## Main Router Setup

### Centralized Route Registration

```javascript
// src/routes/index.js
import { Router } from "express";
import usersRoutes from "./users.routes.js";
import ordersRoutes from "./orders.routes.js";
import productsRoutes from "./products.routes.js";
import authRoutes from "./auth.routes.js";
import { authenticate, cors, requestLogger } from "../middleware/index.js";

const router = Router();

// Global middleware for all API routes
router.use(cors());
router.use(requestLogger);

// Public routes (no authentication required)
router.use("/auth", authRoutes);

// API versioning
const v1Router = Router();

// Protected API routes
v1Router.use(authenticate); // Require authentication for all v1 routes

// Resource routes
v1Router.use("/users", usersRoutes);
v1Router.use("/orders", ordersRoutes);
v1Router.use("/products", productsRoutes);

// Mount versioned routes
router.use("/v1", v1Router);

// Health check endpoint
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
    version: process.env.APP_VERSION || "1.0.0",
  });
});

export default router;
```

### App Integration

```javascript
// src/app.js
import express from "express";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/index.js";

const app = express();

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// API routes
app.use("/api", routes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
```

## Route Documentation

### OpenAPI/Swagger Comments

Add documentation comments for API documentation generation:

```javascript
/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Get list of users
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Number of users per page
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 */
router.get("/", validateQuery(userQuerySchema), userController.getMany);
```

### Route Comments

Add clear comments for complex routes:

```javascript
// Get users by role with pagination and filtering
// Supports search across name, email, and phone fields
// Requires admin or manager role
router.get(
  "/role/:roleId",
  authenticate,
  authorize(["admin", "manager"]),
  validate({
    params: roleIdParamSchema,
    query: userQuerySchema,
  }),
  userController.getByRole
);
```

## Error Handling in Routes

### Route-Specific Error Handling

```javascript
// Wrap async route handlers to catch errors
const asyncHandler = fn => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

router.get(
  "/:id",
  validateParams(idParamSchema),
  asyncHandler(async (req, res) => {
    try {
      const user = await userController.getById(req, res);
    } catch (error) {
      // Specific error handling for this route
      if (error.name === "UserNotFoundError") {
        return res.status(404).json({
          success: false,
          error: "User not found",
          message: `User with ID ${req.params.id} does not exist`,
        });
      }
      throw error; // Re-throw other errors to global handler
    }
  })
);
```

## Route Testing

### Integration Tests

```javascript
// tests/integration/routes/users.test.js
import { describe, test, expect, beforeEach } from "@jest/globals";
import request from "supertest";
import app from "../../../src/app.js";

describe("Users Routes", () => {
  let authToken;

  beforeEach(async () => {
    // Setup authentication token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    authToken = loginResponse.body.data.token;
  });

  describe("GET /api/v1/users", () => {
    test("should return paginated users list", async () => {
      const response = await request(app)
        .get("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });

    test("should return 401 without authentication", async () => {
      await request(app).get("/api/v1/users").expect(401);
    });
  });

  describe("POST /api/v1/users", () => {
    test("should create new user with valid data", async () => {
      const userData = {
        name: "Test User",
        email: "test@example.com",
        phone: "+1234567890",
        roleId: 1,
      };

      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.email).toBe(userData.email);
    });

    test("should return 400 with invalid data", async () => {
      const response = await request(app)
        .post("/api/v1/users")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ name: "" }) // Invalid data
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Validation failed");
    });
  });
});
```

## Best Practices

### 1. Route Organization

- One route file per resource
- Group related routes together
- Use consistent naming conventions
- Place utility routes before parameterized routes

### 2. URL Design

- Use RESTful conventions
- Use nouns for resources, not verbs
- Use consistent pluralization
- Keep URLs simple and predictable

### 3. Middleware Usage

- Apply middleware in the correct order
- Use specific middleware only where needed
- Compose middleware for reusability
- Document middleware requirements

### 4. Validation

- Validate all inputs at the route level
- Use specific schemas for different operations
- Provide clear validation error messages
- Transform data during validation when needed

### 5. Error Handling

- Use consistent error response formats
- Handle route-specific errors appropriately
- Don't expose sensitive information in errors
- Log errors for debugging

### 6. Security

- Always authenticate sensitive routes
- Use appropriate authorization checks
- Implement rate limiting
- Validate and sanitize all inputs

### 7. Documentation

- Document complex routes with comments
- Use OpenAPI/Swagger for API documentation
- Include example requests and responses
- Keep documentation up to date

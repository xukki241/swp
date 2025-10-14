# Validation Middleware Guide

Complete guide for using the validation middleware with the new DTO structure.

## Quick Start

```javascript
import express from "express";
import {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  users,
  auth,
} from "@pharmaflow/dto";

const app = express();
app.use(express.json());

// Validate request body
app.post(
  "/api/auth/login",
  validateBody(auth.loginRequestSchema),
  (req, res) => {
    // req.body is now validated
    res.json({ message: "Login successful" });
  }
);

// Validate query parameters (with pagination)
app.get("/api/users", validateQuery(users.listUsersQuerySchema), (req, res) => {
  // req.query includes validated page, limit, sortBy, sortOrder, etc.
  res.json({ data: [], pagination: {} });
});

// Validate multiple parts
app.patch(
  "/api/users/:id",
  validate({
    params: z.object({ id: z.string().uuid() }),
    body: users.updateUserRequestSchema,
  }),
  (req, res) => {
    // Both params and body are validated
    res.json({ id: req.params.id, ...req.body });
  }
);
```

## Middleware Functions

### 1. `validateBody(schema)`

Validates the request body against a Zod schema.

```javascript
import { validateBody, users } from "@pharmaflow/dto";

app.post("/api/users", validateBody(users.createUserSchema), (req, res) => {
  // req.body is validated and parsed
  const { name, email, phone, password, role } = req.body;
  res.status(201).json(req.body);
});
```

### 2. `validateQuery(schema)`

Validates query parameters (automatically includes pagination).

```javascript
import { validateQuery, medications } from "@pharmaflow/dto";

app.get(
  "/api/medications",
  validateQuery(medications.listMedicationsQuerySchema),
  (req, res) => {
    const {
      page, // Default: 1
      limit, // Default: 10, Max: 100
      sortBy, // Optional
      sortOrder, // Default: "asc"
      status, // Optional filter
      brand, // Optional filter
    } = req.query;

    res.json({
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    });
  }
);
```

### 3. `validateParams(schema)`

Validates route parameters.

```javascript
import { validateParams } from "@pharmaflow/dto";
import { z } from "zod";

const uuidParam = z.object({ id: z.string().uuid() });

app.get("/api/users/:id", validateParams(uuidParam), (req, res) => {
  // req.params.id is validated as UUID
  const { id } = req.params;
  res.json({ id });
});
```

### 4. `validate({ body, query, params })`

Validates multiple parts of the request in one middleware.

```javascript
import { validate, users } from "@pharmaflow/dto";
import { z } from "zod";

app.patch(
  "/api/users/:id",
  validate({
    params: z.object({ id: z.string().uuid() }),
    body: users.updateUserRequestSchema,
  }),
  (req, res) => {
    const { id } = req.params; // Validated UUID
    const updates = req.body; // Validated partial user
    res.json({ id, ...updates });
  }
);
```

### 5. `asyncValidate(validationFn)`

For async validation logic.

```javascript
import { asyncValidate } from "@pharmaflow/dto";

app.post(
  "/api/users",
  asyncValidate(async (req) => {
    // Custom async validation
    const user = await checkUserExists(req.body.email);
    if (user) {
      throw new Error("User already exists");
    }
  }),
  (req, res) => {
    res.status(201).json(req.body);
  }
);
```

### 6. `safeValidate(schema, target)`

Non-throwing validation that attaches results to `req.validation`.

```javascript
import { safeValidate } from "@pharmaflow/dto";

app.post(
  "/api/users",
  safeValidate(users.createUserSchema, "body"),
  (req, res) => {
    // req.validation.body contains the validation result
    if (req.validation.body.success) {
      res.status(201).json(req.validation.body.data);
    }
  }
);
```

## Error Response Format

When validation fails, the middleware returns a structured error response:

```json
{
  "error": "Validation failed",
  "details": {
    "email": ["Invalid email format"],
    "password": ["String must contain at least 8 character(s)"],
    "age": ["Expected number, received string"]
  },
  "issues": [
    {
      "path": ["email"],
      "message": "Invalid email format",
      "code": "invalid_string"
    },
    {
      "path": ["password"],
      "message": "String must contain at least 8 character(s)",
      "code": "too_small"
    },
    {
      "path": ["age"],
      "message": "Expected number, received string",
      "code": "invalid_type"
    }
  ]
}
```

## Common Patterns

### Pattern 1: Standard CRUD Routes

```javascript
import { Router } from "express";
import {
  validate,
  validateQuery,
  validateParams,
  users,
} from "@pharmaflow/dto";
import { z } from "zod";

const router = Router();
const uuidParam = z.object({ id: z.string().uuid() });

// List with pagination
router.get("/", validateQuery(users.listUsersQuerySchema), listUsers);

// Get by ID
router.get("/:id", validateParams(uuidParam), getUser);

// Create (batch)
router.post("/", validateBody(users.createUsersRequestSchema), createUsers);

// Update
router.patch(
  "/:id",
  validate({
    params: uuidParam,
    body: users.updateUserRequestSchema,
  }),
  updateUser
);

// Delete
router.delete("/:id", validateParams(uuidParam), deleteUser);

export default router;
```

### Pattern 2: Nested Resources

```javascript
import { medications } from "@pharmaflow/dto";

// GET /api/medications/:medicationId/variants?page=1&limit=10
router.get(
  "/:medicationId/variants",
  validate({
    params: z.object({ medicationId: z.string().uuid() }),
    query: medications.listVariantsQuerySchema,
  }),
  listVariants
);

// POST /api/medications/:medicationId/variants
router.post(
  "/:medicationId/variants",
  validate({
    params: z.object({ medicationId: z.string().uuid() }),
    body: medications.createVariantsRequestSchema,
  }),
  createVariants
);
```

### Pattern 3: Complex Operations

```javascript
import { purchases, sales, inventory } from "@pharmaflow/dto";

// Create purchase order with items
router.post(
  "/",
  validateBody(purchases.createPurchaseOrdersRequestSchema),
  createPurchaseOrders
);

// Create receipt with items (auto-creates inventory)
router.post(
  "/:purchaseOrderId/receipts",
  validate({
    params: z.object({ purchaseOrderId: z.string().uuid() }),
    body: purchases.createReceiptRequestSchema,
  }),
  createReceipt
);

// Create sales order with items
router.post(
  "/",
  validateBody(sales.createSalesOrderRequestSchema),
  createSalesOrder
);

// Move inventory
router.post(
  "/move",
  validateBody(inventory.moveInventoryRequestSchema),
  moveInventory
);

// Adjust inventory
router.patch(
  "/:id/adjust",
  validate({
    params: z.object({ id: z.string().uuid() }),
    body: inventory.adjustInventoryRequestSchema,
  }),
  adjustInventory
);
```

### Pattern 4: Batch Operations

```javascript
import { warehouse } from "@pharmaflow/dto";

// Create multiple zones manually
router.post(
  "/zones",
  validateBody(warehouse.createZonesRequestSchema),
  createZones
);

// Auto-generate zones
router.post(
  "/zones/batch",
  validateBody(warehouse.batchCreateZonesRequestSchema),
  batchCreateZones
);

// Auto-generate bins (grid mode)
router.post(
  "/racks/:rackId/bins/batch",
  validate({
    params: z.object({ rackId: z.string().uuid() }),
    body: warehouse.batchCreateBinsRequestSchema,
  }),
  batchCreateBins
);
```

### Pattern 5: Authentication

```javascript
import { auth } from "@pharmaflow/dto";

router.post("/register", validateBody(auth.registerRequestSchema), register);
router.post("/login", validateBody(auth.loginRequestSchema), login);
router.post(
  "/forgot-password",
  validateBody(auth.forgotPasswordRequestSchema),
  forgotPassword
);
router.post(
  "/reset-password",
  validateBody(auth.resetPasswordRequestSchema),
  resetPassword
);
router.post(
  "/change-password",
  validateBody(auth.changePasswordRequestSchema),
  changePassword
);
router.post(
  "/refresh-token",
  validateBody(auth.refreshTokenRequestSchema),
  refreshToken
);
```

## Custom Validation

### Add Custom Business Logic

```javascript
import { validateBody, users } from "@pharmaflow/dto";

// Custom middleware after validation
const checkEmailUnique = async (req, res, next) => {
  const exists = await User.findOne({ email: req.body.email });
  if (exists) {
    return res.status(400).json({ error: "Email already exists" });
  }
  next();
};

router.post(
  "/users",
  validateBody(users.createUserSchema),
  checkEmailUnique,
  createUser
);
```

### Conditional Validation

```javascript
const validateUpdate = (req, res, next) => {
  if (req.body.password) {
    // If password is being changed, require old password
    return validateBody(
      z.object({
        oldPassword: z.string().min(1),
        password: z.string().min(8),
      })
    )(req, res, next);
  }
  return validateBody(users.updateUserRequestSchema)(req, res, next);
};

router.patch("/users/:id", validateUpdate, updateUser);
```

## TypeScript Support

```typescript
import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { users } from "@pharmaflow/dto";

type CreateUserRequest = Request<
  {}, // Params
  {}, // Response Body
  z.infer<typeof users.createUserSchema> // Request Body
>;

router.post(
  "/users",
  validateBody(users.createUserSchema),
  (req: CreateUserRequest, res: Response, next: NextFunction) => {
    // req.body is typed
    const { name, email, phone, password, role } = req.body;
    res.status(201).json({ name, email, role });
  }
);
```

## Best Practices

1. **Always validate at the route level** - Catch issues early
2. **Use pagination schemas for all list endpoints** - Consistent UX
3. **Combine validations** - Use `validate()` for params + body
4. **Don't duplicate validation** - Let middleware handle it
5. **Handle validation errors globally** - Use error middleware
6. **Type your handlers** - Use TypeScript + z.infer for type safety
7. **Test validation** - Write tests for edge cases

## Migration from Old Middleware

### Before

```javascript
import { validate } from "../middleware/validate.js";
import { createUserSchema } from "@pharmaflow/dto";

router.post("/users", validate(createUserSchema), createUser);
```

### After

```javascript
import { validateBody, users } from "@pharmaflow/dto";

router.post("/users", validateBody(users.createUserSchema), createUser);
```

## Complete Example

See `examples/middleware-usage.js` and `examples/route-patterns.js` for full working examples.

## Troubleshooting

### Issue: Pagination not working

Make sure you're using `validateQuery` with a schema that extends `paginationSchema`:

```javascript
// ✅ Correct
validateQuery(users.listUsersQuerySchema); // Includes pagination

// ❌ Wrong
validateQuery(z.object({ name: z.string() })); // No pagination
```

### Issue: UUID validation failing

Ensure your param schema validates UUIDs:

```javascript
const uuidParam = z.object({ id: z.string().uuid() });
validateParams(uuidParam);
```

### Issue: Batch operations not accepting arrays

Use the batch request schemas:

```javascript
// ✅ Correct
validateBody(users.createUsersRequestSchema); // Expects array

// ❌ Wrong
validateBody(users.createUserSchema); // Expects single object
```

## See Also

- `README.md` - Complete DTO documentation
- `MIGRATION_SUMMARY.md` - Migration guide
- `examples/middleware-usage.js` - Working examples
- `examples/route-patterns.js` - Common patterns

/**
 * Common route patterns and middleware usage examples
 */

import { Router } from "express";
import {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  users,
  auth,
  medications,
} from "../src/core";
import { z } from "zod";

// ============================================================================
// Pattern 1: Standard CRUD Routes
// ============================================================================

export function createCrudRoutes(resource, schemas) {
  const router = Router();
  const uuidParam = z.object({ id: z.string().uuid() });

  // List with pagination
  router.get("/", validateQuery(schemas.listQuerySchema), (req, res) => {
    // GET /api/{resource}?page=1&limit=10&sortBy=name&sortOrder=asc
    res.json({ data: [], pagination: {} });
  });

  // Get by ID
  router.get("/:id", validateParams(uuidParam), (req, res) => {
    // GET /api/{resource}/:id
    res.json({ id: req.params.id });
  });

  // Create (single or batch)
  router.post("/", validateBody(schemas.createRequestSchema), (req, res) => {
    // POST /api/{resource}
    res.status(201).json(req.body);
  });

  // Update
  router.patch(
    "/:id",
    validate({
      params: uuidParam,
      body: schemas.updateRequestSchema,
    }),
    (req, res) => {
      // PATCH /api/{resource}/:id
      res.json({ id: req.params.id, ...req.body });
    }
  );

  // Delete
  router.delete("/:id", validateParams(uuidParam), (req, res) => {
    // DELETE /api/{resource}/:id
    res.json({ message: "Deleted successfully" });
  });

  return router;
}

// ============================================================================
// Pattern 2: Nested Resource Routes
// ============================================================================

export function createNestedRoutes(parentResource, childResource, schemas) {
  const router = Router();
  const parentIdParam = z.object({ parentId: z.string().uuid() });
  const bothIdsParam = z.object({
    parentId: z.string().uuid(),
    id: z.string().uuid(),
  });

  // List children of parent
  router.get(
    "/:parentId/" + childResource,
    validate({
      params: parentIdParam,
      query: schemas.listQuerySchema,
    }),
    (req, res) => {
      // GET /api/{parent}/:parentId/{children}?page=1&limit=10
      res.json({ data: [], pagination: {} });
    }
  );

  // Create child for parent
  router.post(
    "/:parentId/" + childResource,
    validate({
      params: parentIdParam,
      body: schemas.createRequestSchema,
    }),
    (req, res) => {
      // POST /api/{parent}/:parentId/{children}
      res.status(201).json(req.body);
    }
  );

  // Update child
  router.patch(
    "/:parentId/" + childResource + "/:id",
    validate({
      params: bothIdsParam,
      body: schemas.updateRequestSchema,
    }),
    (req, res) => {
      // PATCH /api/{parent}/:parentId/{children}/:id
      res.json({ id: req.params.id, ...req.body });
    }
  );

  // Delete child
  router.delete(
    "/:parentId/" + childResource + "/:id",
    validateParams(bothIdsParam),
    (req, res) => {
      // DELETE /api/{parent}/:parentId/{children}/:id
      res.json({ message: "Deleted successfully" });
    }
  );

  return router;
}

// ============================================================================
// Pattern 3: Authentication Routes
// ============================================================================

export function createAuthRoutes() {
  const router = Router();

  router.post(
    "/register",
    validateBody(auth.registerRequestSchema),
    (req, res) => {
      res.status(201).json({ message: "Registration submitted" });
    }
  );

  router.post("/login", validateBody(auth.loginRequestSchema), (req, res) => {
    res.json({ accessToken: "token", refreshToken: "refresh" });
  });

  router.post(
    "/forgot-password",
    validateBody(auth.forgotPasswordRequestSchema),
    (req, res) => {
      res.json({ message: "Reset email sent" });
    }
  );

  router.post(
    "/reset-password",
    validateBody(auth.resetPasswordRequestSchema),
    (req, res) => {
      res.json({ message: "Password reset successful" });
    }
  );

  router.post(
    "/change-password",
    validateBody(auth.changePasswordRequestSchema),
    (req, res) => {
      res.json({ message: "Password changed" });
    }
  );

  router.post(
    "/refresh-token",
    validateBody(auth.refreshTokenRequestSchema),
    (req, res) => {
      res.json({ accessToken: "new-token" });
    }
  );

  router.get("/me", (req, res) => {
    res.json(req.user); // Assuming auth middleware sets req.user
  });

  return router;
}

// ============================================================================
// Pattern 4: Batch Operation Routes
// ============================================================================

export function createBatchRoutes() {
  const router = Router();

  // Batch create with manual list
  router.post(
    "/users/batch",
    validateBody(users.createUsersRequestSchema),
    (req, res) => {
      res.status(201).json(req.body);
    }
  );

  // Auto-generate batch
  router.post(
    "/warehouse/zones/batch",
    validateBody(
      z.object({
        quantity: z.number().int().positive(),
        code_prefix: z.string(),
        name_prefix: z.string(),
      })
    ),
    (req, res) => {
      res.status(201).json({ generated: [] });
    }
  );

  return router;
}

// ============================================================================
// Pattern 5: Complex Operation Routes
// ============================================================================

export function createComplexOperationRoutes() {
  const router = Router();

  // Create entity with nested items
  router.post(
    "/purchases",
    validateBody(
      z.object({
        supplier_id: z.string().uuid(),
        items: z
          .array(
            z.object({
              supplier_medication_variant_id: z.string().uuid(),
              quantity: z.number().int().positive(),
              unit_price: z.number().nonnegative(),
            })
          )
          .min(1),
      })
    ),
    (req, res) => {
      res.status(201).json(req.body);
    }
  );

  // Multi-step operation
  router.post(
    "/inventory/move",
    validateBody(
      z.object({
        fromInventoryId: z.string().uuid(),
        toBinId: z.string().uuid(),
        quantity: z.number().nonnegative(),
        reason: z.string().min(1),
      })
    ),
    (req, res) => {
      res.json({ message: "Inventory moved" });
    }
  );

  return router;
}

// ============================================================================
// Pattern 6: Custom Validation Middleware
// ============================================================================

export function createCustomValidation() {
  // Validate and transform
  const validateAndTransform = (schema, transformer) => {
    return (req, res, next) => {
      try {
        const validated = schema.parse(req.body);
        req.body = transformer(validated);
        next();
      } catch (error) {
        res.status(400).json({ error: error.errors });
      }
    };
  };

  // Conditional validation
  const conditionalValidate = (condition, schema) => {
    return (req, res, next) => {
      if (condition(req)) {
        return validateBody(schema)(req, res, next);
      }
      next();
    };
  };

  // Validate with context
  const validateWithContext = (schema, context) => {
    return (req, res, next) => {
      try {
        req.body = schema.parse(req.body, { context });
        next();
      } catch (error) {
        res.status(400).json({ error: error.errors });
      }
    };
  };

  return {
    validateAndTransform,
    conditionalValidate,
    validateWithContext,
  };
}

// ============================================================================
// Usage Examples
// ============================================================================

// Create user CRUD routes
const userRouter = createCrudRoutes("users", {
  listQuerySchema: users.listUsersQuerySchema,
  createRequestSchema: users.createUsersRequestSchema,
  updateRequestSchema: users.updateUserRequestSchema,
});

// Create medication variants routes (nested under medications)
const variantRouter = createNestedRoutes("medications", "variants", {
  listQuerySchema: medications.listVariantsQuerySchema,
  createRequestSchema: medications.createVariantsRequestSchema,
  updateRequestSchema: medications.updateVariantRequestSchema,
});

// Create auth routes
const authRouter = createAuthRoutes();

export { userRouter, variantRouter, authRouter };

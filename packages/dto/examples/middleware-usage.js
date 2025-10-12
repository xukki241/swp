/**
 * Examples of using the validation middleware with Express routes
 */

import express from "express";
import {
  validate,
  validateBody,
  validateQuery,
  validateParams,
  users,
  auth,
  medications,
  warehouse,
  purchases,
  sales,
  inventory,
} from "../src/core";
import { z } from "zod";

const app = express();
app.use(express.json());

// ============================================================================
// Example 1: Validate Request Body
// ============================================================================

app.post(
  "/api/auth/login",
  validateBody(auth.loginRequestSchema),
  (req, res) => {
    // req.body is now validated and typed
    const { email, password } = req.body;
    // ... handle login
    res.json({ message: "Login successful" });
  }
);

// ============================================================================
// Example 2: Validate Query Parameters (with pagination)
// ============================================================================

app.get("/api/users", validateQuery(users.listUsersQuerySchema), (req, res) => {
  // req.query is now validated with pagination
  const { page, limit, sortBy, sortOrder, role, status } = req.query;
  // ... fetch users with pagination
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
});

// ============================================================================
// Example 3: Validate Route Parameters
// ============================================================================

const uuidParamSchema = z.object({
  id: z.string().uuid(),
});

app.get("/api/users/:id", validateParams(uuidParamSchema), (req, res) => {
  // req.params.id is now validated as UUID
  const { id } = req.params;
  // ... fetch user by id
  res.json({ id, name: "John Doe" });
});

// ============================================================================
// Example 4: Validate Multiple Parts (body + params)
// ============================================================================

app.patch(
  "/api/users/:id",
  validate({
    params: uuidParamSchema,
    body: users.updateUserRequestSchema,
  }),
  (req, res) => {
    // Both params and body are validated
    const { id } = req.params;
    const updates = req.body;
    // ... update user
    res.json({ id, ...updates });
  }
);

// ============================================================================
// Example 5: Validate Complex Operations
// ============================================================================

// Create purchase order with items
app.post(
  "/api/purchases",
  validateBody(purchases.createPurchaseOrdersRequestSchema),
  (req, res) => {
    // req.body is array of purchase orders with items
    const orders = req.body;
    // ... create purchase orders
    res.status(201).json(orders);
  }
);

// Create receipt with items (auto-creates inventory)
app.post(
  "/api/purchases/:purchaseOrderId/receipts",
  validate({
    params: z.object({ purchaseOrderId: z.string().uuid() }),
    body: purchases.createReceiptRequestSchema,
  }),
  (req, res) => {
    const { purchaseOrderId } = req.params;
    const { items } = req.body;
    // ... create receipt and inventory
    res.status(201).json({ purchaseOrderId, items });
  }
);

// ============================================================================
// Example 6: Batch Creation
// ============================================================================

// Create multiple users at once
app.post(
  "/api/users",
  validateBody(users.createUsersRequestSchema),
  (req, res) => {
    // req.body is array of users
    const usersToCreate = req.body;
    // ... create users
    res.status(201).json(usersToCreate);
  }
);

// Auto-generate warehouse bins
app.post(
  "/api/warehouse/racks/:rackId/bins/batch",
  validate({
    params: z.object({ rackId: z.string().uuid() }),
    body: warehouse.batchCreateBinsRequestSchema,
  }),
  (req, res) => {
    const { rackId } = req.params;
    const { mode, levels, binsPerLevel, binsPerLevelList } = req.body;
    // ... auto-generate bins
    res.status(201).json({ rackId, mode, generated: [] });
  }
);

// ============================================================================
// Example 7: Inventory Operations
// ============================================================================

// Adjust inventory
app.patch(
  "/api/inventory/:id/adjust",
  validate({
    params: uuidParamSchema,
    body: inventory.adjustInventoryRequestSchema,
  }),
  (req, res) => {
    const { id } = req.params;
    const { newQuantity, reason } = req.body;
    // ... adjust inventory
    res.json({ id, newQuantity, reason });
  }
);

// Move inventory
app.post(
  "/api/inventory/move",
  validateBody(inventory.moveInventoryRequestSchema),
  (req, res) => {
    const { fromInventoryId, toBinId, quantity, reason } = req.body;
    // ... move inventory
    res.json({ message: "Inventory moved successfully" });
  }
);

// ============================================================================
// Example 8: Sales Order with Items
// ============================================================================

app.post(
  "/api/sales",
  validateBody(sales.createSalesOrderRequestSchema),
  (req, res) => {
    const { customer_id, payment_method, items } = req.body;
    // ... create sales order with items
    res.status(201).json({ customer_id, payment_method, items });
  }
);

// ============================================================================
// Example 9: Medication Variants with Pagination
// ============================================================================

app.get(
  "/api/medications/:medicationId/variants",
  validate({
    params: z.object({ medicationId: z.string().uuid() }),
    query: medications.listVariantsQuerySchema,
  }),
  (req, res) => {
    const { medicationId } = req.params;
    const { page, limit, sortBy, sortOrder, isActive, isForSale } = req.query;
    // ... fetch variants with pagination
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

// ============================================================================
// Example 10: Password Operations
// ============================================================================

// Change password
app.post(
  "/api/auth/change-password",
  validateBody(auth.changePasswordRequestSchema),
  (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // ... change password
    res.json({ message: "Password changed successfully" });
  }
);

// Reset password
app.post(
  "/api/auth/reset-password",
  validateBody(auth.resetPasswordRequestSchema),
  (req, res) => {
    const { token, newPassword } = req.body;
    // ... reset password
    res.json({ message: "Password reset successfully" });
  }
);

// ============================================================================
// Example 11: Error Handling
// ============================================================================

// Validation errors are automatically formatted and returned as 400 responses
// Example error response:
// {
//   "error": "Validation failed",
//   "details": {
//     "email": ["Invalid email format"],
//     "password": ["String must contain at least 8 character(s)"]
//   },
//   "issues": [
//     {
//       "path": ["email"],
//       "message": "Invalid email format",
//       "code": "invalid_string"
//     },
//     {
//       "path": ["password"],
//       "message": "String must contain at least 8 character(s)",
//       "code": "too_small"
//     }
//   ]
// }

// ============================================================================
// Export for use in routes
// ============================================================================

export default app;

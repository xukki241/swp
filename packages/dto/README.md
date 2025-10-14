# @pharmaflow/dto

Zod validation schemas for PharmaFlow API, organized by endpoint with built-in pagination support.

## Overview

This package provides comprehensive Zod validation schemas for the PharmaFlow API. All schemas are organized by endpoint and include:

- ✅ Request/Response validation for each API endpoint
- ✅ Built-in pagination support for all list endpoints
- ✅ Database schema alignment
- ✅ Type-safe schemas with Zod
- ✅ Organized folder structure matching API routes

## Installation

```bash
pnpm add @pharmaflow/dto
```

## Usage

### Basic Example

```javascript
import { auth, users, medications, warehouse } from "@pharmaflow/dto";

// Validate login request
const loginData = auth.loginRequestSchema.parse({
  email: "staff@example.com",
  password: "password123",
});

// Validate user creation
const newUser = users.createUserSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  phone: "0123456789",
  password: "password123",
  role: "staff",
});

// Validate medication variant query with pagination
const query = medications.listVariantsQuerySchema.parse({
  page: 1,
  limit: 10,
  sortBy: "name",
  sortOrder: "asc",
  isActive: true,
});
```

### Pagination

All list endpoints support pagination via `paginationSchema`:

```javascript
import { paginationSchema } from "@pharmaflow/dto";

// Query parameters
const query = {
  page: 1, // Default: 1
  limit: 10, // Default: 10, Max: 100
  sortBy: "createdAt", // Optional
  sortOrder: "desc", // Default: "asc"
};

// Response format
const response = {
  data: [...], // Array of items
  pagination: {
    page: 1,
    limit: 10,
    total: 150,
    totalPages: 15,
    hasMore: true,
  },
};
```

## Endpoint Structure

### Authentication (`/api/auth`)

```javascript
import { auth } from "@pharmaflow/dto";

// POST /api/auth/register
auth.registerRequestSchema;
auth.registerResponseSchema;

// POST /api/auth/login
auth.loginRequestSchema;
auth.loginResponseSchema;

// POST /api/auth/forgot-password
auth.forgotPasswordRequestSchema;
auth.forgotPasswordResponseSchema;

// POST /api/auth/reset-password
auth.resetPasswordRequestSchema;
auth.resetPasswordResponseSchema;

// POST /api/auth/change-password
auth.changePasswordRequestSchema;
auth.changePasswordResponseSchema;

// POST /api/auth/refresh-token
auth.refreshTokenRequestSchema;
auth.refreshTokenResponseSchema;

// GET /api/auth/me
auth.meResponseSchema;
```

### Users (`/api/users`)

```javascript
import { users } from "@pharmaflow/dto";

// POST /api/users (batch)
users.createUserSchema;
users.createUsersRequestSchema;
users.createUsersResponseSchema;

// GET /api/users (with pagination)
users.listUsersQuerySchema;
users.listUsersResponseSchema;

// GET /api/users/:id
users.getUserResponseSchema;

// PATCH /api/users/:id
users.updateUserRequestSchema;
users.updateUserResponseSchema;

// DELETE /api/users/:id
users.deleteUserResponseSchema;

// Registration management
// GET /api/users/registrations
users.listRegistrationsQuerySchema;
users.listRegistrationsResponseSchema;

// POST /api/users/registrations/:id/approve
users.approveRegistrationRequestSchema;
users.approveRegistrationResponseSchema;

// POST /api/users/registrations/:id/reject
users.rejectRegistrationResponseSchema;
```

### Medications (`/api/medications`)

```javascript
import { medications } from "@pharmaflow/dto";

// Medications
medications.createMedicationSchema;
medications.listMedicationsQuerySchema;
medications.getMedicationResponseSchema;
medications.updateMedicationRequestSchema;
medications.deleteMedicationResponseSchema;

// Variants
medications.createVariantSchema;
medications.listVariantsQuerySchema;
medications.getVariantResponseSchema;
medications.updateVariantRequestSchema;
medications.deleteVariantResponseSchema;
medications.getVariantInventoryResponseSchema;
```

### Warehouse (`/api/warehouse`)

```javascript
import { warehouse } from "@pharmaflow/dto";

// Zones
warehouse.createZoneSchema;
warehouse.batchCreateZonesRequestSchema; // Auto-generate zones
warehouse.listZonesQuerySchema;
warehouse.getZoneResponseSchema;
warehouse.updateZoneRequestSchema;
warehouse.deleteZoneResponseSchema;

// Racks
warehouse.createRackSchema;
warehouse.batchCreateRacksRequestSchema; // Auto-generate racks
warehouse.listRacksQuerySchema;
warehouse.getRackResponseSchema;
warehouse.updateRackRequestSchema;
warehouse.deleteRackResponseSchema;

// Bins
warehouse.createBinSchema;
warehouse.batchCreateBinsRequestSchema; // Grid or list mode
warehouse.listBinsQuerySchema;
warehouse.getBinResponseSchema;
warehouse.getBinInventoryResponseSchema;
warehouse.updateBinRequestSchema;
warehouse.deleteBinResponseSchema;
```

### Purchases (`/api/purchases`)

```javascript
import { purchases } from "@pharmaflow/dto";

// Purchase Orders
purchases.createPurchaseOrderSchema; // With items
purchases.listPurchaseOrdersQuerySchema;
purchases.getPurchaseOrderResponseSchema;
purchases.updatePurchaseOrderRequestSchema;
purchases.deletePurchaseOrderResponseSchema;

// Receipts
purchases.createReceiptRequestSchema; // With items, auto-creates inventory
purchases.listReceiptsQuerySchema;
purchases.getReceiptResponseSchema;
```

### Inventory (`/api/inventory`)

```javascript
import { inventory } from "@pharmaflow/dto";

// GET /api/inventory
inventory.listInventoryQuerySchema;
inventory.listInventoryResponseSchema;

// GET /api/inventory/:id
inventory.getInventoryResponseSchema;

// PATCH /api/inventory/:id/adjust
inventory.adjustInventoryRequestSchema;
inventory.adjustInventoryResponseSchema;

// POST /api/inventory/move
inventory.moveInventoryRequestSchema;
inventory.moveInventoryResponseSchema;
```

### Sales (`/api/sales`)

```javascript
import { sales } from "@pharmaflow/dto";

// POST /api/sales (with items)
sales.createSalesOrderRequestSchema;
sales.createSalesOrderResponseSchema;

// GET /api/sales
sales.listSalesOrdersQuerySchema;
sales.listSalesOrdersResponseSchema;

// GET /api/sales/:id
sales.getSalesOrderResponseSchema;

// PATCH /api/sales/:id
sales.updateSalesOrderRequestSchema;
sales.updateSalesOrderResponseSchema;

// DELETE /api/sales/:id
sales.deleteSalesOrderResponseSchema;
```

### Suppliers (`/api/suppliers`)

```javascript
import { suppliers } from "@pharmaflow/dto";

// Suppliers
suppliers.createSupplierSchema;
suppliers.listSuppliersQuerySchema;
suppliers.getSupplierResponseSchema;
suppliers.updateSupplierRequestSchema;
suppliers.deleteSupplierResponseSchema;

// Supplier Medications
suppliers.createSupplierMedicationSchema;
suppliers.listSupplierMedicationsQuerySchema;
suppliers.updateSupplierMedicationRequestSchema;
suppliers.deleteSupplierMedicationResponseSchema;
```

### Customers (`/api/customers`)

```javascript
import { customers } from "@pharmaflow/dto";

customers.createCustomerSchema;
customers.listCustomersQuerySchema;
customers.getCustomerResponseSchema;
customers.updateCustomerRequestSchema;
customers.deleteCustomerResponseSchema;
```

### Reports (`/api/reports`)

```javascript
import { reports } from "@pharmaflow/dto";

reports.createReportRequestSchema;
reports.listReportsQuerySchema;
reports.getReportResponseSchema;
reports.deleteReportResponseSchema;
```

## Common Schemas

```javascript
import {
  // Base types
  uuidSchema,
  nameSchema,
  emailSchema,
  phoneSchema,
  addressSchema,
  descriptionSchema,
  codeSchema,

  // Numeric types
  intSchema,
  positiveIntSchema,
  nonNegativeIntSchema,
  decimalSchema,
  positiveDecimalSchema,

  // Date/Time
  dateSchema,
  timestampSchema,

  // Other
  booleanSchema,
  jsonSchema,

  // Pagination
  paginationSchema,
  paginatedResponseSchema,

  // Enums
  userRoleEnum,
  userStatusEnum,
  userRegistrationStatusEnum,
  warehouseZoneTypeEnum,
  medicationStatusEnum,
  supplierStatusEnum,
  purchaseOrderStatusEnum,
  salesOrderStatusEnum,
  salesOrderPaymentMethodEnum,
  reportTypeEnum,
  resetMethodEnum,
} from "@pharmaflow/dto";
```

## Features

### Database Alignment

All schemas are aligned with the database schema using Drizzle ORM conventions:

- UUIDs for all IDs
- Proper nullable/optional fields
- Correct data types (decimal, date, timestamp, json)
- Enum values matching database enums

### Batch Operations

Support for batch creation of entities:

```javascript
// Create multiple users at once
const users = [
  { name: "User 1", email: "user1@example.com", ... },
  { name: "User 2", email: "user2@example.com", ... },
];
users.createUsersRequestSchema.parse(users);

// Auto-generate warehouse zones
warehouse.batchCreateZonesRequestSchema.parse({
  quantity: 5,
  code_prefix: "ZONE",
  name_prefix: "Zone",
});

// Auto-generate bins (grid mode)
warehouse.batchCreateBinsRequestSchema.parse({
  mode: "grid",
  levels: 3,
  binsPerLevel: 4,
});

// Auto-generate bins (list mode)
warehouse.batchCreateBinsRequestSchema.parse({
  mode: "list",
  binsPerLevelList: [2, 3, 4],
});
```

### Complex Operations

Schemas for operations involving multiple entities:

```javascript
// Create purchase order with items
purchases.createPurchaseOrderSchema.parse({
  supplier_id: "uuid",
  items: [
    {
      supplier_medication_variant_id: "uuid",
      quantity: 100,
      unit_price: 10000,
    },
  ],
});

// Create receipt with items (auto-creates inventory)
purchases.createReceiptRequestSchema.parse({
  items: [
    {
      purchase_order_item_id: "uuid",
      quantity: 100,
      bin_id: "uuid",
      batch_number: "L012345",
      expiry_date: "2026-01-01",
    },
  ],
});

// Create sales order with items
sales.createSalesOrderRequestSchema.parse({
  customer_id: "uuid",
  payment_method: "cash",
  items: [
    {
      medication_variant_id: "uuid",
      quantity: 2,
    },
  ],
});
```

## Error Handling

```javascript
import { ZodError } from "zod";

try {
  const user = users.createUserSchema.parse(userData);
} catch (error) {
  if (error instanceof ZodError) {
    console.log(error.errors);
    // [{
    //   path: ['email'],
    //   message: 'Invalid email format',
    //   code: 'invalid_string'
    // }]
  }
}

// Use safeParse for non-throwing validation
const result = users.createUserSchema.safeParse(userData);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.errors);
}
```

## TypeScript Support

```typescript
import { z } from "zod";
import { users } from "@pharmaflow/dto";

type User = z.infer<typeof users.userSchema>;
type CreateUser = z.infer<typeof users.createUserSchema>;
type UpdateUser = z.infer<typeof users.updateUserRequestSchema>;
```

## License

Private

# @pharmaflow/dto

Zod validation schemas for PharmaFlow database entities.

## Overview

This package provides comprehensive Zod validation schemas generated from the Drizzle ORM database schemas. It includes validators for all entities, enums, and common fields used throughout the application.

## Installation

This package is part of the monorepo and is automatically available to other packages.

```bash
pnpm add zod
```

## Usage

### Basic Entity Validation

```javascript
import {
  createUserSchema,
  updateUserSchema,
  userSchema,
} from "@pharmaflow/dto";

// Validate user creation
const newUser = createUserSchema.parse({
  name: "John Doe",
  email: "john@example.com",
  phone: "1234567890",
  role: "staff",
  status: "active",
});

// Validate user update (all fields optional)
const updatedUser = updateUserSchema.parse({
  name: "Jane Doe",
});

// Validate complete user object (with ID)
const user = userSchema.parse({
  id: "1",
  name: "John Doe",
  email: "john@example.com",
  // ... other fields
});
```

### Query Validation

```javascript
import { userQuerySchema, medicationQuerySchema } from "@pharmaflow/dto";

// Validate query parameters
const userQuery = userQuerySchema.parse({
  email: "john@example.com",
  status: "active",
});

const medicationQuery = medicationQuerySchema.parse({
  status: "active",
  isPrescriptionRequired: true,
});
```

### Common Field Validators

```javascript
import {
  nameSchema,
  emailSchema,
  phoneSchema,
  positiveDecimalSchema,
} from "@pharmaflow/dto";

// Validate individual fields
const name = nameSchema.parse("John Doe"); // max 100 chars
const email = emailSchema.parse("john@example.com"); // valid email format
const phone = phoneSchema.parse("1234567890"); // exactly 10 digits
const price = positiveDecimalSchema.parse("99.99"); // positive decimal
```

### Enum Validation

```javascript
import {
  userRoleSchema,
  userStatusSchema,
  medicationStatusSchema,
  salesOrderPaymentMethodSchema,
} from "@pharmaflow/dto";

const role = userRoleSchema.parse("staff"); // owner, staff, or sales
const status = userStatusSchema.parse("active"); // active, inactive, or suspended
const paymentMethod = salesOrderPaymentMethodSchema.parse("cash"); // cash, bank_transfer, etc.
```

## Available Schemas

### Entities

Each entity has multiple schema variants:

- **Base Schema**: Core fields without ID
- **Schema**: Complete entity with ID
- **Create Schema**: For POST requests (no ID, optimized defaults)
- **Update Schema**: For PUT/PATCH requests (all fields optional)
- **Query Schema**: For filtering and search parameters

#### User Schemas

- `userBaseSchema`
- `userSchema`
- `createUserSchema`
- `updateUserSchema`
- `userQuerySchema`

#### Customer Schemas

- `customerBaseSchema`
- `customerSchema`
- `createCustomerSchema`
- `updateCustomerSchema`
- `customerQuerySchema`

#### Medication Schemas

- `medicationBaseSchema`
- `medicationSchema`
- `createMedicationSchema`
- `updateMedicationSchema`
- `medicationQuerySchema`

#### Medication Variant Schemas

- `medicationVariantBaseSchema`
- `medicationVariantSchema`
- `createMedicationVariantSchema`
- `updateMedicationVariantSchema`
- `medicationVariantQuerySchema`

#### Supplier Schemas

- `supplierBaseSchema`
- `supplierSchema`
- `createSupplierSchema`
- `updateSupplierSchema`
- `supplierQuerySchema`

#### Warehouse Schemas

- `warehouseZoneBaseSchema`, `warehouseZoneSchema`, etc.
- `warehouseRackBaseSchema`, `warehouseRackSchema`, etc.
- `warehouseBinBaseSchema`, `warehouseBinSchema`, etc.

#### Inventory Schemas

- `inventoryBaseSchema`
- `inventorySchema`
- `createInventorySchema`
- `updateInventorySchema`
- `inventoryQuerySchema`

#### Order Schemas

- `purchaseOrderBaseSchema`, `purchaseOrderSchema`, etc.
- `salesOrderBaseSchema`, `salesOrderSchema`, etc.

### Enums

- `userRoleSchema`: owner, staff, sales
- `userStatusSchema`: active, inactive, suspended
- `userRegistrationStatusSchema`: pending, approved, rejected
- `warehouseZoneTypeSchema`: normal, cold, hazard, quarantine
- `medicationStatusSchema`: active, inactive, discontinued
- `reportTypeSchema`: inventory, sales, purchase, custom
- `supplierStatusSchema`: active, inactive, blacklisted
- `purchaseOrderStatusSchema`: pending, ordered, received, cancelled
- `salesOrderStatusSchema`: pending, paid, delivered, cancelled
- `salesOrderPaymentMethodSchema`: cash, bank_transfer, credit_card, mobile_payment

### Common Validators

- `idSchema`: Validates bigint, string, or number IDs
- `nameSchema`: String, 1-100 characters
- `descriptionSchema`: Optional text
- `codeSchema`: String, 1-50 characters
- `emailSchema`: Valid email format, max 255 characters
- `phoneSchema`: Exactly 10 digits
- `addressSchema`: Optional text
- `timestampSchema`: ISO datetime string or Date object
- `dateSchema`: ISO date string or Date object
- `booleanSchema`: Boolean value
- `decimalSchema`: Numeric string or number
- `positiveDecimalSchema`: Positive numeric string or number

## Error Handling

```javascript
import { z } from "zod";
import { createUserSchema } from "@pharmaflow/dto";

try {
  const user = createUserSchema.parse(userData);
  // Valid data
} catch (error) {
  if (error instanceof z.ZodError) {
    console.log(error.errors);
    // Handle validation errors
  }
}

// Or use safeParse
const result = createUserSchema.safeParse(userData);
if (result.success) {
  console.log(result.data);
} else {
  console.log(result.error.errors);
}
```

## TypeScript Support

While this project uses JavaScript, Zod provides excellent TypeScript inference:

```typescript
import type { z } from "zod";
import { userSchema } from "@pharmaflow/dto";

type User = z.infer<typeof userSchema>;
```

## Validation Rules

### Email

- Must be valid email format
- Max 255 characters
- Optional (nullable)

### Phone

- Must be exactly 10 digits
- Regex: `/^\d{10}$/`
- Optional (nullable)

### Name

- Required (unless in update schemas)
- Min 1 character
- Max 100 characters

### Code

- Required (unless in update schemas)
- Min 1 character
- Max 50 characters

### Decimal/Numeric Fields

- Accepts string or number
- Must match decimal pattern: `/^\d+(\.\d+)?$/`
- Positive variants must be >= 0

### Dates

- Accepts ISO date string or Date object
- Format: `YYYY-MM-DD`

### Timestamps

- Accepts ISO datetime string or Date object
- Format: `YYYY-MM-DDTHH:mm:ss.sssZ`

## Development

The schemas are automatically generated based on the Drizzle ORM schemas in `apps/api/src/db/schema/`.

When database schemas change, regenerate the validation schemas to keep them in sync.

## License

Private

# Customer OpenAPI Specification - Implementation Summary

## Overview

Completed OpenAPI specification for all customer endpoints based on:

- DTO schemas from `packages/dto/src/core/customers/customer.js`
- Database schema from `apps/api/src/db/schema/customers.js`
- Route definitions from `apps/api/src/routes/customerRoutes.js`

## Files Created

### Component Schemas

- **`components/customers/customer-schemas.yaml`**
  - Customer (main schema)
  - CreateCustomer (for creating customers)
  - CreateCustomersRequest (batch creation array)
  - CreateCustomersResponse (batch creation response)
  - UpdateCustomer (partial update)
  - CustomerListResponse (paginated list)

### Path Definitions (2 files, 5 operations)

1. **`paths/customers/customers.yaml`**
   - `GET /customers` - List all customers with filtering
     - Query params: page, limit, sortBy, sortOrder, name, email, phone
   - `POST /customers` - Create customer(s) (single or batch)
     - Accepts both single customer object and array of customers
     - Returns single customer or array based on input

2. **`paths/customers/customers-customerId.yaml`**
   - `GET /customers/{customerId}` - Get customer by ID
   - `PATCH /customers/{customerId}` - Update customer
   - `DELETE /customers/{customerId}` - Delete customer (Owner only)

### Main OpenAPI File

- **`openapi.yaml`** - Updated to reference customer endpoints

## Schema Details

### Customer Object

```yaml
id: UUID (required)
name: string (1-100 chars) (required)
email: string (email format, max 255 chars) (required)
phone: string (10 digits pattern) (required)
address: string (nullable) (required)
```

### Database Constraints

- Unique email per customer
- Unique phone per customer

## Security

- **Authentication**: All endpoints require Bearer token (`bearerAuth`)
- **Authorization**:
  - DELETE operation requires Owner role
  - All other operations accessible to authenticated users

## Special Features

### Flexible POST Endpoint

The `POST /customers` endpoint accepts both:

- **Single Customer**: `{ name, email, phone, address }`
- **Array of Customers**: `[{ name, email, phone, address }, ...]`

Returns matching format (single object or array).

## Route Alignment

All OpenAPI endpoints align with the actual API routes in `customerRoutes.js`:

- ✅ GET /customers
- ✅ GET /customers/:id
- ✅ POST /customers (single or batch)
- ✅ PATCH /customers/:id
- ✅ DELETE /customers/:id

## Response References

All error responses use the "Error" suffix convention:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`
- `InternalServerError`

## Consistency with Existing Patterns

The implementation follows the same patterns as:

- Medications module (component schemas and path structure)
- Warehouse module (naming conventions and parameter references)
- Inventory module (response handling)
- Common components (schemas, parameters, responses)

## Example Requests

### Create Single Customer

```json
POST /customers
{
  "name": "John Doe",
  "email": "john.doe@example.com",
  "phone": "0123456789",
  "address": "123 Main Street, City, Country"
}
```

### Create Multiple Customers

```json
POST /customers
[
  {
    "name": "John Doe",
    "email": "john.doe@example.com",
    "phone": "0123456789",
    "address": "123 Main Street, City, Country"
  },
  {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "phone": "0987654321",
    "address": "456 Oak Avenue, City, Country"
  }
]
```

### Update Customer

```json
PATCH /customers/{customerId}
{
  "name": "John Doe Jr.",
  "address": "789 New Street, City, Country"
}
```

## Next Steps

1. ✅ Customer module OpenAPI specs complete
2. Consider adding customer-related endpoints (e.g., customer orders history)
3. Validate OpenAPI spec using Swagger Editor
4. Generate API documentation from the OpenAPI spec

# Sales OpenAPI Specification - Implementation Summary

## Overview

Completed OpenAPI specification for all sales order endpoints based on:

- DTO schemas from `packages/dto/src/core/sales/order.js`
- Database schemas from `apps/api/src/db/schema/salesOrders.js` and `salesOrderItems.js`
- Route definitions from `apps/api/src/routes/salesOrderRoutes.js`

## Files Created

### Component Schemas

- **`components/sales/sales-order-schemas.yaml`**
  - SalesOrder (main schema)
  - SalesOrderItem (order line item)
  - SalesOrderWithItems (order with items array)
  - CreateSalesOrderItem (item for order creation)
  - CreateSalesOrderRequest (create new order)
  - UpdateSalesOrderRequest (update order status)
  - SalesOrderListResponse (paginated list)

### Path Definitions (2 files, 5 operations)

1. **`paths/sales/sales.yaml`**
   - `GET /sales` - List all sales orders with filtering
     - Query params: page, limit, sortBy, sortOrder, customerId, status, paymentMethod, salespersonId, orderDateFrom, orderDateTo
   - `POST /sales` - Create new sales order with items
     - Request body: customer_id, payment_method, items[]

2. **`paths/sales/sales-salesOrderId.yaml`**
   - `GET /sales/{salesOrderId}` - Get sales order by ID (includes items)
   - `PATCH /sales/{salesOrderId}` - Update sales order status
   - `DELETE /sales/{salesOrderId}` - Cancel sales order

### Main OpenAPI File

- **`openapi.yaml`** - Updated to reference sales endpoints

## Schema Details

### SalesOrder Object

```yaml
id: UUID (required)
customerId: UUID (required)
orderDate: DateTime (required)
totalAmount: Decimal (required)
status: enum [pending, paid, delivered, cancelled] (required)
paymentMethod: enum [cash, bank_transfer, credit_card, mobile_payment] (required)
salespersonId: UUID (nullable, optional)
```

### SalesOrderItem Object

```yaml
id: UUID (required)
salesOrderId: UUID (required)
medicationVariantId: UUID (required)
quantity: Integer (required)
unitPrice: Decimal (required)
totalPrice: Decimal (required)
```

### Create Sales Order Request

```yaml
customer_id: UUID (required)
payment_method: enum (default: cash)
items: Array[CreateSalesOrderItem] (min 1 item required)
  - medication_variant_id: UUID (required)
  - quantity: Integer (required)
```

## Enums

### SalesOrderStatus

- `pending` - Order created, awaiting payment
- `paid` - Payment received
- `delivered` - Order delivered to customer
- `cancelled` - Order cancelled

### SalesOrderPaymentMethod

- `cash` - Cash payment
- `bank_transfer` - Bank transfer
- `credit_card` - Credit card payment
- `mobile_payment` - Mobile payment (e.g., e-wallet)

## Security

- **Authentication**: All endpoints require Bearer token (`bearerAuth`)
- **Authorization**: All authenticated users can access sales endpoints

## Special Features

### Multi-Item Orders

The `POST /sales` endpoint accepts an array of items, allowing creation of orders with multiple line items in a single request.

### Status Tracking

Orders can be updated through different status stages:

1. `pending` → Initial state
2. `paid` → Payment received
3. `delivered` → Order fulfilled
4. `cancelled` → Order cancelled (at any stage)

### Rich Filtering

The list endpoint supports comprehensive filtering by:

- Customer
- Order status
- Payment method
- Salesperson
- Date range

## Route Alignment

All OpenAPI endpoints align with the actual API routes in `salesOrderRoutes.js`:

- ✅ GET /sales
- ✅ GET /sales/:id
- ✅ POST /sales
- ✅ PATCH /sales/:id
- ✅ DELETE /sales/:id

## Response References

All error responses use the "Error" suffix convention:

- `BadRequestError`
- `UnauthorizedError`
- `NotFoundError`
- `InternalServerError`

## Consistency with Existing Patterns

The implementation follows the same patterns as:

- Customers module (CRUD operations)
- Inventory module (filtering and pagination)
- Medications module (component schemas structure)
- Common components (schemas, parameters, responses, enums)

## Example Requests

### Create Sales Order

```json
POST /sales
{
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": "660e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    },
    {
      "medication_variant_id": "770e8400-e29b-41d4-a716-446655440002",
      "quantity": 1
    }
  ]
}
```

### Update Order Status

```json
PATCH /sales/{salesOrderId}
{
  "status": "paid"
}
```

### List Orders with Filters

```
GET /sales?customerId=550e8400-e29b-41d4-a716-446655440000&status=paid&page=1&limit=10
```

## Database Relationships

- Sales orders belong to a customer
- Sales orders may have a salesperson
- Sales orders contain multiple order items
- Order items reference medication variants

## Next Steps

1. ✅ Sales module OpenAPI specs complete
2. Consider adding sales analytics endpoints
3. Consider adding order fulfillment/delivery tracking
4. Validate OpenAPI spec using Swagger Editor
5. Generate API documentation from the OpenAPI spec

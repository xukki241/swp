# Sales API Implementation

## Overview

This document describes the implementation of the Sales Order and Customer management endpoints for the PharmaFlow API. The implementation follows the same architectural pattern as the Warehouse module.

**Implementation Date:** October 12, 2025  
**Pattern Reference:** Warehouse module structure  
**Status:** ✅ Complete

---

## Architecture

The implementation follows a three-layer architecture:

```
Routes Layer (Validation & Routing)
    ↓
Controller Layer (Request Handling)
    ↓
Service Layer (Business Logic & Database Operations)
```

---

## Files Created

### Sales Order Module

1. **Service Layer**
   - `apps/api/src/services/salesOrderService.js` - Business logic for sales orders

2. **Controller Layer**
   - `apps/api/src/controllers/salesOrderController.js` - HTTP request handlers

3. **Routes Layer**
   - `apps/api/src/routes/salesOrderRoutes.js` - Route definitions with validation

### Customer Module

1. **Service Layer**
   - `apps/api/src/services/customerService.js` - Business logic for customers

2. **Controller Layer**
   - `apps/api/src/controllers/customerController.js` - HTTP request handlers

3. **Routes Layer**
   - `apps/api/src/routes/customerRoutes.js` - Route definitions with validation

### Integration

- Updated `apps/api/src/routes/index.js` to register sales and customer routes

---

## API Endpoints

### Sales Orders

| Method | Endpoint         | Description               | Auth Required | Role |
| ------ | ---------------- | ------------------------- | ------------- | ---- |
| GET    | `/api/sales`     | List all sales orders     | ✅            | All  |
| GET    | `/api/sales/:id` | Get sales order details   | ✅            | All  |
| POST   | `/api/sales`     | Create new sales order    | ✅            | All  |
| PATCH  | `/api/sales/:id` | Update sales order status | ✅            | All  |
| DELETE | `/api/sales/:id` | Cancel sales order        | ✅            | All  |

### Customers

| Method | Endpoint             | Description          | Auth Required | Role       |
| ------ | -------------------- | -------------------- | ------------- | ---------- |
| GET    | `/api/customers`     | List all customers   | ✅            | All        |
| GET    | `/api/customers/:id` | Get customer details | ✅            | All        |
| POST   | `/api/customers`     | Create customer(s)   | ✅            | All        |
| PATCH  | `/api/customers/:id` | Update customer      | ✅            | All        |
| DELETE | `/api/customers/:id` | Delete customer      | ✅            | Owner only |

---

## Features

### Sales Order Management

#### 1. **Automatic Inventory Management**

- **Inventory Reservation (FEFO - First Expiry First Out)**
  - When a sales order is created, inventory is automatically reserved
  - Uses First Expiry First Out strategy to minimize waste
  - Validates sufficient inventory before order creation
- **Inventory Deduction**
  - When order status changes to `completed`, reserved inventory is deducted
- **Inventory Unreservation**
  - When order is cancelled or deleted, reserved inventory is released

#### 2. **Order Status Flow**

```
pending → completed (inventory deducted)
pending → cancelled (inventory unreserved)
```

#### 3. **Automatic Price Calculation**

- Fetches current sell price from medication variants
- Calculates line item totals
- Computes order total amount

#### 4. **Validation**

- Validates medication variant exists and is active
- Checks if medication is available for sale (`isForSale` flag)
- Verifies sufficient inventory availability
- Ensures order has at least one item

### Customer Management

#### 1. **Batch Operations**

- Supports creating single customer or multiple customers in one request
- Validates unique email and phone constraints

#### 2. **Sales History**

- Customer details include their sales order history
- Shows order date, amount, status, and payment method

#### 3. **Delete Protection**

- Cannot delete customers with existing sales orders
- Provides clear error message with order count

---

## Request/Response Examples

### Create Sales Order

**Request:**

```json
POST /api/sales
{
  "customer_id": 1,
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": 1,
      "quantity": 2
    },
    {
      "medication_variant_id": 3,
      "quantity": 5
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "orderDate": "2025-10-12T10:30:00.000Z",
    "totalAmount": 125000,
    "status": "pending",
    "paymentMethod": "cash",
    "salespersonId": 2,
    "items": [
      {
        "id": 1,
        "salesOrderId": 1,
        "medicationVariantId": 1,
        "quantity": 2,
        "unitPrice": 15000,
        "totalPrice": 30000
      },
      {
        "id": 2,
        "salesOrderId": 1,
        "medicationVariantId": 3,
        "quantity": 5,
        "unitPrice": 19000,
        "totalPrice": 95000
      }
    ]
  }
}
```

### Update Sales Order Status

**Request:**

```json
PATCH /api/sales/1
{
  "status": "completed"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": 1,
    "customerId": 1,
    "orderDate": "2025-10-12T10:30:00.000Z",
    "totalAmount": 125000,
    "status": "completed",
    "paymentMethod": "cash",
    "salespersonId": 2
  }
}
```

### Create Customer (Batch)

**Request:**

```json
POST /api/customers
[
  {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "address": "123 Đường ABC, Quận 1, TP.HCM"
  },
  {
    "name": "Trần Thị B",
    "email": "tranthib@example.com",
    "phone": "0907654321",
    "address": "456 Đường XYZ, Quận 3, TP.HCM"
  }
]
```

**Response:**

```json
{
  "success": true,
  "message": "Customers created successfully",
  "data": [
    {
      "id": 1,
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@example.com",
      "phone": "0901234567",
      "address": "123 Đường ABC, Quận 1, TP.HCM"
    },
    {
      "id": 2,
      "name": "Trần Thị B",
      "email": "tranthib@example.com",
      "phone": "0907654321",
      "address": "456 Đường XYZ, Quận 3, TP.HCM"
    }
  ]
}
```

### Get Customer with Sales History

**Request:**

```
GET /api/customers/1
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@example.com",
    "phone": "0901234567",
    "address": "123 Đường ABC, Quận 1, TP.HCM",
    "orders": [
      {
        "id": 1,
        "orderDate": "2025-10-12T10:30:00.000Z",
        "totalAmount": 125000,
        "status": "completed",
        "paymentMethod": "cash"
      },
      {
        "id": 5,
        "orderDate": "2025-10-10T14:20:00.000Z",
        "totalAmount": 50000,
        "status": "completed",
        "paymentMethod": "bank_transfer"
      }
    ]
  }
}
```

---

## Query Parameters

### List Sales Orders

```
GET /api/sales?customerId=1&status=pending&paymentMethod=cash&limit=50&offset=0
```

**Parameters:**

- `customerId` (number, optional) - Filter by customer
- `status` (enum, optional) - Filter by status: `pending`, `paid`, `delivered`, `cancelled`
- `paymentMethod` (enum, optional) - Filter by payment method: `cash`, `bank_transfer`, `credit_card`, `mobile_payment`
- `salespersonId` (number, optional) - Filter by salesperson
- `orderDateFrom` (date, optional) - Filter orders from date
- `orderDateTo` (date, optional) - Filter orders to date
- `limit` (number, optional, default: 100) - Items per page
- `offset` (number, optional, default: 0) - Page offset

### List Customers

```
GET /api/customers?search=nguyen&limit=50&offset=0
```

**Parameters:**

- `search` (string, optional) - Search by name, email, or phone
- `limit` (number, optional, default: 100) - Items per page
- `offset` (number, optional, default: 0) - Page offset

---

## Validation

All endpoints use Zod schemas from `@pharmaflow/dto` package:

### Sales Orders

- `createSalesOrderRequestSchema` - Validates order creation
- `updateSalesOrderRequestSchema` - Validates status updates
- `listSalesOrdersQuerySchema` - Validates query parameters

### Customers

- `createCustomerSchema` - Validates single customer creation
- `createCustomersRequestSchema` - Validates batch customer creation
- `updateCustomerRequestSchema` - Validates customer updates

---

## Error Handling

### Common Error Responses

#### Insufficient Inventory

```json
{
  "error": "Insufficient inventory for Paracetamol 500mg - Vỉ 10 viên (PARA-500-TRA-VI-100). Requested: 10, Available: 5"
}
```

#### Product Not Available for Sale

```json
{
  "error": "Medication variant Paracetamol 500mg - Vỉ 10 viên (PARA-500-TRA-VI-100) is not available for sale"
}
```

#### Duplicate Customer

```json
{
  "success": false,
  "message": "Customer with email 'existing@example.com' already exists"
}
```

#### Cannot Delete Customer

```json
{
  "error": "Cannot delete customer. They have 5 sales order(s) associated with them."
}
```

---

## Database Schema

### Sales Orders Table

```sql
CREATE TABLE sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id),
  order_date TIMESTAMP NOT NULL DEFAULT NOW(),
  total_amount DOUBLE PRECISION NOT NULL DEFAULT 0,
  status sales_order_status NOT NULL DEFAULT 'pending',
  payment_method sales_order_payment_method NOT NULL DEFAULT 'cash',
  salesperson_id UUID REFERENCES users(id)
);
```

### Sales Order Items Table

```sql
CREATE TABLE sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id),
  medication_variant_id UUID NOT NULL REFERENCES medication_variants(id),
  quantity INTEGER NOT NULL,
  unit_price DOUBLE PRECISION NOT NULL,
  total_price DOUBLE PRECISION NOT NULL
);
```

### Customers Table

```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(10),
  address TEXT,
  CONSTRAINT customers_email_unique UNIQUE (email),
  CONSTRAINT customers_phone_unique UNIQUE (phone)
);
```

**Note:** All numeric fields (prices, quantities, totals) use `DOUBLE PRECISION` and are returned as **JavaScript numbers** (not strings) for easier calculations in frontend applications.

---

## Business Logic Details

### Inventory Reservation (FEFO Strategy)

When a sales order is created:

1. **Validate Availability**
   - Query all inventory records for the medication variant
   - Calculate available quantity: `quantity - quantity_reserved`
   - Ensure total available >= requested quantity

2. **Reserve Inventory (FEFO)**
   - Sort inventory by expiry date (ascending)
   - Reserve from earliest expiring batches first
   - Update `quantity_reserved` for each batch

3. **Example:**

   ```
   Order requests 15 units of Medication A

   Available inventory:
   - Batch 1: expires 2025-12-01, available: 10 units → reserve 10
   - Batch 2: expires 2026-03-15, available: 20 units → reserve 5
   - Batch 3: expires 2026-06-20, available: 15 units → reserve 0

   Result:
   - Batch 1: quantity_reserved += 10
   - Batch 2: quantity_reserved += 5
   ```

### Order Status Transitions

#### Pending → Completed

1. Find all reserved inventory for order items (by expiry date)
2. For each inventory record:
   - Deduct from both `quantity` and `quantity_reserved`
   - `quantity = quantity - deducted_amount`
   - `quantity_reserved = quantity_reserved - deducted_amount`

#### Pending → Cancelled or Deleted

1. Find all reserved inventory for order items
2. For each inventory record:
   - Only reduce `quantity_reserved`
   - `quantity_reserved = quantity_reserved - unreserved_amount`
   - Keep `quantity` unchanged (stock returns to available)

---

## Transaction Safety

All critical operations use database transactions:

- ✅ **Sales Order Creation** - Wrapped in transaction (inventory checks + reservations + order creation)
- ✅ **Sales Order Update** - Wrapped in transaction (status transitions + inventory adjustments)
- ✅ **Sales Order Deletion** - Wrapped in transaction (unreserve inventory + delete items + delete order)

This ensures data consistency even if operations fail mid-process.

---

## Testing Recommendations

### Manual Testing with Postman

1. **Test Sales Order Creation**
   - Create order with sufficient inventory ✓
   - Create order with insufficient inventory (should fail) ✓
   - Create order with inactive medication variant (should fail) ✓
   - Verify inventory reservation in database

2. **Test Order Status Updates**
   - Update to `completed` and verify inventory deduction
   - Update to `cancelled` and verify inventory unreservation

3. **Test Order Deletion**
   - Delete order and verify inventory is unreserved

4. **Test Customer CRUD**
   - Create single customer
   - Create batch customers
   - Update customer
   - Try to delete customer with orders (should fail)
   - Delete customer without orders

### Database Verification Queries

```sql
-- Check inventory reservation
SELECT
  mv.sku,
  mv.name,
  i.batch_number,
  i.quantity,
  i.quantity_reserved,
  (i.quantity - i.quantity_reserved) as available
FROM inventory i
JOIN medication_variants mv ON i.medication_variant_id = mv.id
WHERE mv.id = 1;

-- Check sales order with items
SELECT
  so.id,
  so.status,
  so.total_amount,
  c.name as customer_name,
  json_agg(json_build_object(
    'medication', mv.name,
    'quantity', soi.quantity,
    'unit_price', soi.unit_price,
    'total_price', soi.total_price
  )) as items
FROM sales_orders so
JOIN customers c ON so.customer_id = c.id
JOIN sales_order_items soi ON so.id = soi.sales_order_id
JOIN medication_variants mv ON soi.medication_variant_id = mv.id
GROUP BY so.id, so.status, so.total_amount, c.name;
```

---

## Integration with Existing System

### Dependencies

- ✅ Uses existing `customers` table and schema
- ✅ Uses existing `salesOrders` and `salesOrderItems` tables
- ✅ Integrates with `inventory` table for stock management
- ✅ Uses `medicationVariants` for pricing
- ✅ Links to `users` for salesperson tracking

### Authentication & Authorization

- All endpoints require authentication via `authenticate` middleware
- Customer deletion restricted to `owner` role via `authorize("owner")` middleware
- Salesperson ID automatically captured from authenticated user

---

## Future Enhancements

Potential improvements for future iterations:

1. **Payment Processing**
   - Integration with payment gateways
   - Payment status tracking
   - Receipt generation

2. **Inventory Allocation Strategies**
   - Allow configuration of allocation strategy (FEFO, FIFO, LIFO)
   - Batch preference settings

3. **Order Modifications**
   - Support for adding/removing items from pending orders
   - Quantity adjustments before completion

4. **Customer Features**
   - Customer loyalty points
   - Purchase history analytics
   - Prescription management

5. **Advanced Filtering**
   - Date range presets (today, this week, this month)
   - Multi-status filtering
   - Export to Excel/PDF

6. **Notifications**
   - Order confirmation emails
   - Low stock alerts after sales
   - Order completion notifications

---

## Summary

The Sales API implementation provides:

✅ **Complete CRUD operations** for sales orders and customers  
✅ **Automatic inventory management** with FEFO strategy  
✅ **Transaction-safe** operations  
✅ **Comprehensive validation** using Zod schemas  
✅ **Flexible querying** with filters and pagination  
✅ **Integration** with existing medication and inventory systems  
✅ **Protection** against invalid operations (insufficient stock, duplicate customers, etc.)

The implementation follows the warehouse module pattern and maintains consistency with the existing codebase architecture.

# Sales Module - Detailed Documentation

## 📋 Overview

The Sales Module handles the complete sales workflow in the pharmacy system, including creating orders, managing customer information, tracking medications, and processing payments.

---

## 🔄 Sales Workflow - Step by Step

### Phase 1: Customer Selection/Creation

```
┌─────────────────────────────────────────┐
│         Start Sales Transaction         │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  1. Search for Existing Customer        │
│     - Enter customer name/email/phone   │
│     - System searches in database       │
└─────────────────────────────────────────┘
              ↓
         ┌────┴────┐
         ↓         ↓
    Found?    Not Found?
         ↓         ↓
    [SELECT]   [CREATE]
         │         │
         └────┬────┘
              ↓
       ┌──────────────────┐
       │ Customer Ready   │
       └──────────────────┘
```

#### API: Search Customer
**Endpoint:** `GET /api/customers?search={term}`
```json
Request:
{
  "search": "Nguyễn" // Search by name/email/phone
}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "Nguyễn Văn A",
      "email": "abc@gmail.com",
      "phone": "0901234567",
      "address": "123 Đường Lê Lợi"
    },
    {
      "id": "uuid-2",
      "name": "Nguyễn Văn B",
      "email": null,
      "phone": "0987654321",
      "address": null
    }
  ]
}
```

#### API: Create New Customer
**Endpoint:** `POST /api/customers`
```json
Request:
{
  "name": "Vy",                    // Required, 1-100 characters
  "email": "",                     // Optional, empty string → null
  "phone": "0372328467",          // Optional, 10 digits or empty string → null
  "address": ""                    // Optional, empty string → null
}

Response (201 Created):
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid-new",
    "name": "Vy",
    "email": null,
    "phone": "0372328467",
    "address": null
  }
}

Error Cases:
• 400 Bad Request - Name is required or empty
• 409 Conflict - Email/Phone already exists for another customer
```

---

### Phase 2: Adding Medications to Order

```
┌─────────────────────────────────────────┐
│    Customer Selected Successfully       │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. Search for Medications              │
│     - Enter medication name/code        │
│     - Filter by type/category           │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. Show Available Medication Variants   │
│     - Display price, stock, unit type   │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  4. Select Variant & Quantity           │
│     - Add to cart                       │
│     - Multiple items can be added       │
└─────────────────────────────────────────┘
              ↓
       ┌──────┴──────┐
       ↓             ↓
  Add More?       Done?
       ↓             ↓
    [REPEAT]    [CONTINUE]
       │             │
       └──────┬──────┘
              ↓
      ┌───────────────┐
      │  Cart Ready   │
      └───────────────┘
```

#### API: Search Medications
**Endpoint:** `GET /api/medications?search={term}&limit=20`
```json
Request:
{
  "search": "Paracetamol",
  "limit": 20
}

Response (200 OK):
{
  "success": true,
  "data": [
    {
      "id": "uuid-med-1",
      "name": "Paracetamol 500mg",
      "code": "PARA500",
      "description": "Pain reliever",
      "manufacturer": "Company A",
      "variants": [
        {
          "id": "uuid-var-1",
          "strength": "500mg",
          "form": "Tablet",
          "unit": "Box",
          "quantity": 100,
          "cost": 50000,
          "sellPrice": 75000,
          "stockQuantity": 50
        },
        {
          "id": "uuid-var-2",
          "strength": "500mg",
          "form": "Bottle",
          "unit": "Bottle",
          "quantity": 1,
          "cost": 30000,
          "sellPrice": 45000,
          "stockQuantity": 30
        }
      ]
    }
  ]
}
```

#### Cart Item Structure (Frontend State)
```javascript
{
  medication_variant_id: "uuid-var-1",    // Required for API
  quantity: 2,                             // Number of units
  medicationName: "Paracetamol 500mg",    // For display
  variantName: "Box (100 tablets)",       // For display
  unit: "Box",                             // For display
  sellPrice: 75000,                        // Price per unit
  totalPrice: 150000,                      // sellPrice × quantity
  stockQuantity: 50                        // Available stock
}
```

---

### Phase 3: Payment Processing

```
┌──────────────────────────────────┐
│  Order Ready for Payment         │
│  - Customer selected             │
│  - Medications added to cart     │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  5. Choose Payment Method        │
│     □ Cash (Tiền mặt)            │
│     □ VietQR (Mobile Payment)    │
└──────────────────────────────────┘
              ↓
         ┌────┴─────┐
         ↓          ↓
      CASH      VietQR
         ↓          ↓
    [CALC    [SHOW QR
     CHANGE] CODE]
         │          │
         └────┬─────┘
              ↓
┌──────────────────────────────────┐
│  6. Confirm Order Details        │
│     - Review total amount        │
│     - Verify customer info       │
└──────────────────────────────────┘
              ↓
┌──────────────────────────────────┐
│  7. Submit Order to Backend      │
└──────────────────────────────────┘
```

#### API: Create Sales Order
**Endpoint:** `POST /api/sales`
```json
Request:
{
  "customer_id": "uuid-cust-1",           // Required, from customer selection
  "payment_method": "cash",               // Required: "cash" | "mobile_payment"
  "items": [
    {
      "medication_variant_id": "uuid-var-1",  // Required, medication to sell
      "quantity": 2                           // Required, number of units
    },
    {
      "medication_variant_id": "uuid-var-2",
      "quantity": 1
    }
  ]
  // Optional: "prescription_id": "uuid-prescrip" for future use
}

Response (201 Created):
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": "uuid-order-123",
    "customerId": "uuid-cust-1",
    "orderDate": "2025-11-09T10:30:00Z",
    "totalAmount": 225000,                // Sum of all (sellPrice × quantity)
    "status": "pending",                  // pending | paid | delivered | cancelled
    "paymentMethod": "cash",
    "salespersonId": "uuid-user-sales",   // Current logged-in user
    "prescriptionId": null,
    "items": [
      {
        "id": "uuid-item-1",
        "salesOrderId": "uuid-order-123",
        "medicationVariantId": "uuid-var-1",
        "quantity": 2,
        "unitPrice": 75000,
        "totalPrice": 150000
      },
      {
        "id": "uuid-item-2",
        "salesOrderId": "uuid-order-123",
        "medicationVariantId": "uuid-var-2",
        "quantity": 1,
        "unitPrice": 75000,
        "totalPrice": 75000
      }
    ]
  }
}

Error Cases:
• 400 Bad Request - Invalid data (missing items, invalid quantities)
• 404 Not Found - Customer or medication variant not found
• 409 Conflict - Insufficient stock available
```

---

### Phase 4: Order Completion

```
┌──────────────────────────────┐
│   Order Created Successfully │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  8. Cash Payment Processing  │
│     (if payment_method=cash) │
│  - Show total amount         │
│  - Input cash received       │
│  - Calculate change          │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  9. Update Order Status      │
│     → Mark as "paid"         │
└──────────────────────────────┘
```

#### API: Update Order Status (Mark as Paid)
**Endpoint:** `PATCH /api/sales/{orderId}`
```json
Request:
{
  "status": "paid"  // Mark order as completed/paid
}

Response (200 OK):
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": "uuid-order-123",
    "customerId": "uuid-cust-1",
    "orderDate": "2025-11-09T10:30:00Z",
    "totalAmount": 225000,
    "status": "paid",              // ← Updated to "paid"
    "paymentMethod": "cash",
    "salespersonId": "uuid-user-sales",
    "prescriptionId": null
  }
}

🔔 Trigger: When status is updated to "paid":
   - System automatically sends invoice email to customer (if email exists)
   - Email includes: order details, items, total amount, payment method
```

---

### Phase 5: VietQR Payment Flow

```
┌──────────────────────────────┐
│   Order Created Successfully │
│   (payment_method=mobile)    │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  8. Show VietQR Code         │
│     - Display QR code        │
│     - Show order details     │
└──────────────────────────────┘
              ↓
┌──────────────────────────────┐
│  9. Customer Scans QR Code   │
│     - Opens banking app      │
│     - Verifies amount        │
│     - Completes payment      │
└──────────────────────────────┘
              ↓
         [MANUAL CONFIRM]
         Wait for user to
         confirm payment
              ↓
┌──────────────────────────────┐
│  10. Update Order Status     │
│      → Mark as "paid"        │
└──────────────────────────────┘
```

---

## 📊 Order Status Lifecycle

```
┌─────────┐
│PENDING  │  Order created, awaiting payment
└────┬────┘
     │
     ↓ (Payment received)
┌─────────┐
│  PAID   │  Payment confirmed
└────┬────┘
     │
     ├→ (Future: Delivery tracking)
     │
     └→ (Cancellation)
     ↓
┌──────────────┐
│ CANCELLED    │  Order cancelled
└──────────────┘
```

---

## 📱 API Reference - Sales Module

### 1. Create Sales Order
```
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "customer_id": "550e8400-e29b-41d4-a716-446655440000",
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": "550e8400-e29b-41d4-a716-446655440001",
      "quantity": 2
    }
  ]
}

Response: 201 Created
{
  "success": true,
  "message": "Sales order created successfully",
  "data": { /* salesOrder object */ }
}
```

### 2. Get All Sales Orders (with filtering)
```
GET /api/sales?page=1&limit=50&status=pending&sortBy=orderDate&sortOrder=desc
Authorization: Bearer {token}

Query Parameters:
- page: number (default: 1)
- limit: number (default: 100, max: 100)
- status: "pending" | "paid" | "cancelled"
- paymentMethod: "cash" | "mobile_payment"
- customerId: UUID (filter by customer)
- salespersonId: UUID (filter by salesperson)
- orderDateFrom: ISO date string
- orderDateTo: ISO date string
- sortBy: "orderDate" | "totalAmount" (default: orderDate)
- sortOrder: "asc" | "desc" (default: desc)

Response: 200 OK
{
  "success": true,
  "data": [ /* array of salesOrder */ ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 150,
    "totalPages": 3,
    "hasMore": true
  }
}
```

### 3. Get Sales Order by ID
```
GET /api/sales/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "customerId": "uuid",
    "orderDate": "2025-11-09T10:30:00Z",
    "totalAmount": 225000,
    "status": "pending",
    "paymentMethod": "cash",
    "salespersonId": "uuid",
    "prescriptionId": null,
    "items": [
      {
        "id": "uuid",
        "salesOrderId": "uuid",
        "medicationVariantId": "uuid",
        "quantity": 2,
        "unitPrice": 75000,
        "totalPrice": 150000
      }
    ]
  }
}
```

### 4. Update Order Status
```
PATCH /api/sales/{id}
Authorization: Bearer {token}
Content-Type: application/json

Request Body:
{
  "status": "paid"
}

Response: 200 OK
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": { /* updated salesOrder object */ }
}
```

### 5. Cancel Sales Order (Owner only)
```
DELETE /api/sales/{id}
Authorization: Bearer {token}

Response: 200 OK
{
  "success": true,
  "message": "Sales order cancelled successfully"
}

Error: 403 Forbidden (if not owner)
```

---

## 🛒 Frontend State Management

### Active Order Structure
```javascript
{
  id: "temp-order-id",              // Temporary ID until created
  customer: {
    id: "uuid-cust",
    name: "Customer Name",
    email: "customer@email.com",
    phone: "0901234567",
    address: "Address"
  },
  cart: [
    {
      medication_variant_id: "uuid",
      quantity: 2,
      medicationName: "Paracetamol 500mg",
      variantName: "Box (100)",
      sellPrice: 75000,
      totalPrice: 150000
    }
  ],
  paymentMethod: "cash",            // "cash" | "mobile_payment"
  cashReceived: "250000",           // For change calculation
  createdAt: Date
}
```

---

## 🔐 Error Handling & HTTP Status Codes

| Status | Meaning | Example |
|--------|---------|---------|
| 201 | Order created successfully | New order in system |
| 200 | Request successful | Order updated, retrieved |
| 400 | Bad request (validation error) | Missing required fields, invalid data |
| 401 | Unauthorized | Missing/invalid authentication token |
| 403 | Forbidden | Not owner (can't delete order), permission denied |
| 404 | Not found | Order ID doesn't exist, customer not found |
| 409 | Conflict | Insufficient stock, duplicate entry |
| 500 | Server error | Database error, unexpected error |

---

## 💳 Payment Methods Details

### 1. Cash (Tiền mặt)
- Customer pays directly
- Staff enters amount received
- System calculates change
- Order marked as "paid"

### 2. VietQR (Mobile Payment)
- QR code displayed to customer
- Customer scans with banking app
- Payment confirmed by customer
- Staff confirms on system
- Order marked as "paid"

---

## 📧 Invoice Email Trigger

When order status is updated to "paid" AND customer has email:

```
Email Contents:
- Order number
- Order date/time
- Customer name
- Salesperson name
- Items list with:
  - Medication name
  - Variant details (strength, form)
  - Quantity
  - Unit price
  - Total price
- Total amount
- Payment method

Example Email:
---
HOÀN LẠP HÓA ĐƠN HÀ NG
Order #: uuid-order-123
Date: 09/11/2025 10:30

Customer: Nguyễn Văn A
Salesperson: John Sales

Items:
1. Paracetamol 500mg (Box, 100 tablets)
   Qty: 2 × 75,000₫ = 150,000₫

2. Vitamin C 1000mg (Bottle)
   Qty: 1 × 75,000₫ = 75,000₫

---
Total: 225,000₫
Payment Method: Cash

Thank you for your purchase!
---
```

---

## 🎯 Common Workflows

### Workflow 1: Complete Sale - Cash Payment
1. Customer searches for existing customer
2. If not found, creates new customer
3. Searches and adds medications to cart
4. Selects "Cash" payment method
5. Enters cash received amount
6. Reviews change calculation
7. Submits order (POST /api/sales)
8. Updates status to "paid" (PATCH /api/sales/{id})
9. Shows success modal with order details

### Workflow 2: Complete Sale - VietQR Payment
1. Customer searches for existing customer
2. If not found, creates new customer
3. Searches and adds medications to cart
4. Selects "VietQR" payment method
5. System shows QR code dialog
6. Customer scans and pays
7. Staff confirms payment
8. Submits order (POST /api/sales)
9. Updates status to "paid" (PATCH /api/sales/{id})
10. Shows success modal with order details

### Workflow 3: View Order History
1. Navigate to Sales Dashboard
2. Filter by status, date range, customer
3. Sort by date, amount, etc.
4. View individual order details with items
5. Can mark orders as delivered (future feature)

---

## ⚠️ Edge Cases & Validations

1. **Empty Cart**: Can't submit order with no items
2. **Insufficient Stock**: System checks and prevents overselling
3. **Invalid Customer**: Must select valid customer before checkout
4. **Cash Payment Insufficient**: Change amount must be ≥ 0
5. **Duplicate Email/Phone**: When creating customer
6. **Missing Customer Data**: Email/Phone can be empty (optional)


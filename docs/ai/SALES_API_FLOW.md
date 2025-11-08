# Sales API & Flow Documentation

**Module**: Sales/POS  
**Date**: October 21, 2025

---

## API Endpoints

### 1. Create Sales Order

```http
POST /api/sales
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "customer_id": "uuid",
  "payment_method": "cash", // cash | credit_card | bank_transfer | mobile_payment
  "items": [
    {
      "medication_variant_id": "uuid",
      "quantity": 2
    }
  ]
}

Response (201):
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": "uuid",
    "customerId": "uuid",
    "totalAmount": 25000,
    "status": "pending",
    "paymentMethod": "cash",
    "items": [...]
  }
}
```

### 2. List Sales Orders

```http
GET /api/sales?page=1&limit=20&status=pending&customerId=uuid
Authorization: Bearer {token}

Response (200):
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 50,
    "totalPages": 3
  }
}
```

### 3. Get Sales Order

```http
GET /api/sales/:id
Authorization: Bearer {token}

Response (200): Order with customer, salesperson, and items details
```

### 4. Update Status

```http
PATCH /api/sales/:id
Authorization: Bearer {token}

Request:
{
  "status": "completed" // pending | completed | cancelled
}
```

### 5. Search Medications

```http
GET /api/medications?search=paracetamol
Response: Medications with sellPrice, availableQuantity, sku
```

### 6. Search Customers

```http
GET /api/customers?search=nguyen
Response: Customers with name, phone, email
```

### 7. Create Customer

```http
POST /api/customers
Request: { "name": "...", "email": "...", "phone": "..." }
```

---

## Flow

### POS Flow (5 Steps)

```
1. SELECT CUSTOMER
   - Search existing OR create new
   - Required before checkout

2. ADD PRODUCTS TO CART
   - Search medications
   - Check availableQuantity > 0
   - Add/update quantity (max = availableQuantity)

3. MANAGE CART
   - Increase/decrease quantity
   - Remove items
   - Calculate total = Σ(quantity × unitPrice)

4. SELECT PAYMENT METHOD
   - cash (default) | credit_card | bank_transfer | mobile_payment

5. COMPLETE ORDER
   - Validate: customer selected && cart not empty
   - POST /api/sales
   - On success: clear cart, reset customer
```

### Backend Processing

```
POST /api/sales
  ↓
1. Validate items (check isActive, isForSale)
2. Check inventory (FEFO - First Expired First Out)
3. Reserve inventory (update quantity_reserved)
4. Create sales_orders record (status: pending)
5. Create sales_order_items records
6. Return order with items
```

### Status Transitions

```
pending → completed (inventory deducted)
pending → cancelled (inventory unreserved)
completed → (no changes)
cancelled → (no changes)
```

---

## Key Points

- **Permissions**: Staff can create/view/update, Owner can delete
- **Inventory**: Auto-reserved on create, deducted on complete
- **FEFO**: Earliest expiry batches used first
- **Validation**: Frontend + Backend double-check stock availability
- **Transaction**: All DB operations in single transaction (rollback on error)

---

## Error Handling

```javascript
try {
  const response = await salesService.createSalesOrder(orderData);
  toast.success("Order created!");
} catch (error) {
  const message =
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Failed to create order";
  toast.error(message);
}
```

Common errors:

- "Please select a customer"
- "Cart is empty"
- "Insufficient inventory for {product}. Requested: X, Available: Y"
- "Medication variant is not available for sale"

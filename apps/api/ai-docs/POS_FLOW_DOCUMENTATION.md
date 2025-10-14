# POS (Point of Sale) System - Luồng Bán Hàng Documentation

## 📋 Tổng Quan

Hệ thống POS của PharmaFlow quản lý toàn bộ quy trình bán hàng, từ tạo đơn, kiểm tra tồn kho, đặt trước hàng, thanh toán, đến xuất kho.

## 🔄 Luồng Chính (Main Flow)

```
┌─────────────┐
│  1. Chọn    │
│  Khách Hàng │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  2. Thêm    │
│  Sản Phẩm   │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  3. Kiểm    │
│  Tra Tồn    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  4. Đặt     │
│  Trước Hàng │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  5. Thanh   │
│  Toán       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  6. Xuất    │
│  Kho        │
└─────────────┘
```

## 📊 Database Schema

### Sales Orders Table

```javascript
{
  id: bigint (PK),
  customerId: bigint (FK -> customers.id),
  orderDate: timestamp,
  totalAmount: decimal(10,2),
  status: enum('pending', 'paid', 'delivered', 'cancelled'),
  paymentMethod: enum('cash', 'bank_transfer', 'credit_card', 'mobile_payment'),
  salespersonId: bigint (FK -> users.id)
}
```

### Sales Order Items Table

```javascript
{
  id: bigint (PK),
  salesOrderId: bigint (FK -> sales_orders.id),
  medicationVariantId: bigint (FK -> medication_variants.id),
  quantity: integer,
  unitPrice: decimal(10,2),
  totalPrice: decimal(10,2)
}
```

## 🎯 Chi Tiết Các Bước

### Bước 1: Chọn/Tạo Khách Hàng

#### API Endpoint

```
POST /api/customers
GET /api/customers?search=phone_or_name
GET /api/customers/:id
```

#### Request Body (Tạo mới)

```json
{
  "name": "Nguyen Van A",
  "email": "customer@example.com",
  "phone": "0912345678",
  "address": "123 Main St, HCMC"
}
```

#### Response

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": 1,
    "name": "Nguyen Van A",
    "email": "customer@example.com",
    "phone": "0912345678",
    "address": "123 Main St, HCMC"
  }
}
```

#### Validation

- ✅ Email phải unique (nếu có)
- ✅ Phone phải unique
- ✅ Name là required
- ✅ Có thể tìm kiếm khách hàng cũ bằng phone/email

---

### Bước 2: Thêm Sản Phẩm vào Giỏ

#### API Endpoint

```
GET /api/medication-variants?isForSale=true&isActive=true
GET /api/medication-variants/:id
GET /api/medication-variants/:id/inventory
```

#### Response (Get Variant)

```json
{
  "success": true,
  "data": {
    "id": 5,
    "medicationId": 2,
    "sku": "PARA-500-TAB",
    "name": "Paracetamol 500mg - Tablet",
    "unit": "tablet",
    "sellPrice": "5000.00",
    "isActive": true,
    "isForSale": true,
    "medication": {
      "name": "Paracetamol",
      "brand": "Tylenol"
    }
  }
}
```

#### Response (Get Inventory)

```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 10,
      "medicationVariantId": 5,
      "binId": 15,
      "batchNumber": "BATCH-001",
      "quantity": "500.00",
      "quantityReserved": "50.00",
      "quantityAvailable": "450.00",
      "expiryDate": "2026-12-31",
      "location": {
        "zone": "Normal Zone",
        "rack": "R-A1",
        "bin": "B-01-01"
      }
    }
  ]
}
```

#### Validation

- ✅ Sản phẩm phải `isActive = true`
- ✅ Sản phẩm phải `isForSale = true`
- ✅ Kiểm tra tồn kho khả dụng: `quantity - quantityReserved`

---

### Bước 3: Kiểm Tra Tồn Kho

#### Tính Toán Khả Dụng

```javascript
Available Quantity = Total Quantity - Reserved Quantity

Ví dụ:
- Tổng tồn: 500 viên
- Đã đặt trước: 50 viên
- Khả dụng: 450 viên
```

#### API Check Stock

```
GET /api/inventory?medicationVariantId=5
GET /api/inventory/summary/by-variant?medicationId=2
```

#### Response

```json
{
  "success": true,
  "data": {
    "medicationVariantId": 5,
    "totalQuantity": "500.00",
    "totalReserved": "50.00",
    "totalAvailable": "450.00",
    "batches": [
      {
        "batchNumber": "BATCH-001",
        "expiryDate": "2026-12-31",
        "quantity": "500.00",
        "reserved": "50.00",
        "available": "450.00"
      }
    ]
  }
}
```

---

### Bước 4: Tạo Đơn Hàng & Đặt Trước Hàng (Reserve)

#### API Endpoint

```
POST /api/sales-orders
```

#### Request Body

```json
{
  "customer_id": 1,
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": 5,
      "quantity": 100
    },
    {
      "medication_variant_id": 8,
      "quantity": 50
    }
  ]
}
```

#### Process Flow

1. **Validate Items**

   ```javascript
   for each item:
     - Check medication variant exists
     - Check isActive && isForSale
     - Check available inventory >= requested quantity
   ```

2. **Reserve Inventory (FEFO - First Expiry First Out)**

   ```javascript
   // Lấy inventory theo expiry date
   SELECT * FROM inventory
   WHERE medication_variant_id = ?
     AND (quantity - quantity_reserved) > 0
   ORDER BY expiry_date ASC, batch_number ASC

   // Đặt trước theo batch
   remaining = requested_quantity
   for each batch (sorted by expiry):
     available_in_batch = batch.quantity - batch.quantity_reserved
     to_reserve = min(remaining, available_in_batch)

     UPDATE inventory
     SET quantity_reserved = quantity_reserved + to_reserve
     WHERE id = batch.id

     remaining -= to_reserve
     if remaining <= 0: break
   ```

3. **Calculate Total**

   ```javascript
   for each item:
     unit_price = variant.sell_price
     total_price = unit_price * quantity
     order_total += total_price
   ```

4. **Create Order**

   ```sql
   INSERT INTO sales_orders (
     customer_id,
     payment_method,
     total_amount,
     status,
     salesperson_id,
     order_date
   ) VALUES (?, ?, ?, 'pending', ?, NOW())
   ```

5. **Create Order Items**
   ```sql
   INSERT INTO sales_order_items (
     sales_order_id,
     medication_variant_id,
     quantity,
     unit_price,
     total_price
   ) VALUES (?, ?, ?, ?, ?)
   ```

#### Response

```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": 100,
    "customerId": 1,
    "orderDate": "2025-10-14T10:30:00Z",
    "totalAmount": "750000.00",
    "status": "pending",
    "paymentMethod": "cash",
    "salespersonId": 5,
    "items": [
      {
        "id": 201,
        "salesOrderId": 100,
        "medicationVariantId": 5,
        "quantity": 100,
        "unitPrice": "5000.00",
        "totalPrice": "500000.00"
      },
      {
        "id": 202,
        "salesOrderId": 100,
        "medicationVariantId": 8,
        "quantity": 50,
        "unitPrice": "5000.00",
        "totalPrice": "250000.00"
      }
    ]
  }
}
```

#### Error Cases

```json
// Insufficient inventory
{
  "success": false,
  "message": "Insufficient inventory for Paracetamol 500mg (PARA-500-TAB). Requested: 1000, Available: 450"
}

// Product not for sale
{
  "success": false,
  "message": "Medication variant Paracetamol 500mg (PARA-500-TAB) is not available for sale"
}

// Product not found
{
  "success": false,
  "message": "Medication variant with ID 999 not found"
}
```

---

### Bước 5: Thanh Toán (Payment)

#### API Endpoint

```
PATCH /api/sales-orders/:id
```

#### Request Body

```json
{
  "status": "paid"
}
```

#### Process

- Order chuyển từ `pending` → `paid`
- Hàng vẫn còn reserved, chưa xuất kho

#### Response

```json
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": 100,
    "status": "paid",
    "paymentMethod": "cash",
    "totalAmount": "750000.00"
  }
}
```

---

### Bước 6: Hoàn Tất & Xuất Kho (Complete Order)

#### API Endpoint

```
PATCH /api/sales-orders/:id
```

#### Request Body

```json
{
  "status": "delivered"
}
```

#### Process Flow

1. **Deduct Reserved Inventory (FEFO)**

   ```javascript
   for each order item:
     remaining = item.quantity

     // Get inventory với quantity_reserved > 0, sorted by expiry
     batches = SELECT * FROM inventory
              WHERE medication_variant_id = item.medication_variant_id
                AND quantity_reserved > 0
              ORDER BY expiry_date ASC

     for each batch:
       if remaining <= 0: break

       to_deduct = min(remaining, batch.quantity_reserved)

       UPDATE inventory
       SET quantity = quantity - to_deduct,
           quantity_reserved = quantity_reserved - to_deduct
       WHERE id = batch.id

       remaining -= to_deduct
   ```

2. **Update Order Status**
   ```sql
   UPDATE sales_orders
   SET status = 'delivered'
   WHERE id = ?
   ```

#### Response

```json
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": 100,
    "status": "delivered",
    "totalAmount": "750000.00"
  }
}
```

#### Inventory Before & After

**Before (Pending/Paid)**

```
Batch-001:
  quantity: 500
  quantity_reserved: 100
  quantity_available: 400
```

**After (Delivered)**

```
Batch-001:
  quantity: 400          (500 - 100)
  quantity_reserved: 0   (100 - 100)
  quantity_available: 400
```

---

### Bước 7: Hủy Đơn (Cancel Order)

#### API Endpoint

```
DELETE /api/sales-orders/:id
hoặc
PATCH /api/sales-orders/:id với { "status": "cancelled" }
```

#### Process Flow

1. **Unreserve Inventory**

   ```javascript
   for each order item:
     remaining = item.quantity

     batches = SELECT * FROM inventory
              WHERE medication_variant_id = item.medication_variant_id
                AND quantity_reserved > 0
              ORDER BY expiry_date ASC

     for each batch:
       to_unreserve = min(remaining, batch.quantity_reserved)

       UPDATE inventory
       SET quantity_reserved = quantity_reserved - to_unreserve
       WHERE id = batch.id

       remaining -= to_unreserve
   ```

2. **Delete/Cancel Order**

   ```sql
   -- Option 1: Soft delete (change status)
   UPDATE sales_orders
   SET status = 'cancelled'
   WHERE id = ?

   -- Option 2: Hard delete
   DELETE FROM sales_order_items WHERE sales_order_id = ?
   DELETE FROM sales_orders WHERE id = ?
   ```

#### Response

```json
{
  "success": true,
  "message": "Sales order cancelled successfully",
  "data": {
    "id": 100,
    "status": "cancelled"
  }
}
```

---

## 📈 Order Status Flow

```
┌─────────┐
│ pending │ (Đơn mới, hàng đã đặt trước)
└────┬────┘
     │
     ├──→ PATCH { status: "paid" }
     │    ┌──────┐
     │    │ paid │ (Đã thanh toán, hàng vẫn reserved)
     │    └───┬──┘
     │        │
     │        └──→ PATCH { status: "delivered" }
     │             ┌───────────┐
     │             │ delivered │ (Hoàn tất, đã xuất kho)
     │             └───────────┘
     │
     └──→ DELETE hoặc PATCH { status: "cancelled" }
          ┌───────────┐
          │ cancelled │ (Hủy đơn, unreserve hàng)
          └───────────┘
```

## 🔐 Authorization

### Required Permissions

- **Create Order**: `staff`, `owner`
- **View Orders**: `staff`, `owner`
- **Update Order**: `staff`, `owner`
- **Cancel Order**: `owner` only
- **View Reports**: `owner` only

### User Context

```javascript
// Lấy từ auth middleware
const userId = req.user?.id;
const userRole = req.user?.role;

// Tự động gán salesperson khi tạo đơn
salespersonId: userId;
```

---

## 📊 Inventory Management Integration

### FEFO (First Expiry First Out) Strategy

System tự động chọn batch gần hết hạn nhất để bán/xuất trước:

```javascript
// Priority order
ORDER BY
  expiry_date ASC,      // Hết hạn sớm nhất
  batch_number ASC      // Batch cũ nhất
```

### Inventory States

1. **Total Quantity**: Tổng số lượng trong kho
2. **Reserved Quantity**: Số lượng đã đặt trước (pending orders)
3. **Available Quantity**: Có thể bán = Total - Reserved

```
┌──────────────────────────────┐
│     Total Quantity: 500      │
├──────────────────────────────┤
│  Reserved: 100  │ Available: │
│  (for orders)   │    400     │
└──────────────────────────────┘
```

---

## 🧪 Testing Scenarios

### 1. Happy Path - Successful Order

```javascript
// 1. Create customer
POST /api/customers
{ name: "Test Customer", phone: "0912345678" }

// 2. Check inventory
GET /api/medication-variants/5/inventory
// Verify available >= 100

// 3. Create order
POST /api/sales-orders
{
  customer_id: 1,
  items: [{ medication_variant_id: 5, quantity: 100 }]
}
// Verify: status = "pending", inventory reserved

// 4. Pay order
PATCH /api/sales-orders/100
{ status: "paid" }

// 5. Complete order
PATCH /api/sales-orders/100
{ status: "delivered" }
// Verify: inventory deducted, reserved cleared
```

### 2. Insufficient Inventory

```javascript
POST /api/sales-orders
{
  customer_id: 1,
  items: [{ medication_variant_id: 5, quantity: 10000 }]
}
// Expected: 400 Bad Request
// "Insufficient inventory for ..."
```

### 3. Order Cancellation

```javascript
// 1. Create order (reserves inventory)
POST / api / sales - orders;

// 2. Cancel order
DELETE / api / sales - orders / 100;
// Verify: inventory unreserved, available restored
```

### 4. Multiple Batches FEFO

```javascript
// Inventory state:
// Batch A: expiry 2025-12-31, available 50
// Batch B: expiry 2026-06-30, available 100

POST / api / sales - orders;
{
  items: [{ medication_variant_id: 5, quantity: 80 }];
}

// Expected:
// - Reserve 50 from Batch A (oldest)
// - Reserve 30 from Batch B
```

---

## 🚨 Error Handling

### Common Errors

| Error Code | Message                                   | Cause               |
| ---------- | ----------------------------------------- | ------------------- |
| 400        | "Sales order must have at least one item" | Empty items array   |
| 400        | "Insufficient inventory for..."           | Not enough stock    |
| 400        | "... is not available for sale"           | isForSale = false   |
| 404        | "Medication variant with ID X not found"  | Invalid variant ID  |
| 404        | "Sales order not found"                   | Invalid order ID    |
| 404        | "Customer not found"                      | Invalid customer ID |

### Transaction Rollback

Tất cả operations sử dụng database transactions:

```javascript
await db.transaction(async (tx) => {
  // All operations here
  // Auto rollback on error
});
```

---

## 📱 Frontend Integration

### Cart State Management

```javascript
// Cart structure
const cart = {
  customerId: 1,
  items: [
    {
      variantId: 5,
      name: "Paracetamol 500mg",
      sku: "PARA-500-TAB",
      quantity: 100,
      unitPrice: 5000,
      totalPrice: 500000,
      available: 450, // From inventory check
    },
  ],
  totalAmount: 500000,
  paymentMethod: "cash",
};
```

### Workflow Steps

```jsx
1. <CustomerSelection />      // Search/Create customer
2. <ProductSelection />        // Browse + Add to cart
3. <CartReview />              // Review items, check stock
4. <PaymentMethod />           // Select payment
5. <OrderConfirmation />       // Create order
6. <PaymentProcess />          // Mark as paid
7. <OrderCompletion />         // Complete & print receipt
```

---

## 📊 Reports & Analytics

### Sales Reports

```
GET /api/sales-orders?orderDateFrom=2025-01-01&orderDateTo=2025-12-31
```

### Top Selling Products

```sql
SELECT
  mv.name,
  mv.sku,
  SUM(soi.quantity) as total_sold,
  SUM(soi.total_price) as revenue
FROM sales_order_items soi
JOIN medication_variants mv ON soi.medication_variant_id = mv.id
JOIN sales_orders so ON soi.sales_order_id = so.id
WHERE so.status = 'delivered'
  AND so.order_date BETWEEN ? AND ?
GROUP BY mv.id
ORDER BY total_sold DESC
LIMIT 10
```

### Revenue by Payment Method

```sql
SELECT
  payment_method,
  COUNT(*) as order_count,
  SUM(total_amount) as total_revenue
FROM sales_orders
WHERE status = 'delivered'
  AND order_date BETWEEN ? AND ?
GROUP BY payment_method
```

---

## 🎯 Performance Optimization

### Indexes

```sql
CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
CREATE INDEX idx_sales_orders_status ON sales_orders(status);
CREATE INDEX idx_sales_orders_date ON sales_orders(order_date);
CREATE INDEX idx_sales_order_items_variant ON sales_order_items(medication_variant_id);
CREATE INDEX idx_inventory_variant_expiry ON inventory(medication_variant_id, expiry_date);
```

### Caching Strategy

- Cache medication variants (rarely changes)
- Cache customer info for quick lookup
- Invalidate cache on inventory updates

---

## 📚 Related Documentation

- [Inventory Management](./WAREHOUSE_INVENTORY_ENDPOINTS.md)
- [Customer Management](./API_DOCUMENTATION.USER-MANAGEMENT.md)
- [Authentication](./AUTH_SETUP.md)
- [API Endpoints](./API_ENDPOINT_SUMMARY.md)

---

## 🔄 Version History

- **v1.0** (2025-10-14): Initial POS documentation
- FEFO inventory reservation implemented
- Multi-batch support
- Transaction-based operations

---

**Maintained by**: PharmaFlow Development Team  
**Last Updated**: October 14, 2025

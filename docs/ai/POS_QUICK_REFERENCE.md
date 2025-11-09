# POS Quick Reference Guide

## 🚀 Quick Start

### 1. Create Order (One API Call)

```bash
POST /api/sales-orders
Content-Type: application/json
Authorization: Bearer <token>

{
  "customer_id": 1,
  "payment_method": "cash",
  "items": [
    {
      "medication_variant_id": 5,
      "quantity": 100
    }
  ]
}
```

### 2. Update Order Status

```bash
PATCH /api/sales-orders/100
{
  "status": "paid"        # pending -> paid
}

PATCH /api/sales-orders/100
{
  "status": "delivered"   # paid -> delivered (xuất kho)
}
```

### 3. Cancel Order

```bash
DELETE /api/sales-orders/100
# hoặc
PATCH /api/sales-orders/100
{
  "status": "cancelled"
}
```

---

## 📋 API Endpoints Summary

| Method   | Endpoint                                  | Description            |
| -------- | ----------------------------------------- | ---------------------- |
| `POST`   | `/api/sales-orders`                       | Tạo đơn hàng mới       |
| `GET`    | `/api/sales-orders`                       | Lấy danh sách đơn hàng |
| `GET`    | `/api/sales-orders/:id`                   | Lấy chi tiết đơn hàng  |
| `PATCH`  | `/api/sales-orders/:id`                   | Cập nhật trạng thái    |
| `DELETE` | `/api/sales-orders/:id`                   | Hủy đơn hàng           |
| `POST`   | `/api/customers`                          | Tạo khách hàng         |
| `GET`    | `/api/customers?search=`                  | Tìm khách hàng         |
| `GET`    | `/api/medication-variants?isForSale=true` | Lấy sản phẩm bán       |
| `GET`    | `/api/medication-variants/:id/inventory`  | Kiểm tra tồn kho       |

---

## 🔄 Order Status Transitions

```
pending ──pay──> paid ──deliver──> delivered
   │
   └──cancel──> cancelled
```

| Status      | Inventory State | Can Cancel? | Description                |
| ----------- | --------------- | ----------- | -------------------------- |
| `pending`   | Reserved        | ✅ Yes      | Đơn mới, hàng đã đặt trước |
| `paid`      | Reserved        | ✅ Yes      | Đã thanh toán              |
| `delivered` | Deducted        | ❌ No       | Đã xuất kho, hoàn tất      |
| `cancelled` | Unreserved      | -           | Đã hủy                     |

---

## 💰 Payment Methods

```javascript
"cash"; // Tiền mặt
"bank_transfer"; // Chuyển khoản
"credit_card"; // Thẻ tín dụng
"mobile_payment"; // Ví điện tử
```

---

## 📦 Inventory Reservation Logic

### FEFO (First Expiry First Out)

```sql
-- System tự động chọn batch theo thứ tự:
ORDER BY
  expiry_date ASC,     -- Hết hạn sớm nhất
  batch_number ASC     -- Lô cũ nhất
```

### Available Calculation

```
Available = Total Quantity - Reserved Quantity
```

---

## 🧪 Testing Commands

### Complete Flow Test

```bash
# 1. Tạo khách hàng
curl -X POST http://localhost:3000/api/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Customer",
    "phone": "0912345678",
    "email": "test@example.com"
  }'

# 2. Kiểm tra tồn kho
curl -X GET "http://localhost:3000/api/medication-variants/5/inventory" \
  -H "Authorization: Bearer $TOKEN"

# 3. Tạo đơn hàng
curl -X POST http://localhost:3000/api/sales-orders \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "customer_id": 1,
    "payment_method": "cash",
    "items": [
      {
        "medication_variant_id": 5,
        "quantity": 100
      }
    ]
  }'

# 4. Thanh toán
curl -X PATCH http://localhost:3000/api/sales-orders/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "paid"}'

# 5. Hoàn tất
curl -X PATCH http://localhost:3000/api/sales-orders/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "delivered"}'
```

---

## 🚨 Common Errors

| Error                          | Solution                        |
| ------------------------------ | ------------------------------- |
| `Insufficient inventory`       | Kiểm tra số lượng available     |
| `not available for sale`       | Check `isForSale` và `isActive` |
| `Medication variant not found` | Verify variant ID               |
| `Customer not found`           | Create customer first           |

---

## 📊 Query Filters

### Get All Orders

```bash
GET /api/sales-orders?
  customerId=1&
  status=pending&
  paymentMethod=cash&
  salespersonId=5&
  orderDateFrom=2025-01-01&
  orderDateTo=2025-12-31&
  limit=50&
  offset=0
```

### Search Customers

```bash
GET /api/customers?search=0912345678
GET /api/customers?search=Nguyen
```

### Get Products for Sale

```bash
GET /api/medication-variants?
  isForSale=true&
  isActive=true&
  search=paracetamol
```

---

## 💡 Best Practices

### 1. Always Check Inventory First

```javascript
// Before adding to cart
const inventory = await fetch(`/api/medication-variants/${id}/inventory`);
const available = inventory.data.reduce(
  (sum, item) => sum + (item.quantity - item.quantityReserved),
  0
);

if (available < requestedQuantity) {
  alert("Insufficient stock");
}
```

### 2. Handle Errors Gracefully

```javascript
try {
  const order = await createOrder(data);
} catch (error) {
  if (error.message.includes("Insufficient inventory")) {
    // Show stock alert
  } else if (error.message.includes("not available for sale")) {
    // Show product unavailable message
  }
}
```

### 3. Use Transactions

All POS operations use database transactions automatically - no manual handling needed.

### 4. Validate Before Submit

```javascript
// Client-side validation
if (!customerId) return error("Select customer");
if (cart.items.length === 0) return error("Add items");
if (!paymentMethod) return error("Select payment method");

// Check each item stock
for (const item of cart.items) {
  if (item.quantity > item.available) {
    return error(`Insufficient stock for ${item.name}`);
  }
}
```

---

## 🎨 Frontend State Management

### Cart Structure

```javascript
const cart = {
  customerId: null,
  items: [],
  totalAmount: 0,
  paymentMethod: "cash",
};

// Add item
function addToCart(variant, quantity) {
  const existing = cart.items.find((i) => i.variantId === variant.id);
  if (existing) {
    existing.quantity += quantity;
    existing.totalPrice = existing.unitPrice * existing.quantity;
  } else {
    cart.items.push({
      variantId: variant.id,
      name: variant.name,
      sku: variant.sku,
      quantity,
      unitPrice: variant.sellPrice,
      totalPrice: variant.sellPrice * quantity,
    });
  }
  cart.totalAmount = cart.items.reduce((sum, i) => sum + i.totalPrice, 0);
}

// Submit order
async function submitOrder() {
  const response = await fetch("/api/sales-orders", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      customer_id: cart.customerId,
      payment_method: cart.paymentMethod,
      items: cart.items.map((item) => ({
        medication_variant_id: item.variantId,
        quantity: item.quantity,
      })),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const order = await response.json();
  return order.data;
}
```

---

## 📈 Performance Tips

1. **Cache Products**: Cache medication variants list
2. **Debounce Search**: Debounce customer/product search (300ms)
3. **Batch Requests**: Combine multiple checks when possible
4. **Lazy Load**: Load order history on demand

---

## 🔐 Security Notes

- All endpoints require authentication
- Token must be included in `Authorization: Bearer <token>`
- Only `staff` and `owner` can create orders
- Only `owner` can cancel delivered orders

---

## 📱 Mobile Integration

### Barcode Scanning

```javascript
// Scan barcode -> Get variant
GET /api/medication-variants?barcode=8936011502010

// Add to cart if available
```

### QR Code Payment

```javascript
// Generate QR for order
const qrData = {
  orderId: order.id,
  amount: order.totalAmount,
  paymentMethod: "mobile_payment",
};
```

---

## 🔗 Links

- [Full Documentation](./POS_FLOW_DOCUMENTATION.md)
- [API Endpoints](./API_ENDPOINT_SUMMARY.md)
- [Database Schema](../src/db/schema/)
- [Postman Collection](../pharmaflow_api.postman_collection.json)

---

**Quick Help**: See [POS_FLOW_DOCUMENTATION.md](./POS_FLOW_DOCUMENTATION.md) for detailed explanations.

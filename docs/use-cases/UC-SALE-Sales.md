# Sale Management Use Cases

## Overview

Module quản lý bán hàng (POS - Point of Sale), bao gồm tạo đơn hàng, thanh toán, quản lý ca làm việc và báo cáo bán hàng.

---

## UC-SALE-001: Create Sale Order (POS)

**Mô tả:** (Staff) Tạo đơn hàng bán lẻ tại quầy.

### Actors

- Staff, Manager

### Preconditions

- Có active shift
- Medications có trong kho

### Main Flow

1. Staff truy cập `/sales` (POS page)
2. Interface hiển thị:
   - **Search Bar**: Tìm medication
   - **Cart Table**: Items đã thêm
   - **Customer Panel**: Select/create customer
   - **Payment Panel**: Payment method & total
3. Staff search và chọn medication variant
4. Modal hiển thị:
   - Variant info
   - Available stock
   - Price
   - Quantity input
5. Nhập quantity và click "Add to Cart"
6. Item xuất hiện trong cart với:
   - Medication name
   - Variant
   - Quantity
   - Price
   - Total
   - Actions (Edit, Remove)
7. Staff có thể:
   - Edit quantity inline
   - Remove items
   - Add more items
8. Select customer (optional) hoặc tạo mới
9. Chọn payment method:
   - Cash
   - VietQR
   - Bank Transfer
10. Nếu Cash → nhập amount received → tính change
11. Click "Complete Order"
12. Hệ thống:
    - Validate: cart not empty, stock available
    - Check prescription if required
    - Calculate total
    - Create sale order với status: `completed`
    - Decrease stock (FIFO)
    - Create inventory transactions
    - Print receipt (optional)
13. Show Order Success modal với:
    - Order ID
    - Total amount
    - Payment method
    - Items list
14. Option: Print receipt hoặc Continue selling

### Alternative Flows

**A1: Prescription Required**

- Nếu medication requires_prescription = true
- Staff phải upload prescription image
- Không thể complete order nếu chưa upload

**A2: Insufficient Stock**

- Error: "Stock không đủ cho {medication}. Available: {quantity}"
- Remove or reduce quantity

**A3: Multiple Orders (Tabs)**

- Staff có thể mở nhiều tabs để serve nhiều customers
- Switch giữa các orders
- Complete từng order riêng biệt

### API Endpoint

```http
POST /api/sales
Body: {
  customer_id,
  items: [{ medication_variant_id, quantity, sell_price }],
  payment_method,
  amount_received,
  prescription_image_url,
  notes
}

Response: {
  id, order_number, total_amount, status, created_at, items, customer
}
```

---

## UC-SALE-002: View Sales List

**Mô tả:** Xem danh sách tất cả đơn hàng đã bán.

### Actors

- Staff, Manager, Admin

### Main Flow

1. Truy cập `/sales/list`
2. Table hiển thị:
   - Order Number
   - Customer Name
   - Total Amount
   - Payment Method
   - Status
   - Created Date
   - Staff
   - Actions (View, Print)
3. Filters:
   - Date range
   - Status
   - Payment method
   - Staff
   - Customer
4. Search by order number, customer name
5. Export to Excel

### API Endpoint

```http
GET /api/sales?from=&to=&status=&paymentMethod=&staffId=&page=1
```

---

## UC-SALE-003: View Sale Order Detail

**Mô tả:** Xem chi tiết một đơn hàng cụ thể.

### Actors

- Staff, Manager, Admin

### Main Flow

1. Click "View" trên sale order
2. Redirect đến `/sales/:id`
3. Hiển thị:
   - **Order Info**:
     - Order Number
     - Status
     - Created Date
     - Staff
   - **Customer Info** (nếu có)
   - **Items Table**:
     - Medication
     - Variant
     - Quantity
     - Price
     - Total
   - **Payment Info**:
     - Payment Method
     - Total Amount
     - Amount Received (nếu cash)
     - Change (nếu có)
   - **Prescription Image** (nếu có)
   - **Actions**:
     - Print Receipt
     - Refund (nếu applicable)

### API Endpoint

```http
GET /api/sales/:id
```

---

## UC-SALE-004: Print Receipt

**Mô tả:** In hóa đơn cho đơn hàng.

### Actors

- Staff, Manager

### Main Flow

1. Vào sale order detail
2. Click "Print Receipt" button
3. Hệ thống generate receipt với:
   - **Header**:
     - Store name, address, phone
     - Logo
   - **Order Info**:
     - Order number
     - Date & time
     - Staff name
   - **Items Table**
   - **Total Amount**
   - **Payment Method**
   - **Footer**:
     - "Thank you for your purchase!"
     - Return policy
4. Print dialog mở
5. Staff print hoặc save as PDF

### API Endpoint

```http
GET /api/sales/:id/receipt
```

---

## UC-SALE-005: Refund Sale Order

**Mô tả:** (Manager) Hoàn tiền một đơn hàng (trong vòng 7 ngày).

### Actors

- Manager, Admin

### Preconditions

- Order đã completed
- Trong thời hạn refund (7 days)
- Items chưa expired

### Main Flow

1. Manager vào sale order detail
2. Click "Refund" button
3. Modal hiển thị:
   - Items trong order
   - Checkboxes để chọn items cần refund
   - Reason textarea
4. Chọn items và nhập reason
5. Click "Process Refund"
6. Hệ thống:
   - Validate: within refund period
   - Create refund record
   - Return stock (increase inventory)
   - Create inventory transactions (type: `refund_in`)
   - Update sale status: `refunded` hoặc `partially_refunded`
7. Success toast

### Alternative Flows

**A1: Outside refund period**

- Error: "Đơn hàng này đã quá thời hạn hoàn tiền (7 ngày)"

**A2: Partial refund**

- Chỉ refund một số items
- Status = `partially_refunded`
- Calculate refund amount

### API Endpoint

```http
POST /api/sales/:id/refund
Body: {
  items: [{ sale_item_id, quantity }],
  reason
}
```

---

## UC-SALE-006: Apply Discount

**Mô tả:** Áp dụng giảm giá cho đơn hàng.

### Actors

- Staff (with permission), Manager

### Main Flow

1. Trong POS page, trước khi complete order
2. Click "Apply Discount" button
3. Modal hiển thị:
   - Discount Type:
     - Percentage (%)
     - Fixed Amount (VNĐ)
   - Discount Value: input
   - Reason: textarea (required)
4. Nhập discount value và reason
5. Click "Apply"
6. Hệ thống:
   - Calculate new total
   - Display discount amount
   - Update payment panel
7. Proceed to complete order
8. Discount được save trong order record

### Business Rules

- Max discount %: 20% (configurable)
- Max fixed amount: 500,000 VNĐ
- Discount require reason
- Manager can override limits

### API Endpoint

```http
Included in POST /api/sales
Body includes: { discount_type, discount_value, discount_reason }
```

---

## UC-SALE-007: Quick Sale (No Customer)

**Mô tả:** Bán hàng nhanh không cần thông tin customer.

### Actors

- Staff

### Main Flow

1. Thực hiện sale bình thường (UC-SALE-001)
2. Không chọn customer (để trống)
3. Complete order
4. Hệ thống tạo order với customer_id = NULL
5. Success

### Note

- Vẫn track được order
- Không có customer data cho marketing
- Suitable cho walk-in customers

---

## UC-SALE-008: Sales Report

**Mô tả:** (Manager) Xem báo cáo bán hàng theo thời gian.

### Actors

- Manager, Admin

### Main Flow

1. Truy cập `/reports/sales`
2. Chọn date range (from - to)
3. Hệ thống hiển thị:
   - **Summary Cards**:
     - Total Revenue
     - Total Orders
     - Average Order Value
     - Total Items Sold
   - **Revenue Chart**: Line chart by date
   - **Top Selling Products**: Table
   - **Sales by Payment Method**: Pie chart
   - **Sales by Staff**: Bar chart
   - **Sales by Hour**: Line chart (peak hours)
4. Export report as PDF/Excel

### API Endpoint

```http
GET /api/reports/sales?from=2024-01-01&to=2024-01-31

Response: {
  summary: { total_revenue, total_orders, avg_order_value, total_items },
  revenue_by_date: [...],
  top_products: [...],
  by_payment_method: {...},
  by_staff: {...},
  by_hour: [...]
}
```

---

## UC-SALE-009: Search Sale Orders

**Mô tả:** Tìm kiếm đơn hàng bằng Full-Text Search.

### Actors

- All users

### Main Flow

1. Vào Sales List page
2. Nhập search query vào search bar
3. Hệ thống search across:
   - Order number
   - Customer name
   - Customer phone
   - Medication name
   - Staff name
4. Hiển thị matching results
5. Sort by relevance

### API Endpoint

```http
GET /api/sales/search?q=john+doe&limit=20
```

---

## Database Schema

```sql
CREATE TABLE sales (
  id UUID PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  staff_id UUID REFERENCES users(id),
  shift_id UUID REFERENCES shifts(id),
  total_amount DECIMAL(12,2) NOT NULL,
  discount_type VARCHAR(20),
  discount_value DECIMAL(12,2),
  discount_reason TEXT,
  final_amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(50),
  amount_received DECIMAL(12,2),
  change_amount DECIMAL(12,2),
  prescription_image_url TEXT,
  status VARCHAR(20) DEFAULT 'completed',
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  refunded_at TIMESTAMP,
  INDEX idx_order_number (order_number),
  INDEX idx_customer (customer_id),
  INDEX idx_staff (staff_id),
  INDEX idx_shift (shift_id),
  INDEX idx_status (status),
  INDEX idx_date (created_at)
);

CREATE TABLE sale_items (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  medication_variant_id UUID REFERENCES medication_variants(id),
  quantity INT NOT NULL,
  sell_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  batch_number VARCHAR(100),
  INDEX idx_sale (sale_id),
  INDEX idx_variant (medication_variant_id)
);

CREATE TABLE sale_refunds (
  id UUID PRIMARY KEY,
  sale_id UUID REFERENCES sales(id),
  refund_amount DECIMAL(12,2) NOT NULL,
  reason TEXT,
  refunded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_sale (sale_id)
);
```

---

## Business Rules

1. **Order Number Format**: ORD-YYYYMMDD-XXXX (auto-generate)
2. **Prescription Check**: Mandatory cho medications với requires_prescription = true
3. **Stock Validation**: Check stock before completing order
4. **FIFO**: Use oldest batches first khi decrease stock
5. **Refund Period**: 7 days from purchase date
6. **Discount Limits**:
   - Staff: Max 10% or 200,000 VNĐ
   - Manager: Max 20% or 500,000 VNĐ
   - Admin: Unlimited (with reason)
7. **Shift Tracking**: Mọi sale phải belong to một shift

---

## Payment Methods

1. **Cash**:
   - Nhập amount_received
   - Calculate change automatically

2. **VietQR**:
   - Generate QR code với amount
   - Customer scan & pay
   - Auto-verify payment (webhook)

3. **Bank Transfer**:
   - Provide bank account info
   - Manual verification

---

## Testing Checklist

- [ ] Create sale order successfully
- [ ] Add multiple items to cart
- [ ] Edit quantity inline
- [ ] Remove items from cart
- [ ] Calculate total correctly
- [ ] Apply discount (percentage)
- [ ] Apply discount (fixed amount)
- [ ] Discount với reason required
- [ ] Cash payment với change calculation
- [ ] VietQR payment flow
- [ ] Prescription upload required
- [ ] Prescription check working
- [ ] Insufficient stock → error
- [ ] Stock decreased after sale (FIFO)
- [ ] View sales list với filters
- [ ] Search sales by order number
- [ ] View sale detail
- [ ] Print receipt
- [ ] Refund full order
- [ ] Refund partial order
- [ ] Refund outside period → error
- [ ] Multiple order tabs
- [ ] Quick sale without customer
- [ ] Sales report generated
- [ ] Export sales report (Excel, PDF)
- [ ] Inventory transactions created
- [ ] Shift tracking working

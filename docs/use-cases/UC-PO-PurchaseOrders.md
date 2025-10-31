# Purchase Order Management Use Cases

## Overview

Module quản lý đơn đặt hàng từ nhà cung cấp (Purchase Orders), từ tạo PO, phê duyệt, nhận hàng đến thanh toán.

---

## UC-PO-001: Create Purchase Order

**Mô tả:** (Manager) Tạo đơn đặt hàng mới từ nhà cung cấp.

### Actors

- Manager

### Preconditions

- Có role: `manager`
- Suppliers và medications đã tồn tại

### Main Flow

1. Manager truy cập `/purchase-orders/new`
2. Form hiển thị:
   - **Supplier Selection**: Dropdown chọn supplier
   - **Expected Delivery Date**: Date picker
   - **Items Table**:
     - Search medication variant
     - Quantity
     - Unit Price
     - Total
   - **Notes**: Optional textarea
3. Manager chọn supplier
4. Thêm items:
   - Search medication variant
   - Nhập quantity
   - Nhập unit price (hoặc use last price)
   - Click "Add"
5. Tính total amount tự động
6. Click "Create Purchase Order"
7. Hệ thống:
   - Validate: supplier, items not empty
   - Create PO với status: `pending`
   - Generate PO Number: PO-YYYYMMDD-XXXX
8. Success toast và redirect về PO detail

### Alternative Flows

**A1: No items**

- Error: "Vui lòng thêm ít nhất 1 sản phẩm"

**A2: Invalid quantity**

- Error: "Quantity phải > 0"

### API Endpoint

```http
POST /api/purchase-orders
Body: {
  supplier_id,
  expected_delivery_date,
  items: [{ medication_variant_id, quantity, unit_price }],
  notes
}
```

---

## UC-PO-002: View Purchase Order List

**Mô tả:** Xem danh sách tất cả purchase orders với filter theo status.

### Actors

- Manager, Admin

### Main Flow

1. Truy cập `/purchase-orders`
2. Hiển thị table:
   - PO Number
   - Supplier Name
   - Total Amount
   - Status
   - Expected Delivery
   - Created Date
   - Actions
3. Features:
   - Search by PO number, supplier
   - Filter: Status (Pending, Approved, Received, Cancelled)
   - Sort by date, amount
   - Pagination

### API Endpoint

```http
GET /api/purchase-orders?search=&status=&page=1&limit=20
```

---

## UC-PO-003: View Purchase Order Detail

**Mô tả:** Xem chi tiết một purchase order cụ thể.

### Actors

- Manager, Admin

### Main Flow

1. Click "View" trên PO
2. Redirect đến `/purchase-orders/:id`
3. Hiển thị:
   - PO Number
   - Supplier info
   - Status
   - Expected Delivery Date
   - Created Date
   - **Items Table**:
     - Medication Name
     - Variant (Dosage, Form)
     - Quantity Ordered
     - Quantity Received (nếu có)
     - Unit Price
     - Total
   - **Summary**:
     - Subtotal
     - Tax (nếu có)
     - Total Amount
   - **Actions** (tùy status):
     - Approve (nếu pending)
     - Receive (nếu approved)
     - Cancel

### API Endpoint

```http
GET /api/purchase-orders/:id
```

---

## UC-PO-004: Approve Purchase Order

**Mô tả:** (Admin) Phê duyệt purchase order đã được tạo.

### Actors

- Admin

### Preconditions

- PO có status: `pending`
- Có role: `admin`

### Main Flow

1. Admin vào PO detail với status `pending`
2. Review thông tin
3. Click "Approve" button
4. Confirm dialog: "Phê duyệt purchase order này?"
5. Click "Confirm"
6. Hệ thống:
   - Update status: `pending` → `approved`
   - Record approved_by, approved_at
7. Success toast
8. Page refresh với status mới

### Alternative Flows

**A1: Already approved**

- Error: "Purchase order đã được phê duyệt"

### API Endpoint

```http
PATCH /api/purchase-orders/:id/approve
```

---

## UC-PO-005: Receive Purchase Order

**Mô tả:** (Manager) Xác nhận đã nhận hàng từ supplier và cập nhật inventory.

### Actors

- Manager

### Preconditions

- PO có status: `approved`
- Hàng đã được giao

### Main Flow

1. Manager vào PO detail với status `approved`
2. Click "Receive Order" button
3. Modal hiển thị receive form:
   - Items table với columns:
     - Medication Variant
     - Ordered Quantity
     - Received Quantity (editable)
     - Batch Number (input)
     - Expiry Date (date picker)
4. Manager nhập:
   - Received quantity cho mỗi item (có thể khác ordered)
   - Batch number
   - Expiry date
5. Click "Confirm Receipt"
6. Hệ thống:
   - Validate: received qty không vượt ordered qty
   - Update PO status: `approved` → `received`
   - Tạo inventory transactions:
     - type: `purchase_in`
     - quantity: received quantity
     - với batch number & expiry date
   - Update stock levels trong stock_inventories
7. Success toast: "Đã nhận hàng và cập nhật kho"

### Alternative Flows

**A1: Partial receipt**

- Nếu received < ordered cho một số items
- Status = `partially_received`
- Có thể receive thêm lần nữa

**A2: Invalid expiry date**

- Error: "Expiry date phải trong tương lai"

**A3: Missing batch number**

- Warning: "Batch number được khuyến nghị nhập"

### API Endpoint

```http
POST /api/purchase-orders/:id/receive
Body: {
  items: [{
    medication_variant_id,
    received_quantity,
    batch_number,
    expiry_date
  }]
}
```

---

## UC-PO-006: Cancel Purchase Order

**Mô tả:** (Manager/Admin) Hủy purchase order chưa nhận hàng.

### Actors

- Manager, Admin

### Preconditions

- PO có status: `pending` hoặc `approved`

### Main Flow

1. Click "Cancel" button
2. Modal hiển thị:
   - "Lý do hủy" textarea (optional)
3. Click "Confirm Cancel"
4. Hệ thống:
   - Update status → `cancelled`
   - Record cancelled_by, cancelled_at, cancel_reason
5. Success toast

### Alternative Flows

**A1: Already received**

- Error: "Không thể hủy PO đã nhận hàng"

### API Endpoint

```http
PATCH /api/purchase-orders/:id/cancel
Body: { reason }
```

---

## UC-PO-007: Update Purchase Order

**Mô tả:** (Manager) Chỉnh sửa PO chưa được approve.

### Actors

- Manager

### Preconditions

- PO có status: `pending`

### Main Flow

1. Click "Edit" button
2. Form hiển thị với data pre-filled
3. Có thể chỉnh sửa:
   - Supplier (không khuyến nghị)
   - Expected delivery date
   - Items (add/remove/update quantity/price)
   - Notes
4. Click "Save"
5. Hệ thống update PO
6. Success toast

### Alternative Flows

**A1: Already approved**

- Error: "Không thể sửa PO đã được phê duyệt"

### API Endpoint

```http
PATCH /api/purchase-orders/:id
```

---

## UC-PO-008: Export Purchase Order

**Mô tả:** Export PO thành PDF để gửi cho supplier.

### Actors

- Manager, Admin

### Main Flow

1. Vào PO detail
2. Click "Export PDF" button
3. Hệ thống generate PDF với:
   - Company header
   - PO number
   - Supplier info
   - Items table
   - Total amount
   - Terms & conditions
4. Download PDF

### API Endpoint

```http
GET /api/purchase-orders/:id/export-pdf
```

---

## Database Schema

```sql
CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY,
  po_number VARCHAR(50) UNIQUE NOT NULL,
  supplier_id UUID REFERENCES suppliers(id),
  status VARCHAR(20) DEFAULT 'pending',
  expected_delivery_date DATE,
  total_amount DECIMAL(12,2),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMP,
  received_at TIMESTAMP,
  cancelled_by UUID REFERENCES users(id),
  cancelled_at TIMESTAMP,
  cancel_reason TEXT,
  INDEX idx_po_number (po_number),
  INDEX idx_supplier (supplier_id),
  INDEX idx_status (status)
);

CREATE TABLE purchase_order_items (
  id UUID PRIMARY KEY,
  purchase_order_id UUID REFERENCES purchase_orders(id),
  medication_variant_id UUID REFERENCES medication_variants(id),
  quantity INT NOT NULL,
  received_quantity INT DEFAULT 0,
  unit_price DECIMAL(12,2) NOT NULL,
  total DECIMAL(12,2) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date DATE,
  INDEX idx_po (purchase_order_id)
);
```

---

## Business Rules

1. **PO Number Format**: PO-YYYYMMDD-XXXX (auto-generate)
2. **Status Flow**: pending → approved → received/partially_received
   - Có thể cancel từ pending hoặc approved
3. **Approval**: Chỉ Admin mới có quyền approve
4. **Edit**: Chỉ edit được khi status = pending
5. **Receive**: Có thể receive nhiều lần (partial receipts)
6. **Inventory Update**: Chỉ update khi receive, không phải khi approve

---

## Testing Checklist

- [ ] Create PO successfully
- [ ] Create PO without items → error
- [ ] View PO list with filters
- [ ] View PO detail
- [ ] Approve PO as Admin
- [ ] Approve PO as Manager → error (unauthorized)
- [ ] Receive PO full quantity
- [ ] Receive PO partial quantity
- [ ] Receive với expiry date past → error
- [ ] Cancel pending PO
- [ ] Cancel approved PO
- [ ] Cancel received PO → error
- [ ] Edit pending PO
- [ ] Edit approved PO → error
- [ ] Export PO as PDF
- [ ] Inventory updated after receive
- [ ] Stock levels correct

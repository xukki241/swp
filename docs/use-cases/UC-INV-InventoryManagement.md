# Inventory Management Use Cases

## Overview

Module quản lý tồn kho thuốc, bao gồm stock tracking, batch management, expiry alerts, stock adjustments và full-text search.

---

## UC-INV-001: View Stock Inventory

**Mô tả:** Xem tổng quan tồn kho hiện tại của tất cả medication variants.

### Actors

- Staff, Manager, Admin

### Main Flow

1. Truy cập `/inventory`
2. Hiển thị table với columns:
   - Medication Name
   - Variant (Dosage, Form)
   - Current Stock
   - Reorder Point
   - Status (In Stock / Low Stock / Out of Stock)
   - Last Updated
   - Actions
3. Features:
   - Full-text search
   - Filter: Status, Category
   - Sort by: Stock, Last Updated
   - Pagination

### API Endpoint

```http
GET /api/inventory?search=&status=&category=&page=1
```

---

## UC-INV-002: View Stock by Batch

**Mô tả:** Xem chi tiết tồn kho theo từng batch (lô hàng) với expiry date.

### Actors

- Manager, Admin

### Main Flow

1. Vào inventory detail của variant
2. Hiển thị batches table:
   - Batch Number
   - Quantity
   - Expiry Date
   - Days to Expiry
   - Status (Fresh / Expiring Soon / Expired)
   - Received Date
3. Color coding:
   - Red: Expired
   - Orange: < 30 days to expiry
   - Yellow: < 90 days
   - Green: > 90 days

### API Endpoint

```http
GET /api/inventory/variants/:id/batches
```

---

## UC-INV-003: Low Stock Alert

**Mô tả:** Tự động cảnh báo khi stock của variant xuống dưới reorder point.

### Actors

- System (automated)

### Main Flow

1. System chạy scheduled job mỗi giờ
2. Query variants có stock < reorder_point
3. Tạo notifications cho Manager/Admin:
   - Type: `low_stock_alert`
   - Medication info
   - Current stock vs Reorder point
   - Suggested action: Create PO
4. Hiển thị badge trên navigation
5. Email daily summary (optional)

### API Endpoint

```http
GET /api/inventory/low-stock-alerts
```

---

## UC-INV-004: Expiry Alert

**Mô tả:** Cảnh báo medication sắp hết hạn (< 90 days).

### Actors

- System (automated)

### Main Flow

1. System chạy scheduled job daily
2. Query batches có expiry_date trong 90 ngày tới
3. Tạo notifications:
   - Critical: < 30 days
   - Warning: 30-60 days
   - Info: 60-90 days
4. Hiển thị trong Expiry Alerts panel
5. Email report hàng tuần

### API Endpoint

```http
GET /api/inventory/expiry-alerts?threshold=90
```

---

## UC-INV-005: Stock Adjustment

**Mô tả:** (Manager) Điều chỉnh số lượng tồn kho do kiểm kê, hư hỏng, mất mát, etc.

### Actors

- Manager, Admin

### Main Flow

1. Vào inventory detail
2. Click "Adjust Stock" button
3. Modal hiển thị:
   - Current Stock: {quantity}
   - Adjustment Type: (dropdown)
     - Physical Count (kiểm kê)
     - Damage
     - Loss
     - Correction
   - New Stock: (input)
   - Reason: (textarea)
4. Nhập new stock và reason
5. Click "Submit"
6. Hệ thống:
   - Calculate difference: new - current
   - Create inventory transaction:
     - type: `adjustment`
     - quantity_change: difference
     - reason
   - Update stock level
   - Audit log
7. Success toast

### Alternative Flows

**A1: Negative stock**

- Error: "Stock không thể âm"

### API Endpoint

```http
POST /api/inventory/adjust
Body: { medication_variant_id, new_quantity, reason, adjustment_type }
```

---

## UC-INV-006: Stock Transfer

**Mô tả:** (Manager) Chuyển stock giữa các locations/branches (nếu có multiple branches).

### Actors

- Manager, Admin

### Main Flow

1. Click "Transfer Stock"
2. Form:
   - Medication Variant
   - From Location
   - To Location
   - Quantity
   - Reason
3. Submit
4. Hệ thống:
   - Decrease stock at from_location
   - Increase stock at to_location
   - Create 2 transactions (out + in)
   - Audit log
5. Success toast

### API Endpoint

```http
POST /api/inventory/transfer
Body: { variant_id, from_location, to_location, quantity, reason }
```

---

## UC-INV-007: View Inventory Transactions

**Mô tả:** Xem lịch sử tất cả transactions (nhập/xuất kho).

### Actors

- Manager, Admin

### Main Flow

1. Truy cập `/inventory/transactions`
2. Table với columns:
   - Date
   - Medication Variant
   - Type (purchase_in, sale_out, adjustment, transfer)
   - Quantity Change
   - Before Stock
   - After Stock
   - User
   - Reference (PO ID, Sale ID, etc.)
3. Filters:
   - Date range
   - Transaction type
   - Medication
   - User

### API Endpoint

```http
GET /api/inventory/transactions?from=&to=&type=&variantId=&page=1
```

---

## UC-INV-008: Physical Inventory Count

**Mô tả:** (Manager) Thực hiện kiểm kê định kỳ và reconcile với system stock.

### Actors

- Manager

### Main Flow

1. Truy cập `/inventory/physical-count`
2. Click "Start New Count"
3. Hệ thống tạo count session với:
   - List tất cả variants
   - System stock (current)
   - Physical count column (empty)
4. Manager nhập physical count cho từng variant
5. Hệ thống highlight discrepancies:
   - Green: Match
   - Yellow: Difference < 5
   - Red: Difference >= 5
6. Review discrepancies
7. Click "Finalize Count"
8. Hệ thống:
   - Create adjustment transactions
   - Update stock levels
   - Generate count report
   - Audit log
9. Success toast

### API Endpoint

```http
POST /api/inventory/physical-count/start
PATCH /api/inventory/physical-count/:id/update
POST /api/inventory/physical-count/:id/finalize
```

---

## UC-INV-009: Export Inventory Report

**Mô tả:** Export báo cáo tồn kho (Excel, PDF).

### Actors

- Manager, Admin

### Main Flow

1. Vào Inventory page
2. Click "Export Report"
3. Modal chọn:
   - Format: Excel / PDF
   - Include:
     - Current Stock
     - Batches
     - Expiry Dates
     - Low Stock Items
4. Click "Generate"
5. Hệ thống generate file
6. Download

### API Endpoint

```http
GET /api/inventory/export?format=excel&include[]=stock&include[]=batches
```

---

## UC-INV-010: Set Reorder Point

**Mô tả:** (Manager) Thiết lập reorder point cho từng variant.

### Actors

- Manager, Admin

### Main Flow

1. Vào variant detail
2. Click "Edit Reorder Point"
3. Input new value
4. Click "Save"
5. Hệ thống update reorder_point
6. Success toast

### Alternative Flows

**A1: AI Suggestion**

- Hiển thị "AI suggested reorder point: {value}"
- Based on historical sales

### API Endpoint

```http
PATCH /api/medication-variants/:id/reorder-point
Body: { reorder_point }
```

---

## UC-INV-011: View Stock Value

**Mô tả:** Xem giá trị tồn kho hiện tại.

### Actors

- Manager, Admin

### Main Flow

1. Truy cập `/inventory/valuation`
2. Hiển thị:
   - **Summary Cards**:
     - Total Stock Value (VNĐ)
     - Number of Variants
     - Number of Items
   - **By Category Chart**: Pie chart stock value by category
   - **Top Value Items**: Table

### Calculation

```
stock_value = SUM(stock_quantity * sell_price) for all variants
```

### API Endpoint

```http
GET /api/inventory/valuation
```

---

## UC-INV-012: FIFO Management

**Mô tả:** System tự động sell batches theo FIFO (First In First Out) - batch cũ nhất được bán trước.

### Actors

- System (automatic)

### Main Flow

1. Khi tạo sale order
2. System query batches của variant, sort by received_date ASC
3. Allocate quantity từ batch cũ nhất trước
4. Nếu batch cũ không đủ → lấy tiếp batch tiếp theo
5. Decrease stock của từng batch
6. Create transaction records

### Business Rule

- Always sell oldest batch first (FIFO)
- Cannot manually select batch (system-controlled)

---

## UC-INV-013: Batch Recall

**Mô tả:** (Admin) Thu hồi một batch cụ thể (VD: lỗi sản xuất).

### Actors

- Admin

### Main Flow

1. Vào Batch Management
2. Search batch by batch_number
3. Click "Recall" button
4. Confirm dialog với reason
5. Hệ thống:
   - Mark batch as `recalled`
   - Create notification
   - List tất cả sales có sử dụng batch này
   - Generate recall report
6. Success toast

### API Endpoint

```http
POST /api/inventory/batches/:id/recall
Body: { reason }
```

---

## UC-INV-014: Full-Text Search Inventory

**Mô tả:** Tìm kiếm nhanh inventory sử dụng PostgreSQL Full-Text Search.

### Actors

- All users

### Main Flow

1. User nhập search query vào search bar
2. Hệ thống search across:
   - Medication name
   - Active ingredients
   - Manufacturer
   - Batch number
3. Hiển thị results với highlighting
4. Sort by relevance

### Technical Implementation

- PostgreSQL `tsvector` và `tsquery`
- Indexed search vector
- Support Vietnamese language

### API Endpoint

```http
GET /api/inventory/search?q=paracetamol&limit=20
```

---

## Database Schema

```sql
CREATE TABLE stock_inventories (
  id UUID PRIMARY KEY,
  medication_variant_id UUID REFERENCES medication_variants(id),
  batch_number VARCHAR(100),
  quantity INT NOT NULL DEFAULT 0,
  expiry_date DATE,
  received_date DATE,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_variant (medication_variant_id),
  INDEX idx_batch (batch_number),
  INDEX idx_expiry (expiry_date)
);

CREATE TABLE inventory_transactions (
  id UUID PRIMARY KEY,
  medication_variant_id UUID REFERENCES medication_variants(id),
  batch_number VARCHAR(100),
  transaction_type VARCHAR(50), -- purchase_in, sale_out, adjustment, transfer
  quantity_change INT NOT NULL,
  stock_before INT,
  stock_after INT,
  reference_type VARCHAR(50), -- purchase_order, sale, adjustment
  reference_id UUID,
  reason TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_variant (medication_variant_id),
  INDEX idx_type (transaction_type),
  INDEX idx_date (created_at),
  INDEX idx_reference (reference_type, reference_id)
);

CREATE TABLE physical_counts (
  id UUID PRIMARY KEY,
  count_date DATE NOT NULL,
  status VARCHAR(20) DEFAULT 'in_progress',
  started_by UUID REFERENCES users(id),
  finalized_by UUID REFERENCES users(id),
  finalized_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE physical_count_items (
  id UUID PRIMARY KEY,
  physical_count_id UUID REFERENCES physical_counts(id),
  medication_variant_id UUID REFERENCES medication_variants(id),
  system_quantity INT,
  counted_quantity INT,
  difference INT,
  INDEX idx_count (physical_count_id)
);
```

---

## Business Rules

1. **FIFO**: Always sell oldest batch first
2. **Negative Stock**: Not allowed
3. **Expiry Alerts**:
   - Critical: < 30 days
   - Warning: 30-90 days
4. **Low Stock**: Alert khi stock < reorder_point
5. **Batch Tracking**: Required for prescription medications
6. **Adjustment Audit**: Mọi adjustment phải có reason
7. **Physical Count**: Khuyến nghị mỗi quý

---

## Testing Checklist

- [ ] View inventory list
- [ ] Full-text search inventory
- [ ] View batches với expiry dates
- [ ] Low stock alerts generated
- [ ] Expiry alerts generated
- [ ] Stock adjustment successful
- [ ] Stock adjustment với negative → error
- [ ] Stock transfer between locations
- [ ] View transaction history
- [ ] Physical count workflow
- [ ] Export inventory report (Excel, PDF)
- [ ] Set reorder point
- [ ] View stock valuation
- [ ] FIFO allocation khi sale
- [ ] Batch recall
- [ ] Audit log recorded
- [ ] Notifications working

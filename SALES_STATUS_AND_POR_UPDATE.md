# Sales Status & Purchase Order Receipts Update Summary

## Thay đổi chính

### 1. **Sales Orders - Chỉ 3 trạng thái**

**Trước đây:** Sales có nhiều status (pending, paid, delivered, completed, cancelled, processing)

**Bây giờ:** Chỉ còn 3 status:

- ✅ **`pending`** - Đơn hàng chờ thanh toán
- ✅ **`paid`** - Đơn hàng đã thanh toán
- ✅ **`cancelled`** - Đơn hàng đã hủy

**Dữ liệu October 2025:**

- 8 đơn PAID (đã thanh toán)
- 1 đơn CANCELLED (đã hủy)
- 1 đơn PENDING (chờ thanh toán)
- Tổng revenue: 7,580,000 VND

### 2. **Dashboard - Bỏ "Sales by Status"**

**Đã xóa:**

- ❌ Phần "Sales by Status" card
- ❌ `salesByStatus` useMemo
- ❌ `getStatusColor()` function
- ❌ Import `BarChart3` icon

**Cải thiện:**

- ✅ Top Selling Medications giờ hiển thị full width
- ✅ Layout đơn giản hơn
- ✅ Quick Actions cập nhật: thay Analytics → Customers

### 3. **Purchase Order Receipts - Tăng từ 1 → 4**

**Trước đây:** Chỉ có 1 POR từ PO1

**Bây giờ:** 4 Purchase Order Receipts (POR):

#### Receipt 1 - PO1 (Viet Pharmaceutical - May 2024)

- Received: 23/05/2024
- Received by: staff1
- Items: 3
  - Paracetamol 500mg: 200 boxes
  - Amoxicillin 500mg: 100 boxes
  - Atorvastatin 20mg: 50 boxes

#### Receipt 2 - PO2 (Saigon MediSupply - June 2024)

- Received: 08/06/2024
- Received by: staff2
- Items: 2
  - Ibuprofen 400mg: 150 boxes
  - Omeprazole 20mg: 50 boxes

#### Receipt 3 - PO3 (Global BioMed - June 2024)

- Received: 25/06/2024
- Received by: staff1
- Items: 3
  - Metformin 500mg: 300 boxes
  - Salbutamol Inhaler: 50 units
  - Vitamin D3 1000IU: 100 boxes

#### Receipt 4 - PO4 (Viet Pharmaceutical - June 2024)

- Received: 20/06/2024
- Received by: staff3
- Items: 1
  - Amlodipine 10mg: 100 boxes

**Tổng:**

- 4 Purchase Order Receipts
- 9 Receipt Items
- 9 Inventory Entries (1:1 mapping)

### 4. **Inventory - Tăng từ 3 → 9 entries**

**Trước đây:** 3 inventory entries từ PO1 receipt

**Bây giờ:** 9 inventory entries từ 4 receipts:

| Medication   | Variant         | Quantity | Batch    | Expiry     | Bin                        |
| ------------ | --------------- | -------- | -------- | ---------- | -------------------------- |
| Paracetamol  | 500mg Tablets   | 200      | P2405001 | 2027-01-09 | Zone A, Rack A-001, L1-B01 |
| Amoxicillin  | 500mg Capsules  | 100      | A2405002 | 2026-02-14 | Zone A, Rack A-001, L1-B02 |
| Atorvastatin | 20mg Tablets    | 50       | T2405003 | 2025-12-19 | Zone A, Rack A-001, L1-B03 |
| Ibuprofen    | 400mg Tablets   | 150      | I2406001 | 2026-03-04 | Zone A, Rack A-001, L1-B04 |
| Omeprazole   | 20mg Capsules   | 50       | O2406002 | 2026-02-19 | Zone A, Rack A-001, L1-B05 |
| Metformin    | 500mg Tablets   | 300      | M2406001 | 2027-03-14 | Zone A, Rack A-001, L1-B06 |
| Salbutamol   | 100mcg Inhaler  | 50       | S2406002 | 2026-03-31 | Zone A, Rack A-001, L1-B07 |
| Vitamin D3   | 1000IU Capsules | 100      | V2406003 | 2027-02-27 | Zone A, Rack A-001, L1-B08 |
| Amlodipine   | 10mg Tablets    | 100      | M2406004 | 2027-03-19 | Zone A, Rack A-001, L1-B09 |

## Files đã sửa đổi

### 1. `apps/api/src/db/seed.js`

- ✅ Sửa tất cả sales orders: chỉ dùng status pending/paid/cancelled
- ✅ Tạo 4 purchase order receipts (thay vì 1)
- ✅ Tạo 9 receipt items (map đúng với PO items)
- ✅ Tạo 9 inventory entries (từ 4 receipts)
- ✅ Cập nhật summary message

### 2. `apps/web/src/pages/Dashboard.jsx`

- ✅ Xóa `salesByStatus` useMemo
- ✅ Xóa `getStatusColor()` function
- ✅ Xóa import `BarChart3`
- ✅ Xóa "Sales by Status" card component
- ✅ Sửa Top Selling Medications từ `lg:col-span-2` → full width
- ✅ Cập nhật Quick Actions: Analytics → Customers

## Database Statistics

```
✅ Seeded data summary:
- Users: 5
- User Credentials: 5
- User Registrations: 3
- Customers: 6
- Suppliers: 5
- Medications: 12 (6 with images)
- Medication Variants: 26
- Supplier-Medication Links: 14
- Warehouse Zones: 4
- Warehouse Racks: 8
- Warehouse Bins: 192
- Purchase Orders: 5
- Purchase Order Items: 11
- Purchase Order Receipts: 4 (PO1, PO2, PO3, PO4 received)
- Receipt Items: 9 (from 4 receipts)
- Inventory Entries: 9 (from all receipts)
- Sales Orders: 15 (5 from June 2024 + 10 from October 2025)
  * Status: pending, paid, cancelled only
  * October 2025: 10 orders - 8 paid, 1 cancelled, 1 pending
  * Total October Revenue: 7,580,000 VND
- Sales Order Items: 6 (old June 2024 data only)
- Files: 3 + 6 medication images
- Notifications: 5
- Audit Logs: 5
- Reports: 4
- Shifts: 4
- Shift Assignments: 8
- Settings: 10
```

## Kiểm tra

### 1. Sales Status

```sql
SELECT status, COUNT(*) as count, SUM(total_amount) as revenue
FROM sales_orders
WHERE EXTRACT(YEAR FROM order_date) = 2025
  AND EXTRACT(MONTH FROM order_date) = 10
GROUP BY status;
```

**Kết quả mong đợi:**

- paid: 8 orders
- cancelled: 1 order
- pending: 1 order

### 2. Purchase Order Receipts

```sql
SELECT por.id, po.id as po_id, s.name as supplier,
       por.received_date, u.name as received_by,
       COUNT(pori.id) as item_count
FROM purchase_order_receipts por
JOIN purchase_orders po ON por.purchase_order_id = po.id
JOIN suppliers s ON po.supplier_id = s.id
JOIN users u ON por.received_by = u.id
LEFT JOIN purchase_order_receipt_items pori ON por.id = pori.purchase_order_receipt_id
GROUP BY por.id, po.id, s.name, por.received_date, u.name
ORDER BY por.received_date;
```

**Kết quả mong đợi:** 4 receipts

### 3. Inventory

```sql
SELECT COUNT(*) as total_inventory_entries
FROM inventory;
```

**Kết quả mong đợi:** 9 entries

## Testing

### 1. Run seed

```bash
cd apps/api
pnpm run db:seed
```

### 2. Kiểm tra Dashboard

```bash
cd apps/web
pnpm run dev
```

Mở <http://localhost:3000/dashboard>

**Verify:**

- ✅ Không còn "Sales by Status" card
- ✅ Top Selling Medications hiển thị full width
- ✅ Quick Actions có "Customers" thay vì "Analytics"
- ✅ Stats cards hiển thị đúng October 2025 data

### 3. Kiểm tra API

```bash
# Monthly sales report
curl http://localhost:5000/api/reports/sales/monthly/2025/10 \
  -H "Authorization: Bearer {token}"

# Verify status chỉ có: pending, paid, cancelled
```

## Benefits

### 1. Đơn giản hóa Sales Flow

- Chỉ 3 trạng thái rõ ràng
- Dễ quản lý và theo dõi
- Tránh confusion với nhiều status

### 2. Dashboard sạch hơn

- Bỏ thông tin không cần thiết
- Focus vào Top Selling Products
- Layout gọn gàng hơn

### 3. Nhiều dữ liệu test hơn

- 4 Purchase Order Receipts thay vì 1
- 9 Inventory entries thay vì 3
- Dễ test các tính năng inventory, stock, receiving

## Migration Notes

**Nếu production đã có dữ liệu:**

```sql
-- Update các status cũ sang mới
UPDATE sales_orders
SET status = CASE
  WHEN status IN ('delivered', 'completed') THEN 'paid'
  WHEN status IN ('processing') THEN 'pending'
  ELSE status
END
WHERE status NOT IN ('pending', 'paid', 'cancelled');
```

## Kết luận

✅ Sales orders giờ chỉ có 3 trạng thái: pending, paid, cancelled
✅ Dashboard bỏ "Sales by Status" - gọn gàng hơn
✅ Tăng Purchase Order Receipts từ 1 → 4 (nhiều data test hơn)
✅ Tăng Inventory từ 3 → 9 entries
✅ Seed script chạy thành công
✅ Database consistent và ready to test!

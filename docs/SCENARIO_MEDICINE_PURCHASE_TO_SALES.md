# Scenario: Luồng Nhập Thuốc Đến Bán Thuốc Xong

## Mục Đích

Tài liệu này mô tả chi tiết các kịch bản (scenarios) cho toàn bộ luồng từ nhập thuốc từ nhà cung cấp đến bán thuốc cho khách hàng, bao gồm quản lý kho, kiểm kê, và bán hàng.

---

## 1. SCENARIO: Tạo Đơn Nhập Hàng Từ Nhà Cung Cấp

### 1.1 Happy Path - Tạo Đơn Nhập Hàng Thành Công

**Tiêu đề**: Nhân viên kho tạo đơn nhập hàng mới từ nhà cung cấp

**Precondition**:

- Người dùng đã đăng nhập với vai trò "staff" hoặc "manager"
- Có quyền quản lý nhập hàng
- Nhà cung cấp đã tồn tại trong hệ thống
- Thuốc/variant đã được khai báo

**Steps**:

1. Nhân viên truy cập trang "Nhập Hàng" (Purchase Orders)
2. Nhấn nút "Tạo Đơn Nhập Mới"
3. Chọn nhà cung cấp: "Công ty Dược phẩm Tân Dương"
4. Nhập ngày dự kiến nhận hàng: "20/11/2025"
5. Thêm sản phẩm:
   - Chọn thuốc: "Paracetamol 500mg"
   - Chọn variant: "Vỉ 10 viên"
   - Nhập số lượng: 100 vỉ
   - Đơn giá: 50,000 VNĐ/vỉ
   - Thành tiền: 5,000,000 VNĐ
6. Thêm sản phẩm thứ 2:
   - Chọn thuốc: "Amoxicillin 250mg"
   - Chọn variant: "Lọ 100ml"
   - Nhập số lượng: 50 lọ
   - Đơn giá: 80,000 VNĐ/lọ
   - Thành tiền: 4,000,000 VNĐ
7. Xem tóm tắt đơn:
   - Tổng tiền: 9,000,000 VNĐ
   - Số lượng loại sản phẩm: 2
   - Ghi chú: "Nhập cấp cho tháng 11"
8. Nhấn "Lưu Đơn"

**Expected Result**:

- ✅ Đơn nhập hàng được tạo thành công
- ✅ Hiển thị mã đơn: "PO-2025-00123"
- ✅ Trạng thái đơn: "pending"
- ✅ Thông báo: "Đơn nhập hàng được tạo thành công. Mã đơn: PO-2025-00123"
- ✅ Chuyển hướng đến chi tiết đơn

**Database Changes**:

```sql
-- Tạo đơn nhập hàng
INSERT INTO purchase_orders (supplier_id, order_date, expected_date, status, total_amount, created_by, created_at)
VALUES (
    [supplier_id],
    NOW(),
    '2025-11-20',
    'pending',
    9000000,
    [user_id],
    NOW()
);
-- Lấy ID đơn vừa tạo
SELECT @purchase_order_id := LAST_INSERT_ID();

-- Thêm chi tiết dòng 1
INSERT INTO purchase_order_items (purchase_order_id, supplier_medication_variant_id, quantity, unit_price, total_price)
VALUES (@purchase_order_id, [variant_id_1], 100, 50000, 5000000);

-- Thêm chi tiết dòng 2
INSERT INTO purchase_order_items (purchase_order_id, supplier_medication_variant_id, quantity, unit_price, total_price)
VALUES (@purchase_order_id, [variant_id_2], 50, 80000, 4000000);

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'CREATE',
    'purchase_order',
    @purchase_order_id,
    JSON_BUILD_OBJECT('status', 'pending', 'total_amount', 9000000),
    NOW()
);
```

**Postcondition**:

- Đơn nhập hàng có thể được chỉnh sửa hoặc xóa trong trạng thái "pending"
- Có thể gửi đơn cho nhà cung cấp

---

### 1.2 Alternative Flow - Chọn Nhà Cung Cấp Không Tồn Tại

**Tiêu đề**: Hệ thống từ chối khi chọn nhà cung cấp không hợp lệ

**Precondition**:

- Nhân viên đang tạo đơn nhập hàng

**Steps**:

1. Chọn dropdown "Nhà Cung Cấp"
2. Hệ thống chỉ hiển thị các nhà cung cấp có status = "active"
3. Cố gắng chọn nhà cung cấp bị vô hiệu hóa

**Expected Result**:

- ❌ Nhà cung cấp không hiển thị trong danh sách
- ❌ Không thể chọn nhà cung cấp không hoạt động

---

### 1.3 Alternative Flow - Số Lượng Không Hợp Lệ

**Tiêu đề**: Hệ thống từ chối số lượng không hợp lệ

**Precondition**:

- Nhân viên đang thêm sản phẩm vào đơn

**Steps**:

1. Nhập số lượng: "0" hoặc "-10"
2. Nhấn "Thêm Sản Phẩm"

**Expected Result**:

- ❌ Hiển thị lỗi: "Số lượng phải lớn hơn 0"
- ❌ Không thêm được sản phẩm

---

## 2. SCENARIO: Gửi Đơn Nhập Hàng

### 2.1 Happy Path - Gửi Đơn Thành Công

**Tiêu đề**: Nhân viên gửi đơn nhập hàng cho nhà cung cấp

**Precondition**:

- Đơn nhập hàng ở trạng thái "pending"
- Có ít nhất 1 sản phẩm trong đơn

**Steps**:

1. Nhân viên xem chi tiết đơn nhập hàng
2. Nhấn nút "Gửi Đơn"
3. Hệ thống hiển thị xác nhận: "Gửi đơn PO-2025-00123 cho nhà cung cấp Công ty Dược phẩm Tân Dương?"
4. Nhấn "Xác Nhận"
5. Hệ thống cập nhật trạng thái thành "ordered"

**Expected Result**:

- ✅ Đơn được gửi thành công
- ✅ Trạng thái đơn chuyển sang "ordered"
- ✅ Thông báo: "Đơn hàng đã được gửi"
- ✅ Email được gửi cho nhà cung cấp (nếu email được cấu hình)
- ✅ Hiển thị thời gian gửi: "13/11/2025 10:30 AM"

**Database Changes**:

```sql
UPDATE purchase_orders
SET status = 'ordered', updated_at = NOW()
WHERE id = [purchase_order_id];

INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'UPDATE', 'purchase_order', [purchase_order_id],
        JSON_BUILD_OBJECT('status', 'pending -> ordered'), NOW());
```

**Postcondition**:

- Đơn không thể chỉnh sửa nữa (chỉ xem)
- Có thể hủy đơn (nếu có quyền)
- Chờ nhà cung cấp gửi hàng

---

## 3. SCENARIO: Nhập Hàng (Receiving)

### 3.1 Happy Path - Nhập Hàng Thành Công

**Tiêu đề**: Nhân viên kho nhập hàng khi nhận được từ nhà cung cấp

**Precondition**:

- Đơn nhập hàng ở trạng thái "ordered"
- Hàng đã được nhân viên kho nhận vật lý
- Có Phiếu gửi hàng từ nhà cung cấp

**Steps**:

1. Nhân viên kho truy cập trang "Nhập Hàng" (Receiving)
2. Tìm đơn: "PO-2025-00123"
3. Nhấn "Tiếp Nhận Hàng"
4. Kiểm tra từng sản phẩm:
   - Sản phẩm 1: Paracetamol 500mg (Vỉ 10 viên)
     - Số lượng dự kiến: 100 vỉ
     - Số lượng thực tế: 100 vỉ
     - Batch: "LAB20250915"
     - Ngày sản xuất: "15/09/2025"
     - Ngày hết hạn: "14/09/2027"
     - Tình trạng: "Tốt"
   - Sản phẩm 2: Amoxicillin 250mg (Lọ 100ml)
     - Số lượng dự kiến: 50 lọ
     - Số lượng thực tế: 50 lọ
     - Batch: "AMX20250910"
     - Ngày sản xuất: "10/09/2025"
     - Ngày hết hạn: "09/09/2026"
     - Tình trạng: "Tốt"
5. Ghi chú: "Hàng nhập đúng tiêu chuẩn"
6. Nhấn "Xác Nhận Nhập Hàng"

**Expected Result**:

- ✅ Phiếu tiếp nhận được tạo: "GRN-2025-00456"
- ✅ Bản ghi trong `purchase_order_receipts` được tạo
- ✅ Bản ghi trong `purchase_order_receipt_items` được tạo
- ✅ Trạng thái đơn chuyển sang "received"
- ✅ Kho hàng được cập nhật
- ✅ Thông báo: "Nhập hàng thành công. Mã GRN: GRN-2025-00456"

**Database Changes**:

```sql
-- Tạo bản ghi tiếp nhận
INSERT INTO purchase_order_receipts (purchase_order_id, received_date, received_by, created_at)
VALUES ([purchase_order_id], NOW(), [user_id], NOW());
SELECT @receipt_id := LAST_INSERT_ID();

-- Thêm chi tiết sản phẩm 1
INSERT INTO purchase_order_receipt_items (purchase_order_receipt_id, purchase_order_item_id, quantity)
VALUES (@receipt_id, [po_item_1_id], 100);

-- Thêm chi tiết sản phẩm 2
INSERT INTO purchase_order_receipt_items (purchase_order_receipt_id, purchase_order_item_id, quantity)
VALUES (@receipt_id, [po_item_2_id], 50);

-- Cập nhật trạng thái đơn
UPDATE purchase_orders SET status = 'received' WHERE id = [purchase_order_id];

-- Tạo bản ghi kho cho sản phẩm 1
INSERT INTO inventory (medication_variant_id, purchase_order_receipt_items_id, bin_id, batch_number, manufacture_date, expiry_date, quantity, quantity_reserved)
VALUES (
    [variant_id_1],
    [receipt_item_1_id],
    [bin_id_1],
    'LAB20250915',
    '2025-09-15',
    '2027-09-14',
    100,
    0
);

-- Tạo bản ghi kho cho sản phẩm 2
INSERT INTO inventory (medication_variant_id, purchase_order_receipt_items_id, bin_id, batch_number, manufacture_date, expiry_date, quantity, quantity_reserved)
VALUES (
    [variant_id_2],
    [receipt_item_2_id],
    [bin_id_2],
    'AMX20250910',
    '2025-09-10',
    '2026-09-09',
    50,
    0
);

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'CREATE', 'purchase_order_receipt', @receipt_id,
        JSON_BUILD_OBJECT('status', 'received', 'items', 2), NOW());
```

**Postcondition**:

- Thuốc có sẵn bán
- Kho được cập nhật
- Có thể truy vấn tồn kho

---

### 3.2 Alternative Flow - Số Lượng Nhận Không Khớp

**Tiêu đề**: Số lượng nhận khác với số lượng đặt

**Precondition**:

- Nhân viên kho đang nhập hàng
- Số lượng thực tế khác với dự kiến

**Steps**:

1. Sản phẩm 1: Dự kiến 100 vỉ, nhưng chỉ nhận 98 vỉ (thiếu 2 vỉ)
2. Nhập số lượng thực tế: 98
3. Hệ thống hiển thị cảnh báo: "Thiếu 2 vỉ so với đơn"
4. Chọn lý do: "Hàng bị hỏng"
5. Nhấn "Tiếp Tục"

**Expected Result**:

- ⚠️ Hệ thống ghi lại chênh lệch: 2 vỉ
- ⚠️ Hiển thị thông báo cảnh báo
- ⚠️ Ghi lại lý do trong audit log
- ✅ Vẫn có thể nhập hàng
- ✅ Số lượng kho: 98 vỉ (không phải 100)

**Discrepancy Handling**:

```sql
-- Tạo bản ghi chênh lệch
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'DISCREPANCY', 'purchase_order_receipt', @receipt_id,
        JSON_BUILD_OBJECT('expected', 100, 'received', 98, 'reason', 'Hàng bị hỏng'), NOW());
```

---

### 3.3 Alternative Flow - Hàng Bị Hỏng (Rejection)

**Tiêu đề**: Từ chối hàng bị hỏng hoặc không đạt tiêu chuẩn

**Precondition**:

- Nhân viên kho phát hiện hàng bị hỏng hoặc hết hạn

**Steps**:

1. Nhân viên kho phát hiện sản phẩm: "Lọ thuốc bị nứt, chất lỏng rỉ"
2. Chọn hành động: "Từ Chối Hàng"
3. Ghi lý do: "Lọ nứt, chất lỏng rỉ, không thể bán"
4. Chọn thao tác: "Trả Lại Nhà Cung Cấp"
5. Nhấn "Xác Nhận"

**Expected Result**:

- ⚠️ Hàng không được nhập vào kho
- ⚠️ Tạo bản ghi từ chối
- ⚠️ Thông báo cho nhà cung cấp
- ✅ Tạo phiếu trả hàng
- ✅ Số lượng kho không thay đổi

---

## 4. SCENARIO: Quản Lý Kho

### 4.1 Happy Path - Xem Tồn Kho

**Tiêu đề**: Nhân viên xem danh sách thuốc có sẵn trong kho

**Precondition**:

- Người dùng đã đăng nhập
- Có ít nhất 1 sản phẩm trong kho

**Steps**:

1. Nhân viên truy cập trang "Quản Lý Kho" (Inventory)
2. Hệ thống hiển thị danh sách tất cả các lô/batch hàng

**Expected Result**:

- ✅ Hiển thị danh sách:
  | Tên Thuốc | Variant | Batch | NSX | HSD | Tồn Kho | Dự Trữ | Khả Dụng |
  |-----------|---------|-------|-----|-----|---------|--------|----------|
  | Paracetamol 500mg | Vỉ 10 viên | LAB20250915 | 15/09/2025 | 14/09/2027 | 100 | 20 | 80 |
  | Amoxicillin 250mg | Lọ 100ml | AMX20250910 | 10/09/2025 | 09/09/2026 | 50 | 10 | 40 |

- ✅ Có bộ lọc:
  - Theo tên thuốc
  - Theo variant
  - Theo trạng thái (sắp hết, bình thường, hết hạn)
  - Theo vị trí (zone, rack, bin)

**Database Query**:

```sql
SELECT
    mv.name as variant_name,
    m.name as medication_name,
    i.batch_number,
    i.manufacture_date,
    i.expiry_date,
    i.quantity,
    i.quantity_reserved,
    (i.quantity - i.quantity_reserved) as available_quantity,
    CONCAT(z.code, '-', r.code, '-', b.code) as location,
    CASE
        WHEN i.expiry_date < NOW() THEN 'expired'
        WHEN i.expiry_date < NOW() + INTERVAL '30 days' THEN 'expiring_soon'
        WHEN (i.quantity - i.quantity_reserved) <= 10 THEN 'low_stock'
        ELSE 'normal'
    END as status
FROM inventory i
JOIN medication_variants mv ON i.medication_variant_id = mv.id
JOIN medications m ON mv.medication_id = m.id
JOIN warehouse_bins b ON i.bin_id = b.id
JOIN warehouse_racks r ON b.rack_id = r.id
JOIN warehouse_zones z ON r.zone_id = z.id
ORDER BY m.name, i.expiry_date;
```

**Postcondition**:

- Có thể tìm kiếm thuốc cụ thể
- Có thể xem chi tiết từng lô hàng

---

### 4.2 Happy Path - Kiểm Kho

**Tiêu đề**: Nhân viên kho kiểm kho định kỳ

**Precondition**:

- Người dùng có vai trò kho hoặc quản lý
- Có ít nhất 1 sản phẩm trong kho

**Steps**:

1. Nhân viên truy cập trang "Kiểm Kho" (Stock Take)
2. Chọn ngày kiểm: "13/11/2025"
3. Bắt đầu kiểm kho:
   - Quét barcode (hoặc nhập thủ công): "LAB20250915"
   - Thuốc: "Paracetamol 500mg - Vỉ 10 viên"
   - Số lượng hệ thống: 100
   - Số lượng thực tế: 98
   - Chênh lệch: -2
   - Ghi chú: "2 vỉ bị hỏng"
4. Tiếp tục kiểm sản phẩm khác...
5. Hoàn thành kiểm kho

**Expected Result**:

- ✅ Tạo bản ghi kiểm kho
- ✅ Ghi lại chênh lệch nếu có
- ✅ Hiển thị báo cáo: "Kiểm kho hoàn thành. Chênh lệch: -2 vỉ"
- ✅ Cập nhật số lượng kho nếu cần

**Postcondition**:

- Kho chính xác và được đối chiếu
- Có thể tham chiếu cho báo cáo

---

### 4.3 Alternative Flow - Hàng Sắp Hết Hạn

**Tiêu đề**: Hệ thống cảnh báo hàng sắp hết hạn

**Precondition**:

- Có hàng trong kho với ngày hết hạn < 30 ngày

**Steps**:

1. Hệ thống tự động kiểm tra mỗi ngày
2. Nếu phát hiện hàng sắp hết hạn, hiển thị cảnh báo trên dashboard

**Expected Result**:

- ⚠️ Hiển thị cảnh báo: "3 lô hàng sắp hết hạn trong 30 ngày"
- ⚠️ Gợi ý: "Ưu tiên bán hoặc trả lại nhà cung cấp"
- ⚠️ Có danh sách chi tiết:
  - Paracetamol: HSD 14/09/2027 (còn 305 ngày)
  - Amoxicillin: HSD 09/09/2026 (còn 271 ngày)

---

## 5. SCENARIO: Bán Hàng (Sales)

### 5.1 Happy Path - Tạo Hóa Đơn Bán Hàng Thành Công

**Tiêu đề**: Nhân viên bán hàng tạo hóa đơn bán thuốc

**Precondition**:

- Nhân viên đã đăng nhập với vai trò "staff" hoặc "pharmacist"
- Thuốc có sẵn trong kho
- Khách hàng xuất hiện để mua thuốc

**Steps**:

1. Nhân viên bán hàng truy cập trang "Bán Hàng" (Point of Sale)
2. Tạo hóa đơn mới:
   - Nhấn "Hóa Đơn Mới"
3. Thêm khách hàng (nếu khách hàng đã có trong hệ thống):
   - Nhấn "Chọn Khách Hàng"
   - Tìm: "Nguyễn Thị B"
   - Chọn khách hàng
4. Thêm sản phẩm:
   - Quét barcode hoặc tìm sản phẩm: "Paracetamol 500mg"
   - Chọn: "Vỉ 10 viên"
   - Chọn batch: "LAB20250915"
   - Số lượng: 2 vỉ
   - Đơn giá: 55,000 VNĐ/vỉ
   - Thành tiền: 110,000 VNĐ
5. Thêm sản phẩm thứ 2:
   - Tìm: "Amoxicillin 250mg"
   - Chọn: "Lọ 100ml"
   - Chọn batch: "AMX20250910"
   - Số lượng: 1 lọ
   - Đơn giá: 95,000 VNĐ/lọ
   - Thành tiền: 95,000 VNĐ
6. Xem tóm tắt:
   - Tổng: 205,000 VNĐ
   - Giảm giá: 0 VNĐ
   - Thành tiền: 205,000 VNĐ
7. Chọn phương thức thanh toán: "Tiền Mặt"
8. Khách hàng thanh toán
9. Nhấn "Hoàn Thành"
10. Hệ thống in hóa đơn

**Expected Result**:

- ✅ Hóa đơn được tạo thành công
- ✅ Mã hóa đơn: "SO-2025-00789"
- ✅ Trạng thái: "paid"
- ✅ Hóa đơn được in
- ✅ Thông báo: "Bán hàng thành công. Mã SO: SO-2025-00789"
- ✅ Kho được cập nhật ngay lập tức

**Database Changes**:

```sql
-- Tạo đơn bán hàng
INSERT INTO sales_orders (customer_id, order_date, total_amount, status, payment_method, salesperson_id, created_at)
VALUES ([customer_id], NOW(), 205000, 'paid', 'cash', [user_id], NOW());
SELECT @sales_order_id := LAST_INSERT_ID();

-- Thêm chi tiết sản phẩm 1
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@sales_order_id, [variant_id_1], 2, 55000, 110000);

-- Thêm chi tiết sản phẩm 2
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@sales_order_id, [variant_id_2], 1, 95000, 95000);

-- Cập nhật kho (trừ quantity_reserved thành quantity)
UPDATE inventory
SET quantity = quantity - 2, quantity_reserved = quantity_reserved - 2
WHERE medication_variant_id = [variant_id_1] AND batch_number = 'LAB20250915';

UPDATE inventory
SET quantity = quantity - 1, quantity_reserved = quantity_reserved - 1
WHERE medication_variant_id = [variant_id_2] AND batch_number = 'AMX20250910';

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'CREATE', 'sales_order', @sales_order_id,
        JSON_BUILD_OBJECT('items', 2, 'total_amount', 205000, 'payment_method', 'cash'), NOW());
```

**Postcondition**:

- Kho được giảm
- Hóa đơn được ghi lại cho báo cáo
- Doanh thu được cập nhật

---

### 5.2 Happy Path - Bán Hàng Có Đơn Thuốc

**Tiêu đề**: Bán thuốc yêu cầu đơn (prescription required)

**Precondition**:

- Thuốc yêu cầu đơn (is_prescription_required = true)
- Khách hàng có đơn thuốc hợp lệ

**Steps**:

1. Nhân viên bán hàng tạo hóa đơn mới
2. Thêm thuốc yêu cầu đơn: "Amoxicillin 500mg"
3. Hệ thống hiển thị cảnh báo: "Thuốc này yêu cầu đơn. Vui lòng cung cấp"
4. Nhân viên:
   - Upload ảnh đơn: [chọn file]
   - Hoặc nhập thông tin đơn:
     - Ngày kê: "13/11/2025"
     - Bác sĩ: "Trần Văn C"
     - Ghi chú: "Uống 3 lần/ngày"
5. Hệ thống xác minh đơn
6. Tiếp tục bán hàng

**Expected Result**:

- ✅ Đơn được lưu trữ
- ✅ Liên kết đơn với hóa đơn bán
- ✅ Hóa đơn được tạo thành công

**Database Changes**:

```sql
-- Nếu upload file đơn
INSERT INTO files (filename, file_type, mime_type, file_size, storage_path, uploaded_by, uploaded_at)
VALUES ('[prescription_image.jpg]', 'prescription', 'image/jpeg', [size], '[path]', [user_id], NOW());
SELECT @file_id := LAST_INSERT_ID();

-- Cập nhật hóa đơn bán hàng với prescription_id
UPDATE sales_orders
SET prescription_id = @file_id,
    prescription_note = 'Uống 3 lần/ngày'
WHERE id = @sales_order_id;
```

**Postcondition**:

- Thuốc chỉ có thể bán với đơn hợp lệ
- Đơn được lưu trữ cho kiểm tra

---

### 5.3 Alternative Flow - Hàng Không Đủ Số Lượng

**Tiêu đề**: Khi khách muốn mua nhưng kho không đủ

**Precondition**:

- Khách muốn mua 5 vỉ Paracetamol
- Kho chỉ có 2 vỉ sẵn

**Steps**:

1. Nhân viên nhập số lượng: 5 vỉ
2. Hệ thống kiểm tra kho
3. Hiển thị cảnh báo: "Chỉ còn 2 vỉ trong kho"

**Expected Result**:

- ⚠️ Hiển thị lỗi/cảnh báo
- ⚠️ Cho phép 2 tùy chọn:
  1. Giảm số lượng xuống 2 vỉ
  2. Hủy sản phẩm này
- ⚠️ Gợi ý: "Có thể đặt hàng trước cho số lượng còn lại (3 vỉ)"

---

### 5.4 Alternative Flow - Bán Hàng Hết Hạn

**Tiêu đề**: Hệ thống từ chối bán hàng đã hết hạn

**Precondition**:

- Batch hàng có ngày hết hạn < ngày hiện tại

**Steps**:

1. Nhân viên quét barcode hàng đã hết hạn
2. Hệ thống kiểm tra ngày hết hạn

**Expected Result**:

- ❌ Hiển thị lỗi: "Sản phẩm đã hết hạn. Không thể bán"
- ❌ Không thêm sản phẩm vào hóa đơn
- ✅ Gợi ý: "Liên hệ kho để loại bỏ hàng hết hạn"

---

### 5.5 Alternative Flow - Khách Hàng Mới

**Tiêu đề**: Bán hàng cho khách hàng không có trong hệ thống

**Precondition**:

- Khách hàng lần đầu mua

**Steps**:

1. Nhân viên chọn "Khách Hàng Mới" hoặc bỏ qua bước chọn khách hàng
2. Thêm sản phẩm vào hóa đơn
3. Nhấn "Hoàn Thành"
4. Hệ thống hiển thị: "Không có thông tin khách hàng. Tạo khách hàng mới?"

**Optional Steps**:

1. Nhấn "Tạo Mới"
2. Nhập thông tin:
   - Tên: "Trần Văn D"
   - Số điện thoại: "0909123456"
   - Email: (tùy chọn)
   - Địa chỉ: (tùy chọn)
3. Nhấn "Lưu"

**Expected Result**:

- ✅ Khách hàng mới được tạo (nếu chọn)
- ✅ Hóa đơn được tạo với customer_id = null (nếu không tạo)
- ✅ Hóa đơn được tạo thành công

**Database Changes** (nếu tạo khách hàng mới):

```sql
INSERT INTO customers (name, phone, email, address, created_at)
VALUES ('Trần Văn D', '0909123456', NULL, NULL, NOW());
SELECT @customer_id := LAST_INSERT_ID();

-- Cập nhật hóa đơn
UPDATE sales_orders SET customer_id = @customer_id WHERE id = @sales_order_id;
```

---

### 5.6 Alternative Flow - Hoàn Trả Sản Phẩm

**Tiêu đề**: Khách hàng hoàn trả sản phẩm

**Precondition**:

- Hóa đơn đã được tạo trước đó
- Khách hàng muốn hoàn trả

**Steps**:

1. Nhân viên truy cập hóa đơn cũ: "SO-2025-00789"
2. Nhấn "Hoàn Trả"
3. Chọn sản phẩm cần hoàn trả:
   - Paracetamol 500mg (Vỉ): 1 vỉ (từ 2 vỉ)
4. Lý do hoàn trả: "Không phù hợp"
5. Nhấn "Xác Nhận"

**Expected Result**:

- ✅ Tạo hóa đơn hoàn trả
- ✅ Cập nhật số dư hoàn trả
- ✅ Kho được cập nhật (tăng số lượng)
- ✅ Hiển thị thông báo hoàn thành

**Database Changes**:

```sql
-- Tạo hóa đơn hoàn trả
INSERT INTO sales_orders (customer_id, order_date, total_amount, status, payment_method, salesperson_id, notes, created_at)
VALUES ([customer_id], NOW(), -55000, 'paid', 'cash_refund', [user_id], 'Return - Not suitable', NOW());
SELECT @return_order_id := LAST_INSERT_ID();

-- Thêm chi tiết sản phẩm hoàn trả
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@return_order_id, [variant_id_1], -1, 55000, -55000);

-- Cập nhật kho (tăng số lượng)
UPDATE inventory
SET quantity = quantity + 1
WHERE medication_variant_id = [variant_id_1] AND batch_number = 'LAB20250915';
```

---

## 6. SCENARIO: Báo Cáo & Thống Kê

### 6.1 Happy Path - Xem Báo Cáo Bán Hàng

**Tiêu đề**: Quản lý xem báo cáo bán hàng hàng ngày

**Precondition**:

- Người dùng có vai trò "manager" hoặc "owner"
- Có ít nhất 1 hóa đơn trong hệ thống

**Steps**:

1. Truy cập trang "Báo Cáo" (Reports)
2. Chọn "Báo Cáo Bán Hàng Hàng Ngày"
3. Chọn ngày: "13/11/2025"
4. Hệ thống hiển thị báo cáo

**Expected Result**:

- ✅ Hiển thị:
  - Tổng doanh thu: 205,000 VNĐ
  - Số hóa đơn: 1
  - Trung bình hóa đơn: 205,000 VNĐ
  - Sản phẩm bán chạy: Paracetamol (2 vỉ)
  - Chi tiết từng hóa đơn

**Database Query**:

```sql
SELECT
    SO.id,
    SO.order_date,
    C.name as customer_name,
    SUM(SOI.total_price) as total_amount,
    COUNT(SOI.id) as item_count,
    U.name as salesperson_name
FROM sales_orders SO
LEFT JOIN customers C ON SO.customer_id = C.id
LEFT JOIN sales_order_items SOI ON SO.id = SOI.sales_order_id
LEFT JOIN users U ON SO.salesperson_id = U.id
WHERE SO.status = 'paid' AND DATE(SO.order_date) = '2025-11-13'
GROUP BY SO.id, SO.order_date, C.name, U.name
ORDER BY SO.order_date DESC;
```

---

### 6.2 Happy Path - Báo Cáo Tồn Kho

**Tiêu đề**: Xem báo cáo tồn kho hiện tại

**Precondition**:

- Có ít nhất 1 sản phẩm trong kho

**Steps**:

1. Chọn "Báo Cáo Tồn Kho"
2. Chọn ngày: "13/11/2025"

**Expected Result**:

- ✅ Hiển thị:
  - Tổng giá trị kho: 9,450,000 VNĐ
  - Số loại sản phẩm: 2
  - Số lô/batch: 2
  - Danh sách chi tiết mỗi sản phẩm:
    | Sản Phẩm | Variant | Batch | Tồn Kho | Giá Tính Kho | Ghi Chú |
    |----------|---------|-------|---------|------------|---------|
    | Paracetamol | Vỉ 10v | LAB... | 98 | 5,390,000 | Bình thường |
    | Amoxicillin | Lọ 100ml | AMX... | 49 | 4,060,000 | Bình thường |

---

## 7. TIMELINE - Luồng Nhập Đến Bán Xong

```
┌──────────────────────────────────────────────────────────────────┐
│ Ngày 13/11/2025: Tạo Đơn Nhập Hàng                             │
└──────────────────────────────────────────────────────────────────┘

09:00 AM
├─ Nhân viên kho tạo đơn nhập: PO-2025-00123
├─ Chọn nhà cung cấp: Công ty Dược phẩm Tân Dương
├─ Thêm 2 sản phẩm
├─ Tổng tiền: 9,000,000 VNĐ
└─ Trạng thái: pending

09:15 AM
├─ Nhân viên gửi đơn cho nhà cung cấp
├─ Trạng thái: ordered
├─ Email được gửi cho nhà cung cấp
└─ Chờ nhà cung cấp gửi hàng

┌──────────────────────────────────────────────────────────────────┐
│ Ngày 15/11/2025: Nhập Hàng (Receiving)                         │
└──────────────────────────────────────────────────────────────────┘

10:00 AM
├─ Nhân viên kho nhận được hàng từ nhà cung cấp
├─ Kiểm tra chi tiết từng sản phẩm
├─ Tạo phiếu tiếp nhận: GRN-2025-00456
├─ Ghi batch, NSX, HSD
└─ Trạng thái đơn: received

10:30 AM
├─ Hàng được đưa vào kho
├─ Cập nhật kho:
│  ├─ Paracetamol: 100 vỉ (batch LAB20250915)
│  └─ Amoxicillin: 50 lọ (batch AMX20250910)
└─ Sẵn sàng bán

┌──────────────────────────────────────────────────────────────────┐
│ Ngày 13/11/2025: Bán Hàng (Sales)                              │
└──────────────────────────────────────────────────────────────────┘

02:00 PM
├─ Khách hàng "Nguyễn Thị B" đến mua thuốc
├─ Nhân viên bán hàng tạo hóa đơn
├─ Thêm sản phẩm:
│  ├─ Paracetamol 500mg (Vỉ): 2 vỉ × 55,000 VNĐ = 110,000 VNĐ
│  └─ Amoxicillin 250mg (Lọ): 1 lọ × 95,000 VNĐ = 95,000 VNĐ
├─ Tổng: 205,000 VNĐ
└─ Khách thanh toán bằng tiền mặt

02:05 PM
├─ Hóa đơn được tạo: SO-2025-00789
├─ Trạng thái: paid
├─ Hóa đơn được in
└─ Kho được cập nhật:
   ├─ Paracetamol: 98 vỉ (100 - 2)
   └─ Amoxicillin: 49 lọ (50 - 1)

02:10 PM
├─ Khách hàng nhận thuốc
├─ Bán hàng hoàn tất
└─ Doanh thu: +205,000 VNĐ
```

---

## 8. Database Schema - Luồng Nhập Bán

```
┌─────────────────────────────────────────────┐
│            PURCHASE FLOW                    │
└─────────────────────────────────────────────┘

    ┌────────────────┐
    │   suppliers    │
    └────────┬───────┘
             │ 1:N
    ┌────────▼─────────────────┐
    │  purchase_orders        │
    │ (pending/ordered/received)
    └────────┬─────────────────┘
             │ 1:N
    ┌────────▼──────────────────┐
    │  purchase_order_items     │
    └────────┬──────────────────┘
             │ 1:N
    ┌────────▼──────────────────┐
    │ purchase_order_receipts   │
    │ (GRN - Goods Receipt)     │
    └────────┬──────────────────┘
             │ 1:N
    ┌────────▼──────────────────────┐
    │purchase_order_receipt_items   │
    └────────┬───────────────────────┘
             │ 1:N
    ┌────────▼─────────────────┐
    │    inventory            │
    └────────┬────────────────┘
             │ 1:N
    ┌────────▼──────────────────┐
    │  sales_order_items       │
    │  (หลังจากขาย)             │
    └────────┬──────────────────┘
             │ N:1
    ┌────────▼──────────────────┐
    │    sales_orders          │
    │  (paid/cancelled)         │
    └──────────────────────────┘

┌─────────────────────────────────────────────┐
│            SALES FLOW                       │
└─────────────────────────────────────────────┘

    ┌─────────────────┐
    │   customers    │
    └────────┬────────┘
             │ 1:N
    ┌────────▼────────────────┐
    │    sales_orders        │
    │ (pending/paid/cancelled)│
    └────────┬───────────────┘
             │ 1:N
    ┌────────▼──────────────────┐
    │  sales_order_items       │
    │ (link to inventory items) │
    └──────────────────────────┘
```

---

## 9. API Endpoints - Luồng Nhập Bán

### Purchase Order Management

- `GET /api/purchase-orders` - Danh sách đơn nhập
- `POST /api/purchase-orders` - Tạo đơn nhập
- `GET /api/purchase-orders/:id` - Chi tiết đơn nhập
- `PUT /api/purchase-orders/:id` - Cập nhật đơn nhập
- `DELETE /api/purchase-orders/:id` - Xóa đơn nhập
- `POST /api/purchase-orders/:id/send` - Gửi đơn

### Receiving

- `GET /api/purchase-order-receipts` - Danh sách phiếu tiếp nhận
- `POST /api/purchase-order-receipts` - Tạo phiếu tiếp nhận
- `GET /api/purchase-order-receipts/:id` - Chi tiết phiếu tiếp nhận

### Inventory

- `GET /api/inventory` - Danh sách tồn kho
- `GET /api/inventory/:id` - Chi tiết tồn kho
- `POST /api/inventory/stock-take` - Kiểm kho

### Sales

- `GET /api/sales-orders` - Danh sách hóa đơn bán
- `POST /api/sales-orders` - Tạo hóa đơn bán
- `GET /api/sales-orders/:id` - Chi tiết hóa đơn bán
- `POST /api/sales-orders/:id/return` - Hoàn trả

### Reports

- `GET /api/reports/daily-sales` - Báo cáo bán hàng hàng ngày
- `GET /api/reports/inventory` - Báo cáo tồn kho
- `GET /api/reports/sales-summary` - Tổng hợp doanh thu

---

## 10. Validation Rules

### Purchase Order

| Field         | Validation             | Error Message                     |
| ------------- | ---------------------- | --------------------------------- |
| supplier_id   | Bắt buộc, phải tồn tại | "Nhà cung cấp không hợp lệ"       |
| expected_date | Bắt buộc, >= hôm nay   | "Ngày nhận phải >= ngày hiện tại" |
| items         | Ít nhất 1 sản phẩm     | "Phải có ít nhất 1 sản phẩm"      |
| quantity      | > 0                    | "Số lượng phải > 0"               |
| unit_price    | > 0                    | "Đơn giá phải > 0"                |

### Sales Order

| Field          | Validation                 | Error Message                 |
| -------------- | -------------------------- | ----------------------------- |
| items          | Ít nhất 1 sản phẩm         | "Phải có ít nhất 1 sản phẩm"  |
| quantity       | > 0 và <= tồn kho          | "Số lượng không hợp lệ"       |
| payment_method | Bắt buộc                   | "Chọn phương thức thanh toán" |
| prescription   | Bắt buộc nếu thuốc cần đơn | "Vui lòng cung cấp đơn"       |
| expiry_date    | Không hết hạn              | "Sản phẩm đã hết hạn"         |

---

## 11. Testing Checklist

### Purchase Order

- [ ] Tạo đơn nhập hàng thành công
- [ ] Gửi đơn cho nhà cung cấp
- [ ] Cập nhật đơn trong trạng thái pending
- [ ] Từ chối xóa đơn đã gửi
- [ ] Email được gửi cho nhà cung cấp

### Receiving

- [ ] Nhập hàng thành công
- [ ] Ghi lại batch, NSX, HSD
- [ ] Phát hiện chênh lệch số lượng
- [ ] Từ chối hàng hết hạn
- [ ] Cập nhật kho chính xác

### Inventory

- [ ] Xem tồn kho
- [ ] Kiểm kho định kỳ
- [ ] Cảnh báo hàng sắp hết hạn
- [ ] Cảnh báo hàng sắp hết
- [ ] Tính toán giá trị kho chính xác

### Sales

- [ ] Bán hàng thành công
- [ ] Từ chối bán hàng hết hạn
- [ ] Từ chối bán quá số lượng kho
- [ ] Yêu cầu đơn khi bán thuốc cần đơn
- [ ] Hoàn trả sản phẩm

### Reports

- [ ] Báo cáo bán hàng hàng ngày
- [ ] Báo cáo tồn kho
- [ ] Tính toán doanh thu chính xác
- [ ] Lọc theo ngày tháng

# Scenario: Luồng Bán Hàng

## Mục Đích

Tài liệu này mô tả chi tiết các kịch bản (scenarios) cho luồng bán hàng thuốc cho khách hàng, từ tạo đơn bán, thanh toán, đến ghi nhận bán hàng và cập nhật kho.

---

## 1. SCENARIO: Tạo Đơn Bán Hàng Mới

### 1.1 Happy Path - Tạo Đơn Bán Hàng Thành Công

**Tiêu đề**: Nhân viên bán hàng tạo đơn bán mới cho khách hàng

**Precondition**:

- Người dùng đã đăng nhập với vai trò "staff" hoặc "manager"
- Có quyền quản lý bán hàng
- Khách hàng đã tồn tại trong hệ thống hoặc là khách hàng mới
- Thuốc/variant có sẵn trong kho
- Tồn kho đủ để bán

**Steps**:

1. Nhân viên truy cập trang "Bán Hàng" (Sales/Orders)
2. Nhấn nút "Tạo Đơn Bán Mới"
3. Chọn/nhập thông tin khách hàng:
   - Chọn khách hàng cũ: "Công ty Sức Khỏe Plus" hoặc nhập khách hàng mới
   - Họ tên: "Phạm Thị B"
   - Số điện thoại: "0901234567"
   - Địa chỉ giao hàng: "456 Đường Hàm Nghi, Quận 1, TP.HCM"
4. Thêm sản phẩm:
   - Chọn thuốc: "Paracetamol 500mg"
   - Chọn variant: "Vỉ 10 viên"
   - Nhập số lượng bán: 50 vỉ
   - Đơn giá bán: 75,000 VNĐ/vỉ
   - Thành tiền: 3,750,000 VNĐ
5. Thêm sản phẩm thứ 2:
   - Chọn thuốc: "Vitamin C 1000mg"
   - Chọn variant: "Hộp 30 viên"
   - Nhập số lượng bán: 30 hộp
   - Đơn giá bán: 120,000 VNĐ/hộp
   - Thành tiền: 3,600,000 VNĐ
6. Nhập thông tin bổ sung:
   - Ghi chú: "Giao hàng vào sáng mai"
   - Loại thanh toán: "Tiền mặt"
7. Xem tóm tắt đơn:
   - Tổng tiền: 7,350,000 VNĐ
   - Số loại sản phẩm: 2
   - Tổng số lượng: 80 sản phẩm
8. Nhấn "Lưu Đơn"

**Expected Result**:

- ✅ Đơn bán hàng được tạo thành công
- ✅ Hiển thị mã đơn: "SO-2025-00456"
- ✅ Trạng thái đơn: "pending" (chờ thanh toán)
- ✅ Thông báo: "Đơn bán hàng được tạo thành công. Mã đơn: SO-2025-00456"
- ✅ Chuyển hướng đến chi tiết đơn

**Database Changes**:

```sql
-- Tạo hoặc cập nhật khách hàng
INSERT INTO customers (name, phone, address, status, created_at)
VALUES ('Phạm Thị B', '0901234567', '456 Đường Hàm Nghi, Quận 1, TP.HCM', 'active', NOW())
ON DUPLICATE KEY UPDATE updated_at = NOW();

-- Lấy customer_id
SELECT @customer_id := id FROM customers WHERE phone = '0901234567' LIMIT 1;

-- Tạo đơn bán hàng
INSERT INTO sales_orders (customer_id, order_date, payment_type, status, total_amount, notes, created_by, created_at)
VALUES (
    @customer_id,
    NOW(),
    'cash',
    'pending',
    7350000,
    'Giao hàng vào sáng mai',
    [user_id],
    NOW()
);

-- Lấy sales_order_id
SELECT @sales_order_id := LAST_INSERT_ID();

-- Thêm chi tiết dòng 1
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@sales_order_id, [variant_id_1], 50, 75000, 3750000);

-- Thêm chi tiết dòng 2
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@sales_order_id, [variant_id_2], 30, 120000, 3600000);

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'CREATE',
    'sales_order',
    @sales_order_id,
    JSON_BUILD_OBJECT('status', 'pending', 'total_amount', 7350000, 'customer_id', @customer_id),
    NOW()
);
```

**Postcondition**:

- Đơn bán hàng có thể được chỉnh sửa hoặc xóa trong trạng thái "pending"
- Khách hàng có thể được thêm vào danh sách khách hàng thường xuyên
- Tồn kho chưa bị ảnh hưởng (chỉ bị cập nhật khi hoàn tất bán hàng)

---

### 1.2 Alternative Flow - Khách Hàng Mới

**Tiêu đề**: Tạo đơn bán hàng cho khách hàng mới mà không có thông tin trước

**Precondition**:

- Nhân viên đang tạo đơn bán hàng mới

**Steps**:

1. Tại bước chọn khách hàng, chọn "Khách Hàng Mới"
2. Nhập thông tin khách hàng:
   - Họ tên: "Trần Văn C"
   - Số điện thoại: "0912345678"
   - Địa chỉ: "789 Đường Trần Hưng Đạo, Quận 5, TP.HCM"
   - Email (tùy chọn): "tran.van.c@email.com"
3. Hệ thống tạo bản ghi khách hàng mới
4. Tiếp tục thêm sản phẩm vào đơn

**Expected Result**:

- ✅ Khách hàng mới được tạo trong hệ thống
- ✅ Đơn bán hàng được liên kết với khách hàng vừa tạo
- ✅ Khách hàng có thể sử dụng cho các đơn bán tiếp theo

---

### 1.3 Alternative Flow - Sản Phẩm Hết Hàng

**Tiêu đề**: Hệ thống từ chối khi thêm sản phẩm hết hàng

**Precondition**:

- Nhân viên đang tạo đơn bán hàng
- Tồn kho của sản phẩm là 0

**Steps**:

1. Chọn sản phẩm: "Antibiotic X 500mg"
2. Chọn variant: "Vỉ 10 viên"
3. Nhập số lượng: 10 vỉ
4. Hệ thống kiểm tra tồn kho

**Expected Result**:

- ❌ Hiển thị lỗi: "Sản phẩm này hiện không có sẵn. Tồn kho: 0"
- ❌ Không thể thêm sản phẩm vào đơn
- ❌ Nhân viên được gợi ý sản phẩm thay thế hoặc đợi nhập hàng

---

### 1.4 Alternative Flow - Số Lượng Vượt Quá Tồn Kho

**Tiêu đề**: Hệ thống từ chối khi số lượng bán vượt quá tồn kho

**Precondition**:

- Nhân viên đang tạo đơn bán hàng
- Tồn kho của sản phẩm là 50

**Steps**:

1. Chọn sản phẩm: "Paracetamol 500mg"
2. Chọn variant: "Vỉ 10 viên"
3. Nhập số lượng: 100 vỉ
4. Hệ thống kiểm tra tồn kho

**Expected Result**:

- ❌ Hiển thị lỗi: "Số lượng yêu cầu (100) vượt quá tồn kho (50). Vui lòng điều chỉnh số lượng"
- ❌ Không thể lưu đơn
- ❌ Nhân viên phải giảm số lượng xuống 50 hoặc nhỏ hơn

---

## 2. SCENARIO: Xem Chi Tiết Đơn Bán Hàng

### 2.1 Happy Path - Xem Chi Tiết Đơn Bán Hàng

**Tiêu đề**: Nhân viên xem chi tiết đơn bán hàng đã tạo

**Precondition**:

- Đơn bán hàng đã tồn tại: "SO-2025-00456"
- Người dùng đã đăng nhập

**Steps**:

1. Nhân viên truy cập trang "Danh Sách Đơn Bán"
2. Tìm đơn: "SO-2025-00456"
3. Nhấn vào đơn để xem chi tiết
4. Hệ thống hiển thị:
   - Mã đơn, ngày tạo, khách hàng
   - Danh sách sản phẩm với giá, số lượng
   - Tổng tiền, loại thanh toán
   - Trạng thái hiện tại
   - Lịch sử thay đổi

**Expected Result**:

- ✅ Hiển thị toàn bộ thông tin đơn bán hàng
- ✅ Các nút hành động: Sửa, Xóa, Thanh Toán, In, Gửi
- ✅ Hiển thị lịch sử audit log

---

## 3. SCENARIO: Thanh Toán Đơn Bán Hàng

### 3.1 Happy Path - Thanh Toán Bằng Tiền Mặt

**Tiêu đề**: Nhân viên thực hiện thanh toán đơn bán hàng bằng tiền mặt

**Precondition**:

- Đơn bán hàng có trạng thái: "pending"
- Mã đơn: "SO-2025-00456"
- Tổng tiền: 7,350,000 VNĐ

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "Thanh Toán"
3. Hệ thống hiển thị form thanh toán:
   - Tổng tiền: 7,350,000 VNĐ
   - Loại thanh toán: "Tiền mặt" (mặc định từ đơn)
   - Số tiền nhận: [nhập 7,350,000]
   - Tiền thừa: 0 VNĐ
4. Nhấn "Xác Nhận Thanh Toán"

**Expected Result**:

- ✅ Đơn bán hàng chuyển sang trạng thái: "completed"
- ✅ Tồn kho được cập nhật:
  - Paracetamol 500mg: Giảm 50 vỉ
  - Vitamin C 1000mg: Giảm 30 hộp
- ✅ Bản ghi thanh toán được tạo
- ✅ Hiển thị thông báo: "Thanh toán thành công. Đơn hàng hoàn tất."
- ✅ Phiếu bán hàng có thể in hoặc gửi email

**Database Changes**:

```sql
-- Cập nhật trạng thái đơn
UPDATE sales_orders
SET status = 'completed', paid_at = NOW()
WHERE id = @sales_order_id;

-- Tạo bản ghi thanh toán
INSERT INTO payments (sales_order_id, payment_method, amount, status, created_at)
VALUES (@sales_order_id, 'cash', 7350000, 'completed', NOW());

-- Cập nhật tồn kho - Giảm tồn kho sau bán
UPDATE inventory
SET quantity = quantity - 50
WHERE medication_variant_id = [variant_id_1];

UPDATE inventory
SET quantity = quantity - 30
WHERE medication_variant_id = [variant_id_2];

-- Ghi lại audit log thanh toán
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'PAYMENT',
    'sales_order',
    @sales_order_id,
    JSON_BUILD_OBJECT('status', 'completed', 'payment_method', 'cash', 'amount', 7350000),
    NOW()
);

-- Ghi lại audit log cho inventory
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'INVENTORY_UPDATE',
    'inventory',
    [variant_id_1],
    JSON_BUILD_OBJECT('quantity_before', 50, 'quantity_after', 0, 'reason', 'sales'),
    NOW()
);
```

**Postcondition**:

- Đơn bán hàng không thể sửa đổi nữa
- Tồn kho của các sản phẩm đã được giảm
- Có thể xem phiếu bán hàng trong lịch sử

---

### 3.2 Alternative Flow - Thanh Toán Bằng Chuyển Khoản

**Tiêu đề**: Nhân viên thực hiện thanh toán bằng chuyển khoản ngân hàng

**Precondition**:

- Đơn bán hàng có trạng thái: "pending"
- Loại thanh toán được chọn: "Chuyển khoản"

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "Thanh Toán"
3. Chọn loại thanh toán: "Chuyển khoản"
4. Hệ thống hiển thị:
   - Tổng tiền: 7,350,000 VNĐ
   - Tài khoản nhận: [Số TK của quầy thuốc]
5. Nhập:
   - Mã tham chiếu ngân hàng: "TRF20251115123456"
   - Ngân hàng: "Vietcombank"
6. Nhấn "Xác Nhận Thanh Toán"

**Expected Result**:

- ✅ Đơn bán hàng chuyển sang trạng thái: "completed"
- ✅ Thanh toán được đánh dấu: "transfer_pending" chờ xác nhận
- ✅ Bản ghi thanh toán được tạo
- ✅ Nhân viên quản lý có thể xác nhận thanh toán sau

---

### 3.3 Alternative Flow - Thanh Toán Không Đủ Tiền

**Tiêu đề**: Khách hàng thanh toán không đủ số tiền

**Precondition**:

- Đơn bán hàng: Tổng tiền 7,350,000 VNĐ

**Steps**:

1. Nhân viên nhấn nút "Thanh Toán"
2. Chọn loại thanh toán: "Tiền mặt"
3. Nhập số tiền nhận: 7,000,000 VNĐ
4. Nhấn "Xác Nhận Thanh Toán"

**Expected Result**:

- ❌ Hiển thị lỗi: "Số tiền không đủ. Còn thiếu: 350,000 VNĐ"
- ❌ Thanh toán không được hoàn tất
- ❌ Hệ thống cho phép nhập lại số tiền

---

### 3.4 Alternative Flow - Thanh Toán Dư Tiền

**Tiêu đề**: Khách hàng thanh toán với dư tiền

**Precondition**:

- Đơn bán hàng: Tổng tiền 7,350,000 VNĐ

**Steps**:

1. Nhân viên nhấn nút "Thanh Toán"
2. Chọn loại thanh toán: "Tiền mặt"
3. Nhập số tiền nhận: 7,500,000 VNĐ
4. Nhấn "Xác Nhận Thanh Toán"

**Expected Result**:

- ✅ Hiển thị: "Tiền thừa: 150,000 VNĐ"
- ✅ Thanh toán được hoàn tất
- ✅ Ghi lại tiền thừa cần trả lại cho khách hàng
- ✅ Đơn chuyển sang "completed"

---

## 4. SCENARIO: Sửa Đơn Bán Hàng

### 4.1 Happy Path - Sửa Đơn Bán Hàng Đang Pending

**Tiêu đề**: Nhân viên sửa đơn bán hàng trước khi thanh toán

**Precondition**:

- Đơn bán hàng có trạng thái: "pending"
- Mã đơn: "SO-2025-00456"

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "Sửa"
3. Sửa thông tin:
   - Thay đổi số lượng Paracetamol từ 50 thành 60 vỉ
   - Xóa sản phẩm Vitamin C
   - Thêm sản phẩm mới: "Aspirin 100mg" - 20 hộp
4. Xem lại tổng tiền: 7,200,000 VNĐ (thay vì 7,350,000)
5. Nhấn "Lưu Sửa"

**Expected Result**:

- ✅ Đơn bán hàng được cập nhật thành công
- ✅ Mã đơn giữ nguyên: "SO-2025-00456"
- ✅ Tổng tiền được tính lại
- ✅ Lịch sử thay đổi được ghi lại trong audit log
- ✅ Thông báo: "Cập nhật đơn hàng thành công"

**Database Changes**:

```sql
-- Cập nhật số lượng dòng 1
UPDATE sales_order_items
SET quantity = 60, total_price = 60 * 75000
WHERE sales_order_id = @sales_order_id AND medication_variant_id = [variant_id_1];

-- Xóa dòng 2
DELETE FROM sales_order_items
WHERE sales_order_id = @sales_order_id AND medication_variant_id = [variant_id_2];

-- Thêm dòng mới
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@sales_order_id, [variant_id_3], 20, 50000, 1000000);

-- Cập nhật tổng tiền đơn
UPDATE sales_orders
SET total_amount = 5500000
WHERE id = @sales_order_id;

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'UPDATE',
    'sales_order',
    @sales_order_id,
    JSON_BUILD_OBJECT(
        'old_total_amount', 7350000,
        'new_total_amount', 5500000,
        'items_changed', TRUE
    ),
    NOW()
);
```

**Postcondition**:

- Đơn bán hàng vẫn có thể sửa đổi tiếp
- Khách hàng được thông báo về thay đổi

---

### 4.2 Alternative Flow - Không Thể Sửa Đơn Đã Thanh Toán

**Tiêu đề**: Hệ thống từ chối sửa đơn bán hàng đã hoàn tất

**Precondition**:

- Đơn bán hàng có trạng thái: "completed"

**Steps**:

1. Nhân viên mở chi tiết đơn
2. Cố gắng nhấn nút "Sửa"

**Expected Result**:

- ❌ Nút "Sửa" bị vô hiệu hóa hoặc ẩn
- ❌ Hiển thị thông báo: "Không thể sửa đơn hàng đã hoàn tất"
- ❌ Nhân viên có thể tạo phiếu trả hàng để hủy

---

## 5. SCENARIO: Xóa Đơn Bán Hàng

### 5.1 Happy Path - Xóa Đơn Bán Hàng Đang Pending

**Tiêu đề**: Nhân viên xóa đơn bán hàng chưa thanh toán

**Precondition**:

- Đơn bán hàng có trạng thái: "pending"
- Mã đơn: "SO-2025-00456"

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "Xóa"
3. Hệ thống hiển thị cảnh báo: "Bạn có chắc muốn xóa đơn này?"
4. Nhấn "Xác Nhận Xóa"

**Expected Result**:

- ✅ Đơn bán hàng được xóa khỏi hệ thống
- ✅ Tồn kho không bị ảnh hưởng (vì chưa thanh toán)
- ✅ Thông báo: "Xóa đơn hàng thành công"
- ✅ Chuyển hướng về danh sách đơn

**Database Changes**:

```sql
-- Xóa chi tiết các dòng
DELETE FROM sales_order_items
WHERE sales_order_id = @sales_order_id;

-- Xóa đơn bán hàng
DELETE FROM sales_orders
WHERE id = @sales_order_id;

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'DELETE',
    'sales_order',
    @sales_order_id,
    JSON_BUILD_OBJECT('status', 'pending', 'total_amount', 7350000),
    NOW()
);
```

**Postcondition**:

- Đơn không còn trong hệ thống
- Khách hàng vẫn tồn tại để tạo đơn mới

---

### 5.2 Alternative Flow - Không Thể Xóa Đơn Đã Thanh Toán

**Tiêu đề**: Hệ thống từ chối xóa đơn bán hàng đã hoàn tất

**Precondition**:

- Đơn bán hàng có trạng thái: "completed"

**Steps**:

1. Nhân viên mở chi tiết đơn
2. Cố gắng nhấn nút "Xóa"

**Expected Result**:

- ❌ Nút "Xóa" bị vô hiệu hóa hoặc ẩn
- ❌ Hiển thị thông báo: "Không thể xóa đơn hàng đã hoàn tất"
- ❌ Nhân viên phải tạo phiếu trả hàng thay vì xóa

---

## 6. SCENARIO: In Phiếu Bán Hàng

### 6.1 Happy Path - In Phiếu Bán Hàng

**Tiêu đề**: Nhân viên in phiếu bán hàng cho khách hàng

**Precondition**:

- Đơn bán hàng tồn tại (trạng thái: pending hoặc completed)
- Mã đơn: "SO-2025-00456"

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "In"
3. Hệ thống hiển thị xem trước phiếu bán hàng với:
   - Logo quầy thuốc
   - Mã đơn, ngày giờ
   - Thông tin khách hàng
   - Danh sách sản phẩm (tên, giá, số lượng, thành tiền)
   - Tổng tiền, tiền thừa
   - Cảm ơn khách hàng
4. Nhấn "In" để in phiếu

**Expected Result**:

- ✅ Phiếu bán hàng được in thành công
- ✅ Định dạng rõ ràng, dễ đọc
- ✅ Chứa đầy đủ thông tin thanh toán
- ✅ Phiếu được lưu lại trong lịch sử

---

## 7. SCENARIO: Gửi Thông Báo Đơn Cho Khách Hàng

### 7.1 Happy Path - Gửi Email Xác Nhận Đơn

**Tiêu đề**: Nhân viên gửi email xác nhận đơn bán hàng cho khách hàng

**Precondition**:

- Đơn bán hàng tồn tại
- Khách hàng có email: "pham.thi.b@email.com"

**Steps**:

1. Nhân viên mở chi tiết đơn bán hàng
2. Nhấn nút "Gửi Email"
3. Hệ thống hiển thị form:
   - Email nhận (mặc định): "pham.thi.b@email.com"
   - Tiêu đề email: "Xác nhận đơn hàng SO-2025-00456"
   - Nội dung (có thể chỉnh sửa)
4. Nhấn "Gửi"

**Expected Result**:

- ✅ Email được gửi thành công
- ✅ Khách hàng nhận được email với thông tin đơn hàng
- ✅ Thông báo: "Email đã được gửi thành công"
- ✅ Ghi lại lịch sử gửi email

**Database Changes**:

```sql
-- Ghi lại email log
INSERT INTO email_logs (sales_order_id, recipient, subject, status, sent_at)
VALUES (
    @sales_order_id,
    'pham.thi.b@email.com',
    'Xác nhận đơn hàng SO-2025-00456',
    'sent',
    NOW()
);
```

**Postcondition**:

- Khách hàng được thông báo về đơn hàng
- Có thể gửi lại email nếu cần

---

## 8. SCENARIO: Tìm Kiếm và Lọc Đơn Bán Hàng

### 8.1 Happy Path - Tìm Đơn Bán Hàng Theo Mã

**Tiêu đề**: Nhân viên tìm kiếm đơn bán hàng theo mã đơn

**Precondition**:

- Trang "Danh Sách Đơn Bán" đang mở

**Steps**:

1. Nhập mã đơn: "SO-2025-00456" vào ô tìm kiếm
2. Nhấn "Tìm" hoặc Enter
3. Hệ thống hiển thị kết quả

**Expected Result**:

- ✅ Hiển thị đơn hàng: "SO-2025-00456"
- ✅ Thông tin: Khách hàng, ngày tạo, tổng tiền, trạng thái
- ✅ Có thể click vào để xem chi tiết

---

### 8.2 Happy Path - Lọc Đơn Theo Trạng Thái

**Tiêu đề**: Nhân viên lọc đơn bán hàng theo trạng thái

**Precondition**:

- Trang "Danh Sách Đơn Bán" đang mở

**Steps**:

1. Chọn bộ lọc "Trạng Thái": "Pending"
2. Chọn bộ lọc "Ngày Tạo": "Hôm Nay"
3. Nhấn "Áp Dụng Bộ Lọc"
4. Hệ thống hiển thị danh sách đơn

**Expected Result**:

- ✅ Hiển thị các đơn với trạng thái "pending" tạo trong ngày hôm nay
- ✅ Có thể kết hợp nhiều bộ lọc
- ✅ Có nút "Xóa Bộ Lọc" để reset

---

### 8.3 Alternative Flow - Không Tìm Thấy Đơn

**Tiêu đề**: Khi tìm kiếm không có kết quả

**Precondition**:

- Nhân viên tìm đơn với mã không tồn tại

**Steps**:

1. Nhập mã: "SO-9999-99999"
2. Nhấn "Tìm"

**Expected Result**:

- ❌ Hiển thị: "Không tìm thấy đơn hàng nào"
- ❌ Danh sách trống
- ❌ Gợi ý: "Kiểm tra lại mã đơn"

---

## 9. SCENARIO: Xem Lịch Sử Bán Hàng Hàng Ngày

### 9.1 Happy Path - Xem Báo Cáo Bán Hàng Theo Ngày

**Tiêu đề**: Quản lý xem báo cáo bán hàng hàng ngày

**Precondition**:

- Người dùng có vai trò "manager"
- Có dữ liệu bán hàng trong ngày

**Steps**:

1. Truy cập "Báo Cáo" > "Bán Hàng"
2. Chọn khoảng thời gian: "15/11/2025 - 15/11/2025" (Hôm Nay)
3. Hệ thống hiển thị:
   - Tổng doanh thu: 15,200,000 VNĐ
   - Tổng số đơn: 10 đơn
   - Tổng sản phẩm bán: 245 sản phẩm
   - Danh sách 10 đơn với giá trị, khách hàng, trạng thái
4. Nhấn "Xuất Excel" để tải báo cáo

**Expected Result**:

- ✅ Hiển thị toàn bộ thông tin bán hàng trong ngày
- ✅ Có thể xuất báo cáo dưới dạng Excel
- ✅ Biểu đồ thống kê doanh thu

---

## 10. SCENARIO: Hoàn Tiền / Trả Hàng

### 10.1 Happy Path - Tạo Phiếu Trả Hàng

**Tiêu đề**: Khách hàng muốn trả lại sản phẩm sau khi mua

**Precondition**:

- Đơn bán hàng đã hoàn tất: "SO-2025-00456"
- Khách hàng muốn trả 20 vỉ Paracetamol (trong 3 ngày)

**Steps**:

1. Nhân viên mở chi tiết đơn gốc: "SO-2025-00456"
2. Nhấn nút "Tạo Phiếu Trả Hàng"
3. Hệ thống hiển thị form:
   - Mã đơn gốc: "SO-2025-00456"
   - Danh sách sản phẩm đã bán
4. Chọn sản phẩm muốn trả:
   - Paracetamol 500mg: Trả 20 vỉ (giá gốc: 75,000 VNĐ/vỉ)
   - Tiền hoàn: 1,500,000 VNĐ
5. Nhập lý do trả: "Lỗi đóng gói"
6. Nhấn "Tạo Phiếu Trả"

**Expected Result**:

- ✅ Phiếu trả hàng được tạo: "RN-2025-00089"
- ✅ Trạng thái: "pending"
- ✅ Thông báo: "Phiếu trả hàng được tạo thành công"
- ✅ Có thể hoàn tiền sau khi xác nhận

**Database Changes**:

```sql
-- Tạo phiếu trả hàng
INSERT INTO return_notes (sales_order_id, reason, status, created_at)
VALUES (@sales_order_id, 'Lỗi đóng gói', 'pending', NOW());

-- Lấy return_id
SELECT @return_id := LAST_INSERT_ID();

-- Thêm chi tiết trả hàng
INSERT INTO return_note_items (return_note_id, medication_variant_id, quantity, unit_price, total_price)
VALUES (@return_id, [variant_id_1], 20, 75000, 1500000);

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'CREATE',
    'return_note',
    @return_id,
    JSON_BUILD_OBJECT('sales_order_id', @sales_order_id, 'total_return', 1500000),
    NOW()
);
```

**Postcondition**:

- Phiếu trả hàng có thể được xác nhận hoặc hủy
- Tồn kho tăng lại khi phiếu được xác nhận

---

### 10.2 Happy Path - Xác Nhận Phiếu Trả Hàng

**Tiêu đề**: Quản lý xác nhận phiếu trả hàng

**Precondition**:

- Phiếu trả hàng có trạng thái: "pending"
- Mã phiếu: "RN-2025-00089"

**Steps**:

1. Quản lý mở chi tiết phiếu trả hàng
2. Kiểm tra sản phẩm trả
3. Nhấn "Xác Nhận Trả Hàng"
4. Hệ thống kiểm tra tồn kho
5. Xác nhận hoàn tiền: 1,500,000 VNĐ

**Expected Result**:

- ✅ Phiếu trả hàng chuyển sang trạng thái: "approved"
- ✅ Tồn kho tăng lại:
  - Paracetamol 500mg: Tăng 20 vỉ
- ✅ Phiếu hoàn tiền được tạo
- ✅ Ghi lại trong lịch sử

**Database Changes**:

```sql
-- Cập nhật trạng thái phiếu trả
UPDATE return_notes
SET status = 'approved', approved_at = NOW()
WHERE id = @return_id;

-- Tạo phiếu hoàn tiền
INSERT INTO refund_vouchers (return_note_id, amount, status, created_at)
VALUES (@return_id, 1500000, 'pending', NOW());

-- Cập nhật tồn kho
UPDATE inventory
SET quantity = quantity + 20
WHERE medication_variant_id = [variant_id_1];

-- Ghi lại audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES (
    [user_id],
    'RETURN_APPROVED',
    'return_note',
    @return_id,
    JSON_BUILD_OBJECT('status', 'approved', 'refund_amount', 1500000),
    NOW()
);
```

**Postcondition**:

- Tồn kho được cập nhật
- Phiếu hoàn tiền có thể được xử lý thanh toán

---

## Tóm Tắt Các Trạng Thái Đơn Bán Hàng

| Trạng Thái    | Mô Tả              | Hành Động Có Thể                    |
| ------------- | ------------------ | ----------------------------------- |
| **pending**   | Chờ thanh toán     | Sửa, Xóa, Thanh Toán, In, Gửi Email |
| **completed** | Đã thanh toán xong | Xem, In, Gửi Email, Tạo Phiếu Trả   |
| **cancelled** | Đã hủy             | Xem lịch sử                         |

---

## Tóm Tắt Các Phương Thức Thanh Toán

| Phương Thức  | Mô Tả        | Trạng Thái Ban Đầu              |
| ------------ | ------------ | ------------------------------- |
| **cash**     | Tiền mặt     | Completed ngay lập tức          |
| **transfer** | Chuyển khoản | Transfer_pending (chờ xác nhận) |
| **card**     | Thẻ tín dụng | Completed ngay lập tức          |
| **debt**     | Nợ           | Debt_pending (chưa đóng)        |

---

## Quy Trình Kiểm Tra Trước Hoàn Tất Bán Hàng

Trước khi xác nhận thanh toán, hệ thống phải kiểm tra:

1. ✅ Khách hàng hợp lệ
2. ✅ Tồn kho đủ cho tất cả sản phẩm
3. ✅ Giá bán hợp lệ (không âm, không quá chênh lệch với giá gốc)
4. ✅ Số tiền thanh toán >= Tổng tiền đơn
5. ✅ Phương thức thanh toán hợp lệ

---

## Quy Trình Cập Nhật Tồn Kho

Tồn kho được cập nhật chỉ trong các trường hợp sau:

1. **Khi hoàn tất bán hàng** (trạng thái completed):
   - Giảm tồn kho cho mỗi sản phẩm đã bán

2. **Khi xác nhận phiếu trả hàng** (return_note approved):
   - Tăng lại tồn kho cho sản phẩm trả

3. **Không** cập nhật khi:
   - Tạo đơn bán (chỉ "reserve" trong hệ thống)
   - Sửa đơn chưa thanh toán
   - Xóa đơn chưa thanh toán

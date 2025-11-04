# Hướng Dẫn Nhân Viên - Chức Năng Bán Hàng

**Hệ thống**: PharmaFlow  
**Đối tượng**: Nhân viên (Staff)  
**Ngày cập nhật**: 21 tháng 10, 2025  
**Phiên bản**: 1.0

---

## 📋 Mục Lục

1. [Giới Thiệu](#giới-thiệu)
2. [Quyền Truy Cập](#quyền-truy-cập)
3. [Màn Hình Bán Hàng (POS)](#màn-hình-bán-hàng-pos)
4. [Quản Lý Khách Hàng](#quản-lý-khách-hàng)
5. [Xem Danh Sách Đơn Hàng](#xem-danh-sách-đơn-hàng)
6. [Xem Báo Cáo](#xem-báo-cáo)
7. [Xử Lý Lỗi Thường Gặp](#xử-lý-lỗi-thường-gặp)
8. [Câu Hỏi Thường Gặp](#câu-hỏi-thường-gặp)

---

## Giới Thiệu

Tài liệu này hướng dẫn nhân viên sử dụng các chức năng bán hàng trong hệ thống PharmaFlow. Bạn có thể:

- ✅ Tạo đơn hàng bán thuốc cho khách
- ✅ Quản lý thông tin khách hàng
- ✅ Xem danh sách đơn hàng
- ✅ Xem báo cáo bán hàng

---

## Quyền Truy Cập

### Vai Trò: Staff (Nhân Viên)

Là nhân viên, bạn có quyền:

| Chức năng             | Xem | Tạo mới | Sửa | Xóa |
| --------------------- | --- | ------- | --- | --- |
| **Bán hàng (POS)**    | ✅  | ✅      | ✅  | ❌  |
| **Khách hàng**        | ✅  | ✅      | ✅  | ❌  |
| **Đơn hàng**          | ✅  | ✅      | ✅  | ❌  |
| **Thuốc (xem)**       | ✅  | ❌      | ❌  | ❌  |
| **Báo cáo**           | ✅  | ✅      | ❌  | ❌  |
| **Kho hàng (xem)**    | ✅  | ❌      | ❌  | ❌  |
| **Nhà cung cấp**      | ❌  | ❌      | ❌  | ❌  |
| **Đơn mua hàng**      | ❌  | ❌      | ❌  | ❌  |
| **Quản lý nhân viên** | ❌  | ❌      | ❌  | ❌  |

### Lưu Ý Quan Trọng

⚠️ **Chỉ Owner mới có quyền**:

- Xóa đơn hàng (cancel sales order)
- Quản lý nhà cung cấp
- Tạo đơn mua hàng
- Quản lý nhân viên
- Xóa khách hàng

---

## Màn Hình Bán Hàng (POS)

### Truy Cập

1. Đăng nhập vào hệ thống với tài khoản Staff
2. Click vào **"POS"** hoặc **"Bán Hàng"** trong menu bên trái
3. Màn hình POS sẽ hiển thị

### Giao Diện

```
┌─────────────────────────────────────────────────────────┐
│  PHARMAFLOW - POINT OF SALE                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────┐         ┌──────────────────┐   │
│  │  KHÁCH HÀNG        │         │   GIỎ HÀNG       │   │
│  │  [Tìm kiếm...]     │         │   (5 sản phẩm)   │   │
│  │  ☑ Nguyễn Văn A    │         │                  │   │
│  │  [+ Thêm mới]      │         │  Paracetamol x2  │   │
│  └────────────────────┘         │  Amoxicillin x1  │   │
│                                  │  ...             │   │
│  ┌────────────────────┐         │                  │   │
│  │  TÌM SẢN PHẨM      │         │  Tổng: 150,000đ  │   │
│  │  [Tên thuốc...]    │         └──────────────────┘   │
│  │  🔍                │                                  │
│  │                    │         ┌──────────────────┐   │
│  │  Kết quả:          │         │  THANH TOÁN      │   │
│  │  □ Paracetamol     │         │  ☑ Tiền mặt      │   │
│  │    500mg - 5,000đ  │         │  □ Thẻ           │   │
│  │    [Thêm]          │         │  □ Chuyển khoản  │   │
│  └────────────────────┘         │  □ Ví điện tử    │   │
│                                  │                  │   │
│                                  │  [HOÀN TẤT]      │   │
│                                  └──────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### Quy Trình Bán Hàng

#### Bước 1: Chọn Khách Hàng

##### Chọn khách hàng có sẵn:

1. Gõ tên, số điện thoại hoặc email vào ô **"Tìm khách hàng"**
2. Danh sách khách hàng phù hợp sẽ hiện ra
3. Click vào khách hàng muốn chọn
4. Thông tin khách hàng được hiển thị ở đầu màn hình

**Ví dụ**:

```
Tìm: "0901234567"
→ Kết quả: Nguyễn Văn A - 0901234567 - nguyenvana@email.com
→ Click chọn
→ ✅ Đã chọn: Nguyễn Văn A
```

##### Tạo khách hàng mới:

1. Click nút **"+ Thêm khách hàng"** hoặc **"+ New Customer"**
2. Điền thông tin:
   - **Tên** (Bắt buộc)
   - Email (Không bắt buộc)
   - Số điện thoại (Không bắt buộc)
   - Địa chỉ (Không bắt buộc)
3. Click **"Tạo"** hoặc **"Create Customer"**
4. Khách hàng mới được tạo và tự động chọn

**Ví dụ**:

```
Tên: Trần Thị B
Email: tranthib@email.com
Số điện thoại: 0912345678
Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM

→ Click "Tạo"
→ ✅ Thành công! Đã chọn khách hàng: Trần Thị B
```

#### Bước 2: Thêm Sản Phẩm Vào Giỏ

##### Tìm kiếm sản phẩm:

1. Gõ tên thuốc hoặc mã SKU vào ô **"Tìm sản phẩm"**
2. Nhấn **Enter** hoặc click nút **🔍 Tìm**
3. Danh sách thuốc phù hợp hiển thị với:
   - Tên thuốc
   - Mã SKU
   - Giá bán
   - Số lượng tồn kho
4. Click nút **"Thêm"** để thêm vào giỏ

**Ví dụ**:

```
Tìm: "Paracetamol"
→ Kết quả:
   ┌─────────────────────────────────────┐
   │ 💊 Paracetamol 500mg Tablet         │
   │ SKU: PAR-500-TAB-001                │
   │ Giá: 5,000đ | Tồn kho: 500 hộp     │
   │                      [Thêm] ←       │
   └─────────────────────────────────────┘
→ Click "Thêm"
→ ✅ Đã thêm vào giỏ hàng!
```

##### Quét mã vạch (nếu có):

1. Click vào ô tìm kiếm
2. Quét mã vạch bằng máy quét
3. Sản phẩm tự động thêm vào giỏ

> **Lưu ý**: Chỉ có thể thêm sản phẩm còn hàng trong kho (số lượng > 0)

#### Bước 3: Quản Lý Giỏ Hàng

##### Xem giỏ hàng:

Giỏ hàng hiển thị:

- Tên thuốc
- Số lượng
- Đơn giá
- Thành tiền (= số lượng × đơn giá)
- Tổng tiền tất cả sản phẩm

##### Tăng/giảm số lượng:

**Cách 1: Dùng nút +/-**

```
Paracetamol 500mg
[−] [ 2 ] [+]  →  10,000đ
```

- Click **[+]** để tăng số lượng lên 1
- Click **[−]** để giảm số lượng xuống 1 (tối thiểu là 1)

**Cách 2: Nhập trực tiếp**

```
Paracetamol 500mg
[−] [10] [+]  →  50,000đ
     ↑ Click vào đây và gõ số
```

> **⚠️ Lưu ý**: Không thể tăng số lượng vượt quá số tồn kho

##### Xóa sản phẩm:

Click vào icon **🗑️ Xóa** bên cạnh sản phẩm cần xóa

```
Paracetamol 500mg
[−] [ 2 ] [+]  →  10,000đ  [🗑️] ← Click đây
→ Sản phẩm bị xóa khỏi giỏ
```

#### Bước 4: Chọn Phương Thức Thanh Toán

Chọn 1 trong 4 phương thức:

```
┌──────────────────────────────────────┐
│  💵 Tiền mặt       │  💳 Thẻ tín dụng │
│                    │                  │
├────────────────────┼──────────────────┤
│  🏦 Chuyển khoản   │  📱 Ví điện tử   │
└──────────────────────────────────────┘
```

Click vào phương thức mong muốn (ô được chọn sẽ sáng lên màu xanh)

**Mặc định**: Tiền mặt (Cash)

#### Bước 5: Hoàn Tất Đơn Hàng

1. Kiểm tra lại:
   - ✅ Đã chọn khách hàng
   - ✅ Giỏ hàng có ít nhất 1 sản phẩm
   - ✅ Đã chọn phương thức thanh toán
2. Click nút **"HOÀN TẤT"** hoặc **"Complete Order"**

3. Hệ thống xử lý:
   - ⏳ Nút hiển thị "Đang xử lý..." (Processing...)
   - ⏳ Kiểm tra tồn kho
   - ⏳ Tạo đơn hàng
   - ⏳ Trừ hàng tồn kho
4. Kết quả:
   - ✅ **Thành công**: Hiển thị thông báo "Đơn hàng đã tạo thành công!"
   - ❌ **Thất bại**: Hiển thị lỗi (xem phần Xử Lý Lỗi)

5. Sau khi thành công:
   - Giỏ hàng tự động xóa sạch
   - Khách hàng được bỏ chọn
   - Phương thức thanh toán reset về Tiền mặt
   - Sẵn sàng cho đơn hàng tiếp theo

### Ví Dụ Hoàn Chỉnh

```
BƯỚC 1: Chọn khách hàng
→ Tìm: "Nguyễn Văn A"
→ Chọn: Nguyễn Văn A - 0901234567

BƯỚC 2: Thêm sản phẩm
→ Tìm: "Paracetamol"
→ Thêm: Paracetamol 500mg x 2 hộp

→ Tìm: "Amoxicillin"
→ Thêm: Amoxicillin 500mg x 1 hộp

BƯỚC 3: Kiểm tra giỏ
┌──────────────────────────────────────┐
│ Paracetamol 500mg                   │
│ 5,000đ × 2 = 10,000đ                │
│                                      │
│ Amoxicillin 500mg                   │
│ 15,000đ × 1 = 15,000đ               │
│                                      │
│ TỔNG CỘNG: 25,000đ                  │
└──────────────────────────────────────┘

BƯỚC 4: Chọn thanh toán
→ Tiền mặt ✅

BƯỚC 5: Hoàn tất
→ Click "HOÀN TẤT"
→ ✅ Thành công!
→ Giỏ hàng đã xóa, sẵn sàng đơn mới
```

---

## Quản Lý Khách Hàng

### Xem Danh Sách Khách Hàng

#### Truy cập:

1. Click vào **"Khách hàng"** hoặc **"Customers"** trong menu
2. Danh sách khách hàng hiển thị

#### Chức năng:

- **Tìm kiếm**: Gõ tên, email, hoặc số điện thoại
- **Xem chi tiết**: Click vào tên khách hàng
- **Phân trang**: Chuyển trang nếu có nhiều khách hàng

### Tạo Khách Hàng Mới

#### Cách 1: Từ màn hình danh sách

1. Click nút **"+ Thêm khách hàng"**
2. Điền form:
   ```
   Tên: _____________ (Bắt buộc)
   Email: _____________ (Tùy chọn)
   Số điện thoại: _____________ (Tùy chọn)
   Địa chỉ: _____________ (Tùy chọn)
   Ngày sinh: __/__/____ (Tùy chọn)
   ```
3. Click **"Tạo"**

#### Cách 2: Từ màn hình POS

_(Xem phần Màn Hình Bán Hàng - Bước 1)_

### Sửa Thông Tin Khách Hàng

1. Vào danh sách khách hàng
2. Click vào khách hàng cần sửa
3. Click nút **"Sửa"** hoặc **"Edit"**
4. Cập nhật thông tin
5. Click **"Lưu"** hoặc **"Save"**

**Các trường có thể sửa**:

- ✅ Tên
- ✅ Email
- ✅ Số điện thoại
- ✅ Địa chỉ
- ✅ Ngày sinh

> **⚠️ Lưu ý**: Nhân viên KHÔNG có quyền xóa khách hàng (chỉ Owner mới xóa được)

---

## Xem Danh Sách Đơn Hàng

### Truy Cập

1. Click vào **"Đơn hàng"** hoặc **"Sales Orders"** trong menu
2. Danh sách đơn hàng hiển thị

### Thông Tin Hiển Thị

Mỗi đơn hàng hiển thị:

- **Mã đơn hàng**: ID duy nhất
- **Ngày đặt**: Thời gian tạo đơn
- **Khách hàng**: Tên khách hàng
- **Tổng tiền**: Tổng số tiền
- **Trạng thái**:
  - 🟡 **Pending** (Chờ xử lý)
  - 🟢 **Completed** (Hoàn thành)
  - 🔴 **Cancelled** (Đã hủy)
- **Phương thức thanh toán**: Tiền mặt / Thẻ / Chuyển khoản / Ví điện tử
- **Nhân viên**: Người tạo đơn

### Tìm Kiếm và Lọc

#### Tìm kiếm theo:

- Mã đơn hàng
- Tên khách hàng

#### Lọc theo:

```
┌────────────────────────────────────────┐
│ Trạng thái: [Tất cả ▼]                │
│   □ Pending (Chờ xử lý)               │
│   □ Completed (Hoàn thành)            │
│   □ Cancelled (Đã hủy)                │
│                                        │
│ Phương thức: [Tất cả ▼]               │
│   □ Tiền mặt                          │
│   □ Thẻ tín dụng                      │
│   □ Chuyển khoản                      │
│   □ Ví điện tử                        │
│                                        │
│ Ngày: [__/__/____] đến [__/__/____]  │
│                                        │
│ [Áp dụng]  [Xóa lọc]                  │
└────────────────────────────────────────┘
```

### Xem Chi Tiết Đơn Hàng

1. Click vào đơn hàng trong danh sách
2. Màn hình chi tiết hiển thị:

```
┌─────────────────────────────────────────┐
│ ĐơN HÀNG #12345678-90ab-cdef           │
├─────────────────────────────────────────┤
│ Thông tin chung:                       │
│ • Ngày đặt: 21/10/2025 10:30          │
│ • Trạng thái: Hoàn thành 🟢           │
│ • Phương thức: Tiền mặt               │
│ • Nhân viên: Nguyễn Văn C             │
│                                        │
│ Khách hàng:                           │
│ • Tên: Nguyễn Văn A                   │
│ • SĐT: 0901234567                     │
│ • Email: nguyenvana@email.com         │
│                                        │
│ Sản phẩm:                             │
│ ┌─────────────────────────────────┐   │
│ │ Paracetamol 500mg              │   │
│ │ SKU: PAR-500-001               │   │
│ │ 5,000đ × 2 = 10,000đ           │   │
│ ├─────────────────────────────────┤   │
│ │ Amoxicillin 500mg              │   │
│ │ SKU: AMO-500-001               │   │
│ │ 15,000đ × 1 = 15,000đ          │   │
│ └─────────────────────────────────┘   │
│                                        │
│ TỔNG CỘNG: 25,000đ                    │
│                                        │
│ [In hóa đơn]  [Quay lại]              │
└─────────────────────────────────────────┘
```

### Cập Nhật Trạng Thái Đơn Hàng

Nhân viên có thể cập nhật trạng thái đơn hàng:

1. Vào chi tiết đơn hàng
2. Click nút **"Cập nhật trạng thái"** hoặc **"Update Status"**
3. Chọn trạng thái mới:
   - **Completed** (Hoàn thành): Đơn đã giao và thanh toán xong
   - **Cancelled** (Hủy): Hủy đơn (hàng sẽ được hoàn lại kho)
4. Click **"Xác nhận"**

**Luồng trạng thái**:

```
Pending (Chờ) → Completed (Hoàn thành) ✅
Pending (Chờ) → Cancelled (Hủy) ✅
```

> **⚠️ Lưu ý**:
>
> - Không thể thay đổi trạng thái từ **Completed** hay **Cancelled**
> - Khi hủy đơn (Cancelled), hàng sẽ được trả lại kho tự động
> - Chỉ Owner mới có quyền XÓA đơn hàng

---

## Xem Báo Cáo

### Truy Cập

1. Click vào **"Báo cáo"** hoặc **"Reports"** trong menu
2. Chọn loại báo cáo muốn xem

### Các Loại Báo Cáo

#### 1. Báo Cáo Bán Hàng Hôm Nay (Daily Sales)

**Hiển thị**:

- Tổng doanh thu hôm nay
- Số đơn hàng
- Top 10 sản phẩm bán chạy
- Doanh thu theo giờ
- Phân bổ theo phương thức thanh toán

**Cách xem**:

```
Menu → Báo cáo → Bán hàng hôm nay
```

#### 2. Báo Cáo Bán Hàng Tuần (Weekly Sales)

**Hiển thị**:

- Tổng doanh thu tuần này
- So sánh với tuần trước
- Doanh thu theo từng ngày
- Biểu đồ xu hướng

**Cách xem**:

```
Menu → Báo cáo → Bán hàng theo tuần
```

#### 3. Báo Cáo Bán Hàng Tháng (Monthly Sales)

**Hiển thị**:

- Tổng doanh thu tháng
- So sánh với tháng trước
- Doanh thu theo từng tuần
- Top sản phẩm bán chạy trong tháng

**Cách xem**:

```
Menu → Báo cáo → Bán hàng theo tháng
```

#### 4. Báo Cáo Tồn Kho Thấp (Low Stock)

**Hiển thị**:

- Danh sách thuốc sắp hết
- Số lượng còn lại
- Vị trí trong kho

**Cách xem**:

```
Menu → Báo cáo → Tồn kho thấp
hoặc
Dashboard → Widget "Sản phẩm sắp hết"
```

#### 5. Báo Cáo Hạn Sử Dụng (Expiry Dates)

**Hiển thị**:

- Danh sách thuốc sắp hết hạn
- Ngày hết hạn
- Số lượng
- Số lô (batch)

**Cách xem**:

```
Menu → Báo cáo → Sắp hết hạn
hoặc
Dashboard → Widget "Sản phẩm sắp hết hạn"
```

### Tạo Báo Cáo Tùy Chỉnh

1. Vào **Menu → Báo cáo → Tạo báo cáo**
2. Chọn:
   ```
   Loại báo cáo: [Sales Summary ▼]
   Từ ngày: [__/__/____]
   Đến ngày: [__/__/____]
   ```
3. Click **"Tạo báo cáo"**
4. Hệ thống tạo và hiển thị báo cáo

### In và Xuất Báo Cáo

1. Mở báo cáo cần in
2. Click nút **"In"** hoặc **"Export"**
3. Chọn:
   - **In trực tiếp**: Gửi đến máy in
   - **Xuất PDF**: Lưu file PDF
   - **Xuất Excel**: Lưu file Excel (nếu có)

---

## Xử Lý Lỗi Thường Gặp

### 1. "Please select a customer" (Vui lòng chọn khách hàng)

**Nguyên nhân**: Chưa chọn khách hàng

**Giải pháp**:

1. Tìm và chọn khách hàng từ danh sách
2. Hoặc tạo khách hàng mới bằng nút "+ Thêm khách hàng"
3. Sau đó mới click "Hoàn tất"

---

### 2. "Cart is empty" (Giỏ hàng trống)

**Nguyên nhân**: Chưa có sản phẩm nào trong giỏ

**Giải pháp**:

1. Tìm kiếm sản phẩm
2. Thêm ít nhất 1 sản phẩm vào giỏ
3. Sau đó mới click "Hoàn tất"

---

### 3. "Insufficient inventory" (Không đủ hàng)

**Thông báo đầy đủ**:

```
Insufficient inventory for Paracetamol 500mg (PAR-500-001).
Requested: 10, Available: 5
```

**Nguyên nhân**: Số lượng yêu cầu nhiều hơn số tồn kho

**Giải pháp**:

1. Giảm số lượng trong giỏ hàng xuống số lượng có sẵn
2. Hoặc liên hệ quản lý để nhập thêm hàng
3. Hoặc tư vấn khách chọn sản phẩm khác

---

### 4. "Medication variant is not available for sale"

**Nguyên nhân**: Sản phẩm đã bị đánh dấu không bán (ngừng kinh doanh)

**Giải pháp**:

1. Không thể bán sản phẩm này
2. Tư vấn khách chọn sản phẩm thay thế
3. Liên hệ quản lý nếu cần kích hoạt lại sản phẩm

---

### 5. "User not found. Token invalid" (Người dùng không tồn tại)

**Nguyên nhân**: Phiên đăng nhập hết hạn

**Giải pháp**:

1. Đăng xuất (Logout)
2. Đăng nhập lại với tài khoản của bạn

---

### 6. "Account is inactive" (Tài khoản không hoạt động)

**Nguyên nhân**: Tài khoản bị vô hiệu hóa bởi quản lý

**Giải pháp**:

1. Liên hệ với người quản lý (Owner)
2. Yêu cầu kích hoạt lại tài khoản

---

### 7. "Access denied. Required role: owner" (Không có quyền truy cập)

**Nguyên nhân**: Chức năng chỉ dành cho Owner, nhân viên không có quyền

**Giải pháp**:

1. Đây là chức năng dành cho quản lý
2. Liên hệ Owner nếu cần thực hiện chức năng này

---

### 8. Đơn hàng bị treo, không tạo được

**Triệu chứng**:

- Click "Hoàn tất" nhưng không có phản hồi
- Nút hiển thị "Processing..." mãi không xong

**Giải pháp**:

1. Đợi thêm 30 giây
2. Nếu vẫn không xong, kiểm tra kết nối Internet
3. Refresh trang (F5)
4. Kiểm tra danh sách đơn hàng xem đã tạo chưa (có thể đã tạo thành công)
5. Nếu chưa có, thử tạo lại đơn

---

### 9. Không tìm thấy sản phẩm

**Nguyên nhân**:

- Gõ sai tên
- Sản phẩm chưa được thêm vào hệ thống
- Sản phẩm bị vô hiệu hóa

**Giải pháp**:

1. Kiểm tra chính tả
2. Thử tìm bằng mã SKU
3. Liên hệ quản lý nếu sản phẩm chưa có trong hệ thống

---

### 10. Số lượng tồn kho không khớp

**Triệu chứng**: Hệ thống báo còn 5 nhưng thực tế có 10 hộp

**Giải pháp**:

1. Liên hệ quản lý kho
2. Owner sẽ kiểm tra và điều chỉnh tồn kho
3. KHÔNG tự ý sửa (nhân viên không có quyền)

---

## Câu Hỏi Thường Gặp

### Q1: Tôi có thể xóa đơn hàng không?

**Trả lời**: KHÔNG. Chỉ Owner mới có quyền xóa đơn hàng. Nhân viên chỉ có thể:

- Tạo đơn mới
- Cập nhật trạng thái (Pending → Completed hoặc Cancelled)
- Xem danh sách và chi tiết đơn

Nếu cần xóa, liên hệ Owner.

---

### Q2: Làm sao để hủy đơn hàng?

**Trả lời**:

1. Vào danh sách đơn hàng
2. Click vào đơn cần hủy
3. Click "Cập nhật trạng thái"
4. Chọn "Cancelled"
5. Xác nhận

Lưu ý: Hàng sẽ tự động được hoàn lại kho.

---

### Q3: Khách hàng trả lại hàng, tôi xử lý như thế nào?

**Trả lời**:

1. **Nếu chưa hoàn tất đơn**: Bỏ sản phẩm ra khỏi giỏ hàng
2. **Nếu đã hoàn tất đơn**:
   - Tìm đơn hàng cũ
   - Cập nhật trạng thái thành "Cancelled" (hàng sẽ tự động vào lại kho)
   - Tạo đơn hàng mới với sản phẩm còn lại

---

### Q4: Tôi có thể áp dụng giảm giá không?

**Trả lời**: Phiên bản hiện tại CHƯA hỗ trợ giảm giá. Giá bán là giá đã được cài đặt sẵn trong hệ thống bởi Owner.

Tính năng giảm giá đang trong kế hoạch phát triển.

---

### Q5: Làm sao xem tôi đã bán được bao nhiêu hôm nay?

**Trả lời**:

1. Vào **Dashboard** (màn hình chính)
2. Widget "Doanh thu hôm nay" hiển thị tổng doanh thu
3. Hoặc vào **Báo cáo → Bán hàng hôm nay** để xem chi tiết

---

### Q6: Khách hàng muốn thanh toán nửa tiền mặt, nửa thẻ được không?

**Trả lời**: Phiên bản hiện tại CHƯA hỗ trợ thanh toán bằng nhiều phương thức (split payment). Chỉ chọn được 1 phương thức duy nhất.

Tính năng này đang trong kế hoạch phát triển.

---

### Q7: Tôi quên mật khẩu, làm sao đăng nhập?

**Trả lời**:

1. Tại màn hình đăng nhập, click "Quên mật khẩu?"
2. Nhập email hoặc số điện thoại đã đăng ký
3. Chọn nhận OTP qua Email hoặc SMS
4. Nhập OTP và mật khẩu mới
5. Đăng nhập với mật khẩu mới

---

### Q8: Có thể in hóa đơn cho khách không?

**Trả lời**: CÓ.

1. Vào chi tiết đơn hàng
2. Click nút "In hóa đơn" hoặc "Print Invoice"
3. Chọn máy in
4. In cho khách hàng

---

### Q9: Tôi có thể xem kho hàng không?

**Trả lời**: CÓ, nhưng chỉ XEM. Nhân viên có thể:

- ✅ Xem danh sách thuốc
- ✅ Xem số lượng tồn kho
- ✅ Xem vị trí trong kho
- ❌ KHÔNG thể thêm/sửa/xóa thuốc
- ❌ KHÔNG thể điều chỉnh tồn kho

---

### Q10: Ai có thể thêm thuốc mới vào hệ thống?

**Trả lời**: Chỉ có **Owner**. Nhân viên không có quyền thêm thuốc mới.

Nếu cần thêm thuốc mới:

1. Ghi lại thông tin thuốc (tên, nhà sản xuất, quy cách...)
2. Báo cho Owner
3. Owner sẽ thêm vào hệ thống

---

### Q11: Làm sao biết thuốc nào sắp hết hạn?

**Trả lời**:

1. Vào **Dashboard**
2. Xem widget "Sản phẩm sắp hết hạn"
3. Hoặc vào **Báo cáo → Sắp hết hạn**
4. Danh sách thuốc sắp hết hạn sẽ hiển thị

> **Lưu ý**: KHÔNG bán thuốc gần hết hạn cho khách (< 3 tháng)

---

### Q12: Tôi có quyền tạo đơn mua hàng không?

**Trả lời**: KHÔNG. Nhân viên KHÔNG có quyền:

- Tạo đơn mua hàng (Purchase Order)
- Quản lý nhà cung cấp
- Nhập hàng vào kho

Chỉ có Owner mới có quyền này.

---

## Liên Hệ Hỗ Trợ

### Vấn đề kỹ thuật

- 📧 Email: support@pharmaflow.com
- 📞 Hotline: 1900-xxxx
- 💬 Chat: Trong ứng dụng (góc dưới bên phải)

### Yêu cầu từ Owner

Các yêu cầu sau cần liên hệ Owner:

- Thêm/sửa/xóa thuốc
- Tạo đơn mua hàng
- Quản lý nhà cung cấp
- Nhập hàng vào kho
- Điều chỉnh tồn kho
- Xóa đơn hàng
- Quản lý nhân viên

---

## Checklist Cuối Ca

Trước khi kết thúc ca làm việc, hãy kiểm tra:

- [ ] ✅ Tất cả đơn hàng đã hoàn tất (Completed) hoặc hủy (Cancelled)
- [ ] ✅ Không còn đơn nào ở trạng thái Pending
- [ ] ✅ Đã ghi nhận tất cả giao dịch
- [ ] ✅ Đã in hóa đơn cho khách (nếu có)
- [ ] ✅ Đã đóng các tab trình duyệt không cần thiết
- [ ] ✅ Đã đăng xuất khỏi hệ thống

---

## Phím Tắt (Keyboard Shortcuts)

> **Lưu ý**: Tính năng phím tắt đang trong kế hoạch phát triển

Dự kiến:

- `F2` - Thêm khách hàng
- `F3` - Tìm sản phẩm
- `F4` - Hoàn tất đơn hàng
- `Ctrl + P` - In hóa đơn
- `Ctrl + N` - Đơn hàng mới
- `Esc` - Hủy thao tác

---

## Ghi Chú Quan Trọng

### 🔴 KHÔNG được phép:

- ❌ Chia sẻ mật khẩu cho người khác
- ❌ Để người khác dùng tài khoản của bạn
- ❌ Sửa giá sản phẩm
- ❌ Điều chỉnh tồn kho
- ❌ Xóa đơn hàng
- ❌ Bán thuốc hết hạn hoặc gần hết hạn (< 3 tháng)

### 🟢 Nên làm:

- ✅ Kiểm tra hạn sử dụng trước khi bán
- ✅ Xác nhận thông tin khách hàng
- ✅ Kiểm tra giỏ hàng trước khi hoàn tất
- ✅ In hóa đơn cho khách
- ✅ Ghi chú nếu có vấn đề
- ✅ Báo cáo lỗi kỹ thuật ngay lập tức

---

## Bảng Thuật Ngữ

| Tiếng Việt | English            | Giải thích                        |
| ---------- | ------------------ | --------------------------------- |
| Bán hàng   | Sales              | Hoạt động bán thuốc cho khách     |
| POS        | Point of Sale      | Màn hình bán hàng tại quầy        |
| Đơn hàng   | Sales Order        | Đơn đặt hàng của khách            |
| Giỏ hàng   | Cart               | Danh sách sản phẩm chờ thanh toán |
| Tồn kho    | Inventory          | Số lượng hàng còn trong kho       |
| Hết hạn    | Expiry             | Thuốc hết hạn sử dụng             |
| SKU        | Stock Keeping Unit | Mã định danh sản phẩm             |
| Lô hàng    | Batch              | Lô sản xuất của thuốc             |
| Owner      | Owner              | Chủ nhà thuốc / Quản lý           |
| Staff      | Staff              | Nhân viên bán hàng                |

---

**Kết Thúc Tài Liệu**

📌 **Phiên bản**: 1.0  
📅 **Cập nhật lần cuối**: 21/10/2025  
👤 **Dành cho**: Nhân viên bán hàng (Staff)  
🔄 **Tài liệu này sẽ được cập nhật định kỳ**

---

_Nếu có thắc mắc hoặc gặp vấn đề, vui lòng liên hệ Owner hoặc bộ phận hỗ trợ kỹ thuật._

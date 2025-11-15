# Scenario: Luồng Đăng Ký Đăng Nhập Phân Ca

## Mục Đích
Tài liệu này mô tả chi tiết các kịch bản (scenarios) cho luồng đăng ký, đăng nhập và quản lý phân ca của người dùng trong hệ thống PharmaFlow.

---

## 1. SCENARIO: Đăng Ký Tài Khoản Mới

### 1.1 Happy Path - Đăng Ký Thành Công

**Tiêu đề**: Nhân viên mới đăng ký tài khoản thành công

**Precondition**:
- Ứng dụng web đang chạy
- Người dùng chưa có tài khoản trong hệ thống
- Email đăng ký chưa được sử dụng

**Steps**:
1. Người dùng truy cập trang đăng ký (/register)
2. Nhập thông tin:
   - Họ tên: "Nguyễn Văn A"
   - Email: "nguyen.van.a@pharmacy.com"
   - Số điện thoại: "0987654321"
   - Địa chỉ: "123 Đường Lê Lợi, TP.HCM"
   - Mật khẩu: "SecurePass123!"
   - Xác nhận mật khẩu: "SecurePass123!"
3. Chấp nhận điều khoản dịch vụ
4. Nhấn nút "Đăng Ký"
5. Hệ thống gửi email xác minh đến email đã cung cấp
6. Người dùng nhấp vào liên kết xác minh trong email
7. Tài khoản được kích hoạt thành công

**Expected Result**:
- ✅ Bản ghi được tạo trong bảng `user_registrations` với status = "pending"
- ✅ Email xác minh được gửi thành công
- ✅ Hiển thị thông báo: "Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản"
- ✅ Người dùng được chuyển hướng đến trang xác nhận email
- ✅ Khi email được xác minh, bản ghi trong `users` được tạo
- ✅ status trong `user_registrations` chuyển sang "approved"

**Database Changes**:
```sql
-- user_registrations table
INSERT INTO user_registrations (name, email, phone, address, password, status, created_at)
VALUES ('Nguyễn Văn A', 'nguyen.van.a@pharmacy.com', '0987654321', '123 Đường Lê Lợi, TP.HCM', '[hashed_password]', 'pending', NOW());

-- users table (sau khi xác minh email)
INSERT INTO users (name, email, phone, address, status, role, created_at)
VALUES ('Nguyễn Văn A', 'nguyen.van.a@pharmacy.com', '0987654321', '123 Đường Lê Lợi, TP.HCM', 'active', 'staff', NOW());
```

**Postcondition**:
- Người dùng có thể đăng nhập bằng email và mật khẩu đã đăng ký
- Vai trò mặc định được gán: "staff"

---

### 1.2 Alternative Flow - Email Không Hợp Lệ

**Tiêu đề**: Hệ thống từ chối email không hợp lệ

**Precondition**:
- Người dùng ở trên trang đăng ký

**Steps**:
1. Nhập email không hợp lệ: "invalid-email@"
2. Nhấn nút "Đăng Ký"

**Expected Result**:
- ❌ Hiển thị lỗi: "Email không hợp lệ"
- ❌ Form không được submit
- ❌ Không có bản ghi nào được tạo

---

### 1.3 Alternative Flow - Email Đã Được Sử Dụng

**Tiêu đề**: Hệ thống từ chối email trùng lặp

**Precondition**:
- Email "nguyen.van.a@pharmacy.com" đã tồn tại trong bảng `users`

**Steps**:
1. Người dùng nhập email: "nguyen.van.a@pharmacy.com"
2. Nhấn nút "Đăng Ký"

**Expected Result**:
- ❌ Hiển thị lỗi: "Email đã được sử dụng. Vui lòng sử dụng email khác hoặc đăng nhập"
- ❌ Form không được submit
- ❌ Không có bản ghi mới được tạo

---

### 1.4 Alternative Flow - Mật Khẩu Yếu

**Tiêu đề**: Hệ thống yêu cầu mật khẩu mạnh

**Precondition**:
- Người dùng ở trên trang đăng ký

**Steps**:
1. Nhập mật khẩu: "123456" (quá ngắn)
2. Nhập xác nhận mật khẩu: "123456"
3. Nhấn nút "Đăng Ký"

**Expected Result**:
- ❌ Hiển thị lỗi: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt"
- ❌ Form không được submit

**Password Requirements**:
- Độ dài tối thiểu: 8 ký tự
- Bao gồm: chữ hoa (A-Z), chữ thường (a-z), số (0-9), ký tự đặc biệt (!@#$%^&*)

---

## 2. SCENARIO: Đăng Nhập Tài Khoản

### 2.1 Happy Path - Đăng Nhập Thành Công

**Tiêu đề**: Nhân viên đăng nhập thành công vào hệ thống

**Precondition**:
- Người dùng có tài khoản hợp lệ
- Tài khoản status = "active"
- Người dùng chưa đăng nhập

**Steps**:
1. Truy cập trang đăng nhập (/login)
2. Nhập email: "nguyen.van.a@pharmacy.com"
3. Nhập mật khẩu: "SecurePass123!"
4. Nhấn nút "Đăng Nhập"
5. Hệ thống xác minh thông tin đăng nhập
6. Tạo session/JWT token

**Expected Result**:
- ✅ Đăng nhập thành công
- ✅ Chuyển hướng đến dashboard hoặc trang chủ
- ✅ Hiển thị tên người dùng ở góc trên cùng
- ✅ Session được lưu trong localStorage hoặc cookie
- ✅ Token JWT được tạo (nếu sử dụng token-based auth)

**Database Changes**:
```sql
-- Ghi lại thời gian đăng nhập gần nhất (nếu cần)
UPDATE users SET last_login_at = NOW() WHERE id = [user_id];

-- Tạo audit log
INSERT INTO audit_logs (user_id, action, entity, entity_id, created_at)
VALUES ([user_id], 'LOGIN', 'user', [user_id], NOW());
```

**Postcondition**:
- Người dùng có thể truy cập các trang được bảo vệ
- Session tồn tại cho đến khi hết hạn hoặc người dùng đăng xuất

---

### 2.2 Alternative Flow - Mật Khẩu Sai

**Tiêu đề**: Từ chối đăng nhập với mật khẩu sai

**Precondition**:
- Người dùng có tài khoản hợp lệ

**Steps**:
1. Nhập email: "nguyen.van.a@pharmacy.com"
2. Nhập mật khẩu sai: "WrongPassword123!"
3. Nhấn nút "Đăng Nhập"

**Expected Result**:
- ❌ Hiển thị lỗi: "Email hoặc mật khẩu không chính xác"
- ❌ Người dùng vẫn ở trang đăng nhập
- ❌ Không tạo session

**Security Note**:
- Không nên hiển thị "Mật khẩu sai" để tránh lộ thông tin
- Ghi lại nỗ dự đăng nhập sai trong audit log
- Khóa tài khoản tạm thời sau 5 lần đăng nhập sai trong 15 phút

---

### 2.3 Alternative Flow - Tài Khoản Không Tồn Tại

**Tiêu đề**: Từ chối đăng nhập khi email không tồn tại

**Precondition**:
- Email chưa được đăng ký

**Steps**:
1. Nhập email: "nonexistent@pharmacy.com"
2. Nhập mật khẩu: "AnyPassword123!"
3. Nhấn nút "Đăng Nhập"

**Expected Result**:
- ❌ Hiển thị lỗi: "Email hoặc mật khẩu không chính xác"
- ❌ Người dùng vẫn ở trang đăng nhập
- ❌ Không tạo session

---

### 2.4 Alternative Flow - Tài Khoản Bị Vô Hiệu Hóa

**Tiêu đề**: Từ chối đăng nhập tài khoản không hoạt động

**Precondition**:
- Người dùng có tài khoản nhưng status = "inactive" hoặc "suspended"

**Steps**:
1. Nhập email: "suspended.user@pharmacy.com"
2. Nhập mật khẩu: "SecurePass123!"
3. Nhấn nút "Đăng Nhập"

**Expected Result**:
- ❌ Hiển thị lỗi: "Tài khoản của bạn đã bị vô hiệu hóa. Liên hệ quản trị viên để được hỗ trợ"
- ❌ Không tạo session

---

## 3. SCENARIO: Quên Mật Khẩu

### 3.1 Happy Path - Đặt Lại Mật Khẩu Thành Công

**Tiêu đề**: Người dùng quên mật khẩu và đặt lại thành công

**Precondition**:
- Người dùng có tài khoản hợp lệ
- Email tài khoản hợp lệ

**Steps**:
1. Từ trang đăng nhập, nhấn "Quên Mật Khẩu?"
2. Nhập email: "nguyen.van.a@pharmacy.com"
3. Nhấn "Gửi Mã OTP"
4. Hệ thống gửi mã OTP 6 chữ số tới email
5. Người dùng nhập mã OTP: "123456"
6. Nhập mật khẩu mới: "NewSecurePass456!"
7. Nhập xác nhận mật khẩu: "NewSecurePass456!"
8. Nhấn "Đặt Lại Mật Khẩu"
9. Hệ thống xác minh OTP và cập nhật mật khẩu

**Expected Result**:
- ✅ Mã OTP được tạo và gửi trong vòng 2 phút
- ✅ Hiển thị thông báo: "Mã OTP đã được gửi đến email của bạn"
- ✅ Sau khi xác minh OTP, mật khẩu được cập nhật
- ✅ Hiển thị thông báo: "Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập"
- ✅ Chuyển hướng đến trang đăng nhập

**Database Changes**:
```sql
-- Tạo token reset
INSERT INTO password_reset_tokens (user_id, token, method, expires_at, is_used)
VALUES ([user_id], '[6-digit-code]', 'email', NOW() + INTERVAL '30 minutes', false);

-- Cập nhật mật khẩu
UPDATE user_credentials SET secret = '[new-hashed-password]' WHERE user_id = [user_id];

-- Đánh dấu token đã sử dụng
UPDATE password_reset_tokens SET is_used = true WHERE token = '[6-digit-code]';
```

**Postcondition**:
- Người dùng có thể đăng nhập bằng mật khẩu mới
- Token reset hết hiệu lực

---

### 3.2 Alternative Flow - Mã OTP Hết Hạn

**Tiêu đề**: Mã OTP hết hạn trước khi được xác minh

**Precondition**:
- Người dùng yêu cầu đặt lại mật khẩu 35 phút trước

**Steps**:
1. Người dùng nhập mã OTP
2. Hệ thống kiểm tra thời gian hết hạn

**Expected Result**:
- ❌ Hiển thị lỗi: "Mã OTP đã hết hạn. Vui lòng yêu cầu mã mới"
- ❌ Không cho phép đặt lại mật khẩu
- ❌ Người dùng phải yêu cầu OTP mới

**Token Expiration**:
- OTP hết hạn sau 30 phút
- Mỗi OTP chỉ có thể sử dụng 1 lần

---

### 3.3 Alternative Flow - Mã OTP Sai

**Tiêu đề**: Từ chối OTP không chính xác

**Precondition**:
- Người dùng nhận được mã OTP hợp lệ

**Steps**:
1. Người dùng nhập mã OTP sai: "999999"

**Expected Result**:
- ❌ Hiển thị lỗi: "Mã OTP không chính xác. Vui lòng thử lại"
- ❌ Cho phép nhập lại (tối đa 5 lần)
- ❌ Sau 5 lần sai, phải yêu cầu OTP mới

---

## 4. SCENARIO: Quản Lý Phân Ca

### 4.1 Happy Path - Xem Lịch Ca

**Tiêu đề**: Nhân viên xem lịch ca được gán

**Precondition**:
- Người dùng đã đăng nhập
- Người dùng có vai trò "staff"
- Có ca được gán cho người dùng

**Steps**:
1. Người dùng truy cập trang "Lịch Ca" hoặc "Shift Schedule"
2. Hệ thống hiển thị danh sách các ca được gán trong tuần hiện tại

**Expected Result**:
- ✅ Hiển thị danh sách ca:
  - Ngày: "Thứ Hai, 13/11/2025"
  - Ca: "Sáng (06:00 - 14:00)"
  - Trạng thái: "Chưa check-in"
- ✅ Có nút "Check-in" nếu ca đang diễn ra
- ✅ Có nút "Check-out" nếu đã check-in

**Database Query**:
```sql
SELECT 
    sa.id,
    s.name as shift_name,
    s.shift_type,
    s.start_time,
    s.end_time,
    sa.assigned_date,
    sa.status,
    sa.check_in_time,
    sa.check_out_time
FROM shift_assignments sa
JOIN shifts s ON sa.shift_id = s.id
WHERE sa.user_id = [current_user_id]
    AND sa.assigned_date BETWEEN DATE_TRUNC('week', NOW()) 
    AND DATE_TRUNC('week', NOW()) + INTERVAL '7 days'
ORDER BY sa.assigned_date, s.start_time;
```

**Postcondition**:
- Nhân viên có thể check-in hoặc check-out khi cần

---

### 4.2 Happy Path - Check-in

**Tiêu đề**: Nhân viên bắt đầu ca làm việc

**Precondition**:
- Nhân viên đã đăng nhập
- Ca đã được gán và đang diễn ra (thời gian hiện tại trong khoảng start_time - end_time)
- Trạng thái ca: "scheduled" hoặc "confirmed"

**Steps**:
1. Nhân viên xem lịch ca và nhấn "Check-in"
2. Hệ thống ghi lại thời gian check-in hiện tại
3. Cập nhật trạng thái ca thành "in_progress"

**Expected Result**:
- ✅ Check-in thành công
- ✅ Hiển thị thông báo: "Check-in thành công. Ca của bạn đã bắt đầu"
- ✅ Nút "Check-in" thay đổi thành "Check-out"
- ✅ Hiển thị thời gian check-in

**Database Changes**:
```sql
UPDATE shift_assignments 
SET 
    status = 'in_progress',
    check_in_time = NOW()
WHERE id = [assignment_id];

INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'CHECK_IN', 'shift_assignment', [assignment_id], 
        JSON_BUILD_OBJECT('check_in_time', NOW()), NOW());
```

**Postcondition**:
- Nhân viên được phép sử dụng các chức năng của hệ thống
- Hệ thống bắt đầu ghi lại hoạt động của nhân viên

---

### 4.3 Happy Path - Check-out

**Tiêu đề**: Nhân viên kết thúc ca làm việc

**Precondition**:
- Nhân viên đã check-in
- Trạng thái ca: "in_progress"
- Có check_in_time được ghi lại

**Steps**:
1. Nhân viên xem lịch ca và nhấn "Check-out"
2. Hệ thống ghi lại thời gian check-out hiện tại
3. Cập nhật trạng thái ca thành "completed"

**Expected Result**:
- ✅ Check-out thành công
- ✅ Hiển thị thông báo: "Check-out thành công. Ca của bạn đã kết thúc"
- ✅ Hiển thị thời gian làm việc: "8 giờ 5 phút"
- ✅ Nút "Check-out" bị vô hiệu hóa

**Database Changes**:
```sql
UPDATE shift_assignments 
SET 
    status = 'completed',
    check_out_time = NOW()
WHERE id = [assignment_id];

INSERT INTO audit_logs (user_id, action, entity, entity_id, changes, created_at)
VALUES ([user_id], 'CHECK_OUT', 'shift_assignment', [assignment_id], 
        JSON_BUILD_OBJECT('check_out_time', NOW()), NOW());
```

**Calculation**:
```
Thời gian làm việc = check_out_time - check_in_time
```

**Postcondition**:
- Thời gian làm việc được ghi lại chính xác
- Có thể tính toán lương dựa trên số giờ làm việc

---

### 4.4 Alternative Flow - Check-in Sớm (Early Check-in)

**Tiêu đề**: Nhân viên check-in trước khi ca bắt đầu

**Precondition**:
- Thời gian hiện tại < start_time của ca
- Ví dụ: Ca bắt đầu lúc 06:00, nhân viên check-in lúc 05:45

**Steps**:
1. Nhân viên nhấn "Check-in"
2. Hệ thống hiển thị cảnh báo: "Bạn đang check-in sớm (15 phút trước ca bắt đầu). Xác nhận?"
3. Nhân viên nhấn "Xác Nhận"

**Expected Result**:
- ✅ Cho phép check-in sớm (nếu chính sách cho phép)
- ✅ Ghi lại check_in_time = 05:45
- ✅ Hiển thị cảnh báo cho quản lý (nếu quá 30 phút)
- ⚠️ Tính toán lương bao gồm thời gian sớm

**Policy Note**:
- Cho phép check-in sớm tối đa 30 phút
- Nếu sớm hơn 30 phút, cần xác nhận từ quản lý

---

### 4.5 Alternative Flow - Check-out Muộn (Late Check-out)

**Tiêu đề**: Nhân viên check-out sau khi ca kết thúc

**Precondition**:
- Thời gian hiện tại > end_time của ca
- Ví dụ: Ca kết thúc lúc 14:00, nhân viên check-out lúc 14:20

**Steps**:
1. Nhân viên nhấn "Check-out"
2. Hệ thống ghi lại check_out_time = 14:20

**Expected Result**:
- ✅ Check-out thành công
- ✅ Hiển thị cảnh báo: "Bạn check-out muộn hơn ca (20 phút)"
- ✅ Tính toán lương bao gồm thời gian muộn
- ⚠️ Ghi lại trong audit log để quản lý theo dõi

---

### 4.6 Alternative Flow - Không Check-out (Absent)

**Tiêu đề**: Nhân viên không check-out trước khi kết thúc ca

**Precondition**:
- Nhân viên đã check-in
- Thời gian hiện tại > end_time + 30 phút
- Nhân viên không check-out

**Steps**:
1. Hệ thống tự động đóng ca sau 30 phút khi hết giờ (nếu chính sách cho phép)
2. Cập nhật trạng thái ca thành "completed"
3. Ghi lại check_out_time = end_time + 30 phút

**Expected Result**:
- ⚠️ Hệ thống gửi thông báo cho nhân viên và quản lý
- ⚠️ Trạng thái ca chuyển thành "completed" (có cảnh báo)
- ⚠️ Lương được tính dựa trên end_time (không tính thời gian thêm)
- ⚠️ Ghi lại sự cố trong audit log

---

## 5. SCENARIO: Quy Trình Phân Ca (Admin/Manager)

### 5.1 Happy Path - Gán Ca Cho Nhân Viên

**Tiêu đề**: Quản lý gán ca làm việc cho nhân viên

**Precondition**:
- Người dùng có vai trò "manager" hoặc "owner"
- Nhân viên tồn tại trong hệ thống
- Ca làm việc đã được định nghĩa

**Steps**:
1. Quản lý truy cập trang "Quản Lý Ca" (Shift Management)
2. Chọn ngày: "Thứ Hai, 13/11/2025"
3. Chọn ca: "Sáng (06:00 - 14:00)"
4. Chọn nhân viên: "Nguyễn Văn A"
5. Nhấn "Gán Ca"
6. Hệ thống tạo bản ghi assignment

**Expected Result**:
- ✅ Ca được gán thành công
- ✅ Nhân viên nhận thông báo: "Bạn được gán ca Sáng vào Thứ Hai, 13/11/2025"
- ✅ Ca xuất hiện trong lịch của nhân viên
- ✅ Trạng thái assignment: "scheduled"

**Database Changes**:
```sql
INSERT INTO shift_assignments (user_id, shift_id, assigned_date, status, created_by, created_at)
VALUES ([staff_user_id], [shift_id], '2025-11-13', 'scheduled', [manager_user_id], NOW());
```

**Postcondition**:
- Nhân viên có thể xem ca trong lịch của mình
- Nhân viên có thể check-in vào ca

---

## 6. DATABASE DIAGRAM - Shift Management

```
┌─────────────────────────────────┐
│           users                 │
├─────────────────────────────────┤
│ id (PK)                         │
│ name                            │
│ email                           │
│ phone                           │
│ address                         │
│ status (active/inactive)        │
│ role (owner/staff/manager)      │
│ created_at                      │
│ updated_at                      │
└──────────────┬──────────────────┘
               │
               │ 1:N
               ├──────────────────────────┐
               │                          │
     ┌─────────▼────────────┐   ┌────────▼──────────────┐
     │ shift_assignments    │   │ user_registrations   │
     ├──────────────────────┤   ├─────────────────────┤
     │ id (PK)              │   │ id (PK)             │
     │ user_id (FK)────┐    │   │ name                │
     │ shift_id (FK)───┼──┐ │   │ email               │
     │ assigned_date   │  │ │   │ phone               │
     │ status          │  │ │   │ address             │
     │ check_in_time   │  │ │   │ password (hashed)   │
     │ check_out_time  │  │ │   │ status (pending)    │
     │ created_by (FK) │  │ │   │ created_at          │
     │ created_at      │  │ │   └─────────────────────┘
     └─────────────────┘  │ │
                          │ │
                  ┌───────┘ │
                  │         │
              ┌───▼──────────▼──┐
              │    shifts       │
              ├─────────────────┤
              │ id (PK)         │
              │ name            │
              │ shift_type      │
              │ start_time      │
              │ end_time        │
              │ description     │
              │ created_at      │
              │ updated_at      │
              └─────────────────┘
```

---

## 7. Timeline - Luồng Đăng Ký, Đăng Nhập, Phân Ca

```
┌──────────────────────────────────────────────────────────────────┐
│ Ngày 1: Đăng Ký Tài Khoản                                       │
└──────────────────────────────────────────────────────────────────┘

09:00 AM
├─ Nhân viên truy cập trang đăng ký
├─ Điền thông tin cá nhân
├─ Email xác minh được gửi
└─ Trạng thái: user_registrations.status = 'pending'

09:05 AM
├─ Nhân viên nhấp link xác minh trong email
├─ Hệ thống tạo record trong bảng users
├─ role = 'staff' (mặc định)
├─ status = 'active'
└─ Trạng thái: user_registrations.status = 'approved'

┌──────────────────────────────────────────────────────────────────┐
│ Ngày 2: Đăng Nhập & Nhận Ca                                     │
└──────────────────────────────────────────────────────────────────┘

06:30 AM
├─ Nhân viên truy cập trang đăng nhập
├─ Nhập email & mật khẩu
├─ Hệ thống tạo JWT token
└─ Chuyển hướng đến dashboard

06:35 AM
├─ Nhân viên xem lịch ca
├─ Ca được gán: Sáng (06:00 - 14:00)
├─ Trạng thái: 'scheduled'
└─ Nút 'Check-in' khả dụng

06:45 AM
├─ Nhân viên nhấn 'Check-in'
├─ check_in_time = 06:45
├─ Trạng thái assignment = 'in_progress'
└─ Ghi lại audit log

14:20 PM
├─ Nhân viên nhấn 'Check-out'
├─ check_out_time = 14:20
├─ Trạng thái assignment = 'completed'
├─ Thời gian làm việc: 7 giờ 35 phút
└─ Ghi lại audit log
```

---

## 8. API Endpoints - Shift Management

### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/forgot-password` - Yêu cầu đặt lại mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu
- `POST /api/auth/verify-email` - Xác minh email

### Shift Management
- `GET /api/shifts` - Danh sách ca làm việc
- `GET /api/shift-assignments` - Danh sách ca được gán
- `GET /api/shift-assignments/:id` - Chi tiết ca được gán
- `POST /api/shift-assignments/:id/check-in` - Check-in
- `POST /api/shift-assignments/:id/check-out` - Check-out

### Admin/Manager Only
- `POST /api/shift-assignments` - Tạo/gán ca
- `PUT /api/shift-assignments/:id` - Cập nhật ca
- `DELETE /api/shift-assignments/:id` - Xóa ca

---

## 9. Validation Rules

### User Registration
| Field | Validation | Error Message |
|-------|-----------|---------------|
| name | Bắt buộc, 2-100 ký tự | "Tên phải có 2-100 ký tự" |
| email | Bắt buộc, định dạng email | "Email không hợp lệ" |
| email | Không trùng lặp | "Email đã được sử dụng" |
| phone | Bắt buộc, 10-11 chữ số | "Số điện thoại không hợp lệ" |
| address | Không bắt buộc, tối đa 200 ký tự | "Địa chỉ tối đa 200 ký tự" |
| password | 8+ ký tự, hoa, thường, số, ký tự đặc biệt | "Mật khẩu yếu" |
| confirm_password | Khớp với password | "Mật khẩu xác nhận không khớp" |

### Login
| Field | Validation | Error Message |
|-------|-----------|---------------|
| email | Bắt buộc, định dạng email | "Email không hợp lệ" |
| password | Bắt buộc | "Mật khẩu không được để trống" |

### Check-in/Check-out
| Condition | Action | Result |
|-----------|--------|--------|
| Chưa check-in | Check-in | check_in_time = NOW() |
| Đã check-in | Check-out | check_out_time = NOW() |
| Ngoài giờ ca | Check-in sớm/muộn | Hiển thị cảnh báo |

---

## 10. Security Considerations

1. **Password Security**
   - Mật khẩu được hash sử dụng bcrypt
   - Không bao giờ lưu mật khẩu dạng plain text

2. **Session Management**
   - JWT token với expiration (24 giờ)
   - Refresh token (7 ngày)
   - Xóa token khi đăng xuất

3. **Audit Logging**
   - Ghi lại tất cả các hoạt động: đăng ký, đăng nhập, check-in, check-out
   - Lưu thông tin: user_id, action, timestamp, IP address

4. **Rate Limiting**
   - Giới hạn 5 lần đăng nhập sai trong 15 phút
   - Giới hạn 3 lần yêu cầu OTP trong 5 phút

5. **Email Verification**
   - Email verification token hết hạn sau 24 giờ
   - OTP hết hạn sau 30 phút

---

## 11. Testing Checklist

### Registration
- [ ] Đăng ký thành công với thông tin hợp lệ
- [ ] Từ chối email trùng lặp
- [ ] Từ chối mật khẩu yếu
- [ ] Từ chối email không hợp lệ
- [ ] Email xác minh được gửi
- [ ] Link xác minh hết hạn sau 24 giờ

### Login
- [ ] Đăng nhập thành công
- [ ] Từ chối mật khẩu sai
- [ ] Từ chối email không tồn tại
- [ ] Khóa tài khoản sau 5 lần sai
- [ ] Hiển thị "Remember Me" (nếu có)
- [ ] Tạo JWT token

### Shift Management
- [ ] Xem lịch ca
- [ ] Check-in thành công
- [ ] Check-out thành công
- [ ] Tính toán thời gian làm việc
- [ ] Ghi lại audit log
- [ ] Cảnh báo check-in sớm
- [ ] Cảnh báo check-out muộn


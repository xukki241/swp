# Authentication & User Management Use Cases

## Overview

Module quản lý xác thực và người dùng trong hệ thống PharmaFlow, bao gồm đăng nhập, đăng ký, quản lý profile và phân quyền.

---

## UC-AUTH-001: User Login

**Mô tả:** Cho phép người dùng (Nhân viên, Quản lý, Admin) đăng nhập vào hệ thống bằng email và mật khẩu.

### Actors

- Nhân viên (Staff)
- Quản lý (Manager)
- Admin

### Preconditions

- Người dùng đã có tài khoản được kích hoạt trong hệ thống
- Người dùng chưa đăng nhập

### Main Flow

1. Người dùng truy cập trang đăng nhập `/login`
2. Hệ thống hiển thị form đăng nhập với:
   - Email field
   - Password field
   - "Remember me" checkbox
   - "Forgot Password" link
3. Người dùng nhập email và password
4. Người dùng click "Login"
5. Hệ thống xác thực thông tin:
   - Kiểm tra email tồn tại
   - Kiểm tra password đúng
   - Kiểm tra tài khoản đã được kích hoạt
6. Hệ thống tạo JWT token và lưu vào localStorage/cookie
7. Hệ thống redirect đến `/dashboard`

### Alternative Flows

**A1: Email không tồn tại**

- Hiển thị error: "Email không tồn tại trong hệ thống"

**A2: Password sai**

- Hiển thị error: "Mật khẩu không đúng"
- Sau 5 lần sai → khóa tài khoản tạm thời 15 phút

**A3: Tài khoản chưa được kích hoạt**

- Hiển thị warning: "Tài khoản của bạn đang chờ Admin phê duyệt"

### Postconditions

- Người dùng được redirect đến dashboard
- Token được lưu vào client
- Session được tạo trên server

### API Endpoint

```
POST /api/auth/login
Body: { email, password }
Response: { token, user: { id, name, email, role } }
```

---

## UC-AUTH-002: User Registration

**Mô tả:** Cho phép người dùng mới tạo một yêu cầu đăng ký tài khoản, yêu cầu này sẽ chờ Admin phê duyệt.

### Actors

- Người dùng mới (Guest)

### Preconditions

- Người dùng chưa có tài khoản
- Email chưa được sử dụng

### Main Flow

1. Người dùng truy cập `/register`
2. Hệ thống hiển thị form đăng ký:
   - Full Name
   - Email
   - Phone Number
   - Password
   - Confirm Password
   - Terms & Policy checkbox
3. Người dùng điền đầy đủ thông tin
4. Người dùng click "Register"
5. Hệ thống validate:
   - Email format hợp lệ
   - Password >= 8 ký tự
   - Password match confirm password
   - Phone number hợp lệ
6. Hệ thống tạo registration request với status: `pending`
7. Hệ thống gửi email xác nhận đến user
8. Hiển thị thông báo: "Yêu cầu đăng ký của bạn đã được gửi. Vui lòng chờ Admin phê duyệt."

### Alternative Flows

**A1: Email đã tồn tại**

- Hiển thị error: "Email này đã được đăng ký"

**A2: Password không đủ mạnh**

- Hiển thị error: "Password phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số"

**A3: Terms not accepted**

- Hiển thị error: "Vui lòng đồng ý với Điều khoản & Chính sách"

### Postconditions

- Registration request được lưu vào DB với status: `pending`
- Email thông báo được gửi
- Người dùng được redirect về login page

### API Endpoint

```
POST /api/auth/register
Body: { name, email, phone, password }
Response: { message: "Registration request submitted" }
```

---

## UC-AUTH-003: Forgot Password

**Mô tả:** Cung cấp quy trình cho người dùng yêu cầu đặt lại mật khẩu thông qua email đã đăng ký.

### Actors

- Người dùng (đã có tài khoản)

### Preconditions

- Người dùng có tài khoản active
- Email đã được verify

### Main Flow

1. Người dùng click "Forgot Password" tại trang login
2. Hệ thống redirect đến `/forgot-password`
3. Người dùng nhập email
4. Người dùng click "Send Reset Link"
5. Hệ thống kiểm tra email tồn tại
6. Hệ thống tạo reset token (expire sau 1 giờ)
7. Hệ thống gửi email với link reset password
8. Hiển thị message: "Email reset password đã được gửi. Vui lòng kiểm tra inbox."

### Alternative Flows

**A1: Email không tồn tại**

- Hiển thị message chung: "Nếu email tồn tại, link reset đã được gửi" (security practice)

**A2: Yêu cầu quá nhiều lần**

- Giới hạn 3 lần/15 phút
- Hiển thị: "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau 15 phút."

### Postconditions

- Reset token được lưu vào DB
- Email với reset link được gửi

### API Endpoint

```
POST /api/auth/forgot-password
Body: { email }
Response: { message: "Reset email sent" }
```

---

## UC-AUTH-004: Reset Password

**Mô tả:** Cho phép người dùng tạo mật khẩu mới sau khi đã xác thực yêu cầu qua email.

### Actors

- Người dùng

### Preconditions

- Người dùng đã nhận được email reset password
- Reset token còn hiệu lực

### Main Flow

1. Người dùng click vào link trong email
2. Hệ thống redirect đến `/reset-password?token=xxx`
3. Hệ thống validate token:
   - Token hợp lệ
   - Token chưa expire
   - Token chưa được sử dụng
4. Hiển thị form:
   - New Password
   - Confirm Password
5. Người dùng nhập password mới
6. Người dùng click "Reset Password"
7. Hệ thống validate password (>= 8 ký tự, strong)
8. Hệ thống hash và lưu password mới
9. Hệ thống invalidate token
10. Hiển thị success: "Password đã được reset thành công"
11. Redirect về login page

### Alternative Flows

**A1: Token invalid/expired**

- Hiển thị error: "Link reset password không hợp lệ hoặc đã hết hạn"
- Hiển thị button "Request new reset link"

**A2: Password không match**

- Hiển thị error: "Password không khớp"

### Postconditions

- Password mới được lưu (hashed)
- Reset token bị invalidate
- User có thể login với password mới

### API Endpoint

```
POST /api/auth/reset-password
Body: { token, newPassword }
Response: { message: "Password reset successful" }
```

---

## UC-AUTH-005: View User Profile

**Mô tả:** Hiển thị thông tin cá nhân của người dùng đã đăng nhập, bao gồm tên, email, vai trò và trạng thái.

### Actors

- Mọi người dùng đã đăng nhập

### Preconditions

- Người dùng đã đăng nhập

### Main Flow

1. Người dùng click vào avatar/profile icon
2. Hệ thống redirect đến `/user-profile`
3. Hệ thống load và hiển thị:
   - Avatar (nếu có)
   - Full Name
   - Email
   - Phone Number
   - Role (Staff/Manager/Admin)
   - Status (Active/Inactive)
   - Created Date
   - Last Login

### UI Components

- Profile header với avatar
- Tabs: Profile Info | Change Password | Activity Log
- Edit Profile button (cho phép sửa name, phone)

### Postconditions

- Profile data được hiển thị
- User có thể navigate sang Change Password

### API Endpoint

```
GET /api/users/profile
Response: { user: { id, name, email, phone, role, status, createdAt, lastLogin } }
```

---

## UC-AUTH-006: Change Password

**Mô tả:** Cho phép người dùng đã đăng nhập tự thay đổi mật khẩu của mình sau khi xác thực mật khẩu hiện tại.

### Actors

- Mọi người dùng đã đăng nhập

### Preconditions

- Người dùng đã đăng nhập
- Có quyền truy cập profile

### Main Flow

1. Người dùng vào Profile page
2. Click tab "Change Password"
3. Hệ thống hiển thị form:
   - Current Password
   - New Password
   - Confirm New Password
4. Người dùng điền đầy đủ
5. Click "Change Password"
6. Hệ thống validate:
   - Current password đúng
   - New password >= 8 ký tự
   - New password khác old password
   - Confirm password match
7. Hệ thống update password mới (hash)
8. Hiển thị success: "Mật khẩu đã được thay đổi"
9. (Optional) Logout user và yêu cầu login lại

### Alternative Flows

**A1: Current password sai**

- Hiển thị error: "Mật khẩu hiện tại không đúng"

**A2: New password trùng old**

- Hiển thị warning: "Mật khẩu mới phải khác mật khẩu cũ"

### Postconditions

- Password mới được lưu
- Session có thể bị invalidate (tùy security policy)

### API Endpoint

```
PATCH /api/users/change-password
Body: { currentPassword, newPassword }
Response: { message: "Password changed successfully" }
```

---

## UC-AUTH-007: Manage User List (Admin)

**Mô tả:** (Admin) Quản lý danh sách tất cả người dùng, bao gồm tìm kiếm, lọc, chỉnh sửa thông tin và thay đổi trạng thái.

### Actors

- Admin

### Preconditions

- Người dùng có role: `admin`

### Main Flow

1. Admin truy cập `/users/list`
2. Hệ thống hiển thị bảng users với:
   - Columns: Avatar, Name, Email, Role, Status, Created Date, Actions
   - Search bar
   - Filter: Role, Status
   - Pagination
3. Admin có thể:
   - Search by name/email
   - Filter by role (Staff/Manager/Admin)
   - Filter by status (Active/Inactive/Pending)
   - Sort by column
4. Admin click "Edit" trên một user
5. Modal hiển thị form:
   - Name (editable)
   - Email (readonly)
   - Phone (editable)
   - Role (dropdown: Staff/Manager/Admin)
   - Status (toggle: Active/Inactive)
6. Admin thay đổi thông tin
7. Click "Save"
8. Hệ thống update user info
9. Table refresh với data mới

### Features

- **Search**: Real-time search by name/email
- **Filters**: Role, Status
- **Actions**: Edit, Deactivate/Activate, Delete
- **Bulk Actions**: Activate/Deactivate multiple users

### Alternative Flows

**A1: Delete user**

- Admin click "Delete"
- Confirm dialog: "Bạn có chắc muốn xóa user này?"
- Nếu Yes → soft delete user (status = deleted)

**A2: Activate/Deactivate**

- Admin toggle status
- User bị logout nếu đang deactivate

### Postconditions

- User list updated
- Changes reflected immediately

### API Endpoints

```
GET /api/users?search=&role=&status=&page=1&limit=10
PATCH /api/users/:id
DELETE /api/users/:id
```

---

## UC-AUTH-008: Review Registration Requests (Admin)

**Mô tả:** (Admin) Xem xét và phê duyệt hoặc từ chối các yêu cầu đăng ký tài khoản mới từ người dùng.

### Actors

- Admin

### Preconditions

- Người dùng có role: `admin`
- Có registration requests với status: `pending`

### Main Flow

1. Admin truy cập `/users/registrations`
2. Hệ thống hiển thị bảng registration requests:
   - Name, Email, Phone, Requested Date, Actions
   - Filter: Pending/Approved/Rejected
3. Admin click "View" trên một request
4. Modal hiển thị đầy đủ thông tin:
   - Full Name
   - Email
   - Phone
   - Requested Date
   - Additional Info (nếu có)
5. Admin có 3 options:
   - **Approve**: Tạo user với role mặc định (Staff)
   - **Approve as Manager**: Tạo user với role Manager
   - **Reject**: Từ chối yêu cầu
6. Admin click "Approve"
7. Modal assign role:
   - Role dropdown (Staff/Manager)
   - Optional: Welcome message
8. Click "Confirm"
9. Hệ thống:
   - Tạo user account với status: `active`
   - Generate temporary password hoặc send welcome email
   - Update registration status: `approved`
   - Send email thông báo cho user
10. Request được remove khỏi pending list

### Alternative Flows

**A1: Reject request**

- Admin click "Reject"
- Modal: "Lý do từ chối (optional)"
- Admin nhập lý do
- Click "Confirm Reject"
- Hệ thống:
  - Update status: `rejected`
  - Send email thông báo rejection với lý do
  - Move to rejected list

**A2: Bulk approve**

- Admin select multiple requests
- Click "Approve Selected"
- All được approve với role: Staff

### Postconditions

- Registration request status updated
- User account created (nếu approved)
- Email notification sent
- User có thể login (nếu approved)

### API Endpoints

```
GET /api/auth/registration-requests?status=pending
PATCH /api/auth/registration-requests/:id/approve
PATCH /api/auth/registration-requests/:id/reject
```

---

## Database Schema

### users table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('staff', 'manager', 'admin') DEFAULT 'staff',
  status ENUM('active', 'inactive', 'pending', 'deleted') DEFAULT 'pending',
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_status (status)
);
```

### registration_requests table

```sql
CREATE TABLE registration_requests (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejected_reason TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  reviewed_at TIMESTAMP,
  reviewed_by UUID REFERENCES users(id),
  INDEX idx_status (status)
);
```

### password_resets table

```sql
CREATE TABLE password_resets (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_token (token)
);
```

---

## UI Components

### Pages

- `/login` - Login Page
- `/register` - Registration Page
- `/forgot-password` - Forgot Password Page
- `/reset-password` - Reset Password Page
- `/user-profile` - User Profile Page
- `/users/list` - User Management Page (Admin)
- `/users/registrations` - Registration Requests Page (Admin)

### Components

- `LoginForm`
- `RegisterForm`
- `ForgotPasswordForm`
- `ResetPasswordForm`
- `UserProfileCard`
- `ChangePasswordForm`
- `UserListTable`
- `UserEditModal`
- `RegistrationRequestCard`
- `ApproveRequestModal`

---

## Security Considerations

1. **Password Hashing**: Sử dụng bcrypt với salt rounds >= 10
2. **JWT Token**:
   - Access token: expire 1 giờ
   - Refresh token: expire 7 ngày
3. **Rate Limiting**:
   - Login: 5 attempts / 15 minutes
   - Forgot password: 3 requests / 15 minutes
4. **CSRF Protection**: Token validation cho mọi mutation request
5. **XSS Prevention**: Sanitize user input
6. **SQL Injection**: Sử dụng parameterized queries
7. **Session Management**: Logout khi password change hoặc deactivate

---

## Error Codes

| Code | Message | HTTP Status |
|------|---------|-------------|
| AUTH_001 | Invalid credentials | 401 |
| AUTH_002 | Account not activated | 403 |
| AUTH_003 | Email already exists | 409 |
| AUTH_004 | Token expired | 401 |
| AUTH_005 | Invalid token | 400 |
| AUTH_006 | Password too weak | 400 |
| AUTH_007 | Unauthorized | 403 |
| AUTH_008 | Account locked | 423 |

---

## Testing Checklist

- [ ] Login với credentials hợp lệ
- [ ] Login với credentials không hợp lệ
- [ ] Login với account chưa activate
- [ ] Register với email mới
- [ ] Register với email đã tồn tại
- [ ] Forgot password flow hoàn chỉnh
- [ ] Reset password với token hợp lệ
- [ ] Reset password với token expired
- [ ] Change password thành công
- [ ] Change password với current password sai
- [ ] Admin approve registration request
- [ ] Admin reject registration request
- [ ] Admin edit user info
- [ ] Admin activate/deactivate user
- [ ] Rate limiting hoạt động
- [ ] Session expire đúng thời gian

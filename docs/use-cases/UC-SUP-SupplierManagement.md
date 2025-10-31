# Supplier Management Use Cases

## Overview

Module quản lý nhà cung cấp thuốc, bao gồm thông tin liên hệ, lịch sử giao dịch và đánh giá.

---

## UC-SUP-001: View Supplier List

**Mô tả:** Hiển thị danh sách tất cả nhà cung cấp với search, filter và pagination.

### Actors

- Manager, Admin

### Preconditions

- Có role: `manager` hoặc `admin`

### Main Flow

1. Người dùng truy cập `/suppliers`
2. Hệ thống hiển thị table suppliers:
   - Name
   - Contact Person
   - Phone
   - Email
   - Address
   - Status (Active/Inactive)
   - Actions (View, Edit, Delete)
3. Features:
   - Search by name
   - Filter by status
   - Sort by name, created date
   - Pagination: 20 items/page

### API Endpoint

```http
GET /api/suppliers?search=&status=&page=1&limit=20
```

---

## UC-SUP-002: View Supplier Detail

**Mô tả:** Xem chi tiết thông tin nhà cung cấp, bao gồm lịch sử giao dịch và medications provided.

### Actors

- Manager, Admin

### Main Flow

1. Click "View" trên supplier
2. Redirect đến `/suppliers/:id`
3. Hiển thị:
   - **Basic Info**:
     - Company Name
     - Contact Person
     - Phone, Email
     - Address
     - Tax Code
     - Bank Account
     - Status
   - **Purchase History**:
     - Table of purchase orders
     - Total: Amount, Orders count
   - **Medications Supplied**:
     - List medications from this supplier

### API Endpoint

```http
GET /api/suppliers/:id
GET /api/suppliers/:id/purchase-orders
GET /api/suppliers/:id/medications
```

---

## UC-SUP-003: Create Supplier

**Mô tả:** (Manager/Admin) Tạo nhà cung cấp mới.

### Actors

- Manager, Admin

### Main Flow

1. Click "Add Supplier" button
2. Form hiển thị:
   - **Required**:
     - Company Name *
     - Contact Person *
     - Phone *
     - Email *
   - **Optional**:
     - Address
     - Tax Code
     - Bank Account
     - Notes
3. Điền form và click "Create"
4. Hệ thống validate:
   - Name không trống
   - Email format hợp lệ
   - Phone format hợp lệ
5. Tạo supplier với status: `active`
6. Success toast và redirect về supplier detail

### Alternative Flows

**A1: Duplicate email**

- Error: "Email này đã tồn tại"

### API Endpoint

```http
POST /api/suppliers
Body: { name, contactPerson, phone, email, address, taxCode, bankAccount }
```

---

## UC-SUP-004: Update Supplier

**Mô tả:** Chỉnh sửa thông tin nhà cung cấp.

### Actors

- Manager, Admin

### Main Flow

1. Click "Edit" trên supplier detail
2. Form pre-filled với data hiện tại
3. Chỉnh sửa thông tin
4. Click "Save"
5. Validate và update
6. Success toast

### API Endpoint

```http
PATCH /api/suppliers/:id
```

---

## UC-SUP-005: Delete Supplier

**Mô tả:** (Admin) Xóa nhà cung cấp khỏi hệ thống (soft delete).

### Actors

- Admin

### Preconditions

- Không có purchase orders đang pending

### Main Flow

1. Admin click "Delete"
2. Confirm dialog
3. Hệ thống check constraints
4. Soft delete (status = 'deleted')
5. Success toast

### Alternative Flows

**A1: Has pending POs**

- Error: "Không thể xóa. Supplier có purchase orders đang chờ xử lý."

### API Endpoint

```http
DELETE /api/suppliers/:id
```

---

## Database Schema

```sql
CREATE TABLE suppliers (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  address TEXT,
  tax_code VARCHAR(50),
  bank_account VARCHAR(100),
  notes TEXT,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_name (name),
  INDEX idx_email (email),
  INDEX idx_status (status)
);
```

---

## Testing Checklist

- [ ] View supplier list
- [ ] Search suppliers
- [ ] Filter by status
- [ ] View supplier detail
- [ ] Create supplier successfully
- [ ] Create với duplicate email → error
- [ ] Update supplier info
- [ ] Delete supplier without POs → success
- [ ] Delete supplier với pending POs → error
- [ ] View purchase history
- [ ] View medications supplied

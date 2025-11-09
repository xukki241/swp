# Customer Creation Requirements - Backend & Frontend

## Issue Analysis

**Vấn đề:** Khi tạo khách hàng để bán hàng, system yêu cầu email bắt buộc thay vì SĐT.

**Root Cause:** 
1. Backend không có validation rõ ràng cho các trường bắt buộc
2. Frontend yêu cầu SĐT nhưng backend không enforce
3. Thứ tự validation không logic (yêu cầu email khi tạo đơn hàng)

---

## Solution Overview

### **Yêu cầu:**
- ✅ **Tên khách hàng:** Bắt buộc (required)
- ✅ **SĐT (Phone):** Optional nhưng nếu cung cấp phải unique
- ✅ **Email:** Optional nhưng nếu cung cấp phải unique
- ✅ **Địa chỉ:** Optional

### **Email không phải bắt buộc để:**
- Tạo khách hàng
- Tạo đơn hàng bán hàng
- Email chỉ được gửi invoice nếu khách hàng có email

---

## Changes Made

### 1. **Backend - Database Schema (`apps/api/src/db/schema/common.js`)**

#### Vấn đề:
- Phone field chỉ có length 10, khó extend
- Không rõ ràng field nào optional

#### Sửa chữa:
```javascript
// Trước
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 10 });

// Sau
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 20 });
```

**Lý do:** 
- Tăng flexibility cho phone numbers
- Cho phép nhập thêm country code hoặc ext

### 2. **Backend - Customer Controller (`apps/api/src/controllers/customerController.js`)**

#### Vấn đề:
- Error messages không cụ thể (chỉ "already exists")
- Không validate name bắt buộc
- HTTP status code không đúng (400 thay vì 409 cho conflict)

#### Sửa chữa:

**CREATE endpoint:**
```javascript
// Thêm validation cho name
if (!payload.name || !payload.name.trim()) {
  return res.status(400).json({
    success: false,
    error: {
      message: "Tên khách hàng là bắt buộc",
    },
  });
}

// Email check
if (payload.email && payload.email.trim()) {
  const existingCustomer = await customerService.getByEmail(payload.email.trim());
  if (existingCustomer) {
    return res.status(409).json({  // 409 Conflict thay vì 400
      success: false,
      error: {
        message: `Khách hàng với email '${trimmedEmail}' đã tồn tại`,
      },
    });
  }
}

// Phone check
if (payload.phone && payload.phone.trim()) {
  const existingCustomer = await customerService.getByPhone(payload.phone.trim());
  if (existingCustomer) {
    return res.status(409).json({  // 409 Conflict
      success: false,
      error: {
        message: `Khách hàng với số điện thoại '${trimmedPhone}' đã tồn tại`,
      },
    });
  }
}
```

**UPDATE endpoint:**
- Cập nhật tương tự với 409 status code
- Error message bằng tiếng Việt

---

## Frontend Changes Already Applied

### Files Modified:
1. **`apps/web/src/pages/sales/SalesPage.jsx`**
   - `handleCreateCustomer()`: Extract error chi tiết từ response

2. **`apps/web/src/pages/sales/components/CustomerSelector.jsx`**
   - Error handling cụ thể cho tìm kiếm

3. **`apps/web/src/pages/sales/components/EditCustomerForm.jsx`**
   - Error handling cụ thể cho update

### Error Message Extraction Pattern:
```javascript
let message = "Lỗi mặc định";

if (error?.response?.data?.error) {
  const errorData = error.response.data.error;
  if (typeof errorData === "object" && errorData.message) {
    message = errorData.message;
  } else if (typeof errorData === "string") {
    message = errorData;
  }
} else if (error?.response?.data?.message) {
  message = error.response.data.message;
} else if (error?.response?.status) {
  // Handle by HTTP status code
  if (error.response.status === 409) {
    message = "Dữ liệu đã tồn tại";
  }
}

toast.error(message);
```

---

## Frontend Form - Current State

### Create New Customer Form (SalesPage.jsx):
```
Input fields:
- [Required] Tên khách hàng *
- [Optional] Email
- [Optional] SĐT
```

**Lưu ý:** Form chỉ yêu cầu name, các field khác optional

### Edit Customer Form (EditCustomerForm.jsx):
```
Input fields:
- [Required] Tên khách hàng *
- [Required] SĐT * (yêu cầu vì field này có in form)
- [Optional] Email
- [Optional] Địa chỉ
```

---

## Error Scenarios & Expected Behavior

### Scenario 1: Tạo customer mà không có name
```
Frontend validation: Toast "Vui lòng nhập tên khách hàng"
API Response: 400 {
  "success": false,
  "error": { "message": "Tên khách hàng là bắt buộc" }
}
```

### Scenario 2: Email đã tồn tại
```
API Response: 409 {
  "success": false,
  "error": { "message": "Khách hàng với email 'xxx@mail.com' đã tồn tại" }
}
Frontend Toast: "Khách hàng với email 'xxx@mail.com' đã tồn tại"
```

### Scenario 3: SĐT đã tồn tại
```
API Response: 409 {
  "success": false,
  "error": { "message": "Khách hàng với số điện thoại '0901234567' đã tồn tại" }
}
Frontend Toast: "Khách hàng với số điện thoại '0901234567' đã tồn tại"
```

### Scenario 4: Tạo thành công
```
API Response: 201 {
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid",
    "name": "Customer Name",
    "email": null (or email if provided),
    "phone": null (or phone if provided),
    "address": null (or address if provided)
  }
}
Frontend Toast: "Tạo khách hàng thành công!" (if success modal shown)
```

---

## Database Schema - Final State

### customers table:
```sql
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,           -- Required
  email VARCHAR(255),                   -- Optional, unique if provided
  phone VARCHAR(20),                    -- Optional, unique if provided (increased from 10)
  address TEXT,                         -- Optional
  search_vector TSVECTOR,               -- For full-text search
  UNIQUE(email),
  UNIQUE(phone),
  INDEX search_vector_idx USING GIN
);
```

---

## Testing Checklist

- [ ] Create customer with only name
- [ ] Create customer with name + phone
- [ ] Create customer with name + email
- [ ] Create customer with name + phone + email
- [ ] Try to create customer with same email → 409 error
- [ ] Try to create customer with same phone → 409 error
- [ ] Try to create customer without name → 400 error
- [ ] Update customer with new email (non-duplicate)
- [ ] Update customer with duplicate email → 409 error
- [ ] Update customer with duplicate phone → 409 error
- [ ] Create sales order without customer email → no email sent
- [ ] Create sales order with customer email → email sent

---

## Summary

| Field | Required | Unique | Notes |
|-------|----------|--------|-------|
| name | ✅ Yes | ❌ No | Bắt buộc |
| phone | ❌ No | ✅ Yes (if provided) | Optional, unique if set |
| email | ❌ No | ✅ Yes (if provided) | Optional, unique if set |
| address | ❌ No | ❌ No | Optional |

**Email gửi invoice chỉ diễn ra khi:**
1. Order status được update thành "paid"
2. Customer có email (không null)
3. Email được gửi asynchronously (không ảnh hưởng tới API response)

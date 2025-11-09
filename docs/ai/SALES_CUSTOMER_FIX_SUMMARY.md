# Sales Backend - Customer Creation Fix Summary

## Problem Statement

**User Issue:** "Tại sao khi tạo khách hàng cần email bắt buộc? Tôi cần SĐT là bắt buộc và email là optional"

---

## Root Cause Analysis

### Database Schema (✅ Correct)

- ✅ `email` field: Optional (không có `.notNull()`)
- ✅ `phone` field: Optional (không có `.notNull()`)
- ❌ `phone` length: Chỉ 10 characters (quá ngắn)

### Backend Validation (❌ Issues Found)

**File: `apps/api/src/controllers/customerController.js`**

1. **Không validate name bắt buộc** → Cho phép tạo customer không có tên
2. **Error messages không cụ thể** → Chỉ hiển thị "already exists"
3. **HTTP Status Code sai** → Dùng 400 thay vì 409 cho conflict
4. **Error message format không consistent** → Không có `.error.message` structure

### Frontend (❌ Issues Found)

**File: `apps/web/src/pages/sales/SalesPage.jsx`**

1. **Error message handling sơ sài** → Chỉ show `error.message` (status code)
2. **Không extract error từ response** → Không biết lỗi cụ thể là gì

---

## Solutions Implemented

### 1. ✅ Database Schema Fix

**File: `apps/api/src/db/schema/common.js`**

```javascript
// Trước (line 24)
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 10 });

// Sau
export const phone = (columnName = "phone") =>
  varchar(columnName, { length: 20 });
```

**Lý do:** Tăng flexibility cho phone numbers (có thể thêm country code, extension, etc.)

---

### 2. ✅ Backend Validation Improvements

**File: `apps/api/src/controllers/customerController.js`**

#### CREATE Endpoint - Validation Updates:

```javascript
// ✅ Thêm: Validate name bắt buộc
if (!payload.name || !payload.name.trim()) {
  return res.status(400).json({
    success: false,
    error: {
      message: "Tên khách hàng là bắt buộc",
    },
  });
}

// ✅ Sửa: Email check - 409 thay vì 400, message cụ thể
if (payload.email && payload.email.trim()) {
  const existingCustomer = await customerService.getByEmail(
    payload.email.trim()
  );
  if (existingCustomer) {
    return res.status(409).json({
      // 409 Conflict
      success: false,
      error: {
        message: `Khách hàng với email '${trimmedEmail}' đã tồn tại`,
      },
    });
  }
}

// ✅ Sửa: Phone check - 409 thay vì 400, message cụ thể
if (payload.phone && payload.phone.trim()) {
  const existingCustomer = await customerService.getByPhone(
    payload.phone.trim()
  );
  if (existingCustomer) {
    return res.status(409).json({
      // 409 Conflict
      success: false,
      error: {
        message: `Khách hàng với số điện thoại '${trimmedPhone}' đã tồn tại`,
      },
    });
  }
}
```

#### UPDATE Endpoint - Similar improvements:

- Consistent error message structure
- Proper HTTP status codes (409 for duplicates, 404 for not found)
- Vietnamese error messages

---

### 3. ✅ Frontend Error Handling (Already Applied)

**Files Modified:**

- `apps/web/src/pages/sales/SalesPage.jsx` - `handleCreateCustomer()` method
- `apps/web/src/pages/sales/components/CustomerSelector.jsx` - Search error handling
- `apps/web/src/pages/sales/components/EditCustomerForm.jsx` - Update error handling

**Error Extraction Pattern:**

```javascript
let message = "Không thể tạo khách hàng";
if (error?.response?.data?.error?.message) {
  message = error.response.data.error.message;
} else if (error?.response?.data?.message) {
  message = error.response.data.message;
} else if (error?.response?.status === 409) {
  message = "Dữ liệu đã tồn tại";
}
toast.error(message); // Show specific error message
```

---

## New Behavior

### ✅ Create Customer Requirements:

| Field       | Required | Unique          | Notes                        |
| ----------- | -------- | --------------- | ---------------------------- |
| **name**    | ✅ Yes   | ❌ No           | Bắt buộc                     |
| **phone**   | ❌ No    | ✅ Yes (if set) | Optional, unique if provided |
| **email**   | ❌ No    | ✅ Yes (if set) | Optional, unique if set      |
| **address** | ❌ No    | ❌ No           | Optional                     |

### ✅ Error Scenarios:

**1. Missing Name (400):**

```json
{
  "success": false,
  "error": {
    "message": "Tên khách hàng là bắt buộc"
  }
}
```

**2. Email Duplicate (409):**

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với email 'abc@example.com' đã tồn tại"
  }
}
```

**3. Phone Duplicate (409):**

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với số điện thoại '0901234567' đã tồn tại"
  }
}
```

**4. Success (201):**

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid",
    "name": "Nguyễn Văn A",
    "email": null, // optional
    "phone": null, // optional
    "address": null // optional
  }
}
```

---

## Email Invoice Behavior

### ❌ Trước:

- Email bắt buộc để tạo khách hàng → Sai
- Lỗi không rõ ràng → Người dùng confused

### ✅ Sau:

- Email hoàn toàn optional khi tạo customer
- Email chỉ được dùng để gửi invoice sau khi order mark as paid:
  1. Customer tạo thành công không cần email
  2. Tạo sales order không cần customer email
  3. Khi mark order as "paid" → Gửi invoice nếu customer có email
  4. Email được gửi asynchronously (không ảnh hưởng tới API response)

---

## Frontend Form - Current State

### "Add New Customer" Form (SalesPage.jsx):

```
✓ [Required] Tên khách hàng *
○ [Optional] Email
○ [Optional] SĐT
```

### "Edit Customer" Form (EditCustomerForm.jsx):

```
✓ [Required] Tên khách hàng *
✓ [Required] SĐT * (yêu cầu vì đây là form edit)
○ [Optional] Email
○ [Optional] Địa chỉ
```

---

## Testing Checklist

- [ ] Create customer with only name → ✅ Success
- [ ] Create customer with name + phone → ✅ Success
- [ ] Create customer with name + email → ✅ Success
- [ ] Create customer with name + phone + email → ✅ Success
- [ ] Try create without name → ❌ "Tên khách hàng là bắt buộc"
- [ ] Duplicate email → ❌ "Khách hàng với email 'xxx' đã tồn tại"
- [ ] Duplicate phone → ❌ "Khách hàng với số điện thoại 'xxx' đã tồn tại"
- [ ] Frontend shows detailed error message (not status code)
- [ ] Create sales order with customer (no email)
- [ ] Mark order as paid → No email sent (customer has no email)
- [ ] Create customer with email, mark order as paid → Email sent

---

## Files Changed

### Backend:

1. **`apps/api/src/db/schema/common.js`**
   - Increased phone field length from 10 to 20

2. **`apps/api/src/controllers/customerController.js`**
   - Added name validation
   - Updated error messages to Vietnamese
   - Changed HTTP status codes (409 for conflicts)
   - Standardized error response structure

### Frontend (Already Applied):

1. **`apps/web/src/pages/sales/SalesPage.jsx`**
2. **`apps/web/src/pages/sales/components/CustomerSelector.jsx`**
3. **`apps/web/src/pages/sales/components/EditCustomerForm.jsx`**

---

## Key Takeaways

✅ **Problem Solved:**

- Email is now optional (not required)
- Error messages are specific and in Vietnamese
- HTTP status codes are correct (409 for conflicts)
- Frontend shows actual error message, not status code

✅ **Behavior:**

- Customer creation only requires name
- Phone and email are optional but must be unique if provided
- Email invoice only sent when customer has email AND order marked as paid

✅ **User Experience:**

- Clear error messages in Vietnamese
- No confusion about which fields are required
- Better feedback on duplicate data

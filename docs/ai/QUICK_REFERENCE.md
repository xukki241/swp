# Quick Reference - Sales Customer Creation Fix

## ⚡ Quick Summary

| Aspect              | Status                           |
| ------------------- | -------------------------------- |
| **Email bắt buộc?** | ❌ NO - Email is optional        |
| **SĐT bắt buộc?**   | ❌ NO - Phone is optional        |
| **Tên bắt buộc?**   | ✅ YES - Name is required        |
| **Error messages**  | ✅ Chi tiết bằng tiếng Việt      |
| **Email invoice**   | ✅ Chỉ gửi nếu customer có email |

---

## 🔧 Changes Made

### Backend Files:

- ✅ `apps/api/src/db/schema/common.js` - Phone length 10→20
- ✅ `apps/api/src/controllers/customerController.js` - Validation + error structure

### Frontend Files:

- ✅ `apps/web/src/pages/sales/SalesPage.jsx` - Error extraction
- ✅ `apps/web/src/pages/sales/components/CustomerSelector.jsx` - Error extraction
- ✅ `apps/web/src/pages/sales/components/EditCustomerForm.jsx` - Error extraction

---

## 📋 Customer Creation Requirements

```
Create Customer:
├── name (required) ✅
├── phone (optional, unique if set)
├── email (optional, unique if set)
└── address (optional)

Edit Customer:
├── name (required) ✅
├── phone (required in form)
├── email (optional)
└── address (optional)
```

---

## ✅ API Response Format - CREATE /api/customers

### Success (201):

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "uuid",
    "name": "Tên khách",
    "email": null,
    "phone": null,
    "address": null
  }
}
```

### Error - Name Missing (400):

```json
{
  "success": false,
  "error": {
    "message": "Tên khách hàng là bắt buộc"
  }
}
```

### Error - Email Duplicate (409):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với email 'abc@gmail.com' đã tồn tại"
  }
}
```

### Error - Phone Duplicate (409):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với số điện thoại '0901234567' đã tồn tại"
  }
}
```

---

## 🖥️ Frontend Error Handling Pattern

```javascript
try {
  const response = await createCustomer(data);
  setCustomer(response?.data || response);
} catch (error) {
  let message = "Không thể tạo khách hàng";

  // Extract from error.response.data.error.message
  if (error?.response?.data?.error?.message) {
    message = error.response.data.error.message;
  }
  // Extract from error.response.data.message
  else if (error?.response?.data?.message) {
    message = error.response.data.message;
  }

  toast.error(message);
}
```

---

## 🚀 Email Invoice Flow

```
1. User tạo customer (không cần email)
   ✅ Success

2. User tạo sales order (không cần customer email)
   ✅ Success

3. User mark order as paid
   ├─ If customer.email exists
   │  └─ Send invoice email (asynchronously)
   └─ Else
      └─ No email sent
```

---

## 🧪 Test Cases

### ✅ Create Customer - Success Cases:

```
1. Name only → ✅ Created
2. Name + Phone → ✅ Created
3. Name + Email → ✅ Created
4. Name + Phone + Email → ✅ Created
5. Name + Phone + Email + Address → ✅ Created
```

### ❌ Create Customer - Error Cases:

```
1. No name → ❌ "Tên khách hàng là bắt buộc"
2. Empty name → ❌ "Tên khách hàng là bắt buộc"
3. Duplicate email → ❌ "Khách hàng với email 'xxx' đã tồn tại"
4. Duplicate phone → ❌ "Khách hàng với số điện thoại 'xxx' đã tồn tại"
```

### ✅ Sales Order - Success Cases:

```
1. Customer without email → ✅ Order created, no email sent
2. Customer with email → ✅ Order created, email sent when paid
```

---

## 📝 HTTP Status Codes

| Code    | Meaning      | Example                       |
| ------- | ------------ | ----------------------------- |
| **201** | Created      | Customer successfully created |
| **400** | Bad Request  | Missing name, invalid format  |
| **404** | Not Found    | Customer doesn't exist        |
| **409** | Conflict     | Duplicate email or phone      |
| **500** | Server Error | Internal server error         |

---

## 🔑 Key Points

1. **Email không phải yêu cầu**
   - Có thể tạo customer không có email
   - Email chỉ dùng để gửi invoice

2. **Error messages cụ thể**
   - "Khách hàng với email 'xxx' đã tồn tại" (cụ thể giá trị)
   - "Tên khách hàng là bắt buộc" (rõ ràng trường nào)

3. **HTTP Status Codes đúng**
   - 409 cho conflict (duplicate data)
   - 400 cho validation error
   - 404 cho not found

4. **Frontend hiển thị lỗi chi tiết**
   - Không hiển thị status code
   - Hiển thị error message từ backend

---

## 📚 Documentation Files

- 📄 `CUSTOMER_CREATION_REQUIREMENTS.md` - Detailed requirements
- 📄 `ERROR_RESPONSE_FORMAT.md` - Error response specs
- 📄 `SALES_CUSTOMER_FIX_SUMMARY.md` - Complete fix summary
- 📄 `DETAILED_CODE_CHANGES.md` - Before & after code
- 📄 `QUICK_REFERENCE.md` - This file

---

## ❓ FAQ

**Q: Tôi có phải nhập email khi tạo khách hàng không?**
A: Không. Email hoàn toàn optional. Bạn chỉ cần nhập tên.

**Q: Email được gửi khi nào?**
A: Email được gửi khi bạn mark sales order as "paid" và customer có email.

**Q: Nếu khách hàng không có email thì sao?**
A: Không có email nào được gửi. System không báo lỗi, chỉ skip email.

**Q: Lỗi ghi gì?**
A: Lỗi ghi cụ thể bằng tiếng Việt, ví dụ:

- "Khách hàng với email 'abc@gmail.com' đã tồn tại"
- "Tên khách hàng là bắt buộc"

**Q: Database cần migration không?**
A: Chỉ cần nếu phone field hiện tại có data > 20 chars (unlikely). Nếu không có, không cần migration.

---

## 🔗 Related URLs

- API: `/api/customers` - CRUD operations
- API: `/api/sales` - Sales orders
- Frontend: `/pages/sales/SalesPage.jsx` - Main sales page

# Error Response Format Specification

## Standard Error Response Structure

Backend sẽ trả về error với cấu trúc unified:

```javascript
{
  "success": false,
  "error": {
    "message": "Chi tiết lỗi bằng tiếng Việt"
  }
}
```

Hoặc legacy format:

```javascript
{
  "success": false,
  "message": "Chi tiết lỗi"
}
```

---

## HTTP Status Codes

| Status  | Meaning      | Use Case                                                |
| ------- | ------------ | ------------------------------------------------------- |
| **400** | Bad Request  | Input validation failed (name required, invalid format) |
| **401** | Unauthorized | User not authenticated                                  |
| **403** | Forbidden    | User has no permission                                  |
| **404** | Not Found    | Resource doesn't exist                                  |
| **409** | Conflict     | Duplicate email/phone, data conflict                    |
| **500** | Server Error | Internal server error                                   |

---

## Customer API - Response Examples

### POST /api/customers - Create Customer

#### Success (201):

```json
{
  "success": true,
  "message": "Customer created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "phone": "0901234567",
    "address": "123 Đường ABC, TP.HCM"
  }
}
```

#### Error - Name Required (400):

```json
{
  "success": false,
  "error": {
    "message": "Tên khách hàng là bắt buộc"
  }
}
```

#### Error - Email Duplicate (409):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với email 'abc@example.com' đã tồn tại"
  }
}
```

#### Error - Phone Duplicate (409):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với số điện thoại '0901234567' đã tồn tại"
  }
}
```

---

### PATCH /api/customers/{id} - Update Customer

#### Success (200):

```json
{
  "success": true,
  "message": "Customer updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn A",
    "email": "newmail@gmail.com",
    "phone": "0901234567",
    "address": "456 Đường XYZ, TP.HCM"
  }
}
```

#### Error - Not Found (404):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng không tồn tại"
  }
}
```

#### Error - Phone Duplicate (409):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng với số điện thoại '0901234567' đã tồn tại"
  }
}
```

---

### GET /api/customers/search - Search Customers

#### Success (200):

```json
{
  "success": true,
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Nguyễn Văn A",
      "email": "abc@example.com",
      "phone": "0901234567",
      "address": "123 Đường ABC, TP.HCM"
    }
  ]
}
```

#### Error - Invalid Search (400):

```json
{
  "success": false,
  "error": {
    "message": "Tham số tìm kiếm không hợp lệ"
  }
}
```

---

## Sales Order API - Response Examples

### POST /api/sales - Create Sales Order

#### Success (201):

```json
{
  "success": true,
  "message": "Sales order created successfully",
  "data": {
    "id": "order-uuid",
    "customerId": "customer-uuid",
    "paymentMethod": "cash",
    "totalAmount": 500000,
    "status": "pending",
    "items": [
      {
        "medication_variant_id": "variant-uuid",
        "quantity": 2,
        "unitPrice": 250000,
        "totalPrice": 500000
      }
    ]
  }
}
```

#### Error - Item Out of Stock (400):

```json
{
  "success": false,
  "error": {
    "message": "Sản phẩm hết hàng. Yêu cầu: 10, Có sẵn: 5"
  }
}
```

#### Error - Customer Not Found (404):

```json
{
  "success": false,
  "error": {
    "message": "Khách hàng không tồn tại"
  }
}
```

---

### PATCH /api/sales/{id} - Update Sales Order Status

#### Success - Mark as Paid (200):

```json
{
  "success": true,
  "message": "Sales order updated successfully",
  "data": {
    "id": "order-uuid",
    "customerId": "customer-uuid",
    "status": "paid",
    "totalAmount": 500000,
    "items": [...]
  }
}
```

**Note:** Nếu customer có email, invoice sẽ được gửi asynchronously (không ảnh hưởng API response)

---

## Frontend Error Extraction Logic

```javascript
// Helper function to extract error message
const extractErrorMessage = (error, defaultMessage = "Có lỗi xảy ra") => {
  let message = defaultMessage;

  // Try to extract from error.response.data.error.message
  if (error?.response?.data?.error?.message) {
    message = error.response.data.error.message;
  }
  // Try to extract from error.response.data.error (string)
  else if (
    error?.response?.data?.error &&
    typeof error.response.data.error === "string"
  ) {
    message = error.response.data.error;
  }
  // Try to extract from error.response.data.message
  else if (error?.response?.data?.message) {
    message = error.response.data.message;
  }
  // Try to extract from error.message
  else if (error?.message) {
    message = error.message;
  }

  return message;
};

// Usage
try {
  const response = await customerService.createCustomer(data);
} catch (error) {
  const message = extractErrorMessage(error, "Không thể tạo khách hàng");
  toast.error(message);
}
```

---

## Important Notes

1. **Email không phải bắt buộc:**
   - Khách hàng không cần email để tạo đơn hàng
   - Email chỉ được dùng để gửi invoice sau khi order được mark as paid

2. **Error message luôn bằng tiếng Việt:**
   - Backend trả về lỗi bằng tiếng Việt
   - Frontend không cần translate, chỉ cần hiển thị

3. **HTTP Status Codes quan trọng:**
   - 409 = Conflict (duplicate email/phone)
   - 400 = Bad Request (validation error)
   - 404 = Not Found (resource doesn't exist)

4. **Asynchronous Email:**
   - Email được gửi trong background
   - Không chờ email xong để response
   - Nếu email fail, chỉ log error không ảnh hưởng order status

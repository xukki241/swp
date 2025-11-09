# Sửa Lỗi Sales Page - Tạo Khách Hàng và Hiển Thị Lỗi

## Vấn đề được phát hiện và sửa chữa

### 1. **Hiển thị lỗi không cụ thể khi tạo khách hàng thất bại**

#### Vấn đề:

- Khi tạo khách hàng thất bại, hiệu thị `error.message` chỉ hiển thị status code thay vì lỗi chi tiết
- Ví dụ: "404 Not Found" thay vì "Khách hàng đã tồn tại"

#### Giải pháp:

Cập nhật `handleCreateCustomer` trong `SalesPage.jsx` để:

- Extract lỗi chi tiết từ response object
- Kiểm tra các trường: `error.response.data.error.message`, `error.response.data.message`
- Kiểm tra status code và hiển thị lỗi phù hợp cho mỗi trường hợp:
  - 400: "Dữ liệu không hợp lệ"
  - 409: "Khách hàng đã tồn tại"
  - 500: "Lỗi máy chủ. Vui lòng thử lại sau"

```javascript
// Trước
catch (error) {
  toast.error("Lỗi tạo khách hàng: " + error.message);
}

// Sau
catch (error) {
  let message = "Không thể tạo khách hàng";
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
    // Xử lý theo status code
  }
  toast.error(message);
}
```

### 2. **Hiển thị bị lỗi sau khi tạo khách hàng thành công**

#### Vấn đề:

- Không xử lý đúng response từ API khi tạo khách hàng
- Response có thể có structure `{ data: customerObject }` hoặc `customerObject` trực tiếp

#### Giải pháp:

```javascript
// Trước
const customer = await customerService.createCustomer(newCustomerData);
setCustomer(customer);

// Sau
const response = await customerService.createCustomer(newCustomerData);
const customerData = response?.data || response;
setCustomer(customerData);
```

### 3. **Hiển thị lỗi không cụ thể khi tạo đơn hàng thất bại**

#### Vấn đề:

- `submitOrder` function cũng chỉ hiển thị `error.message`
- Không extract lỗi chi tiết từ response

#### Giải pháp:

Áp dụng cách xử lý lỗi chi tiết giống như `handleCreateCustomer`:

- Kiểm tra `error.response.data.error` hoặc `error.response.data.message`
- Kiểm tra status code (400, 401, 403, 404, 409, 500+)
- Cập nhật `OrderSuccessModal` data:
  - Đảm bảo `paymentMethod` được set từ `orderData.payment_method`
  - Map items đúng format có `name` field

### 4. **Cập nhật lỗi trong tìm kiếm khách hàng**

#### Vấn đề:

- `CustomerSelector` hiển thị generic error message

#### Giải pháp:

- Extract lỗi chi tiết từ API response
- Hiển thị lỗi cụ thể cho mỗi status code

### 5. **Cập nhật lỗi trong chỉnh sửa thông tin khách hàng**

#### Vấn đề:

- `EditCustomerForm` không xử lý đầy đủ các loại lỗi

#### Giải pháp:

- Thêm kiểm tra status code cho các lỗi phổ biến
- Extract lỗi từ response chi tiết

## File được sửa

1. **apps/web/src/pages/sales/SalesPage.jsx**
   - `handleCreateCustomer`: Cải thiện xử lý lỗi
   - `submitOrder`: Cải thiện xử lý lỗi và data format

2. **apps/web/src/pages/sales/components/EditCustomerForm.jsx**
   - `handleSubmit`: Cải thiện xử lý lỗi

3. **apps/web/src/pages/sales/components/CustomerSelector.jsx**
   - `handleSearch`: Cải thiện xử lý lỗi

## Kiểm tra và test

### Test cases:

1. ✅ Tạo khách hàng thành công
   - Kiểm tra: Customer được hiển thị đúng trong list
   - Kiểm tra: Form được reset

2. ✅ Tạo khách hàng thất bại
   - Kiểm tra: Hiển thị lỗi chi tiết (không phải status code)
   - Kiểm tra: Form không bị reset

3. ✅ Tạo đơn hàng thành công
   - Kiểm tra: Modal hiển thị đúng `paymentMethod`
   - Kiểm tra: Items được hiển thị với đầy đủ thông tin

4. ✅ Tạo đơn hàng thất bại
   - Kiểm tra: Hiển thị lỗi chi tiết
   - Kiểm tra: Giỏ hàng không bị reset

5. ✅ Tìm kiếm khách hàng
   - Kiểm tra: Error message cụ thể khi search thất bại

6. ✅ Chỉnh sửa thông tin khách hàng
   - Kiểm tra: Error message cụ thể khi update thất bại

## Lợi ích

- ✅ UX tốt hơn: Người dùng biết vấn đề cụ thể là gì
- ✅ Dễ debug: Log chi tiết giúp dev trace vấn đề
- ✅ Xử lý lỗi nhất quán: Tất cả API calls đều có pattern xử lý lỗi giống nhau
- ✅ Ổn định hơn: Không bị crash vì response format không mong đợi

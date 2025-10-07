# Authentication & API Setup Guide

## 📋 Tổng quan

Dự án đã được cấu hình với:

- ✅ React Hook Form - Quản lý form
- ✅ TanStack Query (React Query) - Quản lý API state
- ✅ Axios - HTTP client với interceptors
- ✅ Route Protection - Bảo vệ routes với authentication

## 🔐 Authentication Flow

### 1. Protected Routes

Routes được bảo vệ bằng `ProtectedRoute`:

- Nếu chưa đăng nhập → redirect về `/login`
- Nếu đã đăng nhập → hiển thị trang

### 2. Public Routes

Routes công khai với `PublicRoute`:

- Nếu đã đăng nhập → redirect về `/dashboard`
- Nếu chưa đăng nhập → hiển thị trang login/register

## 📁 Cấu trúc Files

```
src/
├── lib/
│   └── axios.js              # Axios instance với interceptors
├── services/
│   └── authService.js        # API functions cho auth
├── hooks/
│   └── useAuth.js            # Custom hooks cho auth
├── components/
│   └── ProtectedRoute.jsx    # Route protection components
└── pages/
    ├── LoginPage.jsx         # Login với useForm + useMutation
    └── RegisterPage.jsx      # Register với useForm + useMutation
```

## 🚀 Cách sử dụng

### 1. Cấu hình Environment

File `.env`:

```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### 2. Login Page Example

```jsx
import { useForm } from "react-hook-form";
import { useLogin } from "@/hooks/useAuth";

const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm();
const loginMutation = useLogin();

const onSubmit = (data) => {
  loginMutation.mutate(data);
};

// Form với validation
<input {...register("email", { required: true })} />;
{
  errors.email && <span>Required</span>;
}
```

### 3. Thêm Protected Route mới

Trong `App.jsx`:

```jsx
<Route
  path="/products"
  element={
    <ProtectedRoute>
      <ProductsPage />
    </ProtectedRoute>
  }
/>
```

### 4. Tạo API Service mới

File `services/productService.js`:

```javascript
import { instance } from "@/lib/axios";

export const getProducts = async () => {
  const response = await instance.get("/products");
  return response.data;
};
```

### 5. Tạo Hook với useQuery

File `hooks/useProducts.js`:

```javascript
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "@/services/productService";

export const useProducts = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
```

### 6. Sử dụng trong Component

```jsx
import { useProducts } from "@/hooks/useProducts";

function ProductsPage() {
  const { data, isLoading, isError, error } = useProducts();

  if (isLoading) return <Loading />;
  if (isError) return <div>Error: {error.message}</div>;

  return (
    <div>
      {data.products.map((product) => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

### 7. Mutation Example (POST/PUT/DELETE)

```jsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      // Refetch products list
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
};

// Usage
const createMutation = useCreateProduct();

const handleCreate = () => {
  createMutation.mutate({ name: "New Product" });
};
```

## 🔧 Axios Interceptors

### Request Interceptor

- Tự động thêm `Authorization: Bearer <token>` vào mọi request
- Token được lấy từ `localStorage`

### Response Interceptor

- Xử lý lỗi 401 (Unauthorized) → auto logout + redirect login
- Format lỗi thống nhất

## 📝 API Response Format

Backend nên trả về format:

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {...},
    "token": "eyJ..."
  }
}
```

Hoặc khi lỗi:

```json
{
  "success": false,
  "message": "Invalid credentials",
  "data": null
}
```

## 🎯 Authentication Hooks

### useLogin()

- Login user
- Lưu token vào localStorage
- Redirect về dashboard

### useRegister()

- Register new user
- Tự động login sau khi đăng ký thành công

### useLogout()

- Logout user
- Clear localStorage
- Redirect về login

### useCurrentUser()

- Fetch thông tin user hiện tại
- Chỉ chạy khi có token

## 🔍 Testing

1. **Test Login Flow:**
   - Truy cập `/dashboard` khi chưa login → redirect `/login`
   - Login thành công → redirect `/dashboard`
   - Truy cập `/login` khi đã login → redirect `/dashboard`

2. **Test Token:**
   - Xem localStorage: `localStorage.getItem("token")`
   - Clear token: `localStorage.removeItem("token")`

3. **Test API:**
   - Check Network tab trong DevTools
   - Verify Authorization header có token

## 🐛 Troubleshooting

### Lỗi CORS

Nếu gặp CORS error, backend cần enable:

```javascript
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
```

### Token không được gửi

Check axios interceptor đang hoạt động:

```javascript
console.log("Token:", localStorage.getItem("token"));
```

### Query không refetch

Sử dụng `invalidateQueries` sau mutation:

```javascript
queryClient.invalidateQueries({ queryKey: ["products"] });
```

## 📚 Resources

- [React Hook Form Docs](https://react-hook-form.com/)
- [TanStack Query Docs](https://tanstack.com/query/latest)
- [Axios Docs](https://axios-http.com/)

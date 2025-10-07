# Hướng dẫn sử dụng User Information

## 🎯 Đã implement

### 1. **Topbar với User Info**

File: `src/components/layouts/topbar.jsx`

**Features:**

- ✅ Hiển thị tên user thực từ API
- ✅ Hiển thị email user
- ✅ Hiển thị role (owner, admin, user, etc.)
- ✅ Avatar với initials tự động
- ✅ Loading state khi fetch data

**Sử dụng:**

```jsx
import { useCurrentUser } from "@/hooks/useAuth";

const { data: currentUser, isLoading } = useCurrentUser();
const userName = currentUser?.user?.name || "User";
const userEmail = currentUser?.user?.email || "";
```

### 2. **Dashboard với Welcome Message**

File: `src/pages/Dashboard.jsx`

**Features:**

- ✅ Hiển thị "Welcome back, {userName}!"
- ✅ Sử dụng user name từ API

### 3. **UserProfile Component**

File: `src/components/UserProfile.jsx`

Component đầy đủ để hiển thị thông tin user với:

- ✅ Avatar với fallback initials
- ✅ Name, Email, Phone, Address
- ✅ Role và Status
- ✅ Loading skeleton
- ✅ Error handling

**Cách dùng:**

```jsx
import { UserProfile } from "@/components/UserProfile";

<UserProfile />;
```

## 📊 API Response Format

Backend trả về user info qua endpoint `GET /api/auth/me`:

```json
{
  "success": true,
  "user": {
    "userId": "1",
    "email": "john@example.com",
    "role": "owner",
    "name": "John Doe",
    "status": "active",
    "phone": "0123456789",
    "address": "123 Main St"
  }
}
```

## 🔧 useCurrentUser Hook

**Auto features:**

- ✅ Chỉ fetch khi có token
- ✅ Cache 5 phút (staleTime)
- ✅ Auto refetch khi tab focus
- ✅ Retry 1 lần nếu fail

**Properties:**

```javascript
const {
  data, // User data
  isLoading, // Loading state
  isError, // Error state
  error, // Error object
  refetch, // Manual refetch function
} = useCurrentUser();
```

## 📝 Ví dụ sử dụng trong component

### 1. Hiển thị tên user đơn giản

```jsx
import { useCurrentUser } from "@/hooks/useAuth";

function MyComponent() {
  const { data: currentUser } = useCurrentUser();
  const userName = currentUser?.user?.name || "Guest";

  return <h1>Hello, {userName}!</h1>;
}
```

### 2. Với loading state

```jsx
import { useCurrentUser } from "@/hooks/useAuth";

function MyComponent() {
  const { data: currentUser, isLoading } = useCurrentUser();

  if (isLoading) {
    return <div>Loading user info...</div>;
  }

  return <div>Welcome, {currentUser?.user?.name}</div>;
}
```

### 3. Với error handling

```jsx
import { useCurrentUser } from "@/hooks/useAuth";

function MyComponent() {
  const { data: currentUser, isLoading, isError, error } = useCurrentUser();

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error: {error.message}</div>;

  const user = currentUser?.user;

  return (
    <div>
      <h2>{user.name}</h2>
      <p>{user.email}</p>
      <p>Role: {user.role}</p>
    </div>
  );
}
```

### 4. User Profile Card đầy đủ

```jsx
import { UserProfile } from "@/components/UserProfile";

function ProfilePage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">My Profile</h1>
      <UserProfile />
    </div>
  );
}
```

## 🎨 Styling & Customization

### Avatar Initials

Function tự động tạo initials từ tên:

```javascript
const getInitials = (name) => {
  if (!name) return "U";
  return name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// "John Doe" → "JD"
// "Alice" → "AL"
```

### Status Badge

```jsx
<div
  className={`h-2 w-2 rounded-full ${
    user.status === "active" ? "bg-green-500" : "bg-gray-400"
  }`}
/>
```

## 🔄 Refresh User Data

### Auto refresh

User data tự động refetch khi:

- Tab được focus lại
- Token thay đổi
- Sau 5 phút (staleTime)

### Manual refresh

```jsx
const { refetch } = useCurrentUser();

// Call khi cần update data
refetch();
```

### Invalidate cache sau khi update profile

```jsx
import { useQueryClient } from "@tanstack/react-query";

const queryClient = useQueryClient();

// Sau khi update profile thành công
queryClient.invalidateQueries({ queryKey: ["currentUser"] });
```

## 🧪 Testing

### Test trong Console

```javascript
// Check localStorage
localStorage.getItem("token");
localStorage.getItem("user");

// Check current user state
// (trong React DevTools → Components → tìm component dùng useCurrentUser)
```

### Test API endpoint

```javascript
// Trong browser console hoặc Postman
fetch("http://localhost:3000/api/auth/me", {
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
})
  .then((r) => r.json())
  .then(console.log);
```

## 📍 Các file liên quan

```
src/
├── hooks/
│   └── useAuth.js              # useCurrentUser hook
├── components/
│   ├── UserProfile.jsx         # Full user profile card
│   ├── ui/
│   │   └── skeleton.jsx        # Loading skeleton
│   └── layouts/
│       └── topbar.jsx          # Topbar with user info
└── pages/
    └── Dashboard.jsx           # Dashboard with welcome message
```

## 🎯 Best Practices

1. **Always provide fallback values**

   ```jsx
   const userName = currentUser?.user?.name || "Guest";
   ```

2. **Handle loading state**

   ```jsx
   if (isLoading) return <LoadingSpinner />;
   ```

3. **Handle error state**

   ```jsx
   if (isError) return <ErrorMessage />;
   ```

4. **Use optional chaining**
   ```jsx
   currentUser?.user?.email; // ✅ Safe
   currentUser.user.email; // ❌ Có thể lỗi
   ```

## 🚀 Next Steps

Có thể mở rộng thêm:

- Edit profile page
- Upload avatar
- Change password
- Notification preferences
- Activity log

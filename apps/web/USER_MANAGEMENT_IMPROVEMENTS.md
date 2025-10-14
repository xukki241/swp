# User Management Improvements

## Ngày: 14/10/2025

### Tổng quan

Cải thiện logic xử lý trong user management để tối ưu performance và fix cache invalidation issues.

---

## 🎯 Các vấn đề đã fix

### 1. **Search Performance Optimization**

**Vấn đề**: Real-time search gây ra quá nhiều API queries mỗi khi user gõ từng ký tự.

**Giải pháp**: Thêm submit button cho search

- Tách `searchInput` (pending) và `searchQuery` (actual) state
- Chỉ query API khi user click "Search" button
- Thêm "Clear" button để reset search
- Client-side filtering cho instant feedback

**Files modified**:

- `apps/web/src/pages/UserListPage.jsx`
- `apps/web/src/pages/RegistrationRequestsPage.jsx`

---

### 2. **Cache Invalidation Issues**

**Vấn đề**: Sau khi update/activate/deactivate user, phải reload page để thấy changes.

**Giải pháp**: Fix cache invalidation trong React Query hooks

- Thêm `refetchType: "active"` để tự động refetch active queries
- Đảm bảo tất cả mutations invalidate đúng query keys
- Remove stale queries khi delete

**Files modified**:

- `apps/web/src/hooks/useUsers.js`
- `apps/web/src/hooks/useRegistration.js`

---

## 📝 Chi tiết thay đổi

### UserListPage.jsx

#### Before

```jsx
const [searchQuery, setSearchQuery] = useState("");

// Query runs on every keystroke
const filters = {};
if (searchQuery) filters.search = searchQuery;
const { data } = useStaff(filters);

<Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />;
```

#### After

```jsx
const [searchInput, setSearchInput] = useState(""); // Pending input
const [searchQuery, setSearchQuery] = useState(""); // Actual search

// Query only runs when user submits
const filters = {};
if (searchQuery) filters.search = searchQuery;
const { data } = useStaff(filters);

<form
  onSubmit={(e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  }}
>
  <Input value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
  <Button type="submit">
    <Search /> Search
  </Button>
  {searchQuery && (
    <Button
      onClick={() => {
        setSearchInput("");
        setSearchQuery("");
      }}
    >
      Clear
    </Button>
  )}
</form>;
```

---

### useUsers.js

#### Before

```js
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // Invalidate but may not refetch immediately
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["staff"] });
    },
  });
};
```

#### After

```js
export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data, variables) => {
      // Invalidate AND refetch active queries immediately
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active", // ✅ Auto refetch
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active", // ✅ Auto refetch
      });
      queryClient.invalidateQueries({
        queryKey: ["users", variables.id],
        refetchType: "active",
      });
    },
  });
};
```

**Áp dụng tương tự cho**:

- `useCreateUser()`
- `useUpdateUser()`
- `useDeleteUser()`
- `useActivateUser()`
- `useDeactivateUser()`
- `useSuspendUser()`

---

### useRegistration.js

#### Critical Fix: Approve tạo user mới

**Vấn đề**: Khi approve registration request, backend tạo user mới nhưng không invalidate users/staff lists.

#### Before

```js
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRegistrationRequest,
    onSuccess: (data, variables) => {
      // Only invalidate registration queries
      queryClient.invalidateQueries({ queryKey: ["registrationRequests"] });
      // ❌ Missing: users/staff lists need update too!
    },
  });
};
```

#### After

```js
export const useApproveRegistration = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveRegistrationRequest,
    onSuccess: (data, variables) => {
      // Invalidate registration requests
      queryClient.invalidateQueries({
        queryKey: ["registrationRequests"],
        refetchType: "active",
      });

      // ✅ IMPORTANT: New user is created, update user lists
      queryClient.invalidateQueries({
        queryKey: ["users"],
        refetchType: "active",
      });
      queryClient.invalidateQueries({
        queryKey: ["staff"],
        refetchType: "active",
      });
    },
  });
};
```

---

## 🎨 UI Improvements

### Before

```
[Search Input (real-time)               ] [Status Filter▼] [Role Filter▼]
```

### After

```
[Search Input (controlled)              ] [🔍 Search] [Clear] [Status▼] [Role▼]
```

**Benefits**:

- ✅ Giảm số lượng API calls
- ✅ User control khi nào search
- ✅ Clear button để reset nhanh
- ✅ Better UX với explicit search action

---

## 🧪 Test Cases

### Test Search Functionality

1. ✅ Type text → Không query API
2. ✅ Click "Search" → Query với text
3. ✅ Click "Clear" → Reset search và query tất cả
4. ✅ Change filters (status/role) → Query immediately (filter không cần submit)

### Test Cache Invalidation

1. ✅ Update user → Table tự động update
2. ✅ Activate/Deactivate → Status badge update ngay
3. ✅ Suspend user → Table refresh
4. ✅ Approve registration → Xuất hiện trong user list
5. ✅ Reject registration → Biến mất khỏi registration list

---

## 📊 Performance Impact

### Before

- **Keystrokes**: 10 characters typed = 10 API calls
- **Cache**: Stale data, need manual reload
- **User experience**: Laggy, inconsistent

### After

- **Keystrokes**: 10 characters typed = 0 API calls (until submit)
- **Cache**: Auto-refetch on mutations, always fresh
- **User experience**: Smooth, predictable

---

## 🔄 Query Key Structure

```
registrationRequests                    → All pending registrations
registrationRequests/{id}               → Single registration detail

users                                   → All users (any role)
users/{id}                              → Single user detail

staff                                   → Staff-only users (with filters)
staff/{filters}                         → Filtered staff list
```

**Invalidation Strategy**:

- Approve registration → Invalidate `registrationRequests`, `users`, `staff`
- Update user → Invalidate `users`, `staff`, `users/{id}`
- Delete user → Invalidate `users`, `staff`, remove `users/{id}`
- Status change → Invalidate `users`, `staff`, `users/{id}`

---

## 🚀 Next Steps (Optional)

1. **Debounce search input** - Thêm visual feedback khi typing
2. **Optimistic updates** - Update UI trước khi API response
3. **Pagination** - Nếu users list > 100 records
4. **Advanced filters** - Date range, multiple selections
5. **Export functionality** - Download user list as CSV/Excel

---

## 📌 Notes

- `refetchType: "active"` chỉ refetch queries đang được sử dụng bởi mounted components
- Client-side filtering vẫn hoạt động trong RegistrationRequestsPage
- Search là controlled để avoid unnecessary queries, filters apply real-time vì ít change hơn

# Shift Management Implementation Summary

## ✅ Đã hoàn thành

### 1. Database Schema (4 files)

#### `enums.js` - Thêm enums mới
- ✅ `shiftType`: morning, afternoon, night, full_day
- ✅ `shiftAssignmentStatus`: scheduled, confirmed, in_progress, completed, cancelled, absent

#### `shifts.js` - Bảng định nghĩa ca làm việc
```javascript
{
  id: UUID,
  name: string,           // "Ca sáng", "Ca chiều"
  shiftType: enum,        // morning, afternoon, night, full_day
  startTime: time,        // "06:00:00"
  endTime: time,          // "14:00:00"
  description: text,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### `shiftAssignments.js` - Bảng phân ca cho nhân viên
```javascript
{
  id: UUID,
  userId: UUID,                    // FK → users.id
  shiftId: UUID,                   // FK → shifts.id
  assignedDate: timestamp,         // Ngày làm việc
  status: enum,                    // scheduled, confirmed, in_progress, completed, cancelled, absent
  checkInTime: timestamp,          // Giờ check-in thực tế
  checkOutTime: timestamp,         // Giờ check-out thực tế
  notes: text,                     // Ghi chú
  createdBy: UUID,                 // FK → users.id (owner tạo lịch)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Constraint**: Unique index on `(userId, assignedDate)` - Một nhân viên chỉ làm 1 ca/ngày

#### `relations.js` - Thêm relationships
- ✅ users → shiftAssignments (1-N)
- ✅ users → createdShiftAssignments (1-N)
- ✅ shifts → assignments (1-N)
- ✅ shiftAssignments → user, shift, creator (N-1)

---

### 2. Service Layer

**File**: `services/shiftService.js`

#### Shift Management Functions:
- `getAllShifts()` - Lấy tất cả shifts
- `getShiftById(id)` - Lấy shift theo ID
- `createShift(shiftData)` - Tạo shift mới
- `updateShift(id, shiftData)` - Cập nhật shift
- `deleteShift(id)` - Xóa shift (check assignments trước)

#### Shift Assignment Functions:
- `getAllShiftAssignments(filters)` - Lấy assignments với filter
  - Filters: userId, shiftId, startDate, endDate, status
- `getShiftAssignmentById(id)` - Lấy assignment theo ID
- `createShiftAssignment(data)` - Tạo 1 assignment
- `createBatchShiftAssignments(assignments)` - Tạo nhiều assignments
- `updateShiftAssignment(id, data)` - Cập nhật assignment
- `checkInShift(id)` - Check-in (status → in_progress)
- `checkOutShift(id)` - Check-out (status → completed)
- `deleteShiftAssignment(id)` - Xóa assignment
- `getUserSchedule(userId, startDate, endDate)` - Lịch của user
- `getStaffByShiftAndDate(shiftId, date)` - Nhân viên trong ca

**Features**:
- ✅ Join với users và shifts khi query assignments
- ✅ Validate unique constraint (1 user - 1 shift/day)
- ✅ Check assignments trước khi xóa shift
- ✅ Auto update timestamps

---

### 3. Controller Layer

**File**: `controllers/shiftController.js`

#### Shift Controllers (6):
- `getAllShifts` - GET /api/shifts
- `getShiftById` - GET /api/shifts/:id
- `createShift` - POST /api/shifts
- `updateShift` - PATCH /api/shifts/:id
- `deleteShift` - DELETE /api/shifts/:id
- `getStaffByShiftAndDate` - GET /api/shifts/:shiftId/staff?date=...

#### Shift Assignment Controllers (8):
- `getAllShiftAssignments` - GET /api/shift-assignments
- `getShiftAssignmentById` - GET /api/shift-assignments/:id
- `createShiftAssignment` - POST /api/shift-assignments (single or batch)
- `updateShiftAssignment` - PATCH /api/shift-assignments/:id
- `checkInShift` - POST /api/shift-assignments/:id/check-in
- `checkOutShift` - POST /api/shift-assignments/:id/check-out
- `deleteShiftAssignment` - DELETE /api/shift-assignments/:id
- `getUserSchedule` - GET /api/users/:userId/schedule

**Features**:
- ✅ Proper error handling với logger
- ✅ Success/error responses chuẩn
- ✅ Auto inject `createdBy` từ req.user
- ✅ Batch support (detect array input)

---

### 4. Routes Layer

#### `routes/shiftRoutes.js`
- ✅ All routes require authentication
- ✅ Owner-only: POST, PATCH, DELETE
- ✅ Private: GET endpoints

#### `routes/shiftAssignmentRoutes.js`
- ✅ All routes require authentication
- ✅ Owner-only: POST, PATCH, DELETE
- ✅ Private: GET, check-in, check-out

#### `routes/userRoutes.js` (Updated)
- ✅ Added: GET `/api/users/:userId/schedule`

#### `routes/index.js` (Updated)
- ✅ Mounted `/api/shifts` → shiftRouter
- ✅ Mounted `/api/shift-assignments` → shiftAssignmentRouter

---

### 5. Documentation

#### `SHIFT_MANAGEMENT_SYSTEM.md` (Comprehensive Guide)
Bao gồm:
- ✅ Database schema chi tiết
- ✅ Luồng hoạt động đầy đủ
- ✅ API endpoints list
- ✅ 6 Use cases cụ thể
- ✅ Business rules
- ✅ Access control matrix
- ✅ Migration steps
- ✅ Example data

#### `API_DOCUMENTATION.md` (Updated)
- ✅ Thêm section 15: Shift Management (6 endpoints)
- ✅ Thêm section 16: Shift Assignment Management (7 endpoints)
- ✅ Updated User Management (thêm schedule endpoint)

---

## 🎯 Luồng sử dụng tóm tắt

### Bước 1: Setup (Owner - Chỉ làm 1 lần)
```
1. Tạo "Ca sáng" (06:00-14:00)
2. Tạo "Ca chiều" (14:00-22:00)
3. Tạo "Ca tối" (22:00-06:00)
```

### Bước 2: Phân ca hàng tuần (Owner)
```
POST /api/shift-assignments
[
  { userId: "staff-1", shiftId: "morning", assignedDate: "2025-10-25" },
  { userId: "staff-2", shiftId: "afternoon", assignedDate: "2025-10-25" },
  { userId: "staff-1", shiftId: "morning", assignedDate: "2025-10-26" },
  ...
]
```

### Bước 3: Nhân viên xem lịch (Staff)
```
GET /api/users/{myId}/schedule?startDate=2025-10-25&endDate=2025-10-31
→ Thấy được mình làm ca nào, ngày nào
```

### Bước 4: Check-in/out hàng ngày (Staff)
```
Sáng: POST /api/shift-assignments/{todayAssignmentId}/check-in
Chiều: POST /api/shift-assignments/{todayAssignmentId}/check-out
```

### Bước 5: Owner theo dõi
```
GET /api/shifts/{morningShiftId}/staff?date=2025-10-25
→ Xem ai đang làm ca sáng hôm nay
```

---

## 🔐 Quyền truy cập

| Chức năng | Owner | Staff |
|-----------|-------|-------|
| Tạo/sửa/xóa Shift | ✅ | ❌ |
| Xem Shift | ✅ | ✅ |
| Phân ca (Create Assignment) | ✅ | ❌ |
| Sửa/xóa Assignment | ✅ | ❌ |
| Xem lịch của mình | ✅ | ✅ |
| Check-in/out | ✅ | ✅ |
| Xem lịch người khác | ✅ | ❌ |

---

## 📊 Database Relations

```
users (1) ──────> (N) shiftAssignments
                       ↓ (N)
shifts (1) ──────> (N) shiftAssignments

users (1) ──────> (N) shiftAssignments (as creator/createdBy)
```

---

## ⚙️ Các bước tiếp theo

### ✅ 1. Migration Database - HOÀN THÀNH
```bash
# Đã chạy thành công
pnpm --filter @pharmaflow/api db:generate  # ✅ Generated migration 0004_little_wolverine.sql
pnpm --filter @pharmaflow/api db:migrate   # ✅ Migration applied successfully
```

### ✅ 2. Seed Data - HOÀN THÀNH
```bash
# Đã chạy thành công
pnpm --filter @pharmaflow/api db:seed      # ✅ Seeded 4 shifts + 8 assignments
```

**Seeded Shifts:**
- Ca sáng (06:00-14:00) - morning
- Ca chiều (14:00-22:00) - afternoon  
- Ca tối (22:00-06:00) - night
- Ca hành chính (08:00-17:00) - full_day

**Seeded Assignments:**
- 8 shift assignments cho 3 ngày (hôm nay, ngày mai, ngày kia)
- Bao gồm các status: completed, in_progress, scheduled, confirmed

### 3. Test API
Sử dụng Postman/Thunder Client test các endpoints:
1. Tạo shifts
2. Phân ca cho nhân viên
3. Test check-in/check-out
4. Xem lịch làm việc

### 4. Frontend Implementation
Tạo các pages:
- Shift Management Page (Owner)
- Shift Assignment Page (Owner)
- My Schedule Page (Staff)
- Check-in/out Page (Staff)

---

## 📝 Notes

1. **Time format**: PostgreSQL `time` type lưu dạng `HH:MM:SS`
2. **Date format**: `assignedDate` là `timestamp`, nên gửi ISO string
3. **Unique constraint**: Tránh duplicate assignments cho cùng user + date
4. **Cascade delete**: Xóa shift phải check assignments trước
5. **Status flow**: scheduled → in_progress (check-in) → completed (check-out)

---

**Implementation Date**: October 23, 2025  
**Files Modified**: 11 files  
**Lines Added**: ~800 lines  
**Status**: ✅ Complete - Ready for migration

# Shift Management System - Documentation

## 📋 Tổng quan

Hệ thống quản lý ca làm việc cho nhân viên trong hệ thống PharmaFlow. Hệ thống bao gồm:

1. **Shifts** - Định nghĩa các ca làm việc (mẫu ca)
2. **Shift Assignments** - Phân ca cụ thể cho nhân viên theo ngày

---

## 🗄️ Database Schema

### 1. Shifts Table (Định nghĩa ca làm việc)

**Table**: `shifts`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | VARCHAR(100) | Tên ca (ví dụ: "Ca sáng", "Ca chiều") |
| shift_type | ENUM | Loại ca: `morning`, `afternoon`, `night`, `full_day` |
| start_time | TIME | Giờ bắt đầu (HH:MM:SS) |
| end_time | TIME | Giờ kết thúc (HH:MM:SS) |
| description | TEXT | Mô tả ca làm việc |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Shift Types**:
- `morning` - Ca sáng (6:00 - 14:00)
- `afternoon` - Ca chiều (14:00 - 22:00)
- `night` - Ca đêm (22:00 - 6:00)
- `full_day` - Ca full (8:00 - 17:00)

---

### 2. Shift Assignments Table (Phân ca cho nhân viên)

**Table**: `shift_assignments`

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| user_id | UUID | Foreign key → users.id (nhân viên) |
| shift_id | UUID | Foreign key → shifts.id (ca làm việc) |
| assigned_date | TIMESTAMP | Ngày làm việc |
| status | ENUM | Trạng thái ca làm |
| check_in_time | TIMESTAMP | Giờ check-in thực tế |
| check_out_time | TIMESTAMP | Giờ check-out thực tế |
| notes | TEXT | Ghi chú |
| created_by | UUID | Foreign key → users.id (người tạo lịch) |
| created_at | TIMESTAMP | Thời gian tạo |
| updated_at | TIMESTAMP | Thời gian cập nhật |

**Status Values**:
- `scheduled` - Đã lên lịch
- `confirmed` - Nhân viên đã xác nhận
- `in_progress` - Đang làm việc
- `completed` - Đã hoàn thành
- `cancelled` - Đã hủy
- `absent` - Vắng mặt

**Constraints**:
- Unique index trên `(user_id, assigned_date)` - Một nhân viên không thể có nhiều ca trong cùng 1 ngày

---

## 🔄 Luồng hoạt động

### 1. Thiết lập ca làm việc (One-time setup)

**Owner** tạo các ca làm việc mẫu:

```
POST /api/shifts
{
  "name": "Ca sáng",
  "shiftType": "morning",
  "startTime": "06:00:00",
  "endTime": "14:00:00",
  "description": "Ca làm việc buổi sáng"
}
```

### 2. Phân ca cho nhân viên

**Owner** phân ca cho nhân viên (có thể phân đơn lẻ hoặc batch):

**Single Assignment**:
```
POST /api/shift-assignments
{
  "userId": "user-uuid",
  "shiftId": "shift-uuid",
  "assignedDate": "2025-10-25T00:00:00Z"
}
```

**Batch Assignment** (phân ca cho nhiều nhân viên cùng lúc):
```
POST /api/shift-assignments
[
  {
    "userId": "user-1-uuid",
    "shiftId": "morning-shift-uuid",
    "assignedDate": "2025-10-25T00:00:00Z"
  },
  {
    "userId": "user-2-uuid",
    "shiftId": "afternoon-shift-uuid",
    "assignedDate": "2025-10-25T00:00:00Z"
  }
]
```

### 3. Nhân viên xem lịch làm việc

**Staff** xem lịch của mình:

```
GET /api/users/{userId}/schedule?startDate=2025-10-20&endDate=2025-10-27
```

### 4. Check-in/Check-out

**Staff** check-in khi bắt đầu ca:
```
POST /api/shift-assignments/{assignmentId}/check-in
```
→ Status chuyển sang `in_progress`, lưu `check_in_time`

**Staff** check-out khi kết thúc ca:
```
POST /api/shift-assignments/{assignmentId}/check-out
```
→ Status chuyển sang `completed`, lưu `check_out_time`

### 5. Quản lý ca làm việc

**Owner** có thể:
- Xem ai đang làm việc trong ca nào:
  ```
  GET /api/shifts/{shiftId}/staff?date=2025-10-25
  ```
- Cập nhật status (ví dụ: đánh dấu vắng mặt):
  ```
  PATCH /api/shift-assignments/{assignmentId}
  { "status": "absent", "notes": "Nghỉ ốm" }
  ```
- Hủy ca:
  ```
  PATCH /api/shift-assignments/{assignmentId}
  { "status": "cancelled", "notes": "Lý do hủy" }
  ```

---

## 📡 API Endpoints

### Shift Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/shifts` | Private | Lấy tất cả shifts (định nghĩa ca) |
| GET | `/api/shifts/:id` | Private | Lấy shift theo ID |
| POST | `/api/shifts` | Owner | Tạo shift mới |
| PATCH | `/api/shifts/:id` | Owner | Cập nhật shift |
| DELETE | `/api/shifts/:id` | Owner | Xóa shift |
| GET | `/api/shifts/:shiftId/staff` | Private | Lấy danh sách nhân viên làm ca này vào ngày cụ thể (query: `date`) |

### Shift Assignment Management

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/shift-assignments` | Private | Lấy tất cả assignments (có filter: userId, shiftId, startDate, endDate, status) |
| GET | `/api/shift-assignments/:id` | Private | Lấy assignment theo ID |
| POST | `/api/shift-assignments` | Owner | Tạo assignment(s) - hỗ trợ single hoặc batch |
| PATCH | `/api/shift-assignments/:id` | Owner | Cập nhật assignment (status, notes) |
| DELETE | `/api/shift-assignments/:id` | Owner | Xóa assignment |
| POST | `/api/shift-assignments/:id/check-in` | Private | Check-in vào ca |
| POST | `/api/shift-assignments/:id/check-out` | Private | Check-out khỏi ca |

### User Schedule

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/users/:userId/schedule` | Private | Lấy lịch làm việc của user (query: `startDate`, `endDate` - required) |

---

## 💡 Use Cases

### UC1: Owner tạo các ca làm việc mặc định

**Steps**:
1. Owner đăng nhập
2. Tạo ca sáng (6:00-14:00)
3. Tạo ca chiều (14:00-22:00)
4. Tạo ca tối (22:00-6:00)

**Benefits**: Chỉ cần tạo 1 lần, sau đó tái sử dụng cho việc phân ca

---

### UC2: Owner phân ca tuần cho team

**Steps**:
1. Owner chọn tuần cần phân ca
2. Chọn nhân viên và ca tương ứng cho mỗi ngày
3. Sử dụng batch API để tạo nhiều assignments cùng lúc

**Example**: Phân ca cho 5 nhân viên, 7 ngày = 1 request với 35 assignments

---

### UC3: Staff xem lịch làm việc tuần

**Steps**:
1. Staff đăng nhập
2. Xem lịch làm việc của mình trong tuần
3. Biết được sẽ làm ca nào, ngày nào

---

### UC4: Staff check-in/check-out

**Steps**:
1. Staff đến làm việc
2. Check-in qua app/web → ghi lại giờ check-in thực tế
3. Kết thúc ca, check-out → ghi lại giờ check-out thực tế

**Benefits**: 
- Theo dõi giờ làm việc thực tế
- Tính lương chính xác
- Audit trail

---

### UC5: Owner xem ai đang làm việc

**Steps**:
1. Owner muốn biết hôm nay ca sáng có ai
2. Gọi API với shiftId và date
3. Nhận danh sách nhân viên

**Benefits**: Quản lý nhân sự hiệu quả, biết ai có mặt

---

### UC6: Xử lý vắng mặt/thay ca

**Steps**:
1. Nhân viên A báo nghỉ
2. Owner cập nhật status assignment của A thành `absent`
3. Owner tạo assignment mới cho nhân viên B thay thế
4. Ghi chú lý do vào notes

---

## ⚠️ Business Rules

1. **Một nhân viên chỉ làm một ca mỗi ngày**: Đảm bảo bởi unique constraint `(user_id, assigned_date)`

2. **Không thể xóa shift đang được sử dụng**: Service check assignments trước khi xóa

3. **Check-in/Check-out sequence**:
   - Chỉ check-in khi status = `scheduled` hoặc `confirmed`
   - Chỉ check-out khi status = `in_progress`
   - Sau check-out, status → `completed`

4. **Owner rights**:
   - Chỉ Owner mới tạo/sửa/xóa shifts và assignments
   - Staff chỉ xem lịch của mình và check-in/out

5. **Time validation**: 
   - `end_time` phải sau `start_time` (except night shifts spanning midnight)
   - `assigned_date` phải là ngày trong tương lai hoặc hôm nay

---

## 🔐 Access Control

| Action | Owner | Staff |
|--------|-------|-------|
| Create/Update/Delete Shifts | ✅ | ❌ |
| View Shifts | ✅ | ✅ |
| Create/Update/Delete Assignments | ✅ | ❌ |
| View All Assignments | ✅ | ❌ |
| View Own Schedule | ✅ | ✅ |
| Check-in/Check-out | ✅ | ✅ (own only) |

---

## 📊 Reports & Analytics (Future Enhancement)

Có thể mở rộng để tạo báo cáo:

1. **Attendance Report**: Tỷ lệ có mặt/vắng mặt của nhân viên
2. **Working Hours Report**: Tổng giờ làm việc theo tháng
3. **Shift Coverage**: Xem ca nào thiếu nhân viên
4. **Late Check-in/Early Check-out**: Theo dõi kỷ luật

---

## 🚀 Migration Steps

1. Chạy migration để tạo enums:
   ```sql
   CREATE TYPE shift_type AS ENUM ('morning', 'afternoon', 'night', 'full_day');
   CREATE TYPE shift_assignment_status AS ENUM ('scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'absent');
   ```

2. Tạo bảng `shifts`

3. Tạo bảng `shift_assignments` với foreign keys và unique constraint

4. Seed data: Tạo các shifts mặc định (morning, afternoon, night)

---

## 📝 Example Data

**Shifts**:
```json
[
  {
    "id": "shift-morning-uuid",
    "name": "Ca sáng",
    "shiftType": "morning",
    "startTime": "06:00:00",
    "endTime": "14:00:00"
  },
  {
    "id": "shift-afternoon-uuid",
    "name": "Ca chiều",
    "shiftType": "afternoon",
    "startTime": "14:00:00",
    "endTime": "22:00:00"
  }
]
```

**Shift Assignment**:
```json
{
  "id": "assignment-uuid",
  "userId": "staff-uuid",
  "shiftId": "shift-morning-uuid",
  "assignedDate": "2025-10-25T00:00:00Z",
  "status": "in_progress",
  "checkInTime": "2025-10-25T06:05:00Z",
  "checkOutTime": null,
  "notes": null,
  "createdBy": "owner-uuid"
}
```

---

**Created**: October 23, 2025  
**Version**: 1.0.0

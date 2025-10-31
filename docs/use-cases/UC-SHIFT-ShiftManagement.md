# Shift Management Use Cases

## Overview

Module quản lý ca làm việc của nhân viên, tracking doanh thu theo ca, mở/đóng ca và reconcile tiền mặt.

---

## UC-SHIFT-001: Start Shift

**Mô tả:** (Staff) Bắt đầu ca làm việc mới.

### Actors

- Staff, Manager

### Preconditions

- Người dùng đã đăng nhập
- Không có shift đang active của user này

### Main Flow

1. Staff truy cập `/shifts` hoặc POS page
2. Hệ thống check: Không có active shift
3. Button "Start Shift" hiển thị
4. Staff click "Start Shift"
5. Modal hiển thị:
   - **Opening Cash**: Input số tiền mặt ban đầu trong ngăn kéo
   - **Notes**: Optional (VD: "Ca sáng")
6. Nhập opening cash (VD: 500,000 VNĐ)
7. Click "Confirm"
8. Hệ thống:
   - Create shift record với:
     - user_id
     - start_time: NOW()
     - opening_cash
     - status: `active`
9. Success toast: "Ca làm việc đã được bắt đầu"
10. Redirect về POS page (có thể bán hàng)

### Alternative Flows

**A1: Already has active shift**

- Error: "Bạn đang có một ca làm việc đang active. Vui lòng đóng ca trước."

**A2: Negative opening cash**

- Error: "Số tiền ban đầu không thể âm"

### API Endpoint

```http
POST /api/shifts/start
Body: { opening_cash, notes }

Response: {
  id, user_id, start_time, opening_cash, status
}
```

---

## UC-SHIFT-002: View Active Shift Info

**Mô tả:** Xem thông tin ca làm việc hiện tại.

### Actors

- Staff, Manager

### Main Flow

1. Trong POS page hoặc Shift page
2. Display shift info panel:
   - **Staff**: Name
   - **Start Time**: HH:mm DD/MM/YYYY
   - **Duration**: HH:mm (real-time)
   - **Opening Cash**: VNĐ
   - **Current Sales**:
     - Total Orders: count
     - Total Revenue: VNĐ
     - Cash Sales: VNĐ
     - Non-Cash Sales: VNĐ
3. Auto-refresh mỗi 30 giây

### API Endpoint

```http
GET /api/shifts/active

Response: {
  id, user_id, start_time, opening_cash,
  total_orders, total_revenue, cash_sales, non_cash_sales
}
```

---

## UC-SHIFT-003: End Shift

**Mô tả:** (Staff) Kết thúc ca làm việc và reconcile tiền mặt.

### Actors

- Staff, Manager

### Preconditions

- Có active shift

### Main Flow

1. Staff click "End Shift" button
2. Modal hiển thị reconciliation form:
   - **Shift Summary**:
     - Start Time
     - Duration
     - Opening Cash
     - Expected Cash: opening + cash_sales
   - **Closing Cash**: Input số tiền thực tế đếm được
   - **Difference**: Auto-calculate (closing - expected)
     - Green if match
     - Red if difference
   - **Notes**: Textarea (required nếu có difference)
3. Staff đếm tiền và nhập Closing Cash
4. Nếu có difference → nhập reason trong Notes
5. Click "Confirm End Shift"
6. Hệ thống:
   - Update shift:
     - end_time: NOW()
     - closing_cash
     - expected_cash
     - cash_difference
     - status: `closed`
   - Calculate total sales trong shift
   - Generate shift report
7. Show shift summary modal:
   - Total Orders
   - Total Revenue
   - Cash/Non-cash breakdown
   - Cash difference (nếu có)
8. Option: Print shift report
9. Success toast: "Ca làm việc đã kết thúc"

### Alternative Flows

**A1: Cash difference**

- Warning: "Có chênh lệch {amount} VNĐ. Vui lòng nhập lý do."
- Required: Notes field must be filled

**A2: Closing cash < 0**

- Error: "Số tiền đóng ca không thể âm"

### Business Rules

- Small difference (< 10,000 VNĐ): Warning only
- Large difference (>= 10,000 VNĐ): Require Manager approval
- Manager notification nếu difference >= 50,000 VNĐ

### API Endpoint

```http
POST /api/shifts/:id/end
Body: { closing_cash, notes }

Response: {
  id, start_time, end_time, duration,
  opening_cash, closing_cash, expected_cash, cash_difference,
  total_orders, total_revenue, cash_sales, non_cash_sales
}
```

---

## UC-SHIFT-004: View Shift History

**Mô tả:** Xem lịch sử tất cả các ca làm việc.

### Actors

- Manager, Admin

### Main Flow

1. Truy cập `/shifts/history`
2. Table hiển thị:
   - Staff Name
   - Start Time
   - End Time
   - Duration
   - Opening Cash
   - Closing Cash
   - Expected Cash
   - Difference
   - Total Orders
   - Total Revenue
   - Status
   - Actions (View Detail)
3. Filters:
   - Date range
   - Staff
   - Status (Active, Closed)
   - Has difference (Yes/No)
4. Sort by: Date, Staff, Revenue
5. Pagination

### API Endpoint

```http
GET /api/shifts?from=&to=&staffId=&status=&page=1&limit=20
```

---

## UC-SHIFT-005: View Shift Detail

**Mô tả:** Xem chi tiết một ca làm việc cụ thể, bao gồm tất cả orders.

### Actors

- Manager, Admin, Staff (own shifts only)

### Main Flow

1. Click "View" trên shift
2. Redirect đến `/shifts/:id`
3. Hiển thị:
   - **Shift Info**:
     - Staff name
     - Start/End time
     - Duration
   - **Cash Reconciliation**:
     - Opening Cash
     - Closing Cash
     - Expected Cash
     - Difference (highlight nếu != 0)
     - Notes
   - **Sales Summary**:
     - Total Orders
     - Total Revenue
     - Cash Sales
     - Non-Cash Sales
     - Average Order Value
   - **Sales Breakdown by Payment Method**: Pie chart
   - **Orders List**: Table of all orders trong shift
     - Order Number
     - Customer
     - Amount
     - Payment Method
     - Time
     - Link to order detail
4. Export shift report (PDF)

### API Endpoint

```http
GET /api/shifts/:id

Response: {
  id, user, start_time, end_time, duration,
  opening_cash, closing_cash, expected_cash, cash_difference,
  notes, total_orders, total_revenue, cash_sales, non_cash_sales,
  orders: [...]
}
```

---

## UC-SHIFT-006: Force Close Shift (Manager)

**Mô tả:** (Manager) Đóng ca của staff khác (VD: staff quên đóng ca).

### Actors

- Manager, Admin

### Preconditions

- Target shift is active
- Manager có quyền

### Main Flow

1. Manager vào Shift History
2. Find active shift của staff
3. Click "Force Close" button
4. Confirm dialog: "Bạn có chắc muốn đóng ca của {staff}?"
5. Input closing cash (estimate)
6. Input reason: "Force closed by manager"
7. Click "Confirm"
8. Hệ thống:
   - End shift với closing_cash
   - Mark: force_closed_by = manager_id
   - Send notification to staff
9. Success toast

### API Endpoint

```http
POST /api/shifts/:id/force-close
Body: { closing_cash, reason }
```

---

## UC-SHIFT-007: Shift Report

**Mô tả:** Generate và export báo cáo ca làm việc.

### Actors

- Manager, Admin

### Main Flow

1. Vào Shift Detail hoặc History
2. Click "Generate Report" button
3. Hệ thống generate PDF report với:
   - **Header**: Store info, date
   - **Shift Info**: Staff, times, duration
   - **Cash Reconciliation**: Opening, closing, expected, difference
   - **Sales Summary**: Orders, revenue, breakdowns
   - **Top Products Sold**: Table
   - **Sales by Hour**: Chart
   - **All Orders**: Detailed table
   - **Footer**: Generated by, date/time
4. Download PDF

### API Endpoint

```http
GET /api/shifts/:id/report?format=pdf
```

---

## Database Schema

```sql
CREATE TABLE shifts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) NOT NULL,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP,
  opening_cash DECIMAL(12,2) NOT NULL,
  closing_cash DECIMAL(12,2),
  expected_cash DECIMAL(12,2),
  cash_difference DECIMAL(12,2),
  status VARCHAR(20) DEFAULT 'active',
  notes TEXT,
  force_closed_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX idx_user (user_id),
  INDEX idx_status (status),
  INDEX idx_start_time (start_time),
  CONSTRAINT chk_one_active_shift_per_user UNIQUE (user_id, status) WHERE status = 'active'
);

-- Sales table has shift_id foreign key
ALTER TABLE sales ADD COLUMN shift_id UUID REFERENCES shifts(id);
```

---

## Business Rules

1. **One Active Shift**: Mỗi user chỉ có 1 active shift tại một thời điểm
2. **Sales Tracking**: Mọi sale phải belong to một shift
3. **Cash Difference Thresholds**:
   - < 10,000: Warning
   - 10,000 - 50,000: Require notes
   - >= 50,000: Manager notification
4. **Shift Duration**: Không giới hạn (có thể overnight shifts)
5. **Force Close**: Chỉ Manager/Admin mới có quyền
6. **Expected Cash Calculation**: opening_cash + cash_sales
7. **Non-cash Sales**: Không ảnh hưởng expected cash

---

## Calculations

### Expected Cash

```javascript
expected_cash = opening_cash + cash_sales
```

### Cash Difference

```javascript
cash_difference = closing_cash - expected_cash
```

### Duration

```javascript
duration = end_time - start_time (in minutes hoặc hours)
```

### Cash Sales

```javascript
cash_sales = SUM(sale.final_amount) WHERE sale.payment_method = 'cash' AND sale.shift_id = shift.id
```

---

## UI Components

- `StartShiftModal` - Form để bắt đầu ca
- `ActiveShiftPanel` - Hiển thị thông tin ca đang active
- `EndShiftModal` - Form đóng ca với reconciliation
- `ShiftHistoryTable` - Danh sách shifts
- `ShiftDetailPage` - Chi tiết shift
- `ShiftReportViewer` - PDF report viewer
- `CashDifferenceAlert` - Warning khi có chênh lệch

---

## Testing Checklist

- [ ] Start shift successfully
- [ ] Start shift khi đã có active → error
- [ ] View active shift info
- [ ] Real-time sales tracking trong shift
- [ ] End shift với cash match
- [ ] End shift với cash difference
- [ ] Cash difference < 10,000 → warning
- [ ] Cash difference >= 50,000 → manager notified
- [ ] View shift history với filters
- [ ] View shift detail
- [ ] All orders belong to correct shift
- [ ] Force close shift as Manager
- [ ] Force close as Staff → error (unauthorized)
- [ ] Generate shift report (PDF)
- [ ] Export shift history (Excel)
- [ ] One active shift per user constraint
- [ ] Cannot start shift với negative opening cash
- [ ] Cannot close với negative closing cash
- [ ] Duration calculated correctly
- [ ] Expected cash calculation correct
- [ ] Cash difference calculation correct

---

## Integration Points

1. **Sales Module**: Mọi sale được link với active shift
2. **User Module**: Shift tracking per user
3. **Reporting**: Shift reports include sales data
4. **Audit Log**: Track start/end shift actions
5. **Notifications**: Alert Manager khi có cash difference lớn

---

## Security Considerations

1. **Access Control**:
   - Staff: Chỉ start/end own shifts
   - Manager: View all shifts, force close
   - Admin: Full access

2. **Audit Trail**:
   - Log mọi shift actions
   - Track force close by Manager
   - Record cash differences

3. **Data Integrity**:
   - Validate closing_cash >= 0
   - Prevent multiple active shifts
   - Link all sales to shifts

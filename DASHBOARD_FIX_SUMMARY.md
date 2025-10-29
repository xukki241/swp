# Dashboard Data Issues - Quick Fix Guide

## Vấn Đề

Dashboard hiển thị tất cả giá trị = 0:

- Total Orders: 0
- Total Revenue: 0 ₫
- No sales data available

## Nguyên Nhân Chính

1. **Database không có dữ liệu sales** cho tháng hiện tại (October 2025)
2. API endpoint hoạt động đúng nhưng database trống

## ✅ Đã Sửa

### 1. Fix Month Parameter

```javascript
// BEFORE (SAI)
const currentMonth = currentDate.getMonth(); // 0-11

// AFTER (ĐÚNG)  
const currentMonth = currentDate.getMonth() + 1; // 1-12 để match API
```

### 2. Thêm Debug Logging

Dashboard bây giờ sẽ tự động log debug info ra console:

```javascript
console.log('Dashboard Debug:', {
  currentYear: 2025,
  currentMonth: 10,
  monthlyReport: {...},
  isLoadingReport: false,
  reportError: null
});
```

### 3. Error Display

Dashboard hiển thị error message nếu API call fail:

```jsx
{reportError && (
  <Card className="border-red-200 bg-red-50">
    <CardContent>
      Error Loading Dashboard Data: {reportError.message}
    </CardContent>
  </Card>
)}
```

### 4. Handle Response Structure

Code bây giờ handle cả 2 response structures:

```javascript
const reportData = monthlyReport.data.data || monthlyReport.data;
```

## 🔍 Cách Kiểm Tra

### Bước 1: Xem Console

1. Mở trang Dashboard
2. Press F12 > Console tab
3. Tìm log "Dashboard Debug:"
4. Check các field:
   - `isLoadingReport`: false = loaded
   - `reportError`: null = no error
   - `monthlyReport`: có data không?

### Bước 2: Xem Network

1. F12 > Network tab
2. Refresh trang
3. Tìm request: `reports/monthly?year=2025&month=10`
4. Click vào request
5. Xem Response tab:
   - Status: 200 OK?
   - Data có summary, topSellingMedications không?

### Bước 3: Test API Trực Tiếp

```powershell
# Chạy test script
.\test-dashboard-api.ps1

# Sẽ hiển thị:
# - API response structure
# - Summary data
# - Top medications
# - Sales by status
```

**Lưu ý:** Cần thêm JWT token vào script trước khi chạy

## 📊 Nếu Vẫn Thấy 0

### Nguyên nhân: Database không có sales data

Chạy query để kiểm tra:

```sql
SELECT COUNT(*) FROM sales_orders 
WHERE order_date >= '2025-10-01' 
  AND order_date < '2025-11-01';
```

**Nếu kết quả = 0:** Database không có sales orders cho tháng 10/2025

### Giải pháp A: Đợi có sales orders thực tế

- Tạo sales orders qua Sales page (/sales)
- Dashboard sẽ tự động update

### Giải pháp B: Tạo test data

```sql
-- Tạo 1 sales order test
INSERT INTO sales_orders (
  customer_id, 
  order_date, 
  total_amount, 
  status, 
  payment_method, 
  created_by
) VALUES (
  1,                    -- customer_id (cần có customer)
  CURRENT_DATE,         -- order_date  
  500000,               -- total_amount
  'completed',          -- status
  'cash',               -- payment_method
  1                     -- created_by (user_id)
);
```

### Giải pháp C: Test với tháng trước

Nếu có data ở tháng trước, temporarily change Dashboard to test:

```javascript
// Temporary test - change month to previous month
const currentMonth = currentDate.getMonth(); // Will get September data
```

## 📝 Files Đã Tạo

1. **DASHBOARD_TROUBLESHOOTING.md** - Full troubleshooting guide
2. **test-dashboard-api.ps1** - PowerShell test script
3. **Dashboard.jsx** - Updated với debug logging và error handling

## 🚀 Next Steps

1. **Mở Dashboard** → Check console logs
2. **Xem Network tab** → Verify API call thành công
3. **Chạy test script** → Verify API response
4. **Check database** → Xem có sales data không
5. **Tạo test sales order** → Nếu database trống

## ❓ Cần Help?

Xem full guide: `DASHBOARD_TROUBLESHOOTING.md`

## 💡 Tips

- Dashboard auto-refresh khi có data mới
- Loading skeleton hiển thị khi đang load
- Error banner hiển thị nếu có lỗi
- Console log cho developer debugging

---

**Expected Behavior:**

- Nếu có sales data → Hiển thị thống kê thực
- Nếu không có data → Hiển thị 0 (đúng)
- Nếu API error → Hiển thị error message
- Nếu đang load → Hiển thị loading skeleton

# Dashboard Troubleshooting Guide

## Vấn Đề: Dashboard Hiển Thị Giá Trị 0

Nếu Dashboard hiển thị tất cả các giá trị thống kê là 0:

- Total Orders: 0
- Total Revenue: 0 ₫
- Average Order: 0 ₫
- Top Products: 0
- "No sales data available"

### Nguyên Nhân Có Thể

1. **Không có dữ liệu sales trong database**
2. **API endpoint không hoạt động đúng**
3. **Authentication/Authorization issues**
4. **Response structure không đúng**

---

## Các Bước Kiểm Tra

### 1. Kiểm Tra Console Browser

Mở DevTools (F12) và xem tab Console:

```javascript
// Dashboard sẽ tự động log debug info
Dashboard Debug: {
  currentYear: 2025,
  currentMonth: 10,
  monthlyReport: {...},
  isLoadingReport: false,
  reportError: null,
  reportData: {...}
}
```

**Những gì cần kiểm tra:**

- `isLoadingReport` - Nếu `true` mãi thì có vấn đề với API
- `reportError` - Nếu có lỗi sẽ hiển thị ở đây
- `monthlyReport` - Kiểm tra cấu trúc response
- `reportData` - Kiểm tra có data không

### 2. Kiểm Tra Network Tab

1. Mở DevTools (F12) > Network tab
2. Refresh trang Dashboard
3. Tìm request đến `/api/reports/monthly`
4. Kiểm tra:
   - **Status Code**: Phải là 200 (OK)
   - **Response**: Xem data trả về
   - **Query Params**: year và month có đúng không

**Expected Request:**

```
GET /api/reports/monthly?year=2025&month=10
Authorization: Bearer <token>
```

**Expected Response:**

```json
{
  "success": true,
  "message": "Monthly sales report generated successfully",
  "data": {
    "id": 123,
    "type": "monthly_sales",
    "data": {
      "period": {
        "startDate": "2025-10-01T00:00:00.000Z",
        "endDate": "2025-10-31T23:59:59.999Z"
      },
      "summary": {
        "totalOrders": 50,
        "totalRevenue": 10000000
      },
      "topSellingMedications": [...],
      "salesByStatus": [...],
      "monthInfo": {...}
    }
  }
}
```

### 3. Test API Trực Tiếp

Sử dụng PowerShell script:

```powershell
# Chỉnh sửa token trong file
.\test-dashboard-api.ps1
```

**Cách lấy token:**

1. Login vào web app
2. F12 > Application > Local Storage
3. Copy giá trị của key `token` hoặc `auth_token`
4. Paste vào biến `$TOKEN` trong script

### 4. Kiểm Tra Database

Kết nối vào database và chạy query:

```sql
-- Kiểm tra có sales orders không
SELECT COUNT(*) as total_orders, SUM(total_amount) as total_revenue
FROM sales_orders
WHERE order_date >= '2025-10-01'
  AND order_date < '2025-11-01';

-- Kiểm tra sales order items
SELECT
  m.name as medication_name,
  mv.name as variant_name,
  SUM(soi.quantity) as total_quantity,
  SUM(soi.quantity * soi.unit_price) as total_revenue
FROM sales_order_items soi
LEFT JOIN sales_orders so ON soi.sales_order_id = so.id
LEFT JOIN medication_variants mv ON soi.medication_variant_id = mv.id
LEFT JOIN medications m ON mv.medication_id = m.id
WHERE so.order_date >= '2025-10-01'
  AND so.order_date < '2025-11-01'
GROUP BY m.name, mv.name
ORDER BY total_quantity DESC
LIMIT 10;

-- Kiểm tra sales by status
SELECT
  status,
  COUNT(*) as order_count,
  SUM(total_amount) as total_amount
FROM sales_orders
WHERE order_date >= '2025-10-01'
  AND order_date < '2025-11-01'
GROUP BY status;
```

**Nếu query trả về 0 rows:**

- Database không có dữ liệu sales cho tháng hiện tại
- Cần tạo test data hoặc chờ có sales orders thực tế

---

## Giải Pháp

### Giải Pháp 1: Tạo Test Data

Nếu đang development và cần test data:

```sql
-- Tạo test sales orders cho tháng hiện tại
INSERT INTO sales_orders (customer_id, order_date, total_amount, status, payment_method, created_by)
VALUES
  (1, CURRENT_DATE - INTERVAL '5 days', 500000, 'completed', 'cash', 1),
  (2, CURRENT_DATE - INTERVAL '3 days', 750000, 'completed', 'banking', 1),
  (3, CURRENT_DATE - INTERVAL '1 day', 300000, 'pending', 'cash', 1);

-- Tạo sales order items (cần có medication_variant_id hợp lệ)
INSERT INTO sales_order_items (sales_order_id, medication_variant_id, quantity, unit_price)
VALUES
  (LASTVAL(), 1, 2, 250000),  -- LASTVAL() lấy ID của sales order vừa tạo
  (LASTVAL(), 2, 3, 100000);
```

### Giải Pháp 2: Kiểm Tra API Server

Đảm bảo API server đang chạy:

```bash
# Check API server
cd apps/api
pnpm dev

# Check logs
tail -f logs/app.log
```

### Giải Pháp 3: Kiểm Tra Authentication

Nếu nhận được 401 Unauthorized:

1. Check token còn hạn không
2. Logout và login lại
3. Kiểm tra middleware authentication trong reportRoutes.js

### Giải Pháp 4: Sửa Response Structure

Nếu API trả về structure khác, update Dashboard.jsx:

```javascript
// Thay vì
const reportData = monthlyReport.data.data || monthlyReport.data;

// Có thể cần
const reportData =
  monthlyReport.report?.data || monthlyReport.data?.data || monthlyReport.data;
```

---

## Common Issues

### Issue 1: "isLoadingReport: true" mãi không tắt

**Nguyên nhân:** API request bị timeout hoặc error

**Giải pháp:**

- Kiểm tra API server có chạy không
- Check CORS settings
- Xem Network tab có request failed không

### Issue 2: Error: "Cannot read property 'data' of undefined"

**Nguyên nhân:** Response structure không như expected

**Giải pháp:**

- Log ra `monthlyReport` để xem structure
- Update code để match với actual structure

### Issue 3: Authentication Error (401)

**Nguyên nhân:** Token hết hạn hoặc invalid

**Giải pháp:**

- Logout và login lại
- Check token expiry time
- Verify JWT secret key trong API

### Issue 4: Month Parameter Wrong

**Nguyên nhân:** JavaScript getMonth() returns 0-11

**Giải pháp:**

- Đã fix: `currentMonth = getMonth() + 1`
- API controller sẽ convert về 0-based: `month - 1`

---

## Debug Checklist

- [ ] API server đang chạy (port 5000)
- [ ] Web app đang chạy (port 3000)
- [ ] Đã login thành công
- [ ] Token hợp lệ
- [ ] Database có connection
- [ ] Database có sales data cho tháng hiện tại
- [ ] Network request thành công (200 OK)
- [ ] Response có đúng structure
- [ ] Console không có error
- [ ] Đã clear cache và hard reload

---

## Monitoring

### Real-time Debugging

Thêm vào Dashboard.jsx để monitor:

```javascript
useEffect(() => {
  if (monthlyReport) {
    console.log("📊 Monthly Report Updated:", {
      hasData: !!monthlyReport?.data,
      structure: Object.keys(monthlyReport || {}),
      summary: monthlyReport?.data?.data?.summary,
      medications: monthlyReport?.data?.data?.topSellingMedications?.length,
      status: monthlyReport?.data?.data?.salesByStatus?.length,
    });
  }
}, [monthlyReport]);
```

### API Logging

Enable debug logging trong API:

```javascript
// apps/api/src/controllers/reportController.js
generateMonthly: asyncHandler(async (req, res) => {
  console.log("🔍 Generate Monthly Report:", {
    year: req.query.year,
    month: req.query.month,
    user: req.user?.id,
  });

  // ... rest of code
});
```

---

## Contact Support

Nếu vẫn gặp vấn đề:

1. Export console logs (Console > Save as log file)
2. Export network HAR (Network > Export HAR)
3. Screenshot của Dashboard
4. Database query results
5. Contact team lead

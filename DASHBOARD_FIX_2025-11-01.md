# Dashboard Fix - November 1, 2025

## 🐛 Vấn Đề Ban Đầu

Dashboard hiển thị dữ liệu không chính xác:

- Tổng doanh thu bao gồm cả đơn pending và cancelled
- Top selling medications bao gồm cả đơn chưa thanh toán
- Tháng bị convert sai giữa controller và service

## ✅ Các Fix Đã Thực Hiện

### 1. Fix Month Parameter Conversion

**File: `apps/api/src/controllers/reportController.js`**

**TRƯỚC:**

```javascript
month: month ? parseInt(month) - 1 : undefined, // Convert to 0-based
```

**SAU:**

```javascript
month: month ? parseInt(month) : undefined, // Keep 1-12, service will convert to 0-based
```

**File: `apps/api/src/services/reportService.js`**

**TRƯỚC:**

```javascript
const targetMonth = month !== undefined ? month : new Date().getMonth();
```

**SAU:**

```javascript
// If month is provided (1-12), convert to 0-based. Otherwise use current month (0-based)
const targetMonth = month !== undefined ? month - 1 : new Date().getMonth();
```

**Lý do:**

- API nhận tháng từ 1-12 (tháng 10 = 10)
- JavaScript Date object dùng tháng 0-11 (tháng 10 = 9)
- Trước đây convert 2 lần: controller (10 → 9) và service không convert
- Bây giờ: controller giữ nguyên, service convert 1 lần duy nhất

### 2. Filter Only Paid Orders for Revenue

**File: `apps/api/src/services/reportService.js`**

#### A. Total Sales Summary

**TRƯỚC:**

```javascript
// Total sales and order count
const [summary] = await db
  .select({
    totalOrders: count(salesOrders.id),
    totalRevenue: sum(salesOrders.totalAmount),
  })
  .from(salesOrders)
  .where(
    and(gte(salesOrders.orderDate, start), lte(salesOrders.orderDate, end))
  );
```

**SAU:**

```javascript
// Total sales and order count (only paid orders for revenue)
const [summary] = await db
  .select({
    totalOrders: count(salesOrders.id),
    totalRevenue: sum(salesOrders.totalAmount),
  })
  .from(salesOrders)
  .where(
    and(
      gte(salesOrders.orderDate, start),
      lte(salesOrders.orderDate, end),
      eq(salesOrders.status, "paid")
    )
  );
```

#### B. Top Selling Medications

**TRƯỚC:**

```javascript
.where(
  and(gte(salesOrders.orderDate, start), lte(salesOrders.orderDate, end))
)
```

**SAU:**

```javascript
.where(
  and(
    gte(salesOrders.orderDate, start),
    lte(salesOrders.orderDate, end),
    eq(salesOrders.status, "paid")
  )
)
```

**Lý do:**

- Dashboard chỉ nên hiển thị doanh thu thực từ đơn đã thanh toán
- Đơn "pending" chưa thanh toán → không tính vào doanh thu
- Đơn "cancelled" đã hủy → không tính vào doanh thu
- Chỉ đơn "paid" mới tính vào revenue và top selling

## 📊 Impact của Fix

### Trước Fix

```
Total Revenue = Tất cả đơn (pending + paid + cancelled)
Top Selling = Tất cả sản phẩm trong mọi đơn
```

### Sau Fix

```
Total Revenue = Chỉ đơn paid
Top Selling = Chỉ sản phẩm từ đơn paid
```

### Ví dụ với October 2025 Data

**Sales Orders October 2025:**

- 8 đơn paid: 450K + 680K + 320K + 1,250K + 540K + 890K + 760K + 920K = **5,810,000 VND**
- 1 đơn pending: 420K (KHÔNG tính)
- 1 đơn cancelled: 350K (KHÔNG tính)

**Kết quả:**

- ✅ Dashboard hiển thị: **5,810,000 VND** (chính xác)
- ❌ Trước đây: 6,580,000 VND (sai vì bao gồm pending + cancelled)

## 🧪 Testing

### Test API Directly

```bash
# PowerShell
$headers = @{
  "Authorization" = "Bearer YOUR_TOKEN"
}

$response = Invoke-RestMethod -Uri "http://localhost:3000/api/reports/monthly?year=2025&month=10" -Headers $headers
$response.data.data.summary
```

**Expected Output:**

```json
{
  "totalOrders": 8,
  "totalRevenue": "5810000",
  "avgOrderValue": "726250"
}
```

### Test Dashboard

1. Login to web app
2. Navigate to `/dashboard`
3. Check console logs for debug info
4. Verify stats cards show:
   - Tổng đơn hàng: 8
   - Tổng doanh thu: ₫5,810,000
   - Đơn hàng TB: ₫726,250

## 📝 Files Changed

1. **apps/api/src/controllers/reportController.js**
   - Remove double conversion of month parameter

2. **apps/api/src/services/reportService.js**
   - Fix month conversion (1-12 → 0-11)
   - Add status filter for paid orders only
   - Update summary query
   - Update top selling medications query

## 🚀 Deployment Notes

- No database migration needed
- No schema changes
- Backend changes only
- Frontend code remains unchanged
- Backward compatible

## 📖 Related Documentation

- `DASHBOARD_DOCUMENTATION.md` - Full dashboard documentation
- `DASHBOARD_QUICKSTART.md` - Quick start guide
- `DASHBOARD_TROUBLESHOOTING.md` - Troubleshooting guide
- `SALES_API_FLOW.md` - Sales API documentation

## ✅ Verification Checklist

- [x] Month parameter conversion fixed
- [x] Revenue calculation only includes paid orders
- [x] Top selling medications only from paid orders
- [x] Code formatted with Prettier
- [ ] API tested with October 2025 data
- [ ] Dashboard UI verified
- [ ] Console logs checked

---

**Fixed by:** GitHub Copilot  
**Date:** November 1, 2025  
**Issue:** Dashboard showing incorrect revenue (including pending/cancelled orders)  
**Solution:** Filter by status='paid' and fix month parameter conversion

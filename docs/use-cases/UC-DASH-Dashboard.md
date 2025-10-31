# Dashboard & Analytics Use Cases

## Overview

Module Dashboard cung cấp tổng quan về hoạt động kinh doanh của nhà thuốc, bao gồm doanh thu, đơn hàng, tồn kho và các chỉ số quan trọng.

---

## UC-DASH-001: View Dashboard Analytics

**Mô tả:** Hiển thị tổng quan các chỉ số kinh doanh quan trọng như doanh thu, số lượng đơn hàng, tồn kho, và các biểu đồ phân tích theo thời gian.

### Actors

- Manager
- Admin

### Preconditions

- Người dùng đã đăng nhập
- Có role: `manager` hoặc `admin`
- Hệ thống đã có dữ liệu

### Main Flow

1. Người dùng truy cập `/dashboard`
2. Hệ thống hiển thị Dashboard với các section:

#### **Summary Cards (Top Section)**

- **Total Revenue (Today)**
  - Số tiền: VNĐ
  - % change so với hôm qua
  - Icon: trending up/down
- **Total Orders (Today)**
  - Số đơn: count
  - % change so với hôm qua
  - Icon: shopping cart
- **Low Stock Items**
  - Số sản phẩm sắp hết: count
  - Urgent items (< 10): highlight red
  - Icon: alert triangle
- **Pending Orders**
  - Số đơn đang chờ: count
  - Icon: clock

#### **Revenue Chart (Main Section)**

- **Time Range Selector**: Today, This Week, This Month, This Year, Custom Range
- **Chart Type**: Line chart hoặc Bar chart
- **Data Points**:
  - X-axis: Time (hours/days/months tùy range)
  - Y-axis: Revenue (VNĐ)
- **Tooltip**: Hiển thị chi tiết khi hover
- **Export**: Button để export data as CSV/Excel

#### **Top Selling Products (Right Panel)**

- **Table với columns**:
  1. Rank (#)
  2. Product Name
  3. Quantity Sold
  4. Revenue
- **Limit**: Top 10 products
- **Time filter**: Today/This Week/This Month
- **Link**: Click vào product → redirect to product detail

#### **Recent Orders (Bottom Section)**

- **Table với columns**:
  1. Order ID
  2. Customer Name
  3. Total Amount
  4. Status
  5. Created Date
  6. Actions (View Detail)
- **Pagination**: 10 orders per page
- **Filter**: All/Completed/Pending/Cancelled
- **Real-time update**: Auto refresh mỗi 30 giây

#### **Inventory Alerts (Right Bottom)**

- **List of low stock items**:
  - Product Name
  - Current Stock
  - Reorder Point
  - Action: Create Purchase Order
- **Color coding**:
  - Red: Stock < 10
  - Orange: Stock < Reorder Point
  - Yellow: Stock < Reorder Point \* 1.5

### Features

#### **Time Range Filters**

- Today
- Yesterday
- Last 7 days
- Last 30 days
- This Month
- Last Month
- This Year
- Custom Range (date picker)

#### **Refresh Options**

- Manual refresh button
- Auto refresh toggle (30s, 1m, 5m)
- Last updated timestamp

#### **Export Functions**

- Export Revenue Chart data (CSV, Excel)
- Export Top Products (PDF, Excel)
- Export Orders (CSV)
- Generate Full Dashboard Report (PDF)

### Alternative Flows

**A1: No data available**

- Hiển thị empty state: "Chưa có dữ liệu trong khoảng thời gian này"
- Suggest: "Thử chọn khoảng thời gian khác"

**A2: Loading state**

- Hiển thị skeleton loaders cho mỗi section
- Timeout sau 10 giây → hiển thị error

**A3: API error**

- Hiển thị error message: "Không thể tải dữ liệu. Vui lòng thử lại."
- Retry button

### Postconditions

- Dashboard data được cache trong 5 phút
- User activity được log
- Performance metrics được ghi nhận

### API Endpoints

```http
# Get dashboard summary
GET /api/dashboard/summary?date=2024-01-01

Response:
{
  "totalRevenue": 15000000,
  "revenueChange": 5.2,
  "totalOrders": 45,
  "ordersChange": -2.1,
  "lowStockCount": 12,
  "pendingOrders": 8
}

# Get revenue chart data
GET /api/dashboard/revenue?from=2024-01-01&to=2024-01-31&interval=day

Response:
{
  "data": [
    { "date": "2024-01-01", "revenue": 500000, "orders": 15 },
    { "date": "2024-01-02", "revenue": 750000, "orders": 22 }
  ]
}

# Get top selling products
GET /api/dashboard/top-products?from=2024-01-01&to=2024-01-31&limit=10

Response:
{
  "products": [
    {
      "id": "uuid",
      "name": "Paracetamol 500mg",
      "quantitySold": 150,
      "revenue": 450000
    }
  ]
}

# Get recent orders
GET /api/dashboard/recent-orders?page=1&limit=10&status=all

Response:
{
  "orders": [
    {
      "id": "uuid",
      "customer": { "id": "uuid", "name": "John Doe" },
      "totalAmount": 250000,
      "status": "completed",
      "createdAt": "2024-01-15T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10
  }
}

# Get low stock items
GET /api/dashboard/low-stock?threshold=reorder_point

Response:
{
  "items": [
    {
      "medicationId": "uuid",
      "name": "Aspirin 100mg",
      "currentStock": 8,
      "reorderPoint": 20,
      "urgency": "high"
    }
  ]
}
```

### UI Components

#### Main Components

- `DashboardLayout` - Main layout wrapper
- `SummaryCards` - 4 metric cards
- `RevenueChart` - Chart component with filters
- `TopProductsTable` - Product ranking table
- `RecentOrdersTable` - Orders table
- `LowStockAlert` - Inventory alerts panel

#### Sub Components

- `StatCard` - Reusable metric card
- `TimeRangeSelector` - Date range picker
- `RefreshControl` - Auto/manual refresh
- `ExportButton` - Export dropdown menu
- `ChartTooltip` - Custom tooltip for charts
- `EmptyState` - No data placeholder
- `LoadingSkeleton` - Loading states

### Business Rules

1. **Access Control**:
   - Staff: Không có quyền truy cập
   - Manager: Xem dashboard của chi nhánh mình quản lý
   - Admin: Xem dashboard toàn hệ thống

2. **Data Refresh**:
   - Summary cards: Refresh mỗi 1 phút
   - Charts: Refresh mỗi 5 phút
   - Recent orders: Real-time (WebSocket)
   - Low stock: Refresh mỗi 10 phút

3. **Performance**:
   - Cache dashboard data: 5 phút
   - Lazy load charts khi scroll vào view
   - Paginate long lists
   - Optimize queries với indexes

4. **Time Zones**:
   - Sử dụng timezone của user
   - Display dates trong local format
   - Server calculations dùng UTC

### Calculations

#### Revenue Change %

```javascript
const revenueChange =
  ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
```

#### Urgency Level

```javascript
function getUrgency(currentStock, reorderPoint) {
  if (currentStock < 10) return "critical";
  if (currentStock < reorderPoint) return "high";
  if (currentStock < reorderPoint * 1.5) return "medium";
  return "normal";
}
```

### Database Queries Optimization

```sql
-- Summary Revenue (indexed on sales.created_at)
SELECT
  SUM(total_amount) as total_revenue,
  COUNT(*) as total_orders
FROM sales
WHERE DATE(created_at) = CURDATE()
  AND status = 'completed';

-- Top Products (indexed on sale_items.medication_variant_id)
SELECT
  mv.id,
  m.name,
  SUM(si.quantity) as quantity_sold,
  SUM(si.total) as revenue
FROM sale_items si
JOIN medication_variants mv ON si.medication_variant_id = mv.id
JOIN medications m ON mv.medication_id = m.id
JOIN sales s ON si.sale_id = s.id
WHERE s.created_at >= ? AND s.created_at <= ?
  AND s.status = 'completed'
GROUP BY mv.id, m.name
ORDER BY revenue DESC
LIMIT 10;

-- Low Stock (indexed on stock_inventories.quantity)
SELECT
  m.id,
  m.name,
  si.quantity as current_stock,
  m.reorder_point
FROM stock_inventories si
JOIN medication_variants mv ON si.medication_variant_id = mv.id
JOIN medications m ON mv.medication_id = m.id
WHERE si.quantity < m.reorder_point
ORDER BY (si.quantity / m.reorder_point) ASC
LIMIT 20;
```

### Error Handling

| Error Code | Message                | Action                        |
| ---------- | ---------------------- | ----------------------------- |
| DASH_001   | Failed to load summary | Show retry button             |
| DASH_002   | Chart data unavailable | Show empty chart with message |
| DASH_003   | Invalid date range     | Reset to default range        |
| DASH_004   | Export failed          | Show error toast, allow retry |
| DASH_005   | Unauthorized access    | Redirect to 403 page          |

### Testing Checklist

- [ ] Dashboard loads cho Manager role
- [ ] Dashboard loads cho Admin role
- [ ] Staff không thể access dashboard
- [ ] Summary cards hiển thị đúng data
- [ ] Revenue chart render với đúng time range
- [ ] Time range selector hoạt động
- [ ] Top products table hiển thị đúng ranking
- [ ] Recent orders table có pagination
- [ ] Low stock alerts hiển thị items đúng
- [ ] Auto refresh hoạt động
- [ ] Manual refresh button hoạt động
- [ ] Export CSV/Excel/PDF thành công
- [ ] Empty state hiển thị khi không có data
- [ ] Loading skeleton hiển thị khi fetch data
- [ ] Error handling khi API fail
- [ ] Responsive trên mobile/tablet
- [ ] Chart tooltip hiển thị đúng info
- [ ] Color coding cho urgency levels
- [ ] Timezone conversion đúng

### Performance Metrics

- **Load Time**: < 2 seconds (initial load)
- **TTI (Time to Interactive)**: < 3 seconds
- **API Response**: < 500ms (với cache)
- **Chart Render**: < 1 second
- **Auto Refresh**: Không gây lag UI

### Future Enhancements

1. **Advanced Analytics**:
   - Revenue prediction với ML
   - Customer segmentation
   - Seasonal trends analysis
   - Profit margin tracking

2. **Real-time Features**:
   - WebSocket for live updates
   - Push notifications
   - Live order tracking map

3. **Customization**:
   - Drag & drop dashboard layout
   - Custom widgets
   - Saved dashboard templates
   - Personal dashboard views

4. **Reporting**:
   - Scheduled reports (daily/weekly/monthly)
   - Email reports
   - Custom report builder
   - Compare periods

---

## Related Use Cases

- UC-SALE-001: Create Sale Order (provides data)
- UC-INV-001: View Stock Inventory (low stock alerts)
- UC-MED-001: View Medication List (top products)
- UC-AI-001: Generate AI Insights (advanced analytics)

---

## Dependencies

### Frontend Libraries

- React Query (data fetching)
- Recharts hoặc Chart.js (charts)
- date-fns (date manipulation)
- react-table (tables)
- WebSocket client (real-time)

### Backend Services

- Sales Service
- Inventory Service
- Analytics Service
- Reporting Service

### Infrastructure

- Redis (caching)
- PostgreSQL (data)
- WebSocket server (real-time)
- CDN (static assets)

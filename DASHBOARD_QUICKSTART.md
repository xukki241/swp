# 🚀 Dashboard Quick Start Guide

## Khởi động nhanh cho Dashboard PharmaFlow

### 1. Kiểm tra Prerequisites

Đảm bảo bạn đã cài:

- Node.js 18+
- npm hoặc pnpm
- React 18.3+
- React Router 7+

### 2. Import Dashboard vào App

```jsx
// App.jsx
import DashboardPage from "@/pages/Dashboard";

// Trong Routes
<Route path="/dashboard" element={<DashboardPage />} />;
```

### 3. Kiểm tra Hooks

Đảm bảo các hooks sau đã được implement:

```jsx
// hooks/useAuth.js
export function useCurrentUser() {
  // Return: { data: { user: { name, role } } }
}

// hooks/useReports.js
export function useMonthlySalesReport(year, month) {
  // Return: { data: { summary, topSellingMedications, salesByStatus } }
}
```

### 4. Run Development Server

```bash
npm run dev
# or
pnpm dev
```

### 5. Navigate to Dashboard

Truy cập: `http://localhost:5173/dashboard`

---

## 🎨 Customization Guide

### Thay đổi Quick Actions

Trong `Dashboard.jsx`, tìm `quickActions` array:

```jsx
const quickActions = [
  {
    title: "Tên Action",
    description: "Mô tả ngắn",
    icon: IconComponent, // từ lucide-react
    color: "bg-blue-100", // Tailwind color
    iconColor: "text-blue-600",
    path: "/route-path",
  },
  // Thêm actions khác...
];
```

### Thay đổi Stats Display

Modify stats calculation trong `useMemo`:

```jsx
const stats = useMemo(() => {
  // Custom stats logic
  return [
    {
      title: "Metric Name",
      value: "100",
      icon: IconComponent,
      trend: "+10%",
      trendUp: true,
      loading: false,
    },
  ];
}, [dependencies]);
```

### Customizing Colors

Trong `StatCard.jsx`, `QuickActionCard.jsx`:

- Primary: `bg-primary`, `text-primary`
- Success: `bg-green-100`, `text-green-600`
- Warning: `bg-yellow-100`, `text-yellow-600`
- Error: `bg-red-100`, `text-red-600`

---

## 📊 Data Structure

### Monthly Report Expected Format

```json
{
  "data": {
    "summary": {
      "totalOrders": 150,
      "totalRevenue": 50000000
    },
    "topSellingMedications": [
      {
        "medicationId": "1",
        "medicationName": "Paracetamol",
        "variantName": "500mg",
        "totalRevenue": 5000000,
        "totalQuantity": 1000
      }
    ],
    "salesByStatus": [
      {
        "status": "completed",
        "count": 120,
        "totalAmount": 45000000
      }
    ]
  }
}
```

---

## 🔧 Troubleshooting

### Dashboard không load stats

**Giải pháp:**

1. Kiểm tra API endpoint `/api/reports/monthly-sales`
2. Verify `useMonthlySalesReport` hook
3. Check browser console for errors

### Quick Actions không navigate

**Giải pháp:**

1. Đảm bảo React Router được setup đúng
2. Kiểm tra routes exist trong `App.jsx`
3. Verify `useNavigate` hook

### Animations không chạy

**Giải pháp:**

1. Import CSS: `import '@/styles/dashboard-animations.css'`
2. Kiểm tra TailwindCSS config
3. Clear cache và rebuild

### Loading states không hiển thị

**Giải pháp:**

1. Verify `isLoading` từ hook
2. Check conditional rendering logic
3. Ensure skeleton components imported

---

## ✅ Checklist sau khi setup

- [ ] Dashboard page loads without errors
- [ ] User name displays correctly
- [ ] Stats show with proper formatting
- [ ] Top medications list appears
- [ ] Sales by status displays
- [ ] Quick Actions navigate correctly
- [ ] Recent activities feed works
- [ ] Animations smooth
- [ ] Responsive on mobile
- [ ] Loading states work
- [ ] Empty states show when no data

---

## 📱 Mobile Testing

Test trên các resolutions:

- **320px** - Small phones
- **375px** - iPhone SE
- **768px** - Tablets
- **1024px** - Desktop
- **1920px** - Large screens

---

## 🎯 Next Steps

1. **Connect Real API**
   - Replace mock data
   - Implement WebSocket for real-time updates

2. **Add More Metrics**
   - Low stock alerts
   - Expiring medications
   - Staff performance

3. **Enhance Visualizations**
   - Add charts (Chart.js/Recharts)
   - Revenue graphs
   - Trend analysis

4. **Implement Filters**
   - Date range selector
   - Department filter
   - Staff filter

---

## 📚 Related Docs

- [Full Dashboard Documentation](./DASHBOARD_DOCUMENTATION.md)
- [Component API Reference](./apps/web/src/components/dashboard/README.md)
- [Implementation Details](./DASHBOARD_IMPLEMENTATION.md)
- [Web Use Cases](./WEB_USE_CASES.md)

---

**Thời gian setup ước tính:** 5-10 phút  
**Độ khó:** ⭐⭐ (Easy-Medium)

Chúc bạn thành công! 🎉

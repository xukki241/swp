# Dashboard Month Selector - November 1, 2025

## 🎯 Vấn Đề

Dashboard mặc định hiển thị tháng hiện tại (tháng 11/2025), nhưng database chỉ có seed data tháng 10/2025, nên Dashboard hiển thị 0.

## ✅ Giải Pháp

Thêm Month/Year Selector vào Dashboard để người dùng có thể chọn tháng/năm muốn xem.

## 🎨 UI Components Đã Thêm

### 1. Month/Year Selector Card

```jsx
<Card className="border-0 shadow-md">
  <CardContent className="p-4">
    <div className="flex items-center justify-between gap-4">
      {/* Label */}
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        <span className="font-semibold">Báo cáo tháng:</span>
      </div>
      
      {/* Controls */}
      <div className="flex items-center gap-2">
        <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
          <ChevronLeft />
        </Button>
        
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          {/* Tháng 1-12 */}
        </Select>
        
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          {/* 2023-2026 */}
        </Select>
        
        <Button variant="outline" size="icon" onClick={goToNextMonth}>
          <ChevronRight />
        </Button>
        
        <Button variant="default" onClick={goToCurrentMonth}>
          Tháng hiện tại
        </Button>
      </div>
    </div>
  </CardContent>
</Card>
```

### 2. Features

- **Month Selector**: Dropdown chọn tháng 1-12
- **Year Selector**: Dropdown chọn năm 2023-2026
- **Previous/Next Buttons**: Navigate qua lại giữa các tháng
- **Current Month Button**: Jump về tháng hiện tại
- **Dynamic Badge**: Badge hiển thị "Tháng {month}/{year}"

## 🔧 State Management

```jsx
const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth() + 1); // 1-12
```

## 🎮 Navigation Functions

```jsx
// Go to previous month
const goToPreviousMonth = () => {
  if (selectedMonth === 1) {
    setSelectedMonth(12);
    setSelectedYear(selectedYear - 1);
  } else {
    setSelectedMonth(selectedMonth - 1);
  }
};

// Go to next month
const goToNextMonth = () => {
  if (selectedMonth === 12) {
    setSelectedMonth(1);
    setSelectedYear(selectedYear + 1);
  } else {
    setSelectedMonth(selectedMonth + 1);
  }
};

// Go to current month
const goToCurrentMonth = () => {
  const now = new Date();
  setSelectedYear(now.getFullYear());
  setSelectedMonth(now.getMonth() + 1);
};
```

## 📊 Data Flow

1. User chọn tháng/năm từ selector
2. `selectedMonth` và `selectedYear` state update
3. `useMonthlySalesReport(selectedYear, selectedMonth)` tự động re-fetch
4. Dashboard re-render với data mới
5. Badge update: "Tháng 10/2025"

## 🎨 UI/UX

- **Vị trí**: Ngay dưới Welcome Banner, trước Stats Grid
- **Responsive**: Full width trên mobile, compact trên desktop
- **Styling**: Card với shadow, primary color theme
- **Icons**: Calendar, ChevronLeft, ChevronRight từ lucide-react

## 📝 Files Changed

### `apps/web/src/pages/Dashboard.jsx`

**Imports Added:**

- `Button` component
- `Select`, `SelectContent`, `SelectItem`, `SelectTrigger`, `SelectValue` components
- `Calendar`, `ChevronLeft`, `ChevronRight` icons

**State Added:**

- `selectedYear` - Currently selected year
- `selectedMonth` - Currently selected month (1-12)

**Functions Added:**

- `goToPreviousMonth()` - Navigate to previous month
- `goToNextMonth()` - Navigate to next month
- `goToCurrentMonth()` - Jump to current month

**UI Added:**

- Month/Year Selector Card
- Navigation buttons
- Dynamic badge in Top Selling Medications section

## 🧪 Testing

### Test Scenarios

1. **Default State** (November 2025)
   - Dashboard loads with current month
   - Shows "No data" if no sales in current month

2. **Select October 2025**
   - Click selector → Choose "Tháng 10"
   - Dashboard shows October data:
     - Total Orders: 7
     - Total Revenue: ₫4,890,000
     - Top Selling Medications: 5 items

3. **Navigation Buttons**
   - Previous: Nov → Oct → Sep → ... → Jan → Dec (prev year)
   - Next: Oct → Nov → Dec → Jan (next year) → ...

4. **Current Month Button**
   - From any month → Click "Tháng hiện tại"
   - Jumps back to November 2025

## 💡 Usage Examples

### Xem data tháng 10/2025

1. Mở Dashboard
2. Click dropdown "Tháng 11" → Chọn "Tháng 10"
3. Dashboard auto-refresh với data tháng 10

### Navigate qua các tháng

1. Click `<` để xem tháng trước
2. Click `>` để xem tháng sau
3. Click "Tháng hiện tại" để về tháng hiện tại

## 🚀 Benefits

1. ✅ **Flexibility**: Xem báo cáo bất kỳ tháng nào
2. ✅ **User-friendly**: Easy navigation với buttons và dropdowns
3. ✅ **Real-time**: Data update ngay khi chọn tháng mới
4. ✅ **Visual Feedback**: Badge hiển thị tháng đang xem
5. ✅ **No Data Handling**: Clear message khi không có data

## 🎯 Default Behavior

- **Initial Load**: Dashboard loads with current month (tháng 11/2025)
- **No Data**: Shows "Chưa có dữ liệu bán hàng" message
- **User Action**: Select tháng 10/2025 to see seeded data

## 📖 Related Files

- `apps/web/src/pages/Dashboard.jsx` - Main dashboard file
- `apps/web/src/hooks/useReports.js` - Reports hook
- `apps/api/src/services/reportService.js` - Report service (backend)
- `apps/api/src/db/seed.js` - Seed data (October 2025)

---

**Added by:** GitHub Copilot  
**Date:** November 1, 2025  
**Issue:** Dashboard showing 0 because current month (Nov) has no data  
**Solution:** Add month/year selector to view historical data

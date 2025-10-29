# Dashboard Component Documentation

## Overview

The PharmaFlow Dashboard provides a comprehensive overview of pharmacy operations with real-time statistics, quick actions, and recent activities.

## Features

### 1. **Welcome Banner**

- Dynamic greeting based on time of day (Good morning/afternoon/evening)
- Displays current user name
- Shows current date and time
- Animated background with decorative elements

### 2. **Statistics Cards** (4 metrics)

- **Total Orders**: Monthly order count with trend percentage
- **Total Revenue**: Total sales in VND with trend
- **Average Order**: Average order value with trend
- **Top Products**: Count of best-selling items

Each card includes:

- Animated hover effects
- Trend indicators (up/down arrows)
- Loading states with skeleton screens
- Color-coded trends (green = up, red = down)

### 3. **Top Selling Medications**

- Shows top 5 best-selling medications for current month
- Displays:
  - Rank number (#1-5)
  - Medication name and variant
  - Total revenue (VND formatted)
  - Units sold
- Hover effects with border highlighting
- Empty state when no data available

### 4. **Sales by Status**

- Breakdown of orders by status:
  - Completed (green)
  - Pending (yellow)
  - Cancelled (red)
  - Processing (blue)
- Shows order count and total amount per status

### 5. **Quick Actions**

Interactive buttons for common tasks:

- **New Sale** → Navigate to `/sales` (POS)
- **Inventory** → Navigate to `/inventory/stock`
- **Medications** → Navigate to `/medications`
- **Analytics** → Navigate to `/dashboard` (reports)

Features:

- Icon-based design with color coding
- Hover animations (scale, arrow movement)
- Click to navigate
- Active state feedback

### 6. **Recent Activities**

Real-time activity feed showing:

- Sale orders completed
- Inventory updates
- Low stock alerts
- User registrations
- Timestamps (relative time)
- Icon indicators with color coding

## Component Structure

```
Dashboard/
├── Dashboard.jsx (Main page)
└── components/
    ├── StatCard.jsx (Stat card component)
    ├── WelcomeBanner.jsx (Welcome section)
    ├── QuickActionCard.jsx (Action button)
    ├── ActivityItem.jsx (Activity list item)
    └── index.js (Exports)
```

## Data Sources

### API Hooks Used

- `useCurrentUser()` - Get logged-in user information
- `useMonthlySalesReport(year, month)` - Get monthly sales statistics

### Data Flow

1. Dashboard fetches current month's report on load
2. Data is memoized to prevent unnecessary recalculations
3. Loading states shown while fetching
4. Empty states displayed when no data available

## Styling & Animations

### Color Scheme

- Primary: Blue gradient
- Success: Green (positive trends)
- Warning: Yellow (pending items)
- Error: Red (negative trends, cancelled)
- Info: Purple, Orange (various actions)

### Animations

- **Fade in**: Main container
- **Slide in**: Welcome banner text
- **Zoom in**: Banner icon
- **Pulse**: Activity indicators
- **Scale**: Cards on hover
- **Ping**: Background circles

### Responsive Design

- Mobile: Single column layout
- Tablet: 2-column stats grid
- Desktop: 4-column stats grid, 3-column content grid

## Usage Examples

### Basic Implementation

```jsx
import DashboardPage from "@/pages/Dashboard";

function App() {
  return <DashboardPage />;
}
```

### Custom Greeting

The dashboard automatically shows time-based greetings:

- 00:00 - 11:59: "Good morning"
- 12:00 - 17:59: "Good afternoon"
- 18:00 - 23:59: "Good evening"

### Navigation

Quick actions use React Router's `useNavigate`:

```jsx
const navigate = useNavigate();
onClick={() => navigate('/sales')}
```

## Customization

### Adding New Quick Actions

```jsx
const quickActions = [
  // ... existing actions
  {
    title: "Reports",
    description: "View detailed reports",
    icon: FileText,
    color: "bg-indigo-100",
    iconColor: "text-indigo-600",
    path: "/reports",
  },
];
```

### Adding New Stats

Modify the `stats` array in Dashboard.jsx:

```jsx
{
  title: "New Metric",
  value: "100",
  icon: YourIcon,
  trend: "+10%",
  trendUp: true,
  loading: false,
}
```

### Customizing Recent Activities

Replace mock data with API call:

```jsx
const { data: activities } = useRecentActivities();
```

## Performance Optimizations

1. **useMemo**: Expensive calculations memoized
2. **Lazy Loading**: Components load on demand
3. **Skeleton Screens**: Loading states for better UX
4. **Debounced Updates**: Prevent excessive re-renders

## Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- Screen reader friendly
- Color contrast compliance (WCAG AA)

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Dependencies

- React 18.3+
- React Router 7+
- Lucide React (icons)
- TailwindCSS 4+
- Radix UI components

## Future Enhancements

- [ ] Real-time data updates (WebSocket)
- [ ] Customizable dashboard layouts
- [ ] Widget drag-and-drop
- [ ] Export dashboard as PDF
- [ ] Dark mode support
- [ ] Multiple dashboard views (roles)
- [ ] Advanced charts (Chart.js/Recharts)
- [ ] Notification center integration

## Troubleshoading

### Issue: Stats not loading

**Solution**: Check API connection and `useMonthlySalesReport` hook

### Issue: Navigation not working

**Solution**: Ensure React Router is properly configured in App.jsx

### Issue: Animations laggy

**Solution**: Reduce animation complexity or disable for low-end devices

## Related Documentation

- [API Documentation](../API_DOCUMENTATION.md)
- [Component Library](../components/README.md)
- [Use Cases](../WEB_USE_CASES.md)

---

**Last Updated**: October 29, 2025  
**Version**: 2.0

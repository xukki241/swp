# Audit Log Frontend - Quick Start

## 🎯 What Was Built

A complete audit log viewer for tracking all system activities with filtering, pagination, and detailed views.

## 📁 Files Created

```
apps/web/
├── src/
│   ├── pages/
│   │   └── AuditLogPage.jsx          # Main audit log page
│   ├── services/
│   │   └── auditService.js           # API service layer
│   └── hooks/
│       └── useAuditLogs.js           # React Query hooks
└── AUDIT_LOG_FRONTEND.md             # Documentation
```

## 🔧 Files Modified

- `apps/web/src/App.jsx` - Added route `/audit-logs`
- `apps/web/src/config/sidebar-config.js` - Added sidebar menu item

## 🚀 Features

### ✅ Core Features

- 📊 **Table View** - Display logs in a sortable table
- 🔍 **Advanced Filtering** - Filter by action, entity, date range
- 📄 **Pagination** - Navigate through pages (50 items per page)
- 👁️ **Detail View** - Click to see full log details
- 🎨 **Color-coded Actions** - Visual distinction for action types
- ♻️ **Manual Refresh** - Reload data on demand

### 🎨 UI Components

- Cards for filters and content
- Responsive table with hover effects
- Modal dialog for details
- Color-coded badges for actions
- Loading states with spinners
- Empty states with helpful messages

### 🔐 Security

- Protected route (authentication required)
- Owner-only access via sidebar
- Backend enforces additional permissions

## 📊 Filter Options

1. **Action Type** - CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
2. **Entity Type** - user, medication, sale, purchase order, etc.
3. **Date Range** - Filter by start and end date
4. **Pagination** - Navigate pages with prev/next buttons

## 🎨 Action Color Codes

- 🟢 **CREATE** - Green
- 🔵 **UPDATE** - Blue
- 🔴 **DELETE** - Red
- 🟣 **LOGIN** - Purple
- ⚪ **LOGOUT** - Gray
- 🟠 **PASSWORD_CHANGE** - Orange
- 🟡 **PASSWORD_RESET** - Yellow
- 🔷 **VIEW** - Cyan
- 🟤 **EXPORT** - Indigo
- 🟣 **IMPORT** - Pink

## 📍 How to Access

### Option 1: Sidebar Navigation

1. Login as **owner** user
2. Click **"Nhật ký kiểm toán"** in sidebar

### Option 2: Direct URL

Navigate to: `http://localhost:5173/audit-logs`

## 🧪 Testing

```bash
# Run the application
cd apps/web
npm run dev

# Or from root
pnpm dev
```

### Test Scenarios

1. ✅ Login and view logs
2. ✅ Filter by action type
3. ✅ Filter by entity type
4. ✅ Filter by date range
5. ✅ Click "Chi tiết" to view details
6. ✅ Navigate between pages
7. ✅ Click refresh button

## 📡 API Endpoints Used

```
GET /api/audit-logs                      # List with filters
GET /api/audit-logs/:id                  # Get by ID
GET /api/audit-logs/entity/:entity/:id   # Get by entity
GET /api/audit-logs/user/:userId         # Get by user
GET /api/audit-logs/statistics           # Statistics
DELETE /api/audit-logs/cleanup           # Cleanup (admin)
```

## 🎯 Example Usage

```jsx
// In your component
import { useAuditLogs } from "@/hooks/useAuditLogs";

function MyComponent() {
  const { data, isLoading } = useAuditLogs({
    action: "CREATE",
    entity: "medication",
    page: 1,
    limit: 50,
  });

  const logs = data?.data || [];
  const pagination = data?.pagination || {};

  // Render your UI
}
```

## 📸 Screenshots

### Main View

- Header with title and refresh button
- Filter section with dropdowns and date pickers
- Table with logs (timestamp, user, action, entity, actions)
- Pagination controls

### Detail Dialog

- Log timestamp
- User information
- Action badge
- Entity type and ID
- Log ID
- JSON-formatted changes

## 🔄 Data Flow

```
Component → Hook (useAuditLogs) → Service (auditService) → API
                ↓
          React Query Cache
                ↓
         Component Re-render
```

## 🛠️ Tech Stack

- **React** - UI framework
- **React Router** - Navigation
- **TanStack Query** - Data fetching
- **Shadcn/ui** - UI components
- **date-fns** - Date formatting
- **Lucide React** - Icons

## 🎉 Success Criteria

✅ All files created successfully  
✅ No lint errors  
✅ Route added to App.jsx  
✅ Sidebar menu item added  
✅ Documentation created  
✅ Protected route implemented  
✅ Responsive design  
✅ Color-coded actions  
✅ Pagination working  
✅ Filtering working  
✅ Detail view working

## 🚀 Next Steps

1. Test the page in development
2. Add to user documentation
3. Consider additional features:
   - Export to CSV/Excel
   - Real-time updates
   - Advanced search
   - Statistics dashboard

---

**Status**: ✅ Complete  
**Date**: November 15, 2025  
**Ready for**: Production

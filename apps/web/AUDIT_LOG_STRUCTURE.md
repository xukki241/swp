# Audit Log View - Component Structure

## Component Hierarchy

```
AuditLogPage
├── AppLayout (wrapper)
│   ├── Header Section
│   │   ├── Icon + Title + Description
│   │   └── Refresh Button
│   │
│   ├── Filter Card
│   │   ├── CardHeader (with Filter icon)
│   │   └── CardContent
│   │       ├── Action Type Select
│   │       ├── Entity Type Select
│   │       ├── Start Date Input
│   │       └── End Date Input
│   │
│   └── Audit Logs Card
│       ├── CardHeader (with Activity icon)
│       └── CardContent
│           ├── Loading State (Spinner)
│           ├── Empty State (No logs message)
│           └── Table View
│               ├── TableHeader
│               │   ├── Thời gian (Timestamp)
│               │   ├── Người dùng (User)
│               │   ├── Hành động (Action)
│               │   ├── Đối tượng (Entity)
│               │   ├── Mã đối tượng (Entity ID)
│               │   └── Thao tác (Actions)
│               ├── TableBody
│               │   └── TableRow (for each log)
│               │       ├── Timestamp Cell
│               │       ├── User Cell (name + email)
│               │       ├── Action Badge
│               │       ├── Entity Label
│               │       ├── Entity ID Code
│               │       └── Detail Button
│               └── Pagination Controls
│
└── Detail Dialog
    ├── DialogHeader
    │   ├── DialogTitle
    │   └── DialogDescription
    └── DialogContent
        ├── Grid Layout (2 columns)
        │   ├── Timestamp
        │   ├── User Info
        │   ├── Action Badge
        │   ├── Entity Type
        │   ├── Entity ID
        │   └── Log ID
        └── Changes Section (JSON)
```

## Data Flow

```
┌─────────────────────────────────────────────────────────┐
│                     AuditLogPage                        │
│                                                         │
│  State:                                                 │
│  - filters (action, entity, dates, page, limit)       │
│  - selectedLog                                          │
│  - showDetailDialog                                     │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│              useAuditLogs(filters) Hook                 │
│                                                         │
│  Returns:                                               │
│  - data (logs + pagination)                            │
│  - isLoading                                            │
│  - isFetching                                           │
│  - refetch                                              │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│               React Query Cache Layer                   │
│                                                         │
│  Features:                                              │
│  - Automatic caching                                    │
│  - Background refetching                                │
│  - Query invalidation                                   │
│  - keepPreviousData for smooth transitions             │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│            auditService.getAuditLogs()                  │
│                                                         │
│  Builds query params and makes API call                │
└─────────────────────────────────────────────────────────┘
                          │
                          ↓
┌─────────────────────────────────────────────────────────┐
│                 Backend API Endpoint                    │
│                 GET /api/audit-logs                     │
│                                                         │
│  Returns:                                               │
│  {                                                      │
│    success: true,                                       │
│    data: [...logs],                                     │
│    pagination: { ... }                                  │
│  }                                                      │
└─────────────────────────────────────────────────────────┘
```

## User Interactions

```
┌─────────────────────────────────────────────────────────┐
│                    USER ACTIONS                         │
└─────────────────────────────────────────────────────────┘
         │
         ├─→ Select Action Filter
         │   └─→ handleFilterChange("action", value)
         │       └─→ Update filters state
         │           └─→ Reset page to 1
         │               └─→ Trigger new API call
         │
         ├─→ Select Entity Filter
         │   └─→ (same flow as action filter)
         │
         ├─→ Set Date Range
         │   └─→ (same flow as action filter)
         │
         ├─→ Click Detail Button
         │   └─→ handleViewDetail(log)
         │       └─→ setSelectedLog(log)
         │           └─→ setShowDetailDialog(true)
         │
         ├─→ Navigate Pages
         │   └─→ handlePageChange(newPage)
         │       └─→ Update filters.page
         │           └─→ Trigger new API call
         │
         └─→ Click Refresh
             └─→ refetch()
                 └─→ Force reload from API
```

## Styling & Theming

```
┌─────────────────────────────────────────────────────────┐
│                   SHADCN/UI COMPONENTS                  │
├─────────────────────────────────────────────────────────┤
│ AppLayout        - Main app wrapper with sidebar        │
│ Card             - Container for sections               │
│ Table            - Data table with sorting              │
│ Badge            - Color-coded action indicators        │
│ Button           - Interactive buttons                  │
│ Select           - Dropdown filters                     │
│ Input            - Date pickers                         │
│ Dialog           - Modal for details                    │
│ Label            - Form labels                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                      ICONS (Lucide)                     │
├─────────────────────────────────────────────────────────┤
│ FileText         - Main page icon                       │
│ RefreshCw        - Refresh button                       │
│ Filter           - Filter section                       │
│ Activity         - Logs section                         │
│ Calendar         - Timestamp indicator                  │
│ Eye              - View detail button                   │
│ ChevronLeft      - Previous page                        │
│ ChevronRight     - Next page                            │
│ Loader2          - Loading spinner                      │
└─────────────────────────────────────────────────────────┘
```

## Badge Color Mapping

```javascript
const getActionBadgeColor = (action) => {
  return {
    CREATE:          "bg-green-100 text-green-800",
    UPDATE:          "bg-blue-100 text-blue-800",
    DELETE:          "bg-red-100 text-red-800",
    LOGIN:           "bg-purple-100 text-purple-800",
    LOGOUT:          "bg-gray-100 text-gray-800",
    PASSWORD_CHANGE: "bg-orange-100 text-orange-800",
    PASSWORD_RESET:  "bg-yellow-100 text-yellow-800",
    VIEW:            "bg-cyan-100 text-cyan-800",
    EXPORT:          "bg-indigo-100 text-indigo-800",
    IMPORT:          "bg-pink-100 text-pink-800",
  }[action] || "bg-gray-100 text-gray-800";
};
```

## Responsive Design

```
┌─────────────────────────────────────────────────────────┐
│                   BREAKPOINTS                           │
├─────────────────────────────────────────────────────────┤
│ Mobile  (< 768px)  - Stacked filters, scrollable table │
│ Tablet  (768-1024) - 2-column filters                  │
│ Desktop (> 1024px) - 4-column filters, full table      │
└─────────────────────────────────────────────────────────┘
```

## Key Features Implementation

### 1. Filtering
```javascript
// State management
const [filters, setFilters] = useState({
  action: "",
  entity: "",
  startDate: "",
  endDate: "",
  page: 1,
  limit: 50,
});

// Filter change handler
const handleFilterChange = (key, value) => {
  setFilters(prev => ({
    ...prev,
    [key]: value,
    page: 1, // Reset pagination
  }));
};
```

### 2. Pagination
```javascript
// Pagination component
{pagination.totalPages > 1 && (
  <div className="pagination-controls">
    <Button 
      onClick={() => handlePageChange(currentPage - 1)}
      disabled={!hasPrevPage}
    >
      <ChevronLeft /> Trước
    </Button>
    <Button 
      onClick={() => handlePageChange(currentPage + 1)}
      disabled={!hasNextPage}
    >
      Sau <ChevronRight />
    </Button>
  </div>
)}
```

### 3. Detail View
```javascript
// Detail dialog trigger
<Button onClick={() => handleViewDetail(log)}>
  <Eye /> Chi tiết
</Button>

// Dialog content
<Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
  <DialogContent>
    {/* Display all log details */}
  </DialogContent>
</Dialog>
```

### 4. Date Formatting
```javascript
import { format } from "date-fns";
import { vi } from "date-fns/locale";

const formatDate = (dateString) => {
  return format(
    new Date(dateString), 
    "dd/MM/yyyy HH:mm:ss", 
    { locale: vi }
  );
};
```

## Performance Optimizations

1. **React Query Caching** - Automatic data caching
2. **keepPreviousData** - Smooth transitions between pages
3. **Lazy Loading** - Detail dialog only renders when opened
4. **Pagination** - Limits data loaded per page (50 items)
5. **Memoization** - useMemo for expensive computations (if needed)

## Error Handling

```javascript
// Loading state
{isLoading && <Loader2 className="animate-spin" />}

// Empty state
{!isLoading && logs.length === 0 && (
  <div className="empty-state">
    <FileText />
    <p>Không có nhật ký</p>
  </div>
)}

// Error state (from React Query)
{isError && (
  <div className="error-state">
    <p>Có lỗi xảy ra khi tải dữ liệu</p>
  </div>
)}
```

## Accessibility

- ✅ Semantic HTML structure
- ✅ ARIA labels on interactive elements
- ✅ Keyboard navigation support
- ✅ Screen reader friendly
- ✅ Focus management in dialogs
- ✅ Color contrast compliance

---

**Last Updated**: November 15, 2025

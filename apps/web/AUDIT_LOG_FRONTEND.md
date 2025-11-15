# Audit Log Frontend Implementation

## Overview

This document describes the frontend implementation for viewing and managing audit logs in the PharmaFlow application.

## Files Created

### 1. Service Layer (`apps/web/src/services/auditService.js`)

API service functions for interacting with the audit log endpoints:

- `getAuditLogs(filters)` - Fetch audit logs with filtering and pagination
- `getAuditLogById(id)` - Fetch a single audit log by ID
- `getAuditLogsByEntity(entity, entityId)` - Fetch logs for a specific entity
- `getAuditLogsByUser(userId, limit)` - Fetch logs for a specific user
- `getAuditStatistics(startDate, endDate)` - Fetch audit statistics
- `cleanupAuditLogs(daysToKeep)` - Cleanup old audit logs (admin only)

### 2. React Hooks (`apps/web/src/hooks/useAuditLogs.js`)

Custom React Query hooks for managing audit log data:

- `useAuditLogs(filters)` - Hook for fetching audit logs with filters
- `useAuditLog(id)` - Hook for fetching a single audit log
- `useAuditLogsByEntity(entity, entityId)` - Hook for entity-specific logs
- `useAuditLogsByUser(userId, limit)` - Hook for user-specific logs
- `useAuditStatistics(startDate, endDate)` - Hook for audit statistics
- `useCleanupAuditLogs()` - Mutation hook for cleanup operations

### 3. Main Page Component (`apps/web/src/pages/AuditLogPage.jsx`)

Complete audit log viewer with features:

- **Filtering**: Filter by action type, entity type, date range
- **Table View**: Display audit logs in a sortable table
- **Pagination**: Navigate through pages of audit logs
- **Detail View**: Click to view detailed information about each log entry
- **Refresh**: Manual refresh button to reload data
- **Color-coded Actions**: Visual distinction between different action types

### 4. Routing Configuration (`apps/web/src/App.jsx`)

Added route for audit log page:
```jsx
<Route
  path="/audit-logs"
  element={
    <ProtectedRoute>
      <AuditLogPage />
    </ProtectedRoute>
  }
/>
```

### 5. Sidebar Navigation (`apps/web/src/config/sidebar-config.js`)

Added audit log link to sidebar for owner role.

## Features

### Filter Options

1. **Action Type**: Filter by CREATE, UPDATE, DELETE, LOGIN, LOGOUT, etc.
2. **Entity Type**: Filter by user, medication, sale, purchase order, etc.
3. **Date Range**: Filter by start date and end date
4. **Pagination**: Configurable page size (default: 50 per page)

### Action Types with Color Coding

- **CREATE** - Green badge
- **UPDATE** - Blue badge
- **DELETE** - Red badge
- **LOGIN** - Purple badge
- **LOGOUT** - Gray badge
- **PASSWORD_CHANGE** - Orange badge
- **PASSWORD_RESET** - Yellow badge
- **VIEW** - Cyan badge
- **EXPORT** - Indigo badge
- **IMPORT** - Pink badge

### Entity Types Supported

- Auth (Xác thực)
- User (Người dùng)
- Customer (Khách hàng)
- Medication (Thuốc)
- Medication Variant (Biến thể thuốc)
- Supplier (Nhà cung cấp)
- Purchase Order (Đơn đặt hàng)
- Purchase Receipt (Phiếu nhập hàng)
- Inventory (Kho hàng)
- Sale (Đơn bán hàng)
- Warehouse Zone (Khu vực kho)
- Warehouse Rack (Giá kệ)
- Warehouse Bin (Ngăn lưu trữ)
- Report (Báo cáo)
- File (Tệp tin)

### Detail Dialog

When clicking "Chi tiết" (Detail) on any log entry, a dialog displays:

- Timestamp
- User information (name, email)
- Action type with badge
- Entity type
- Entity ID
- Log ID
- Changes (JSON formatted)

## Usage

### Accessing the Page

1. Login as an owner-role user
2. Navigate to **"Nhật ký kiểm toán"** in the sidebar
3. Or go directly to `/audit-logs`

### Filtering Logs

1. Use the filter section at the top
2. Select action type and/or entity type from dropdowns
3. Set date range if needed
4. Filters apply automatically and reset pagination to page 1

### Viewing Details

1. Click the "Chi tiết" button on any log entry
2. View complete information in the modal
3. See JSON-formatted changes if available
4. Close modal to return to list

### Pagination

- Use "Trước" (Previous) and "Sau" (Next) buttons to navigate
- Current page and total pages shown at bottom
- Pagination state preserved when filtering

## API Integration

The frontend connects to these backend endpoints:

- `GET /api/audit-logs` - List with filters
- `GET /api/audit-logs/:id` - Get by ID
- `GET /api/audit-logs/entity/:entity/:entityId` - By entity
- `GET /api/audit-logs/user/:userId` - By user
- `GET /api/audit-logs/statistics` - Statistics
- `DELETE /api/audit-logs/cleanup` - Cleanup (admin)

## Security

- All routes are protected with `ProtectedRoute` component
- Only authenticated users can access
- Sidebar menu only shows for owner role
- Backend enforces additional access control

## Technical Details

### State Management

- React Query for server state management
- Local state for UI (filters, dialogs, pagination)
- Automatic caching and background refetching

### Dependencies

- `@tanstack/react-query` - Data fetching and caching
- `lucide-react` - Icons
- `date-fns` - Date formatting
- `sonner` - Toast notifications (if needed)
- Shadcn/ui components (Table, Card, Dialog, Badge, etc.)

### Performance

- Pagination reduces load (50 items per page default)
- React Query caching prevents unnecessary requests
- keepPreviousData option for smooth transitions
- Lazy loading of detail dialogs

## Future Enhancements

Potential improvements:

1. **Export Functionality**: Export filtered logs to CSV/Excel
2. **Advanced Search**: Full-text search in changes field
3. **Statistics Dashboard**: Visualize audit data with charts
4. **Real-time Updates**: WebSocket for live log updates
5. **Bulk Actions**: Select multiple logs for operations
6. **User Filtering**: Search by username/email
7. **Entity Quick Links**: Click entity ID to navigate to entity detail

## Testing

To test the audit log view:

1. **Login/Logout**: Perform login/logout and check logs
2. **CRUD Operations**: Create, update, delete entities and verify logs
3. **Filter Testing**: Test all filter combinations
4. **Pagination**: Test navigation between pages
5. **Detail View**: Verify all information displays correctly
6. **Date Formatting**: Check dates display in correct format
7. **Responsive Design**: Test on different screen sizes

## Troubleshooting

### No logs appearing

- Check that audit logging is enabled in backend
- Verify user has owner role
- Check API endpoint is accessible
- Review browser console for errors

### Filters not working

- Clear date inputs and try again
- Check that selected values are valid
- Verify API accepts filter parameters

### Performance issues

- Reduce page size limit
- Apply more specific filters
- Check network tab for slow requests
- Consider adding indexes to database

## Related Documentation

- [Backend Audit Log Guide](../../../api/AUDIT_LOG_GUIDE.md)
- [Audit Log Implementation](../../../api/AUDIT_LOG_IMPLEMENTATION.md)
- [API Documentation](../../../docs/ai/API_DOCUMENTATION.md)

---

**Created**: November 15, 2025  
**Version**: 1.0  
**Status**: ✅ Complete

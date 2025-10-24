# Audit Log System Documentation

## Overview

The audit log system provides comprehensive tracking of user actions throughout the application. It automatically logs important operations including authentication events, CRUD operations, and other critical actions.

## Features

- **Automatic Logging**: Middleware-based automatic logging for routes
- **Manual Logging**: Service-based logging for complex operations
- **Query & Filter**: Advanced filtering and pagination for audit logs
- **Statistics**: Aggregated statistics by action type and entity
- **User Context**: Automatically associates actions with authenticated users
- **Change Tracking**: Stores before/after values for updates
- **Maintenance**: Automated cleanup of old logs

## Database Schema

The audit logs are stored in the `audit_logs` table with the following structure:

```javascript
{
  id: UUID (Primary Key),
  userId: UUID (Foreign Key to users table, nullable),
  action: VARCHAR(100) - Action type (CREATE, UPDATE, DELETE, etc.),
  entity: VARCHAR(100) - Entity type (user, medication, sale, etc.),
  entityId: UUID (nullable) - ID of the affected entity,
  changes: JSONB (nullable) - Details of what changed,
  createdAt: TIMESTAMP - When the action occurred
}
```

## Action Types

The following action types are supported:

- `CREATE` - Entity creation
- `UPDATE` - Entity update
- `DELETE` - Entity deletion
- `LOGIN` - User login
- `LOGOUT` - User logout
- `PASSWORD_CHANGE` - Password change
- `PASSWORD_RESET` - Password reset
- `VIEW` - Entity view (for sensitive data)
- `EXPORT` - Data export
- `IMPORT` - Data import

## Entity Types

Supported entity types include:

- `auth` - Authentication events
- `user` - User management
- `customer` - Customer management
- `medication` - Medication management
- `medication_variant` - Medication variant management
- `supplier` - Supplier management
- `supplier_medication` - Supplier medication relationships
- `purchase_order` - Purchase orders
- `purchase_receipt` - Purchase receipts
- `inventory` - Inventory operations
- `sale` - Sales orders
- `warehouse_zone` - Warehouse zones
- `warehouse_rack` - Warehouse racks
- `warehouse_bin` - Warehouse bins
- `report` - Report generation
- `file` - File operations

## Usage

### 1. Automatic Logging with Middleware

The easiest way to add audit logging is using the middleware:

```javascript
import { createAuditLog } from "../middleware/auditLog.js";

// For basic CRUD operations
router.post(
  "/",
  authenticate,
  createAuditLog("CREATE", "medication"),
  controller.create
);

router.put(
  "/:id",
  authenticate,
  createAuditLog("UPDATE", "medication"),
  controller.update
);

router.delete(
  "/:id",
  authenticate,
  createAuditLog("DELETE", "medication"),
  controller.delete
);
```

### 2. Authentication Logging

Special middleware for authentication events:

```javascript
import {
  auditLogin,
  auditLogout,
  auditPasswordChange,
} from "../middleware/auditLog.js";

// Login
router.post("/login", auditLogin, authController.login);

// Logout
router.post("/logout", authenticate, auditLogout, authController.logout);

// Password change
router.post(
  "/change-password",
  authenticate,
  auditPasswordChange,
  authController.changePassword
);
```

### 3. Manual Logging in Services

For complex operations or service-level logging:

```javascript
import { auditService } from "../services/auditService.js";

async function complexOperation(userId, data) {
  // ... perform operation ...

  // Log the action
  await auditService.log({
    userId,
    action: "UPDATE",
    entity: "medication",
    entityId: medication.id,
    changes: {
      before: oldValues,
      after: newValues,
    },
  });
}
```

### 4. Custom Extractors

For complex scenarios, provide custom extractors:

```javascript
router.post(
  "/complex",
  authenticate,
  createAuditLog("CREATE", "custom_entity", {
    getEntityId: (req, res, data) => {
      // Extract entity ID from response
      return JSON.parse(data).data.customId;
    },
    getChanges: (req, res, data) => {
      // Extract relevant changes
      return {
        created: req.body,
        metadata: { source: "api" },
      };
    },
  }),
  controller.complexOperation
);
```

## API Endpoints

### Get All Audit Logs

```http
GET /api/audit-logs
```

**Query Parameters:**

- `userId` - Filter by user ID
- `action` - Filter by action type
- `entity` - Filter by entity type
- `entityId` - Filter by entity ID
- `startDate` - Filter by start date (ISO 8601)
- `endDate` - Filter by end date (ISO 8601)
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)

**Response:**

```json
{
  "success": true,
  "message": "Audit logs retrieved successfully",
  "data": [
    {
      "id": "uuid",
      "userId": "uuid",
      "action": "CREATE",
      "entity": "medication",
      "entityId": "uuid",
      "changes": { ... },
      "createdAt": "2025-10-23T10:00:00Z",
      "user": {
        "id": "uuid",
        "username": "john.doe",
        "email": "john@example.com",
        "firstName": "John",
        "lastName": "Doe"
      }
    }
  ],
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 50,
    "totalPages": 2
  }
}
```

### Get Audit Log by ID

```http
GET /api/audit-logs/:id
```

**Response:**

```json
{
  "success": true,
  "message": "Audit log retrieved successfully",
  "data": { ... }
}
```

### Get Audit Logs for an Entity

```http
GET /api/audit-logs/entity/:entity/:entityId
```

**Example:**

```http
GET /api/audit-logs/entity/medication/123e4567-e89b-12d3-a456-426614174000
```

### Get Audit Logs for a User

```http
GET /api/audit-logs/user/:userId
```

**Query Parameters:**

- `limit` - Maximum number of logs to return (default: 100)

### Get Audit Statistics

```http
GET /api/audit-logs/statistics
```

**Query Parameters:**

- `startDate` - Start date for statistics (ISO 8601)
- `endDate` - End date for statistics (ISO 8601)

**Response:**

```json
{
  "success": true,
  "message": "Audit statistics retrieved successfully",
  "data": {
    "total": 1000,
    "byAction": [
      { "action": "CREATE", "count": 300 },
      { "action": "UPDATE", "count": 400 },
      { "action": "DELETE", "count": 100 },
      { "action": "LOGIN", "count": 200 }
    ],
    "byEntity": [
      { "entity": "medication", "count": 450 },
      { "entity": "sale", "count": 300 },
      { "entity": "user", "count": 250 }
    ]
  }
}
```

### Cleanup Old Audit Logs (Admin Only)

```http
DELETE /api/audit-logs/cleanup?daysToKeep=90
```

**Query Parameters:**

- `daysToKeep` - Number of days of logs to keep (default: 90)

**Response:**

```json
{
  "success": true,
  "message": "Successfully deleted 500 old audit logs",
  "data": {
    "deletedCount": 500,
    "daysKept": 90
  }
}
```

## Security Considerations

1. **Authentication Required**: All audit log endpoints require authentication
2. **Admin Access Recommended**: Most endpoints should be restricted to admin/owner roles
3. **Self-Access**: Users can view their own audit logs
4. **No Modification**: Audit logs cannot be modified or deleted individually (only bulk cleanup)
5. **Automatic Logging**: Audit logging failures don't break main operations (fail silently)

## Best Practices

1. **Use Middleware**: Prefer automatic middleware logging over manual logging
2. **Meaningful Changes**: Include relevant before/after values in changes object
3. **Entity IDs**: Always include entity IDs when available
4. **Context Information**: Add IP addresses, user agents, or other context in changes
5. **Regular Cleanup**: Schedule periodic cleanup of old logs (recommended: 90 days)
6. **Sensitive Data**: Don't log passwords or other sensitive data in changes
7. **Performance**: Audit logging is async and won't block responses

## Examples

### Example 1: Login Audit Log

```json
{
  "userId": "user-uuid",
  "action": "LOGIN",
  "entity": "auth",
  "changes": {
    "ip": "192.168.1.1",
    "userAgent": "Mozilla/5.0..."
  }
}
```

### Example 2: Medication Creation

```json
{
  "userId": "user-uuid",
  "action": "CREATE",
  "entity": "medication",
  "entityId": "medication-uuid",
  "changes": {
    "created": {
      "name": "Aspirin",
      "genericName": "Acetylsalicylic Acid",
      "dosageForm": "tablet"
    }
  }
}
```

### Example 3: User Update

```json
{
  "userId": "admin-uuid",
  "action": "UPDATE",
  "entity": "user",
  "entityId": "target-user-uuid",
  "changes": {
    "updated": {
      "role": "manager",
      "status": "active"
    }
  }
}
```

### Example 4: Sale Deletion

```json
{
  "userId": "owner-uuid",
  "action": "DELETE",
  "entity": "sale",
  "entityId": "sale-uuid",
  "changes": null
}
```

## Monitoring & Maintenance

### Regular Tasks

1. **Review Logs**: Regularly review audit logs for suspicious activity
2. **Storage Management**: Monitor database size and plan for log archival
3. **Cleanup Schedule**: Set up automated cleanup (e.g., monthly cron job)
4. **Statistics Review**: Use statistics endpoint to identify trends

### Automated Cleanup

You can set up a cron job or scheduled task to clean up old logs:

```javascript
import { auditService } from "./services/auditService.js";

// Run daily to keep only last 90 days
async function dailyCleanup() {
  const deletedCount = await auditService.deleteOldLogs(90);
  console.log(`Deleted ${deletedCount} old audit logs`);
}
```

## Integration with Existing Code

The audit log system has been integrated into the following routes:

### Authentication Routes

- Login (with audit log)
- Logout (with audit log)
- Password change (with audit log)
- Password reset via OTP (with audit log)

### User Routes

- Create user (with audit log)
- Update user (with audit log)
- Delete user (with audit log)

### Medication Routes

- Create medication (with audit log)
- Update medication (with audit log)
- Delete medication (with audit log)

### Sales Routes

- Create sale (with audit log)
- Update sale (with audit log)
- Delete/Cancel sale (with audit log)

## Troubleshooting

### Audit logs not being created

1. Check that the middleware is properly attached to the route
2. Verify the route is returning 2xx status codes
3. Check server logs for any audit service errors
4. Ensure the user is authenticated (userId should be available)

### Missing entity IDs

1. Verify the entity ID is available in `req.params.id`
2. Use custom `getEntityId` function if ID is in a different location
3. Check that the controller is returning the created entity with ID

### Performance issues

1. Audit logging is async and shouldn't block requests
2. Check database indexes on `audit_logs` table
3. Consider archiving old logs to a separate table
4. Monitor the size of the `changes` JSONB field

## Future Enhancements

Potential improvements for the audit log system:

1. **Real-time Notifications**: Alert admins of critical actions
2. **Log Archival**: Automatic archiving to cold storage
3. **Advanced Search**: Full-text search in changes field
4. **Compliance Reports**: Pre-built compliance reports
5. **Log Export**: Export logs in various formats (CSV, PDF)
6. **Retention Policies**: Configurable retention by entity type
7. **Anomaly Detection**: Identify unusual patterns

## Conclusion

The audit log system provides comprehensive tracking of all important actions in your application. Use it to maintain security, compliance, and accountability throughout your system.

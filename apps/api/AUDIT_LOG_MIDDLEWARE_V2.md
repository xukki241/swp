# Audit Log Middleware Improvements

## 🎯 Overview

Enhanced audit log middleware with better error handling, security features, and comprehensive tracking capabilities.

## ✨ Key Improvements

### 1. **Enhanced Error Handling**

- ✅ Prevents duplicate logging with `isLogged` flag
- ✅ Better error messages with structured logging
- ✅ Graceful failure - errors don't break main operations
- ✅ Overrides both `res.send()` and `res.json()` for comprehensive coverage

### 2. **Security Enhancements**

- ✅ Automatic redaction of sensitive fields (passwords, tokens, API keys)
- ✅ Configurable field exclusion via `excludeFields` option
- ✅ Sensitive data filtering in all change tracking
- ✅ Failed login attempt tracking

### 3. **Improved Data Extraction**

- ✅ Smart response parsing (handles JSON and objects)
- ✅ Better entity ID extraction from multiple sources
- ✅ Comprehensive metadata collection (IP, user agent, method, path)
- ✅ Action-specific change extraction

### 4. **New Features**

- ✅ `auditPasswordReset` - Track password reset requests
- ✅ `logAuditBatch` - Batch logging for bulk operations
- ✅ Failed authentication tracking
- ✅ Timestamps in all audit logs
- ✅ Success/failure indicators

### 5. **Customization Options**

- ✅ `skipOnError` - Control error logging behavior
- ✅ `shouldLog` - Custom function to determine if logging should occur
- ✅ `excludeFields` - Exclude specific fields from logging
- ✅ Async-safe custom extractors

## 📋 API Reference

### `createAuditLog(action, entity, options)`

Main audit middleware with enhanced features.

**Parameters:**

- `action` (string): Action type (CREATE, UPDATE, DELETE, etc.)
- `entity` (string): Entity type (user, medication, sale, etc.)
- `options` (object):
  - `getEntityId` (function): Custom entity ID extractor
  - `getChanges` (function): Custom changes extractor
  - `skipOnError` (boolean): Skip logging on error responses
  - `shouldLog` (function): Custom logging condition
  - `excludeFields` (array): Fields to exclude from logging

**Example:**

```javascript
router.put(
  "/:id",
  authenticate,
  createAuditLog("UPDATE", "medication", {
    excludeFields: ["internalNotes", "costPrice"],
    getEntityId: (req) => req.params.id,
    shouldLog: (req, res) => res.statusCode === 200,
  }),
  controller.update
);
```

### `auditLogin(req, res, next)`

Enhanced login tracking with failed attempts.

**Features:**

- Tracks successful logins
- Logs failed login attempts
- Records email/username used
- Captures IP and user agent
- Timestamp tracking

**Example:**

```javascript
router.post("/login", auditLogin, authController.login);
```

### `auditLogout(req, res, next)`

Enhanced logout tracking.

**Features:**

- User identification
- IP tracking
- User agent capture
- Timestamp

**Example:**

```javascript
router.post("/logout", authenticate, auditLogout, authController.logout);
```

### `auditPasswordChange(req, res, next)`

Enhanced password change tracking.

**Features:**

- Tracks success/failure
- Differentiates between change and reset
- Records IP and user agent
- Timestamp tracking

**Example:**

```javascript
router.post(
  "/change-password",
  authenticate,
  auditPasswordChange,
  authController.changePassword
);
```

### `auditPasswordReset(req, res, next)`

**NEW** - Track password reset requests.

**Features:**

- Logs reset requests
- Captures email address
- Records IP and user agent
- Timestamp tracking

**Example:**

```javascript
router.post("/reset-password", auditPasswordReset, authController.requestReset);
```

### `logAudit(auditData)`

Manual audit logging helper.

**Parameters:**

- `auditData` (object): Audit log data
  - `userId` (string)
  - `action` (string)
  - `entity` (string)
  - `entityId` (string, optional)
  - `changes` (object, optional)

**Example:**

```javascript
import { logAudit } from "../middleware/auditLog.js";

await logAudit({
  userId: req.user.id,
  action: "EXPORT",
  entity: "report",
  entityId: report.id,
  changes: {
    format: "PDF",
    filters: req.query,
  },
});
```

### `logAuditBatch(auditDataArray)`

**NEW** - Batch logging for multiple operations.

**Parameters:**

- `auditDataArray` (array): Array of audit data objects

**Returns:**

- Promise with results array

**Example:**

```javascript
import { logAuditBatch } from "../middleware/auditLog.js";

const auditLogs = items.map((item) => ({
  userId: req.user.id,
  action: "CREATE",
  entity: "inventory_item",
  entityId: item.id,
  changes: { created: item },
}));

await logAuditBatch(auditLogs);
```

## 🔒 Security Features

### Automatic Field Redaction

Sensitive fields are automatically redacted:

```javascript
const sensitiveFields = [
  "password",
  "passwordHash",
  "token",
  "refreshToken",
  "secret",
  "apiKey",
  ...excludeFields, // Custom fields
];
```

**Before:**

```json
{
  "email": "user@example.com",
  "password": "mySecretPassword",
  "token": "abc123xyz"
}
```

**After:**

```json
{
  "email": "user@example.com",
  "password": "[REDACTED]",
  "token": "[REDACTED]"
}
```

### Failed Login Tracking

Failed login attempts are now logged:

```json
{
  "userId": null,
  "action": "LOGIN",
  "entity": "auth",
  "changes": {
    "email": "attacker@example.com",
    "ip": "192.168.1.100",
    "success": false,
    "statusCode": 401
  }
}
```

## 📊 Change Tracking by Action

### CREATE

```json
{
  "created": {
    /* full entity data */
  },
  "input": {
    /* request body */
  },
  "metadata": {
    /* request metadata */
  }
}
```

### UPDATE

```json
{
  "updates": {
    /* fields being updated */
  },
  "before": {
    /* old values (if available) */
  },
  "after": {
    /* new values */
  },
  "metadata": {
    /* request metadata */
  }
}
```

### DELETE

```json
{
  "deletedId": "uuid",
  "deletedEntity": {
    /* entity data before deletion */
  },
  "metadata": {
    /* request metadata */
  }
}
```

### EXPORT

```json
{
  "exportType": "PDF",
  "filters": {
    /* query parameters */
  },
  "metadata": {
    /* request metadata */
  }
}
```

### IMPORT

```json
{
  "itemCount": 150,
  "source": "CSV upload",
  "metadata": {
    /* request metadata */
  }
}
```

## 🚀 Usage Examples

### Basic Usage

```javascript
import { createAuditLog } from "../middleware/auditLog.js";

router.post(
  "/medications",
  authenticate,
  createAuditLog("CREATE", "medication"),
  medicationController.create
);
```

### Advanced Usage with Options

```javascript
router.put(
  "/medications/:id",
  authenticate,
  createAuditLog("UPDATE", "medication", {
    excludeFields: ["internalNotes", "costPrice"],
    getEntityId: (req) => req.params.id,
    getChanges: (req, res, data) => ({
      before: req.oldMedication,
      after: data?.data,
      fields: Object.keys(req.body),
    }),
    shouldLog: (req, res) => res.statusCode === 200,
  }),
  medicationController.update
);
```

### Storing Old Values for UPDATE Tracking

```javascript
// In your controller middleware
export const loadMedication = async (req, res, next) => {
  try {
    const medication = await medicationService.getById(req.params.id);
    req.oldValues = medication; // Store for audit log
    next();
  } catch (error) {
    next(error);
  }
};

// In routes
router.put(
  "/:id",
  authenticate,
  loadMedication, // Load before update
  createAuditLog("UPDATE", "medication"),
  controller.update
);
```

### Batch Operations

```javascript
// In your service/controller
const results = await bulkCreateMedications(medications);

const auditLogs = results.map((med) => ({
  userId: req.user.id,
  action: "CREATE",
  entity: "medication",
  entityId: med.id,
  changes: { created: med },
}));

await logAuditBatch(auditLogs);
```

## 🎯 Best Practices

### 1. Always Use Middleware for Routes

```javascript
// ✅ Good
router.post(
  "/",
  authenticate,
  createAuditLog("CREATE", "user"),
  controller.create
);

// ❌ Avoid manual logging unless necessary
router.post("/", authenticate, async (req, res) => {
  const user = await createUser(req.body);
  await logAudit({
    /* ... */
  }); // Only if middleware can't be used
  res.json(user);
});
```

### 2. Store Old Values for UPDATE Operations

```javascript
// ✅ Good - Store old values
router.put(
  "/:id",
  loadEntity,
  createAuditLog("UPDATE", "entity"),
  controller.update
);

// ❌ Missing context - can't see what changed
router.put("/:id", createAuditLog("UPDATE", "entity"), controller.update);
```

### 3. Use Batch Logging for Bulk Operations

```javascript
// ✅ Good - Single batch call
await logAuditBatch(auditDataArray);

// ❌ Avoid - Multiple individual calls
for (const item of items) {
  await logAudit(auditData); // Slow!
}
```

### 4. Exclude Sensitive Fields

```javascript
// ✅ Good - Exclude sensitive data
createAuditLog("UPDATE", "user", {
  excludeFields: ["internalNotes", "costPrice", "profitMargin"],
});

// ❌ Risk - Logging sensitive data
createAuditLog("UPDATE", "user"); // Logs everything
```

## 📈 Performance Considerations

1. **Asynchronous Logging**: Uses `setImmediate()` - doesn't block responses
2. **Batch Operations**: Use `logAuditBatch()` for bulk operations
3. **Smart Extraction**: Only parses response data when needed
4. **Duplicate Prevention**: `isLogged` flag prevents multiple log entries
5. **Error Isolation**: Failed logging doesn't affect main operations

## 🔍 Monitoring

Enhanced logging includes structured error messages:

```javascript
logger.error("Failed to create audit log in middleware:", {
  error: error.message,
  action,
  entity,
  userId: req.user?.id,
});
```

## 🧪 Testing

Test your audit logs:

```javascript
// Test successful operation
const res = await request(app)
  .post("/api/medications")
  .set("Authorization", `Bearer ${token}`)
  .send(medicationData);

// Check audit log was created
const logs = await auditService.getAll({
  action: "CREATE",
  entity: "medication",
});
expect(logs.data).toHaveLength(1);
expect(logs.data[0].userId).toBe(userId);
```

## 📚 Migration Guide

### From Old to New Middleware

**Old:**

```javascript
createAuditLog("UPDATE", "medication");
```

**New (same usage, better features):**

```javascript
createAuditLog("UPDATE", "medication", {
  excludeFields: ["sensitiveField"],
  shouldLog: (req, res) => res.statusCode === 200,
});
```

**New password reset tracking:**

```javascript
// Add this to your routes
router.post("/forgot-password", auditPasswordReset, controller.forgotPassword);
```

## ✅ Checklist

- [ ] All routes have audit logging
- [ ] Sensitive fields are excluded
- [ ] Old values stored for UPDATE operations
- [ ] Batch logging used for bulk operations
- [ ] Failed logins are tracked
- [ ] Password resets are logged
- [ ] Custom extractors implemented where needed
- [ ] Tests verify audit logs are created

---

**Updated**: November 15, 2025  
**Version**: 2.0  
**Status**: ✅ Production Ready

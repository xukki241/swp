# UUID Migration Guide

## Overview

Database đã chuyển từ `bigint` (auto-increment) sang `uuid` (v7) cho tất cả primary keys.

## Breaking Changes

### 1. ID Type Change

- **Before**: `bigint` (number)
- **After**: `uuid` (string)

### 2. Controller Changes Required

#### ❌ OLD CODE (BigInt)

```javascript
const id = BigInt(req.params.id);
const currentUserId = BigInt(req.user.userId);
```

#### ✅ NEW CODE (UUID String)

```javascript
const id = req.params.id; // UUID is a string
const currentUserId = req.user.userId; // UUID is a string
```

## Files That Need Updates

### Controllers (High Priority)

- [x] `userController.js` - FIXED ✅
- [x] `medicationController.js` - FIXED ✅
- [x] `medicationVariantController.js` - FIXED ✅ (partial)
- [x] `registrationController.js` - FIXED ✅
- [x] `authController.js` - FIXED ✅
- [x] `supplierController.js` - FIXED ✅
- [x] `supplierMedicationVariantController.js` - FIXED ✅
- [x] `purchaseOrderController.js` - FIXED ✅
- [ ] `customerController.js`
- [ ] `inventoryController.js`
- [ ] `salesOrderController.js`

### Services

- [x] `userService.js` - Clean (no BigInt) ✅
- [x] `authService.js` - Clean (no BigInt) ✅
- [x] `supplierService.js` - FIXED ✅ (removed Number() from medicationVariantId)
- [ ] Check remaining service files for BigInt conversions

### Frontend

- [ ] No changes needed (already using strings)
- [ ] Verify ID comparisons use string equality

## Search Patterns

### Find BigInt usages:

```bash
grep -r "BigInt(" apps/api/src/controllers/
grep -r "BigInt(" apps/api/src/services/
```

### Replace pattern:

```
// OLD
const id = BigInt(req.params.id);

// NEW
const id = req.params.id; // UUID is a string
```

## Testing Checklist

After fixing each controller:

- [ ] User management (CRUD)
- [ ] User registration approval
- [ ] Medication management
- [ ] Customer management
- [ ] Supplier management
- [ ] Inventory tracking
- [ ] Purchase orders
- [ ] Sales orders (POS)

## Common Mistakes to Avoid

### ❌ Don't do this:

```javascript
// Don't convert UUID to number
const id = parseInt(req.params.id); // WRONG!

// Don't use === with mixed types
if (userId === 123) // WRONG!
```

### ✅ Do this:

```javascript
// Keep as string
const id = req.params.id;

// Use string comparison
if (userId === anotherUserId) // Correct (both strings)
```

## Migration Status

### Completed ✅

- Database schema updated to UUID
- **User Management Flow** (100%):
  - `userController.js` ✅
  - `authController.js` ✅
  - `registrationController.js` ✅
  - `checkAuth.js` middleware ✅
  - `userService.js` ✅
  - `authService.js` ✅
- **Medication Management Flow** (95%):
  - `medicationController.js` ✅
  - `medicationVariantController.js` ✅ (3 BigInt(medicationId) còn lại)
- **Supplier Management Flow** (100%):
  - `supplierController.js` ✅
  - `supplierMedicationVariantController.js` ✅
  - `supplierService.js` ✅
  - `purchaseOrderController.js` ✅

### In Progress 🔄

- Customer management
- Inventory management
- Sales orders (POS)

### Pending ⏳

- Integration testing
- Update API documentation
- Update Postman collection

## Notes

- UUID v7 provides time-ordered IDs (good for indexing)
- UUIDs are globally unique (no conflicts)
- String comparison is safe and efficient
- No need to convert - keep as strings throughout

## Rollback Plan

If issues occur:

1. Database backup exists before migration
2. Revert schema to bigint
3. Restore BigInt() conversions in controllers
4. Re-deploy

---

**Last Updated**: October 14, 2025
**Status**: In Progress

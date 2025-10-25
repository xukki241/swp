# Sales Enums Update - October 24, 2025

## Summary

Updated sales order enums to only support the required payment methods and statuses.

## Changes Made

### 1. Payment Methods (Reduced from 4 to 2)

**Before:**

```javascript
salesOrderPaymentMethodEnum = z.enum([
  "cash",
  "bank_transfer",
  "credit_card",
  "mobile_payment",
]);
```

**After:**

```javascript
salesOrderPaymentMethodEnum = z.enum([
  "cash",
  "mobile_payment", // VietQR
]);
```

### 2. Order Status (Reduced from 4 to 3)

**Before:**

```javascript
salesOrderStatusEnum = z.enum(["pending", "paid", "delivered", "cancelled"]);
```

**After:**

```javascript
salesOrderStatusEnum = z.enum(["pending", "paid", "cancelled"]);
```

## Files Modified

### Backend

- ✅ `packages/dto/src/core/common/enums.js` - Updated Zod enum schemas

### Frontend

- ✅ `apps/web/src/pages/sales/components/PaymentMethodSelector.jsx` - Display only Cash and VietQR
- ✅ `apps/web/src/pages/sales/SalesOrderDetailPage.jsx` - Removed `delivered` status handling
- ✅ `apps/web/src/pages/sales/SalesOrderListPage.jsx` - Removed `delivered` status handling

## Payment Method Mapping

| Enum Value       | Display Label | Icon     | Description    |
| ---------------- | ------------- | -------- | -------------- |
| `cash`           | Cash          | Banknote | Pay with cash  |
| `mobile_payment` | VietQR        | QrCode   | Scan QR to pay |

## Status Mapping

| Enum Value  | Display Label | Color  | Icon        |
| ----------- | ------------- | ------ | ----------- |
| `pending`   | Pending       | Yellow | Clock       |
| `paid`      | Paid          | Green  | CheckCircle |
| `cancelled` | Cancelled     | Red    | XCircle     |

## Database Note

⚠️ **Important:** The PostgreSQL enum types in the database still contain the old values (`bank_transfer`, `credit_card`, `delivered`). These values are:

- Still present in the database schema
- **NOT used** by the application
- Can be safely ignored

To fully remove them would require:

1. Creating a new enum type
2. Migrating all existing data
3. Dropping the old enum
4. Renaming the new enum

This is not necessary as the DTO validation layer prevents their use.

## Validation

All API endpoints now validate against the new enums:

- `POST /api/sales` - Only accepts `cash` or `mobile_payment`
- `PATCH /api/sales/:id` - Only accepts `pending`, `paid`, or `cancelled`
- Frontend prevents selection of invalid values

## Testing Checklist

- [x] Payment method selector shows only 2 options
- [x] Status colors updated (no `delivered` handling)
- [x] VietQR dialog works with `mobile_payment`
- [x] Backend validation accepts only valid enums
- [x] No TypeScript/ESLint errors
- [x] Order detail page displays correctly
- [x] Order list page displays correctly

## Impact

✅ **No Breaking Changes** for existing data:

- Orders with `bank_transfer`, `credit_card` will still display correctly (fallback to gray badge)
- Orders with `delivered` status will display correctly (fallback to gray badge)
- New orders can only use the 2 payment methods and 3 statuses

## Future Considerations

If you want to completely remove old enum values from database:

```sql
-- 1. Create new enum types
CREATE TYPE sales_order_payment_method_new AS ENUM ('cash', 'mobile_payment');
CREATE TYPE sales_order_status_new AS ENUM ('pending', 'paid', 'cancelled');

-- 2. Update table column types
ALTER TABLE sales_orders
  ALTER COLUMN payment_method TYPE sales_order_payment_method_new
  USING payment_method::text::sales_order_payment_method_new;

ALTER TABLE sales_orders
  ALTER COLUMN status TYPE sales_order_status_new
  USING status::text::sales_order_status_new;

-- 3. Drop old enum types
DROP TYPE sales_order_payment_method;
DROP TYPE sales_order_status;

-- 4. Rename new types
ALTER TYPE sales_order_payment_method_new RENAME TO sales_order_payment_method;
ALTER TYPE sales_order_status_new RENAME TO sales_order_status;
```

⚠️ Only do this if all existing orders use the new enum values!

---

**Updated:** October 24, 2025

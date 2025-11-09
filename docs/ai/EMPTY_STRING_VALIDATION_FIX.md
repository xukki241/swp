# Email/Phone Validation Fix - Summary

## Problem Found 🎯

When submitting a customer creation form with:
```json
{
  "name": "vy",
  "email": "",
  "phone": "0372328467"
}
```

The validation was **FAILING** even though email should be **optional**.

## Root Cause

The issue was with **Zod's validation order**:

1. **Empty string `""`** is submitted for email field
2. Zod's `.email()` validator tries to validate it as an email
3. An empty string is **NOT** a valid email format
4. **Validation fails BEFORE** checking if the field is optional
5. The `.nullable().optional()` check happens AFTER the email format check fails

### Example of the Problem:
```javascript
// ❌ DOESN'T WORK - Empty string fails email validation first
const schema = z.object({
  email: z.email().nullable().optional()
});

schema.safeParse({ email: "" })  // ❌ FAIL
schema.safeParse({ email: null })  // ✅ PASS
schema.safeParse({ email: undefined })  // ✅ PASS (omitted field)
```

## Solution Applied ✅

Use **`.preprocess()`** to convert empty strings to `null` BEFORE validation:

```javascript
export const emailSchema = z.preprocess(
  (val) => (val === "" ? null : val),
  z.email().max(255).nullable().optional()
);
```

This way:
1. Empty string `""` is converted to `null` first
2. Then validated as `null` → passes (nullable)
3. Result: `{ email: null }` (properly stored)

## Changes Made

### File: `packages/dto/src/core/common/base.js`

Updated these schemas with `.preprocess()`:
- `emailSchema` - Converts `""` to `null` before email validation
- `phoneSchema` - Converts `""` to `null` before phone validation  
- `addressSchema` - Converts `""` to `null` before string validation

### Before:
```javascript
export const emailSchema = z.email().max(255).nullable().optional();
export const phoneSchema = z
  .string()
  .regex(/^\d{10}$/, "Phone must be exactly 10 digits")
  .nullable()
  .optional();
export const addressSchema = z.string().nullable().optional();
```

### After:
```javascript
export const emailSchema = z.preprocess(
  (val) => (val === "" ? null : val),
  z.email().max(255).nullable().optional()
);
export const phoneSchema = z.preprocess(
  (val) => (val === "" ? null : val),
  z
    .string()
    .regex(/^\d{10}$/, "Phone must be exactly 10 digits")
    .nullable()
    .optional()
);
export const addressSchema = z.preprocess(
  (val) => (val === "" ? null : val),
  z.string().nullable().optional()
);
```

## Test Results ✅

All scenarios now pass:
```
✅ Only name
✅ Name + email
✅ Name + empty email ← NOW WORKS!
✅ Name + phone
✅ Name + empty phone ← NOW WORKS!
✅ Name + all empty ← NOW WORKS!
✅ Complete data
❌ Invalid phone length (correctly rejects)
❌ Invalid email format (correctly rejects)
```

## Impact

This fix affects all modules that use these schemas:
- ✅ Customer creation/update
- ✅ User registration
- ✅ Supplier management
- ✅ Any other module using `emailSchema`, `phoneSchema`, or `addressSchema`

All empty string fields are now properly converted to `null` in the database, matching the optional field requirements.

## Testing

Users can now:
1. Create customers with just a name ✅
2. Create customers with name + phone (no email) ✅
3. Create customers with name + email (no phone) ✅
4. Leave email/phone fields empty and they become `null` ✅
5. Still get validation errors for invalid email/phone formats ✅


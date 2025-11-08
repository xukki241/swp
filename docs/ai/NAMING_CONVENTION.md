# API Naming Convention - camelCase for Payloads

## ✅ Naming Convention Standard

### Rule: **camelCase for all API payloads (request & response)**

All JSON request and response payloads use **camelCase** for property names.

**snake_case is ONLY used for:**

- Database table names
- Database column names
- Database column aliases in SQL queries

---

## 📋 Updated Schemas

### ✅ Medication Schemas

#### CreateMedication (Request)

**Before (snake_case):**

```json
{
  "name": "Aspirin",
  "is_prescription_required": true,
  "is_controlled_substance": false
}
```

**After (camelCase):**

```json
{
  "name": "Aspirin",
  "isPrescriptionRequired": true,
  "isControlledSubstance": false
}
```

#### UpdateMedication (Request)

Same changes: `is_prescription_required` → `isPrescriptionRequired`, `is_controlled_substance` → `isControlledSubstance`

---

### ✅ Purchase Order Schemas

#### CreatePurchaseOrderItem (Nested in Request)

**Before (snake_case):**

```json
{
  "supplier_medication_variant_id": "uuid",
  "quantity": 100,
  "unit_price": 50000.0
}
```

**After (camelCase):**

```json
{
  "supplierMedicationVariantId": "uuid",
  "quantity": 100,
  "unitPrice": 50000.0
}
```

#### CreatePurchaseOrder (Request)

**Before (snake_case):**

```json
{
  "supplier_id": "uuid",
  "items": [...]
}
```

**After (camelCase):**

```json
{
  "supplierId": "uuid",
  "items": [...]
}
```

---

### ✅ Receipt Schemas

#### CreateReceiptItem (Nested in Request)

**Before (snake_case):**

```json
{
  "purchase_order_item_id": "uuid",
  "quantity": 100,
  "bin_id": "uuid",
  "batch_number": "BATCH-2025-001",
  "manufacture_date": "2025-01-01",
  "expiry_date": "2027-01-01"
}
```

**After (camelCase):**

```json
{
  "purchaseOrderItemId": "uuid",
  "quantity": 100,
  "binId": "uuid",
  "batchNumber": "BATCH-2025-001",
  "manufactureDate": "2025-01-01",
  "expiryDate": "2027-01-01"
}
```

---

## 📊 Complete Property Mapping

### Changed Properties

| Module          | Old (snake_case)                 | New (camelCase)               |
| --------------- | -------------------------------- | ----------------------------- |
| Medications     | `is_prescription_required`       | `isPrescriptionRequired`      |
| Medications     | `is_controlled_substance`        | `isControlledSubstance`       |
| Purchase Orders | `supplier_id`                    | `supplierId`                  |
| Purchase Orders | `supplier_medication_variant_id` | `supplierMedicationVariantId` |
| Purchase Orders | `unit_price`                     | `unitPrice`                   |
| Receipts        | `purchase_order_item_id`         | `purchaseOrderItemId`         |
| Receipts        | `bin_id`                         | `binId`                       |
| Receipts        | `batch_number`                   | `batchNumber`                 |
| Receipts        | `manufacture_date`               | `manufactureDate`             |
| Receipts        | `expiry_date`                    | `expiryDate`                  |

### Already camelCase (No Changes)

These were already using camelCase:

- All response schemas (e.g., `isPrescriptionRequired`, `isActive`, `medicationId`)
- Common schemas (e.g., `sortBy`, `sortOrder`)
- Most existing properties

---

## 🎯 Why camelCase?

### 1. **JavaScript/JSON Standard**

- camelCase is the standard convention in JavaScript and JSON
- Natural for frontend developers
- Consistent with JavaScript object property access

### 2. **API Best Practices**

- Most modern REST APIs use camelCase (Google, Stripe, GitHub, etc.)
- Better readability in JSON payloads
- Matches TypeScript/JavaScript generated types

### 3. **Framework Support**

- Frontend frameworks (React, Vue, Angular) use camelCase
- TypeScript interfaces use camelCase
- OpenAPI/Swagger generators produce camelCase by default

### 4. **Separation of Concerns**

- **API Layer**: camelCase (client-facing)
- **Database Layer**: snake_case (SQL standard)
- Clear distinction between layers

---

## 🔍 Example: Complete Request/Response Flow

### Creating a Medication

**Request (camelCase):**

```json
POST /api/medications
{
  "name": "Aspirin",
  "brand": "Bayer",
  "isPrescriptionRequired": false,
  "isControlledSubstance": false,
  "status": "active"
}
```

**Response (camelCase):**

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "Aspirin",
  "brand": "Bayer",
  "description": null,
  "isPrescriptionRequired": false,
  "isControlledSubstance": false,
  "status": "active"
}
```

**Database (snake_case):**

```sql
INSERT INTO medications (
  id,
  name,
  brand,
  is_prescription_required,
  is_controlled_substance,
  status
) VALUES (...);
```

---

## 📝 Implementation Notes

### DTO Layer (Zod Schemas)

The DTO layer should handle transformation:

- **Input**: Accept camelCase from API
- **Transform**: Convert to snake_case for database
- **Output**: Convert back to camelCase for API response

### Example Transformation:

```javascript
// Request DTO (accepts camelCase)
const createMedicationSchema = z.object({
  isPrescriptionRequired: z.boolean(),
  isControlledSubstance: z.boolean(),
});

// Transform to DB (snake_case)
const dbData = {
  is_prescription_required: input.isPrescriptionRequired,
  is_controlled_substance: input.isControlledSubstance,
};

// Response DTO (outputs camelCase)
const responseSchema = z.object({
  isPrescriptionRequired: z.boolean(),
  isControlledSubstance: z.boolean(),
});
```

---

## ✅ Checklist: Updated Files

- ✅ `components/medications/medication-schemas.yaml`
  - CreateMedication
  - UpdateMedication
- ✅ `components/purchases/order-schemas.yaml`
  - CreatePurchaseOrderItem
  - CreatePurchaseOrder
- ✅ `components/purchases/receipt-schemas.yaml`
  - CreateReceiptItem

---

## 🎓 Best Practices

### DO ✅

- Use camelCase for all API request/response properties
- Use snake_case only in database queries and schema definitions
- Document the convention clearly
- Be consistent across all endpoints

### DON'T ❌

- Mix camelCase and snake_case in API payloads
- Use snake_case in API documentation
- Expose database naming conventions to API clients
- Change naming mid-project without versioning

---

## 🔄 Migration Strategy

For existing APIs with snake_case:

1. **Version the API**: Create v2 with camelCase
2. **Dual Support**: Accept both formats temporarily
3. **Deprecation**: Mark snake_case as deprecated
4. **Sunset**: Remove snake_case support after grace period

For new APIs (like this one):

- Start with camelCase from day one ✅
- No migration needed

---

## 📚 References

- [Google JSON Style Guide](https://google.github.io/styleguide/jsoncstyleguide.xml) - Recommends camelCase
- [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript#naming--camelCase) - camelCase convention
- [REST API Naming Conventions](https://restfulapi.net/resource-naming/) - Best practices

---

**Updated:** 2025-10-16  
**Status:** ✅ Applied to all create/update request schemas

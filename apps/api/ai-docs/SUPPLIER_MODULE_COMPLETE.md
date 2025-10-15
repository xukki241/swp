# Supplier OpenAPI Specification - Implementation Summary

## Overview

Completed OpenAPI specification for all supplier and supplier medication endpoints based on:

- DTO schemas from `packages/dto/src/core/suppliers/supplier.js` and `medication.js`
- Database schemas from `apps/api/src/db/schema/suppliers.js` and `supplierMedicationVariants.js`
- Route definitions from `apps/api/src/routes/supplierRoutes.js` and `supplierMedicationVariantRoutes.js`

## Files Created

### Component Schemas

- **`components/suppliers/supplier-schemas.yaml`**
  - Supplier (main schema)
  - CreateSupplier (for creating suppliers)
  - CreateSuppliersRequest (batch creation array)
  - CreateSuppliersResponse (batch creation response)
  - UpdateSupplier (partial update)
  - SupplierListResponse (paginated list)
  - SupplierMedicationVariant (supplier's medication catalog)
  - CreateSupplierMedication (add medication to supplier)
  - CreateSupplierMedicationsRequest (batch add medications)
  - CreateSupplierMedicationsResponse (batch add response)
  - UpdateSupplierMedication (update supplier medication)
  - SupplierMedicationListResponse (paginated medication list)

### Path Definitions (4 files, 10 operations)

1. **`paths/suppliers/suppliers.yaml`**
   - `GET /suppliers` - List all suppliers with filtering
     - Query params: page, limit, sortBy, sortOrder, name, email, phone, status
   - `POST /suppliers` - Create supplier(s) in batch (Owner only)

2. **`paths/suppliers/suppliers-supplierId.yaml`**
   - `GET /suppliers/{supplierId}` - Get supplier by ID
   - `PATCH /suppliers/{supplierId}` - Update supplier (Owner only)
   - `DELETE /suppliers/{supplierId}` - Delete supplier (Owner only)

3. **`paths/suppliers/suppliers-supplierId-medications.yaml`**
   - `GET /suppliers/{supplierId}/medications` - List medications offered by supplier
   - `POST /suppliers/{supplierId}/medications` - Add medications to supplier catalog (Owner only)

4. **`paths/suppliers/suppliers-supplierId-medications-medicationId.yaml`**
   - `GET /suppliers/{supplierId}/medications/{medicationId}` - Get specific supplier medication
   - `PATCH /suppliers/{supplierId}/medications/{medicationId}` - Update supplier medication (Owner only)
   - `DELETE /suppliers/{supplierId}/medications/{medicationId}` - Remove medication from supplier (Owner only)

### Main OpenAPI File

- **`openapi.yaml`** - Updated to reference all 4 supplier endpoint paths

## Schema Details

### Supplier Object

```yaml
id: UUID (required)
name: string (1-100 chars) (required)
contactName: string (max 100 chars, nullable, optional)
email: string (email format, max 255 chars) (required)
phone: string (10 digits pattern) (required)
address: string (nullable) (required)
status: enum [active, inactive, blacklisted] (required)
```

### SupplierMedicationVariant Object

```yaml
id: UUID (required)
supplierId: UUID (required)
medicationVariantId: UUID (required)
supplierSku: string (max 50 chars, nullable, optional) - Supplier's product code
leadTimeDays: integer (non-negative, nullable, optional) - Delivery lead time
```

### Database Constraints

- Unique email per supplier
- Unique phone per supplier

## Enums

### SupplierStatus

- `active` - Supplier is active and can be used
- `inactive` - Supplier is temporarily inactive
- `blacklisted` - Supplier is blacklisted and should not be used

## Security

- **Authentication**: All endpoints require Bearer token (`bearerAuth`)
- **Authorization**:
  - POST, PATCH, DELETE operations require Owner role
  - GET operations accessible to all authenticated users

## Special Features

### Batch Creation

Both supplier and supplier medication endpoints support batch creation:

- Create multiple suppliers in one request
- Add multiple medications to a supplier in one request

### Nested Routes

Supplier medications are nested under suppliers:

- `/suppliers/{supplierId}/medications` - Logical grouping
- Each supplier has their own medication catalog
- Supports supplier-specific SKUs and lead times

### Supplier Catalog Management

Suppliers can maintain their own medication catalog with:

- **Supplier SKU**: Their internal product code
- **Lead Time**: Days required for delivery from this supplier

## Route Alignment

All OpenAPI endpoints align with the actual API routes:

- ✅ GET /suppliers
- ✅ GET /suppliers/:id
- ✅ POST /suppliers (batch)
- ✅ PATCH /suppliers/:id
- ✅ DELETE /suppliers/:id
- ✅ GET /suppliers/:supplierId/medications
- ✅ GET /suppliers/:supplierId/medications/:id
- ✅ POST /suppliers/:supplierId/medications (batch)
- ✅ PATCH /suppliers/:supplierId/medications/:id
- ✅ DELETE /suppliers/:supplierId/medications/:id

## Response References

All error responses use the "Error" suffix convention:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `ConflictError`
- `InternalServerError`

## Consistency with Existing Patterns

The implementation follows the same patterns as:

- Customers module (CRUD operations and batch creation)
- Medications module (nested resource management)
- Sales module (relationship handling)
- Common components (schemas, parameters, responses, enums)

## Example Requests

### Create Suppliers (Batch)

```json
POST /suppliers
[
  {
    "name": "ABC Pharmaceuticals",
    "contactName": "John Doe",
    "email": "contact@abcpharma.com",
    "phone": "0123456789",
    "address": "123 Medical Plaza, City, Country",
    "status": "active"
  },
  {
    "name": "XYZ Medical Supplies",
    "contactName": "Jane Smith",
    "email": "info@xyzmedical.com",
    "phone": "0987654321",
    "address": "456 Health Avenue, City, Country",
    "status": "active"
  }
]
```

### Add Medications to Supplier

```json
POST /suppliers/{supplierId}/medications
[
  {
    "medication_variant_id": "550e8400-e29b-41d4-a716-446655440000",
    "supplier_sku": "SUP-MED-001",
    "lead_time_days": 7
  },
  {
    "medication_variant_id": "660e8400-e29b-41d4-a716-446655440001",
    "supplier_sku": "SUP-MED-002",
    "lead_time_days": 14
  }
]
```

### Update Supplier

```json
PATCH /suppliers/{supplierId}
{
  "name": "ABC Pharmaceuticals Ltd.",
  "status": "active"
}
```

### Update Supplier Medication

```json
PATCH /suppliers/{supplierId}/medications/{medicationId}
{
  "supplier_sku": "SUP-MED-001-V2",
  "lead_time_days": 10
}
```

## Use Cases

1. **Supplier Management**: Create, view, update, and manage supplier information
2. **Catalog Management**: Maintain each supplier's medication catalog
3. **Lead Time Tracking**: Track delivery times from each supplier
4. **SKU Mapping**: Map supplier SKUs to internal medication variants
5. **Supplier Status**: Track supplier status (active, inactive, blacklisted)
6. **Purchase Planning**: Use lead times for purchase order planning

## Next Steps

1. ✅ Supplier module OpenAPI specs complete
2. Consider adding supplier performance metrics endpoints
3. Consider adding supplier pricing information
4. Validate OpenAPI spec using Swagger Editor
5. Generate API documentation from the OpenAPI spec

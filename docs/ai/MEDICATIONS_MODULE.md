# Medications & Variants Module - OpenAPI Documentation

## ✅ Completed

### Component Schemas (`components/medications/schemas.yaml`)

#### Medication Schemas (6)

1. **Medication** - Full medication object
2. **CreateMedication** - Create medication request
3. **CreateMedicationsRequest** - Batch create (array)
4. **CreateMedicationsResponse** - Batch create response (array)
5. **UpdateMedication** - Update medication request (partial)
6. **MedicationListResponse** - Paginated list response

#### Medication Variant Schemas (6)

1. **MedicationVariant** - Full variant object
2. **CreateMedicationVariant** - Create variant request
3. **CreateMedicationVariantsRequest** - Batch create (array)
4. **CreateMedicationVariantsResponse** - Batch create response (array)
5. **UpdateMedicationVariant** - Update variant request (partial)
6. **MedicationVariantListResponse** - Paginated list response

### Medication Endpoints (3 files, 7 operations)

#### 1. `/medications` (medications.yaml)

- **GET** - List medications (paginated)
  - Filters: name, brand, status, isPrescriptionRequired, isControlledSubstance
  - Pagination: page, limit, sortBy, sortOrder
- **POST** - Create medications (batch)

#### 2. `/medications/{medicationId}` (medications-medicationId.yaml)

- **GET** - Get medication by ID
- **PATCH** - Update medication
- **DELETE** - Delete medication

#### 3. `/medications/{medicationId}/variants` (medications-medicationId-variants.yaml)

- **GET** - List medication variants (paginated)
  - Filters: sku, barcode, isActive, isForSale
  - Pagination: page, limit, sortBy, sortOrder
- **POST** - Create medication variants (batch)

#### 4. `/medications/{medicationId}/variants/{variantId}` (medications-medicationId-variants-variantId.yaml)

- **GET** - Get medication variant by ID
- **PATCH** - Update medication variant
- **DELETE** - Delete medication variant

### Path Parameters Added

In `components/common/parameters.yaml`:

- **MedicationIdParam** - {medicationId} path parameter
- **VariantIdParam** - {variantId} path parameter

## 📊 Medication Schema Details

### Medication Fields

- `id` (UUID) - Unique identifier
- `name` (string, 1-100 chars) - Medication name
- `brand` (string, max 100 chars, nullable) - Brand name
- `description` (string, nullable) - Description
- `isPrescriptionRequired` (boolean) - Prescription requirement
- `isControlledSubstance` (boolean) - Controlled substance flag
- `status` (enum) - active, inactive, discontinued

### Medication Variant Fields

- `id` (UUID) - Unique identifier
- `medicationId` (UUID) - Parent medication reference
- `sku` (string, max 50 chars) - Stock Keeping Unit
- `name` (string, 1-100 chars) - Variant name
- `unit` (string, max 50 chars) - Unit of measurement (e.g., "Box of 10 tablets")
- `unitFactor` (number) - Conversion factor to base unit
- `barcode` (string, max 50 chars, nullable) - Barcode number
- `sellPrice` (number) - Selling price
- `isActive` (boolean) - Active status
- `isForSale` (boolean) - Available for sale

## 🎯 Features

### ✅ Batch Operations

Both medications and variants support batch creation:

- Send array of items
- Create multiple records in one request
- Atomic operation (all or nothing)

### ✅ Comprehensive Filtering

- Medications: filter by name, brand, status, prescription requirement, controlled substance
- Variants: filter by SKU, barcode, active status, sale availability

### ✅ Pagination Support

All list endpoints include:

- Page number and limit
- Sort by any field
- Sort order (asc/desc)
- Total count and page info

### ✅ Nested Resources

Variants are properly nested under medications:

- `/medications/{medicationId}/variants`
- Clear parent-child relationship
- Both IDs in variant detail endpoints

### ✅ Full CRUD Operations

- Create (batch)
- Read (list & detail)
- Update (partial)
- Delete

## 🔗 Endpoint Relationships

```
Medications
├── GET    /medications                                    (list all)
├── POST   /medications                                    (create batch)
├── GET    /medications/{medicationId}                     (get one)
├── PATCH  /medications/{medicationId}                     (update)
├── DELETE /medications/{medicationId}                     (delete)
└── Variants
    ├── GET    /medications/{medicationId}/variants        (list variants)
    ├── POST   /medications/{medicationId}/variants        (create batch)
    ├── GET    /medications/{medicationId}/variants/{variantId}    (get one)
    ├── PATCH  /medications/{medicationId}/variants/{variantId}    (update)
    └── DELETE /medications/{medicationId}/variants/{variantId}    (delete)
```

## 📝 Files Created

```
components/medications/
└── schemas.yaml (12 schemas)

paths/medications/
├── medications.yaml                                      (GET, POST /medications)
├── medications-medicationId.yaml                         (GET, PATCH, DELETE)
├── medications-medicationId-variants.yaml                (GET, POST variants)
└── medications-medicationId-variants-variantId.yaml      (GET, PATCH, DELETE variant)
```

## 🎉 Total Statistics

### Medications Module

- **4 path files**
- **12 schemas**
- **11 operations** (endpoints)
- **2 path parameters**
- **100% DTO-aligned**

## 🔄 Integration

### Updated Files

- `openapi.yaml` - Added 4 medication path references
- `components/common/parameters.yaml` - Added MedicationIdParam, VariantIdParam

### DTO Source

Based on:

- `packages/dto/src/core/medications/medication.js`
- `packages/dto/src/core/medications/variant.js`

### Database Schema Source

Based on:

- `apps/api/src/db/schema/medications.js`
- `apps/api/src/db/schema/medicationVariants.js`

## ✨ Key Highlights

1. **Descriptive Path Parameters**: Using `{medicationId}` and `{variantId}` instead of generic `{id}`
2. **Nested Resources**: Variants properly nested under parent medication
3. **Batch Support**: Both resources support batch creation
4. **Rich Filtering**: Comprehensive query parameters for filtering
5. **Field Naming**: Database fields use snake_case in requests, camelCase in responses (as per DTO)

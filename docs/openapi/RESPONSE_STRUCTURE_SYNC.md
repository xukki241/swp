# Response Structure Synchronization

## Overview

All API response structures have been synchronized to follow a standardized format across the entire OpenAPI specification.

## Standardized Response Structures

### Success Response (Single Item)

```yaml
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { // Single object data },
}
```

### Success Response (List/Collection)

```yaml
{
  "success": true,
  "message": "Data retrieved successfully",
  "data": [// Array of items],
  "pagination":
    { "page": 1, "limit": 10, "total": 100, "totalPages": 10, "hasMore": true },
}
```

### Error Response

```yaml
{
  "success": false,
  "error": "Error message",
  "reasons": ["Detailed reason 1", "Detailed reason 2"],
}
```

### Error Response (with trace in development)

```yaml
{
  "success": false,
  "error": "Internal server error",
  "reasons": ["Database connection failed"],
  "trace": "Error: Database connection failed\n    at connect (/app/db.js:15:9)",
}
```

## Updated Components

### Common Schemas (`components/common/schemas.yaml`)

- ✅ Added `SuccessResponse` - Base wrapper for successful single-item responses
- ✅ Added `SuccessListResponse` - Base wrapper for successful list responses with pagination
- ✅ Added `ErrorResponse` - Standard error response structure
- ✅ Added `ErrorResponseWithTrace` - Error response with stack trace for development

### Common Responses (`components/common/responses.yaml`)

- ✅ Updated `BadRequestError` (400)
- ✅ Updated `UnauthorizedError` (401)
- ✅ Updated `ForbiddenError` (403)
- ✅ Updated `NotFoundError` (404)
- ✅ Updated `ConflictError` (409)
- ✅ Updated `InternalServerError` (500)

### Module Schemas

#### Auth (`components/auth/schemas.yaml`)

- ✅ `RegisterResponse`
- ✅ `LoginResponse`
- ✅ `ForgotPasswordResponse`
- ✅ `ResetPasswordResponse`
- ✅ `ChangePasswordResponse`
- ✅ `MeResponse`

#### Users (`components/users/schemas.yaml`)

- ✅ `UserResponse` (new)
- ✅ `UserListResponse`
- ✅ `CreateUsersResponse`
- ✅ `DeleteUserResponse` (new)

#### Medications (`components/medications/`)

- ✅ `MedicationResponse` (new)
- ✅ `MedicationListResponse`
- ✅ `CreateMedicationsResponse`
- ✅ `DeleteMedicationResponse` (new)
- ✅ `MedicationVariantResponse` (new)
- ✅ `MedicationVariantListResponse`
- ✅ `CreateMedicationVariantsResponse`
- ✅ `DeleteMedicationVariantResponse` (new)

#### Customers (`components/customers/customer-schemas.yaml`)

- ✅ `CustomerResponse` (new)
- ✅ `CustomerListResponse`
- ✅ `CreateCustomersResponse`
- ✅ `DeleteCustomerResponse` (new)

#### Suppliers (`components/suppliers/supplier-schemas.yaml`)

- ✅ `SupplierResponse` (new)
- ✅ `SupplierListResponse`
- ✅ `CreateSuppliersResponse`
- ✅ `DeleteSupplierResponse` (new)
- ✅ `CreateSupplierMedicationsResponse`
- ✅ `SupplierMedicationListResponse`
- ✅ `DeleteSupplierMedicationResponse` (new)

#### Purchases (`components/purchases/`)

- ✅ `PurchaseOrderResponse` (new)
- ✅ `PurchaseOrderListResponse`
- ✅ `CreatePurchaseOrdersResponse`
- ✅ `DeletePurchaseOrderResponse` (new)
- ✅ `ReceiptResponse` (new)
- ✅ `ReceiptListResponse`
- ✅ `CreateReceiptResponse` (new)

#### Sales (`components/sales/sales-order-schemas.yaml`)

- ✅ `SalesOrderResponse` (new)
- ✅ `SalesOrderListResponse`
- ✅ `CreateSalesOrderResponse` (new)

#### Inventory (`components/inventory/inventory-schemas.yaml`)

- ✅ `InventoryResponse` (new)
- ✅ `InventoryListResponse`
- ✅ `InventorySummaryListResponse`
- ✅ `MoveInventoryResponse`

#### Warehouse (`components/warehouse/`)

- ✅ `WarehouseZoneResponse` (new)
- ✅ `WarehouseZoneListResponse`
- ✅ `CreateWarehouseZonesResponse`
- ✅ `DeleteWarehouseZoneResponse` (new)
- ✅ `WarehouseRackResponse` (new)
- ✅ `WarehouseRackListResponse`
- ✅ `CreateWarehouseRacksResponse`
- ✅ `DeleteWarehouseRackResponse` (new)
- ✅ `WarehouseBinResponse` (new)
- ✅ `WarehouseBinListResponse`
- ✅ `CreateWarehouseBinsResponse`
- ✅ `DeleteWarehouseBinResponse` (new)

#### Reports (`components/reports/report-schemas.yaml`)

- ✅ `ReportResponse` (new)
- ✅ `ReportListResponse`

## Key Changes

### 1. Consistent Success Field

All responses now include a `success: true` field to clearly indicate successful operations.

### 2. Standardized Message Field

Every response includes a `message` field with a human-readable description of the operation result.

### 3. Data Wrapper

All response data is wrapped in a `data` field:

- For single items: `data: { ...object }`
- For collections: `data: [ ...array ]`
- For operations with no return data: `data: null`

### 4. Pagination Structure

List responses consistently include pagination information:

- `page`: Current page number
- `limit`: Items per page
- `total`: Total number of items
- `totalPages`: Total number of pages
- `hasMore`: Boolean indicating if more pages exist

### 5. Error Handling

Error responses now use:

- `success: false` to indicate failure
- `error`: Main error message
- `reasons`: Optional array of detailed error reasons
- `trace`: Stack trace (only in development mode for 500 errors)

## Benefits

1. **Consistency**: All endpoints follow the same response pattern
2. **Clarity**: The `success` field makes it easy to determine request outcome
3. **Predictability**: Clients can parse responses using a single pattern
4. **Debuggability**: Error responses with reasons array provide better debugging info
5. **Type Safety**: Standardized structure improves TypeScript/client generation

## Migration Notes

### For API Consumers

- All responses now require checking the `success` field
- Response data is always in the `data` field
- Error handling should check for `success: false` and read the `error` field

### For Backend Implementation

Ensure your API controllers return responses matching these structures:

```javascript
// Success response
return res.json({
  success: true,
  message: "Operation completed successfully",
  data: result,
});

// List response
return res.json({
  success: true,
  message: "Data retrieved successfully",
  data: results,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10,
    hasMore: true,
  },
});

// Error response
return res.status(400).json({
  success: false,
  error: "Validation failed",
  reasons: ["Invalid email format", "Password too short"],
});
```

## Validation

All response schemas use OpenAPI's `allOf` composition to extend base response types while maintaining type safety and validation.

---

Last Updated: October 16, 2025

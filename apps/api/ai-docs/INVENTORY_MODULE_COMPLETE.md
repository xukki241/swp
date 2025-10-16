# Inventory OpenAPI Specification - Implementation Summary

## Overview

Completed OpenAPI specification for all inventory endpoints based on:

- DTO schemas from `packages/dto/src/core/inventory/inventory.js`
- Database schema from `apps/api/src/db/schema/inventory.js`
- Route definitions from `apps/api/src/routes/inventoryRoutes.js`

## Files Created

### Component Schemas

- **`components/inventory/inventory-schemas.yaml`**
  - Inventory (main schema)
  - UpdateInventory (partial update)
  - AdjustInventoryRequest (quantity adjustment)
  - MoveInventoryRequest (move between bins)
  - MoveInventoryResponse
  - InventoryListResponse (paginated list)
  - InventorySummary (aggregated by variant)
  - InventorySummaryListResponse (paginated summary)

### Path Definitions (7 endpoints)

1. **`paths/inventory/inventory.yaml`**
   - `GET /inventory` - List all inventory with filtering
   - Query params: page, limit, sortBy, sortOrder, medication_variant_id, bin_id, batchNumber, expiryDateFrom, expiryDateTo

2. **`paths/inventory/inventory-inventoryId.yaml`**
   - `GET /inventory/{inventoryId}` - Get inventory by ID
   - `PATCH /inventory/{inventoryId}` - Update inventory (Owner only)

3. **`paths/inventory/inventory-inventoryId-adjust.yaml`**
   - `PATCH /inventory/{inventoryId}/adjust` - Adjust inventory quantity (Owner only)
   - Request body: newQuantity, reason

4. **`paths/inventory/inventory-move.yaml`**
   - `POST /inventory/move` - Move inventory between bins (Owner only)
   - Request body: fromInventoryId, toBinId, quantity, reason

5. **`paths/inventory/inventory-summary-by-variant.yaml`**
   - `GET /inventory/summary/by-variant` - Get aggregated inventory by medication variant
   - Returns: totalQuantity, totalReserved, availableQuantity per variant

6. **`paths/inventory/inventory-expiring.yaml`**
   - `GET /inventory/expiring` - Get inventory expiring soon
   - Query param: daysUntilExpiry (default: 30)

7. **`paths/inventory/inventory-low-stock.yaml`**
   - `GET /inventory/low-stock` - Get low stock inventory
   - Query param: threshold (default: 10)

### Main OpenAPI File

- **`openapi.yaml`** - Updated to reference all 7 inventory endpoints

## Schema Details

### Inventory Object

```yaml
id: UUID (required)
medicationVariantId: UUID (required)
purchaseOrderReceiptItemsId: UUID (required)
binId: UUID (required)
batchNumber: string (max 100) (required)
manufactureDate: date (nullable, optional)
expiryDate: date (nullable, optional)
quantity: decimal (required)
quantityReserved: decimal (required)
```

## Security

All endpoints require:

- Bearer token authentication (`bearerAuth`)
- Owner role for write operations (PATCH, POST)
- Read operations accessible to both Owner and Staff roles

## Consistency with Existing Patterns

The implementation follows the same patterns as:

- Medications module (component schemas and path structure)
- Warehouse module (naming conventions and parameter references)
- Common components (schemas, parameters, responses, enums)

## Route Alignment

All OpenAPI endpoints align with the actual API routes in `inventoryRoutes.js`:

- ✅ GET /inventory
- ✅ GET /inventory/summary/by-variant
- ✅ GET /inventory/expiring
- ✅ GET /inventory/low-stock
- ✅ GET /inventory/:id
- ✅ PATCH /inventory/:id
- ✅ PATCH /inventory/:id/adjust
- ✅ POST /inventory/move

## Next Steps

1. Validate OpenAPI spec using Swagger Editor or similar tool
2. Generate API documentation from the OpenAPI spec
3. Consider adding integration tests for inventory endpoints
4. Update API documentation with example requests/responses

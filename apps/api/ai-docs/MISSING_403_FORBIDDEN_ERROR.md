# 403 ForbiddenError - Complete ✅

## Overview

Since the API uses role-based authorization (Owner and Staff roles), all endpoints that require specific roles (Owner-only operations) include `403 ForbiddenError` in their responses.

## Current Status - ALL COMPLETE ✅

### ✅ All Modules Have Correct 403 ForbiddenError

#### Users Module

- POST /users (Owner only) ✅
- GET /users/{userId} (Owner only) ✅
- PATCH /users/{userId} (Owner only) ✅
- DELETE /users/{userId} (Owner only) ✅

#### Medications Module

- POST /medications (Owner only) ✅
- PATCH /medications/{medicationId} (Owner only) ✅
- DELETE /medications/{medicationId} (Owner only) ✅
- POST /medications/{medicationId}/variants (Owner only) ✅
- PATCH /medications/{medicationId}/variants/{variantId} (Owner only) ✅
- DELETE /medications/{medicationId}/variants/{variantId} (Owner only) ✅

#### Purchases Module

- POST /purchases/orders (Owner only) ✅
- PATCH /purchases/orders/{purchaseOrderId} (Owner only) ✅
- DELETE /purchases/orders/{purchaseOrderId} (Owner only) ✅
- POST /purchases/orders/{purchaseOrderId}/receipts (Owner only) ✅
- PATCH /purchases/receipts/{receiptId} (Owner only) ✅

#### Inventory Module

- PATCH /inventory/{inventoryId} (Owner only) ✅
- POST /inventory/{inventoryId}/adjust (Owner only) ✅
- POST /inventory/move (Owner only) ✅

#### Suppliers Module

- POST /suppliers (Owner only) ✅
- PATCH /suppliers/{supplierId} (Owner only) ✅
- DELETE /suppliers/{supplierId} (Owner only) ✅
- POST /suppliers/{supplierId}/medications (Owner only) ✅
- PATCH /suppliers/{supplierId}/medications/{medicationId} (Owner only) ✅
- DELETE /suppliers/{supplierId}/medications/{medicationId} (Owner only) ✅

#### Warehouse Module

**Zones:**

- POST /warehouse/zones (Owner only) ✅
- POST /warehouse/zones/batch (Owner only) ✅
- PATCH /warehouse/zones/{zoneId} (Owner only) ✅
- DELETE /warehouse/zones/{zoneId} (Owner only) ✅
- POST /warehouse/zones/{zoneId}/racks (Owner only) ✅
- POST /warehouse/zones/{zoneId}/racks/batch (Owner only) ✅

**Racks:**

- PATCH /warehouse/racks/{rackId} (Owner only) ✅
- DELETE /warehouse/racks/{rackId} (Owner only) ✅
- POST /warehouse/racks/{rackId}/bins (Owner only) ✅
- POST /warehouse/racks/{rackId}/bins/batch (Owner only) ✅

**Bins:**

- PATCH /warehouse/bins/{binId} (Owner only) ✅
- DELETE /warehouse/bins/{binId} (Owner only) ✅

#### Customers Module

- DELETE /customers/{customerId} (Owner only) ✅
- POST /customers (Staff allowed - no 403 needed) ✅
- PATCH /customers/{customerId} (Staff allowed - no 403 needed) ✅

#### Reports Module

- DELETE /reports/{reportId} (Owner only) ✅
- POST /reports (Staff allowed - no 403 needed) ✅

#### Sales Module

- All operations (Staff allowed - no 403 needed) ✅

## Standard Format

All Owner-only operations include this response after `'401'`:

```yaml
"403":
  $ref: "../../components/common/responses.yaml#/ForbiddenError"
```

## Why 403 is Important

- **401 Unauthorized**: User is not authenticated (no token or invalid token)
- **403 Forbidden**: User is authenticated but doesn't have the required role/permissions
  - Example: Staff user trying to delete a warehouse zone (Owner-only operation)
  - Example: Staff user trying to create suppliers (Owner-only operation)

This distinction helps frontends show appropriate error messages:

- 401 → "Please log in"
- 403 → "You don't have permission to perform this action"

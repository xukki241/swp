# Warehouse & Inventory Management Endpoints

This document describes the newly created warehouse and inventory management endpoints based on the Postman collection.

## Overview

The implementation includes comprehensive inventory management with the following features:

- Real-time inventory tracking
- Batch and expiry date management
- Stock level monitoring (low stock alerts)
- Location-based inventory (zone, rack, bin)
- Inventory movement tracking
- Medication variant inventory views

## Endpoints Created

### 1. Inventory Management (`/api/inventory`)

#### GET `/api/inventory`

Get all inventory items with optional filters.

**Query Parameters:**

- `medicationVariantId` - Filter by medication variant
- `binId` - Filter by warehouse bin
- `batchNumber` - Filter by batch number
- `expiryDateFrom` - Filter items expiring after this date
- `expiryDateTo` - Filter items expiring before this date
- `zoneId` - Filter by warehouse zone
- `rackId` - Filter by warehouse rack
- `limit` - Number of items per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "medicationVariantId": 10,
      "purchaseOrderReceiptItemsId": 5,
      "binId": 3,
      "batchNumber": "BATCH001",
      "manufactureDate": "2024-01-15",
      "expiryDate": "2026-01-15",
      "quantity": 500,
      "quantityReserved": 50,
      "quantityAvailable": 450,
      "variantName": "Paracetamol 500mg",
      "variantSku": "PAR500",
      "variantUnit": "tablet",
      "variantPrice": 0.5,
      "medicationId": 1,
      "medicationName": "Paracetamol",
      "medicationCode": "PAR",
      "medicationActiveIngredient": "Paracetamol",
      "binCode": "B001",
      "binName": "Bin 1",
      "binLevel": 1,
      "binNumber": 1,
      "rackCode": "R001",
      "rackName": "Rack 1",
      "zoneCode": "Z001",
      "zoneName": "Zone A",
      "zoneType": "storage"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0
  }
}
```

#### GET `/api/inventory/:id`

Get a specific inventory item by ID.

**Response:**

```json
{
  "data": {
    "id": 1,
    "medicationVariantId": 10,
    "purchaseOrderReceiptItemsId": 5,
    "binId": 3,
    "batchNumber": "BATCH001",
    "manufactureDate": "2024-01-15",
    "expiryDate": "2026-01-15",
    "quantity": 500,
    "quantityReserved": 50,
    "quantityAvailable": 450,
    "variantName": "Paracetamol 500mg",
    "medicationId": 1,
    "medicationName": "Paracetamol",
    "binCode": "B001",
    "rackCode": "R001",
    "zoneCode": "Z001"
  }
}
```

#### GET `/api/inventory/low-stock`

Get inventory items with low stock levels.

**Query Parameters:**

- `threshold` - Stock threshold (default: 100)
- `limit` - Number of items per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "medicationVariantId": 10,
      "variantName": "Paracetamol 500mg",
      "variantSku": "PAR500",
      "medicationName": "Paracetamol",
      "totalQuantity": 50,
      "totalReserved": 10,
      "totalAvailable": 40,
      "locations": 2
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0
  }
}
```

#### GET `/api/inventory/expiring-soon`

Get inventory items expiring within a specified period.

**Query Parameters:**

- `days` - Number of days from now (default: 30)
- `limit` - Number of items per page (default: 100)
- `offset` - Pagination offset (default: 0)

**Response:**

```json
{
  "data": [
    {
      "id": 1,
      "medicationVariantId": 10,
      "variantName": "Paracetamol 500mg",
      "medicationName": "Paracetamol",
      "batchNumber": "BATCH001",
      "expiryDate": "2025-11-15",
      "daysUntilExpiry": 35,
      "quantity": 500,
      "quantityAvailable": 450,
      "binCode": "B001",
      "rackCode": "R001",
      "zoneCode": "Z001"
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 100,
    "offset": 0
  }
}
```

#### GET `/api/inventory/by-location`

Get inventory grouped by warehouse location (zone, rack, bin).

**Query Parameters:**

- `zoneId` - Filter by zone
- `rackId` - Filter by rack
- `binId` - Filter by bin

**Response:**

```json
{
  "data": [
    {
      "zoneCode": "Z001",
      "zoneName": "Zone A",
      "rackCode": "R001",
      "rackName": "Rack 1",
      "binCode": "B001",
      "binName": "Bin 1",
      "totalItems": 5,
      "totalQuantity": 2500,
      "totalAvailable": 2300
    }
  ]
}
```

#### POST `/api/inventory/adjust`

Adjust inventory quantity (for corrections, damages, etc.).

**Request Body:**

```json
{
  "inventoryId": 1,
  "adjustmentType": "increase",
  "quantity": 10,
  "reason": "Damaged items removed",
  "notes": "Optional notes"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "previousQuantity": 500,
    "newQuantity": 510,
    "adjustmentType": "increase",
    "quantity": 10,
    "reason": "Damaged items removed"
  },
  "message": "Inventory adjusted successfully"
}
```

#### POST `/api/inventory/transfer`

Transfer inventory between bins.

**Request Body:**

```json
{
  "inventoryId": 1,
  "fromBinId": 3,
  "toBinId": 5,
  "quantity": 100,
  "reason": "Reorganization",
  "notes": "Optional notes"
}
```

**Response:**

```json
{
  "data": {
    "sourceInventory": {
      "id": 1,
      "binId": 3,
      "quantity": 400
    },
    "destinationInventory": {
      "id": 2,
      "binId": 5,
      "quantity": 100
    }
  },
  "message": "Inventory transferred successfully"
}
```

#### POST `/api/inventory/reserve`

Reserve inventory for an order.

**Request Body:**

```json
{
  "inventoryId": 1,
  "quantity": 50,
  "orderId": "ORD001",
  "notes": "Optional notes"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "quantity": 500,
    "quantityReserved": 100,
    "quantityAvailable": 400
  },
  "message": "Inventory reserved successfully"
}
```

#### POST `/api/inventory/unreserve`

Release reserved inventory.

**Request Body:**

```json
{
  "inventoryId": 1,
  "quantity": 50,
  "orderId": "ORD001",
  "notes": "Optional notes"
}
```

**Response:**

```json
{
  "data": {
    "id": 1,
    "quantity": 500,
    "quantityReserved": 50,
    "quantityAvailable": 450
  },
  "message": "Inventory unreserved successfully"
}
```

### 2. Warehouse Bin Inventory (`/api/warehouse-bins/:binId/inventory`)

#### GET `/api/warehouse-bins/:binId/inventory`

Get all inventory items in a specific bin.

**Response:**

```json
{
  "data": {
    "bin": {
      "id": 3,
      "code": "B001",
      "name": "Bin 1",
      "level": 1,
      "number": 1
    },
    "inventory": [
      {
        "id": 1,
        "medicationVariantId": 10,
        "variantName": "Paracetamol 500mg",
        "medicationName": "Paracetamol",
        "batchNumber": "BATCH001",
        "expiryDate": "2026-01-15",
        "quantity": 500,
        "quantityReserved": 50,
        "quantityAvailable": 450
      }
    ],
    "summary": {
      "totalItems": 1,
      "totalQuantity": 500,
      "totalReserved": 50,
      "totalAvailable": 450
    }
  }
}
```

### 3. Medication Variant Inventory (`/api/medication-variants/:variantId/inventory`)

#### GET `/api/medication-variants/:variantId/inventory`

Get all inventory items for a specific medication variant.

**Response:**

```json
{
  "data": {
    "variant": {
      "id": 10,
      "name": "Paracetamol 500mg",
      "sku": "PAR500",
      "unit": "tablet",
      "price": 0.5
    },
    "inventory": [
      {
        "id": 1,
        "binId": 3,
        "binCode": "B001",
        "rackCode": "R001",
        "zoneCode": "Z001",
        "batchNumber": "BATCH001",
        "manufactureDate": "2024-01-15",
        "expiryDate": "2026-01-15",
        "quantity": 500,
        "quantityReserved": 50,
        "quantityAvailable": 450
      }
    ],
    "summary": {
      "totalQuantity": 500,
      "totalReserved": 50,
      "totalAvailable": 450,
      "locations": 1
    }
  }
}
```

### 4. Medication Inventory (`/api/medications/:medicationId/inventory`)

#### GET `/api/medications/:medicationId/inventory`

Get all inventory items for all variants of a medication.

**Response:**

```json
{
  "data": {
    "medication": {
      "id": 1,
      "name": "Paracetamol",
      "code": "PAR",
      "activeIngredient": "Paracetamol"
    },
    "inventory": [
      {
        "variantId": 10,
        "variantName": "Paracetamol 500mg",
        "variantSku": "PAR500",
        "totalQuantity": 500,
        "totalReserved": 50,
        "totalAvailable": 450,
        "locations": 1,
        "batches": [
          {
            "batchNumber": "BATCH001",
            "expiryDate": "2026-01-15",
            "quantity": 500
          }
        ]
      }
    ],
    "summary": {
      "totalVariants": 1,
      "totalQuantity": 500,
      "totalAvailable": 450
    }
  }
}
```

## Implementation Details

### Files Created/Modified

1. **Controllers:**
   - `src/controllers/inventoryController.js` - New inventory controller
   - `src/controllers/warehouseBinController.js` - Added `getInventory` method
   - `src/controllers/medicationVariantController.js` - Added `getInventory` method
   - `src/controllers/medicationController.js` - Added `getInventory` method

2. **Services:**
   - `src/services/inventoryService.js` - New comprehensive inventory service

3. **Routes:**
   - `src/routes/inventoryRoutes.js` - New inventory routes
   - `src/routes/warehouseBinRoutes.js` - Added inventory endpoint
   - `src/routes/medicationVariantRoutes.js` - Added inventory endpoint
   - `src/routes/medicationRoutes.js` - Added inventory endpoint
   - `src/routes/index.js` - Exported inventory routes

4. **Application:**
   - `src/app.js` - Registered inventory routes at `/api/inventory`

### Features Implemented

1. **Inventory Tracking:**
   - Real-time quantity tracking
   - Reserved quantity management
   - Available quantity calculation

2. **Location Management:**
   - Zone, rack, and bin tracking
   - Location-based inventory queries
   - Inventory transfer between bins

3. **Batch Management:**
   - Batch number tracking
   - Manufacturing and expiry dates
   - Expiring soon alerts

4. **Stock Management:**
   - Low stock alerts
   - Quantity adjustments (increase/decrease)
   - Reservation system for orders

5. **Reporting:**
   - Inventory by location
   - Low stock report
   - Expiring soon report
   - Comprehensive inventory views

### Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

### Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Detailed error information"
}
```

Common HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `500` - Internal Server Error

## Testing

Use the provided Postman collection (`pharmaflow_api.postman_collection.json`) to test all endpoints. The collection includes:

- Pre-configured requests
- Example request bodies
- Environment variables for base URL and authentication

## Next Steps

1. Test all endpoints using Postman
2. Verify database schema is up to date
3. Add integration tests
4. Configure monitoring and logging
5. Set up automated alerts for low stock and expiring items

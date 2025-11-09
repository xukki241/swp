# Purchase Orders & Receipts Module - OpenAPI Documentation

## ✅ Completed

### Component Schemas

#### Purchase Order Schemas (`components/purchases/order-schemas.yaml`)

1. **PurchaseOrder** - Full purchase order object
2. **PurchaseOrderItem** - Individual item in a purchase order
3. **PurchaseOrderWithItems** - Purchase order with nested items array
4. **CreatePurchaseOrderItem** - Create item request (for nested items)
5. **CreatePurchaseOrder** - Create purchase order request with items
6. **CreatePurchaseOrdersRequest** - Batch create (array)
7. **CreatePurchaseOrdersResponse** - Batch create response (array)
8. **UpdatePurchaseOrder** - Update purchase order request (status only)
9. **PurchaseOrderListResponse** - Paginated list response

#### Purchase Receipt Schemas (`components/purchases/receipt-schemas.yaml`)

1. **PurchaseOrderReceipt** - Full receipt object
2. **PurchaseOrderReceiptItem** - Individual item in a receipt
3. **PurchaseOrderReceiptWithItems** - Receipt with nested items array
4. **CreateReceiptItem** - Create receipt item request (includes inventory details)
5. **CreateReceipt** - Create receipt request with items
6. **ReceiptListResponse** - Paginated list response

### Purchase Order Endpoints (3 files, 7 operations)

#### 1. `/purchases` (purchases.yaml)

- **GET** - List purchase orders (paginated)
  - Filters: supplierId, status, createdBy, orderDateFrom, orderDateTo
  - Pagination: page, limit, sortBy, sortOrder
- **POST** - Create purchase orders (batch with nested items)

#### 2. `/purchases/{purchaseOrderId}` (purchases-purchaseOrderId.yaml)

- **GET** - Get purchase order by ID (with items)
- **PATCH** - Update purchase order (status)
- **DELETE** - Delete purchase order

#### 3. `/purchases/{purchaseOrderId}/receipts` (purchases-purchaseOrderId-receipts.yaml)

- **GET** - List receipts for a purchase order (paginated)
- **POST** - Create receipt (receive items from PO)

#### 4. `/receipts/{receiptId}` (receipts-receiptId.yaml)

- **GET** - Get receipt by ID (with items)

### Path Parameters Added

In `components/common/parameters.yaml`:

- **PurchaseOrderIdParam** - {purchaseOrderId} path parameter
- **ReceiptIdParam** - {receiptId} path parameter
- **SalesOrderIdParam** - {salesOrderId} path parameter (for future use)

## 📊 Schema Details

### Purchase Order Fields

- `id` (UUID) - Unique identifier
- `supplierId` (UUID) - Reference to supplier
- `orderDate` (DateTime) - When order was placed
- `expectedDate` (DateTime, nullable) - Expected delivery date
- `status` (enum) - pending, ordered, received, cancelled
- `totalAmount` (number) - Total order amount
- `createdBy` (UUID, nullable) - User who created the order

### Purchase Order Item Fields

- `id` (UUID) - Unique identifier
- `purchaseOrderId` (UUID) - Parent order reference
- `supplierMedicationVariantId` (UUID) - Medication variant from supplier
- `quantity` (integer) - Quantity ordered
- `unitPrice` (number) - Price per unit
- `totalPrice` (number) - Total price (quantity \* unitPrice)

### Purchase Order Receipt Fields

- `id` (UUID) - Unique identifier
- `purchaseOrderId` (UUID) - Parent order reference
- `receivedDate` (DateTime) - When items were received
- `receivedBy` (UUID, nullable) - User who received the items

### Receipt Item Fields

- `id` (UUID) - Unique identifier
- `purchaseOrderReceiptId` (UUID) - Parent receipt reference
- `purchaseOrderItemId` (UUID) - Reference to ordered item
- `quantity` (integer) - Quantity received
- Additional fields in create: `bin_id`, `batch_number`, `manufacture_date`, `expiry_date`

## 🎯 Key Features

### ✅ Nested Item Creation

Purchase orders are created with items in a single request:

```json
{
  "supplier_id": "uuid",
  "items": [
    {
      "supplier_medication_variant_id": "uuid",
      "quantity": 100,
      "unit_price": 50000.0
    }
  ]
}
```

### ✅ Receipt with Inventory Details

When receiving items, specify storage location and batch info:

```json
{
  "items": [
    {
      "purchase_order_item_id": "uuid",
      "quantity": 100,
      "bin_id": "uuid",
      "batch_number": "BATCH-2025-001",
      "manufacture_date": "2025-01-01",
      "expiry_date": "2027-01-01"
    }
  ]
}
```

### ✅ Status Workflow

Purchase orders follow a status progression:

1. **pending** - Just created
2. **ordered** - Sent to supplier
3. **received** - Items received (via receipt)
4. **cancelled** - Order cancelled

### ✅ Comprehensive Filtering

Filter purchase orders by:

- Supplier
- Status
- Creator
- Date range (orderDateFrom/To)

### ✅ Nested Resources

- Receipts nested under purchase orders: `/purchases/{purchaseOrderId}/receipts`
- Receipt detail endpoint: `/receipts/{receiptId}`

## 🔗 Endpoint Relationships

```
Purchase Orders
├── GET    /purchases                                      (list all)
├── POST   /purchases                                      (create batch with items)
├── GET    /purchases/{purchaseOrderId}                    (get one with items)
├── PATCH  /purchases/{purchaseOrderId}                    (update status)
├── DELETE /purchases/{purchaseOrderId}                    (delete)
└── Receipts
    ├── GET    /purchases/{purchaseOrderId}/receipts       (list receipts)
    ├── POST   /purchases/{purchaseOrderId}/receipts       (create receipt)
    └── GET    /receipts/{receiptId}                       (get receipt detail)
```

## 📝 Files Created

```
components/purchases/
├── order-schemas.yaml (9 schemas)
└── receipt-schemas.yaml (6 schemas)

paths/purchases/
├── purchases.yaml                                         (GET, POST /purchases)
├── purchases-purchaseOrderId.yaml                         (GET, PATCH, DELETE)
├── purchases-purchaseOrderId-receipts.yaml                (GET, POST receipts)
└── receipts-receiptId.yaml                                (GET receipt)
```

## 🎉 Total Statistics

### Purchases Module

- **4 path files**
- **15 schemas** (9 order + 6 receipt)
- **8 operations** (endpoints)
- **3 path parameters**
- **100% DTO-aligned**

## 🔄 Integration

### Updated Files

- `openapi.yaml` - Added 4 purchase path references
- `components/common/parameters.yaml` - Added PurchaseOrderIdParam, ReceiptIdParam, SalesOrderIdParam

### DTO Source

Based on:

- `packages/dto/src/core/purchases/order.js`
- `packages/dto/src/core/purchases/receipt.js`

### Database Schema Source

Based on:

- `apps/api/src/db/schema/purchaseOrders.js`
- `apps/api/src/db/schema/purchaseOrderItems.js`
- `apps/api/src/db/schema/purchaseOrderReceipts.js`
- `apps/api/src/db/schema/purchaseOrderReceiptItems.js`

## ✨ Key Highlights

1. **Nested Creation**: Purchase orders created with items in single request
2. **Inventory Integration**: Receipts include bin_id, batch_number, expiry dates
3. **Status Management**: Controlled workflow for order lifecycle
4. **Comprehensive Filtering**: Rich query options for purchase orders
5. **Descriptive Parameters**: Using `{purchaseOrderId}` and `{receiptId}`
6. **Clear Relationships**: Receipt endpoints properly nested under purchase orders

---

## 🔀 Medication Schemas Split

The medication schemas have been split into separate files for better organization:

### Before

- `components/medications/schemas.yaml` (12 schemas combined)

### After

- `components/medications/medication-schemas.yaml` (6 medication schemas)
- `components/medications/variant-schemas.yaml` (6 variant schemas)

All path files updated to reference the new split schema files.

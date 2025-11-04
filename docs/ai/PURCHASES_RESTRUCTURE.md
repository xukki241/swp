# Purchase Endpoints Restructure - Summary

## ✅ Changes Applied

### 🔄 Path Restructure

#### Before:

```
/purchases                              (GET, POST orders)
/purchases/{purchaseOrderId}            (GET, PATCH, DELETE order)
/purchases/{purchaseOrderId}/receipts   (GET, POST receipts for order)
/receipts/{receiptId}                   (GET receipt)
```

#### After:

```
/purchases/orders                              (GET, POST orders)
/purchases/orders/{purchaseOrderId}            (GET, PATCH, DELETE order)
/purchases/orders/{purchaseOrderId}/receipts   (GET, POST receipts for order)
/purchases/receipts                            (GET all receipts) ✨ NEW
/purchases/receipts/{receiptId}                (GET, DELETE receipt) ✨ DELETE added
```

### 📝 Files Renamed

1. `purchases.yaml` → `purchases-orders.yaml`
2. `purchases-purchaseOrderId.yaml` → `purchases-orders-purchaseOrderId.yaml`
3. `purchases-purchaseOrderId-receipts.yaml` → `purchases-orders-purchaseOrderId-receipts.yaml`
4. `receipts-receiptId.yaml` → `purchases-receipts-receiptId.yaml`

### ✨ New Features Added

#### 1. GET All Receipts (`purchases-receipts.yaml`)

**Endpoint:** `GET /purchases/receipts`

List all purchase order receipts across all orders with filtering:

- `purchaseOrderId` - Filter by specific purchase order
- `receivedBy` - Filter by user who received items
- `receivedDateFrom` - Filter by received date from
- `receivedDateTo` - Filter by received date to
- Plus standard pagination (page, limit, sortBy, sortOrder)

#### 2. DELETE Receipt (added to `purchases-receipts-receiptId.yaml`)

**Endpoint:** `DELETE /purchases/receipts/{receiptId}`

Delete a purchase order receipt.

## 🎯 Benefits

### 1. **Better Organization**

- Purchase orders under `/purchases/orders`
- Receipts under `/purchases/receipts`
- Clear separation of concerns

### 2. **Consistent Naming**

- All purchase-related endpoints start with `/purchases/`
- Sub-resources clearly identified (orders, receipts)

### 3. **Complete CRUD for Receipts**

- ✅ Create (POST under order)
- ✅ Read (GET single, GET all)
- ✅ Delete (NEW)
- Note: Update not needed for receipts (immutable once created)

### 4. **Flexible Querying**

- Get receipts for a specific order: `/purchases/orders/{purchaseOrderId}/receipts`
- Get all receipts with filters: `/purchases/receipts`
- Get single receipt: `/purchases/receipts/{receiptId}`

## 📊 Updated Endpoint Structure

```
/purchases/
├── orders/
│   ├── GET     /purchases/orders                              (list all orders)
│   ├── POST    /purchases/orders                              (create orders)
│   ├── GET     /purchases/orders/{purchaseOrderId}            (get order detail)
│   ├── PATCH   /purchases/orders/{purchaseOrderId}            (update order status)
│   ├── DELETE  /purchases/orders/{purchaseOrderId}            (delete order)
│   └── receipts/
│       ├── GET  /purchases/orders/{purchaseOrderId}/receipts  (list receipts for order)
│       └── POST /purchases/orders/{purchaseOrderId}/receipts  (create receipt for order)
└── receipts/
    ├── GET     /purchases/receipts                            (list all receipts) ✨ NEW
    ├── GET     /purchases/receipts/{receiptId}                (get receipt detail)
    └── DELETE  /purchases/receipts/{receiptId}                (delete receipt) ✨ NEW
```

## 📈 Statistics

### Before:

- **4 path files**
- **8 operations**
- **4 unique paths**

### After:

- **5 path files** (+1)
- **10 operations** (+2)
- **5 unique paths** (+1)

## 🔗 Updated Files

1. `openapi.yaml` - Updated all purchase path references
2. `purchases-orders.yaml` - Path changed to `/purchases/orders`
3. `purchases-orders-purchaseOrderId.yaml` - Path changed to `/purchases/orders/{purchaseOrderId}`
4. `purchases-orders-purchaseOrderId-receipts.yaml` - Path changed to `/purchases/orders/{purchaseOrderId}/receipts`
5. `purchases-receipts.yaml` - ✨ NEW file for GET all receipts
6. `purchases-receipts-receiptId.yaml` - Path changed to `/purchases/receipts/{receiptId}`, DELETE added

## 🎉 Final Purchase Module

### Operations: 10 Total

**Purchase Orders (5):**

- GET /purchases/orders
- POST /purchases/orders
- GET /purchases/orders/{purchaseOrderId}
- PATCH /purchases/orders/{purchaseOrderId}
- DELETE /purchases/orders/{purchaseOrderId}

**Receipts (5):**

- GET /purchases/orders/{purchaseOrderId}/receipts (for specific order)
- POST /purchases/orders/{purchaseOrderId}/receipts (create receipt)
- GET /purchases/receipts (all receipts) ✨ NEW
- GET /purchases/receipts/{receiptId} (single receipt)
- DELETE /purchases/receipts/{receiptId} ✨ NEW

### Components: 15 Schemas

- 9 order-related schemas
- 6 receipt-related schemas

### Path Parameters: 3

- PurchaseOrderIdParam
- ReceiptIdParam
- SalesOrderIdParam (for future use)

---

## 💡 Design Rationale

### Why this structure?

1. **RESTful Design**: Resources (orders, receipts) clearly identified in URL
2. **Scalability**: Easy to add more purchase-related resources under `/purchases/`
3. **Flexibility**:
   - Context-specific queries: receipts for a specific order
   - Global queries: all receipts across orders
4. **Consistency**: Follows similar patterns for nested resources like medications/variants

This structure provides both hierarchical (order → receipts) and flat (all receipts) access patterns, giving maximum flexibility for different use cases.

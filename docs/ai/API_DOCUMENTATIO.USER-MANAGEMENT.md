# PharmaFlow API - Authentication & User Management

## 🚀 User Stories Implementation

### ✅ Implemented Features

1. **User Register** - First user becomes owner automatically
2. **Review Registration Requests** - Owner can approve/reject staff registrations
3. **User Login** - Secure login with JWT
4. **User Logout** - Client-side token removal
5. **Reset Password** - Password recovery
6. **View & Search Staff Account** - Owner can view and search staff
7. **Edit Staff Account** - Owner can edit staff details
8. **Activate/Deactivate Staff Account** - Owner can manage staff status
9. **Manage Medications** - Owner can CUD, Staff can Read (with nested variants creation)
10. **Manage Medication Variants** - Owner can CUD, Staff can Read
11. **Manage Suppliers** - Owner only (with nested medication variants creation)
12. **Manage Supplier Medication Variants** - Owner only
13. **Manage Purchase Orders** - Owner only (with nested items creation)
14. **Manage Purchase Order Items** - Owner only
15. **Manage Purchase Order Receipts** - Owner only (with nested items creation)
16. **Manage Purchase Order Receipt Items** - Owner only

---

# API Reference (English)

Base URL: `http://localhost:80` or your API host.  
All endpoints (unless noted) require `Authorization: Bearer <token>` header for protected routes.

Auth roles: `owner` (full), `staff` (read), `sales` (limited as assigned).

---

## Authentication Routes (`/api/auth`)

### 1. Register (create registration or owner)

**POST** `/api/auth/register`  
**Public**

**Request**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "0123456789",
  "address": "123 Main St",
  "password": "password123"
}
```

**Possible responses**

- First user (owner created):

```json
{
  "success": true,
  "message": "Owner account created",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "status": "active"
  }
}
```

- Subsequent users (registration request created):

```json
{
  "success": true,
  "message": "Registration request created and pending approval",
  "registrationId": "5"
}
```

---

### 2. Login

**POST** `/api/auth/login`  
**Public**

**Request**

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "status": "active"
  }
}
```

---

### 3. Logout

**POST** `/api/auth/logout`  
**Auth required**  
Client should delete token locally. Server may optionally revoke a token depending on implementation.

**Response**

```json
{ "success": true, "message": "Logged out" }
```

---

### 4. Reset Password

**POST** `/api/auth/reset-password`  
**Public**

**Request**

```json
{
  "email": "john@example.com",
  "newPassword": "newpassword123"
}
```

**Response**

```json
{ "success": true, "message": "Password reset successful (or email sent)" }
```

---

### 5. Change Password

**POST** `/api/auth/change-password`  
**Auth required**

**Request**

```json
{
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response**

```json
{ "success": true, "message": "Password changed successfully" }
```

---

### 6. Get current user

**GET** `/api/auth/me`  
**Auth required**

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "status": "active"
  }
}
```

---

## Registration Management (`/api/registrations`) — Owner only

### Get all registration requests

**GET** `/api/registrations?status=pending`

**Response**

```json
[
  {
    "id": "5",
    "name": "Jane Staff",
    "email": "jane@example.com",
    "phone": "0987654321",
    "address": "456 Oak St",
    "status": "pending",
    "createdAt": "2025-10-01T12:00:00Z"
  }
]
```

---

### Get registration by id

**GET** `/api/registrations/:id`

**Response**

```json
{
  "id": "5",
  "name": "Jane Staff",
  "email": "jane@example.com",
  "phone": "0987654321",
  "address": "456 Oak St",
  "status": "pending",
  "createdAt": "2025-10-01T12:00:00Z"
}
```

---

### Approve registration

**POST** `/api/registrations/:id/approve`

**Request**

```json
{
  "role": "staff"
}
```

**Response**

```json
{
  "success": true,
  "message": "Registration approved, user created",
  "user": {
    "id": "6",
    "name": "Jane Staff",
    "email": "jane@example.com",
    "role": "staff",
    "status": "active"
  }
}
```

---

### Reject registration

**POST** `/api/registrations/:id/reject`

**Response**

```json
{ "success": true, "message": "Registration rejected" }
```

---

### Delete registration

**DELETE** `/api/registrations/:id`

**Response**

```json
{ "success": true, "message": "Registration deleted" }
```

---

## User Management (`/api/users`)

> Owner has full access. Authenticated users can get their own profile.

### Get all staff (owner only)

**GET** `/api/users/staff?search=jane&role=staff&status=active&page=1&limit=25`

**Response**

```json
{
  "success": true,
  "data": [
    {
      "id": "6",
      "name": "Jane Staff",
      "email": "jane@example.com",
      "role": "staff",
      "status": "active"
    }
  ],
  "pagination": { "page": 1, "limit": 25, "total": 1, "totalPages": 1 }
}
```

---

### Get all users (owner only)

**GET** `/api/users?search=john&page=1&limit=25`

**Response** similar to above.

---

### Get user by id (auth required)

**GET** `/api/users/:id`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "owner",
    "status": "active"
  }
}
```

---

### Create user (owner only)

**POST** `/api/users`

**Request**

```json
{
  "name": "New Staff",
  "email": "newstaff@example.com",
  "phone": "0112233445",
  "address": "100 New St",
  "role": "staff",
  "status": "active"
}
```

**Response**

```json
{
  "success": true,
  "message": "User created",
  "data": { "id": "7", "name": "New Staff", "email": "newstaff@example.com" }
}
```

---

### Update user (owner only)

**PUT** `/api/users/:id`

**Request**

```json
{ "name": "Updated Staff", "role": "sales" }
```

**Response**

```json
{
  "success": true,
  "message": "User updated",
  "data": { "id": "7", "name": "Updated Staff", "role": "sales" }
}
```

---

### Delete user (owner only)

**DELETE** `/api/users/:id`

**Response**

```json
{ "success": true, "message": "User deleted" }
```

---

### Activate / Deactivate / Suspend user (owner only)

**PATCH** `/api/users/:id/activate`  
**PATCH** `/api/users/:id/deactivate`  
**PATCH** `/api/users/:id/suspend`

**Response**

```json
{ "success": true, "message": "User status updated" }
```

---

## Medications (`/api/medications`)

### Get all medications

**GET** `/api/medications?search=aspirin&status=active&page=1&limit=10`

**Response**

```json
{
  "success": true,
  "count": 1,
  "data": [
    {
      "id": "1",
      "name": "Aspirin",
      "brand": "Generic",
      "description": "Pain reliever and fever reducer",
      "isPrescriptionRequired": false,
      "isControlledSubstance": false,
      "status": "active",
      "variants": [
        {
          "id": "11",
          "sku": "ASP-500",
          "name": "Aspirin 500mg tablet",
          "unit": "tablet",
          "sellPrice": 1000,
          "isActive": true
        }
      ],
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 10, "total": 1, "totalPages": 1 }
}
```

---

### Get medication by id

**GET** `/api/medications/:id`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "Aspirin",
    "variants": [{ "id": "11", "sku": "ASP-500" }]
  }
}
```

---

### Create medication with variants (owner only)

**POST** `/api/medications`

**Request**

```json
{
  "name": "Aspirin",
  "brand": "Generic",
  "description": "Pain reliever and fever reducer",
  "isPrescriptionRequired": false,
  "isControlledSubstance": false,
  "status": "active",
  "variants": [
    {
      "sku": "ASP-500",
      "name": "Aspirin 500mg tablet",
      "unit": "tablet",
      "barcode": "1234567890123",
      "sellPrice": 1000,
      "isActive": true,
      "isForSale": true
    },
    {
      "sku": "ASP-1000",
      "name": "Aspirin 1000mg capsule",
      "unit": "capsule",
      "sellPrice": 2000,
      "isActive": true,
      "isForSale": true
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "message": "Medication created successfully",
  "data": {
    "id": "1",
    "name": "Aspirin",
    "variants": [
      { "id": "11", "sku": "ASP-500" },
      { "id": "12", "sku": "ASP-1000" }
    ]
  }
}
```

---

### Update medication with variants (owner only)

**PUT** `/api/medications/:id`

**Request**

```json
{
  "name": "Aspirin Updated",
  "variants": [{ "sku": "ASP-250", "name": "Aspirin 250mg" }]
}
```

**Response**

```json
{
  "success": true,
  "message": "Medication updated",
  "data": { "id": "1", "name": "Aspirin Updated" }
}
```

---

### Delete medication (owner only)

**DELETE** `/api/medications/:id`

**Response**

```json
{ "success": true, "message": "Medication deleted successfully" }
```

---

## Medication Variants (nested under medications)

### Get all variants for a medication

**GET** `/api/medications/:medicationId/variants?search=500mg&isActive=true&page=1&limit=10`

**Response**

```json
{
  "success": true,
  "count": 1,
  "data": [{ "id": "11", "sku": "ASP-500", "name": "Aspirin 500mg" }]
}
```

---

### Get variant by id

**GET** `/api/medications/:medicationId/variants/:id`

**Response**

```json
{
  "success": true,
  "data": { "id": "11", "sku": "ASP-500", "name": "Aspirin 500mg" }
}
```

---

### Create variant for a medication (owner only)

**POST** `/api/medications/:medicationId/variants`

**Request**

```json
{
  "sku": "ASP-250",
  "name": "Aspirin 250mg tablet",
  "unit": "tablet",
  "barcode": "9876543210987",
  "sellPrice": 800,
  "isActive": true,
  "isForSale": true
}
```

**Response**

```json
{
  "success": true,
  "message": "Medication variant created successfully",
  "data": { "id": "13", "sku": "ASP-250" }
}
```

---

### Update variant (owner only)

**PUT** `/api/medications/:medicationId/variants/:id`

**Request**

```json
{ "sellPrice": 900, "isActive": false }
```

**Response**

```json
{
  "success": true,
  "message": "Medication variant updated",
  "data": { "id": "13", "sellPrice": 900 }
}
```

---

### Delete variant (owner only)

**DELETE** `/api/medications/:medicationId/variants/:id`

**Response**

```json
{ "success": true, "message": "Medication variant deleted successfully" }
```

---

## Suppliers (`/api/suppliers`)

### Get all suppliers

**GET** `/api/suppliers?search=pharmacorp&status=active&limit=100&offset=0`

**Response**

```json
[
  {
    "id": "1",
    "name": "PharmaCorp",
    "contactName": "John Smith",
    "email": "contact@pharmacorp.com",
    "phone": "0123456789",
    "address": "123 Supplier St",
    "status": "active",
    "medicationVariants": [
      {
        "id": "1",
        "medicationVariantId": "11",
        "supplierSku": "SKU-12345",
        "leadTimeDays": 7
      }
    ]
  }
]
```

---

### Get supplier by id (includes medication variants)

**GET** `/api/suppliers/:id`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "name": "PharmaCorp",
    "medicationVariants": [
      { "id": "1", "medicationVariantId": "11", "supplierSku": "SKU-12345" }
    ]
  }
}
```

---

### Create supplier with medication variants (owner only)

**POST** `/api/suppliers`

**Request**

```json
{
  "name": "PharmaCorp",
  "contactName": "John Smith",
  "email": "contact@pharmacorp.com",
  "phone": "0123456789",
  "address": "123 Supplier St",
  "status": "active",
  "medicationVariants": [
    {
      "medicationVariantId": 11,
      "supplierSku": "SKU-12345",
      "leadTimeDays": 7
    },
    { "medicationVariantId": 12, "supplierSku": "SKU-67890", "leadTimeDays": 5 }
  ]
}
```

**Response**

```json
{
  "success": true,
  "message": "Supplier created successfully",
  "data": { "id": "1", "name": "PharmaCorp" }
}
```

---

### Update supplier with medication variants (owner only)

**PUT** `/api/suppliers/:id`

**Request**

```json
{
  "name": "PharmaCorp Updated",
  "medicationVariants": [
    {
      "medicationVariantId": 13,
      "supplierSku": "SKU-11111",
      "leadTimeDays": 10
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "message": "Supplier updated",
  "data": { "id": "1", "name": "PharmaCorp Updated" }
}
```

---

### Delete supplier (owner only)

**DELETE** `/api/suppliers/:id`

**Response**

```json
{ "success": true, "message": "Supplier deleted successfully" }
```

---

## Supplier Medication Variants (nested under suppliers)

### Get all supplier medication variants for a supplier

**GET** `/api/suppliers/:supplierId/variants?medicationVariantId=11&limit=100&offset=0`

**Response**

```json
{
  "success": true,
  "count": 1,
  "data": [
    { "id": "1", "medicationVariantId": "11", "supplierSku": "SKU-12345" }
  ]
}
```

---

### Get supplier medication variant by id

**GET** `/api/suppliers/:supplierId/variants/:id`

**Response**

```json
{
  "success": true,
  "data": { "id": "1", "medicationVariantId": "11", "supplierSku": "SKU-12345" }
}
```

---

### Create supplier medication variant (owner only)

**POST** `/api/suppliers/:supplierId/variants`

**Request**

```json
{ "medicationVariantId": 11, "supplierSku": "SKU-22222", "leadTimeDays": 4 }
```

**Response**

```json
{
  "success": true,
  "message": "Supplier medication variant created",
  "data": { "id": "2", "supplierSku": "SKU-22222" }
}
```

---

### Update supplier medication variant (owner only)

**PUT** `/api/suppliers/:supplierId/variants/:id`

**Request**

```json
{ "supplierSku": "SKU-54321", "leadTimeDays": 5 }
```

**Response**

```json
{
  "success": true,
  "message": "Supplier medication variant updated",
  "data": { "id": "2", "supplierSku": "SKU-54321" }
}
```

---

### Delete supplier medication variant (owner only)

**DELETE** `/api/suppliers/:supplierId/variants/:id`

**Response**

```json
{ "success": true, "message": "Supplier medication variant deleted" }
```

---

## Purchase Orders (`/api/purchase-orders`)

### Get all purchase orders

**GET** `/api/purchase-orders?supplierId=1&status=pending&startDate=2025-01-01&endDate=2025-12-31&page=1&limit=50`

**Response**

```json
[
  {
    "id": "1",
    "supplierId": "1",
    "orderDate": "2025-01-15T00:00:00Z",
    "expectedDate": "2025-01-22T00:00:00Z",
    "status": "pending",
    "totalAmount": "1500.00",
    "createdBy": "1",
    "items": [
      {
        "id": "1",
        "supplierMedicationVariantId": "1",
        "quantity": 100,
        "unitPrice": "10.00",
        "totalPrice": "1000.00"
      }
    ]
  }
]
```

---

### Get purchase order by id (includes items)

**GET** `/api/purchase-orders/:id`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "supplierId": "1",
    "items": [
      { "id": "1", "supplierMedicationVariantId": "1", "quantity": 100 }
    ]
  }
}
```

---

### Create purchase order with items (owner only)

**POST** `/api/purchase-orders`

**Request**

```json
{
  "supplierId": 1,
  "expectedDate": "2025-01-22T00:00:00Z",
  "status": "pending",
  "totalAmount": 2500.0,
  "createdBy": 1,
  "items": [
    {
      "supplierMedicationVariantId": 1,
      "quantity": 100,
      "unitPrice": 10.0,
      "totalPrice": 1000.0
    },
    {
      "supplierMedicationVariantId": 2,
      "quantity": 50,
      "unitPrice": 30.0,
      "totalPrice": 1500.0
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "message": "Purchase order created with items",
  "data": { "id": "1", "items": [{ "id": "1", "purchaseOrderId": "1" }] }
}
```

---

### Update purchase order with items (owner only)

**PUT** `/api/purchase-orders/:id`

**Request**

```json
{
  "status": "ordered",
  "totalAmount": 3000.0,
  "items": [
    {
      "supplierMedicationVariantId": 3,
      "quantity": 20,
      "unitPrice": 25.0,
      "totalPrice": 500.0
    }
  ]
}
```

**Response**

```json
{
  "success": true,
  "message": "Purchase order updated",
  "data": { "id": "1", "status": "ordered" }
}
```

---

### Delete purchase order (owner only)

**DELETE** `/api/purchase-orders/:id`

**Response**

```json
{ "success": true, "message": "Purchase order deleted" }
```

---

## Purchase Order Items (nested under purchase orders)

### Get all items for a purchase order

**GET** `/api/purchase-orders/:purchaseOrderId/items`

**Response**

```json
{
  "success": true,
  "count": 1,
  "data": [{ "id": "1", "supplierMedicationVariantId": "1", "quantity": 100 }]
}
```

---

### Get item by id

**GET** `/api/purchase-orders/:purchaseOrderId/items/:id`

**Response**

```json
{
  "success": true,
  "data": { "id": "1", "supplierMedicationVariantId": "1", "quantity": 100 }
}
```

---

### Create item (owner only)

**POST** `/api/purchase-orders/:purchaseOrderId/items`

**Request**

```json
{
  "supplierMedicationVariantId": 1,
  "quantity": 100,
  "unitPrice": 10.0,
  "totalPrice": 1000.0
}
```

**Response**

```json
{
  "success": true,
  "message": "Item created",
  "data": { "id": "5", "purchaseOrderId": "1" }
}
```

---

### Update item (owner only)

**PUT** `/api/purchase-orders/:purchaseOrderId/items/:id`

**Request**

```json
{ "quantity": 120, "totalPrice": 1200.0 }
```

**Response**

```json
{
  "success": true,
  "message": "Item updated",
  "data": { "id": "5", "quantity": 120 }
}
```

---

### Delete item (owner only)

**DELETE** `/api/purchase-orders/:purchaseOrderId/items/:id`

**Response**

```json
{ "success": true, "message": "Item deleted" }
```

---

## Purchase Order Receipts (`/api/purchase-orders/:orderId/receipts`)

### Get all receipts for a purchase order

**GET** `/api/purchase-orders/:orderId/receipts`

**Response**

```json
[
  {
    "id": "1",
    "purchaseOrderId": "1",
    "receivedDate": "2025-01-20T00:00:00Z",
    "receivedBy": "1",
    "items": [{ "id": "1", "purchaseOrderItemId": "1", "quantity": 95 }]
  }
]
```

---

### Get receipt by id (includes items)

**GET** `/api/purchase-orders/:orderId/receipts/:id`

**Response**

```json
{
  "success": true,
  "data": {
    "id": "1",
    "purchaseOrderId": "1",
    "items": [{ "id": "1", "purchaseOrderItemId": "1", "quantity": 95 }]
  }
}
```

---

### Create receipt with items (owner only)

**POST** `/api/purchase-orders/:orderId/receipts`

**Request**

```json
{
  "purchaseOrderId": 1,
  "receivedBy": 1,
  "items": [
    { "purchaseOrderItemId": 1, "quantity": 95 },
    { "purchaseOrderItemId": 2, "quantity": 48 }
  ]
}
```

**Response**
{ "success": true, "message": "Receipt created with items", "data": { "id": "1", "items": [ { "id": "1" } ] } }

---

### Update receipt with items (owner only)

**PUT** `/api/purchase-orders/:orderId/receipts/:id`

**Request**

```json
{
  "receivedDate": "2025-01-21T00:00:00Z",
  "items": [{ "purchaseOrderItemId": 3, "quantity": 20 }]
}
```

**Response**

```json
{ "success": true, "message": "Receipt updated", "data": { "id": "1" } }
```

---

### Delete receipt (owner only)

**DELETE** `/api/purchase-orders/:orderId/receipts/:id`

**Response**

```json
{ "success": true, "message": "Receipt deleted" }
```

---

## Purchase Order Receipt Items (nested under receipts)

### Get all receipt items for a receipt

**GET** `/api/purchase-orders/:orderId/receipts/:receiptId/items`

**Response**

```json
{
  "success": true,
  "count": 1,
  "data": [{ "id": "1", "purchaseOrderItemId": "1", "quantity": 95 }]
}
```

---

### Get receipt item by id

**GET** `/api/purchase-orders/:orderId/receipts/:receiptId/items/:id`

**Response**

```json
{
  "success": true,
  "data": { "id": "1", "purchaseOrderItemId": "1", "quantity": 95 }
}
```

---

### Create receipt item (owner only)

**POST** `/api/purchase-orders/:orderId/receipts/:receiptId/items`

**Request**

```json
{ "purchaseOrderItemId": 1, "quantity": 95 }
```

**Response**

```json
{
  "success": true,
  "message": "Receipt item created",
  "data": { "id": "2", "purchaseOrderReceiptId": "1" }
}
```

---

### Update receipt item (owner only)

**PUT** `/api/purchase-orders/:orderId/receipts/:receiptId/items/:id`

**Request**

```json
{ "quantity": 100 }
```

**Response**

```json
{
  "success": true,
  "message": "Receipt item updated",
  "data": { "id": "2", "quantity": 100 }
}
```

---

### Delete receipt item (owner only)

**DELETE** `/api/purchase-orders/:orderId/receipts/:receiptId/items/:id`

**Response**

```json
{ "success": true, "message": "Receipt item deleted" }
```

---

## Warehouse Management

### Warehouse Zones

**GET** `/api/warehouse-zones`  
**GET** `/api/warehouse-zones/:id`  
**POST** `/api/warehouse-zones` (owner)  
**PUT** `/api/warehouse-zones/:id` (owner)  
**DELETE** `/api/warehouse-zones/:id` (owner)

**Request example (create zone)**

```json
{ "name": "Zone A", "description": "Main receiving area" }
```

**Response**

```json
{
  "success": true,
  "message": "Zone created",
  "data": { "id": "1", "name": "Zone A" }
}
```

---

### Warehouse Racks

**GET** `/api/warehouse-zones/:zoneId/racks`  
**GET** `/api/warehouse-zones/:zoneId/racks/:id`  
**POST** `/api/warehouse-zones/:zoneId/racks` (owner)  
**PUT** `/api/warehouse-zones/:zoneId/racks/:id` (owner)  
**DELETE** `/api/warehouse-zones/:zoneId/racks/:id` (owner)

**Request example (create rack)**

```json
{ "code": "RACK-01", "description": "Top shelf rack" }
```

**Response**

```json
{
  "success": true,
  "message": "Rack created",
  "data": { "id": "1", "code": "RACK-01" }
}
```

---

### Warehouse Bins

**GET** `/api/warehouse-zones/:zoneId/racks/:rackId/bins`  
**GET** `/api/warehouse-zones/:zoneId/racks/:rackId/bins/:id`  
**POST** `/api/warehouse-zones/:zoneId/racks/:rackId/bins` (owner)  
**PUT** `/api/warehouse-zones/:zoneId/racks/:rackId/bins/:id` (owner)  
**DELETE** `/api/warehouse-zones/:zoneId/racks/:rackId/bins/:id` (owner)

**Request example (create bin)**

```json
{ "code": "BIN-01", "capacity": 100 }
```

**Response**

```json
{
  "success": true,
  "message": "Bin created",
  "data": { "id": "1", "code": "BIN-01", "capacity": 100 }
}
```

---

## Notes & Constraints

- All protected routes require `Authorization: Bearer <your-jwt-token>` header.
- Use nested routes for child resources (variants, items, receipts) as shown above.
- When creating parent with nested children in a single request, endpoints perform the creation inside a database transaction. If any child creation fails the whole request is rolled back.
- All IDs in examples are strings for readability but your API may return numbers or BigInt depending on implementation.
- Validation errors return `400` with `{ "success": false, "message": "<error details>" }`.
- Not found resources return `404`.
- Server errors return `500`.

---

## Example Testing Flow (curl)

1. Register first user (owner)

```bash
curl -X POST http://localhost:80/api/auth/register -H "Content-Type: application/json" -d '{"name":"Owner User","email":"owner@pharmaflow.com","phone":"0123456789","address":"HQ","password":"owner123"}'
```

2. Login to get token

```bash
curl -X POST http://localhost:80/api/auth/login -H "Content-Type: application/json" -d '{"email":"owner@pharmaflow.com","password":"owner123"}'
```

3. Create medication with variants

```bash
curl -X POST http://localhost:80/api/medications -H "Authorization: Bearer <token>" -H "Content-Type: application/json" -d '{"name":"Aspirin","status":"active","variants":[{"sku":"ASP-500","name":"Aspirin 500mg","unit":"tablet","sellPrice":1000}] }'
```

---

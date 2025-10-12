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
8. **Active/Deactive Staff Account** - Owner can manage staff status
9. **Manage Medications** - Owner can CUD, Staff can Read (with nested variants creation)
10. **Manage Medication Variants** - Owner can CUD, Staff can Read
11. **Manage Suppliers** - Owner only (with nested medication variants creation)
12. **Manage Supplier Medication Variants** - Owner only
13. **Manage Purchase Orders** - Owner only (with nested items creation)
14. **Manage Purchase Order Items** - Owner only
15. **Manage Purchase Order Receipts** - Owner only (with nested items creation)
16. **Manage Purchase Order Receipt Items** - Owner only

## 📚 API Endpoints

### Authentication Routes (`/api/auth`)

#### 1. Register

\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
"name": "John Doe",
"email": "john@example.com",
"phone": "0123456789",
"address": "123 Main St",
"password": "password123"
}
\`\`\`

**Response:**

- **First User:** Creates owner account immediately
- **Subsequent Users:** Creates registration request (pending approval)

#### 2. Login

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
"email": "john@example.com",
"password": "password123"
}
\`\`\`

**Response:**

\`\`\`json
{
"success": true,
"message": "Login successful",
"token": "eyJhbGciOiJIUzI1NiIs...",
"user": {
"id": "1",
"name": "John Doe",
"email": "john@example.com",
"role": "owner",
"status": "active"
}
}
\`\`\`

#### 3. Logout

\`\`\`http
POST /api/auth/logout
\`\`\`

#### 4. Reset Password

\`\`\`http
POST /api/auth/reset-password
Content-Type: application/json

{
"email": "john@example.com",
"newPassword": "newpassword123"
}
\`\`\`

#### 5. Change Password (Requires Authentication)

\`\`\`http
POST /api/auth/change-password
Authorization: Bearer <token>
Content-Type: application/json

{
"oldPassword": "oldpassword123",
"newPassword": "newpassword123"
}
\`\`\`

#### 6. Get Current User (Requires Authentication)

\`\`\`http
GET /api/auth/me
Authorization: Bearer <token>
\`\`\`

---

### Registration Management Routes (`/api/registrations`)

**All routes require Owner authentication**

#### 1. Get All Registration Requests

\`\`\`http
GET /api/registrations?status=pending
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `status`: Filter by status (pending, approved, rejected)

#### 2. Get Registration by ID

\`\`\`http
GET /api/registrations/:id
Authorization: Bearer <owner-token>
\`\`\`

#### 3. Approve Registration

\`\`\`http
POST /api/registrations/:id/approve
Authorization: Bearer <owner-token>
Content-Type: application/json

{
<<<<<<< HEAD:apps/api/API_DOCUMENTATION.md
"password": "temporaryPassword123",
"role": "staff"
=======
"role": "staff"

> > > > > > > next:apps/api/API_DOCUMENTATIO.USER-MANAGEMENT.md
> > > > > > > }
> > > > > > > \`\`\`

**Roles:** `staff` | `sales`

**Note:** Password is retrieved from the registration request (stored during user registration). Owner only needs to specify the role.

#### 4. Reject Registration

\`\`\`http
POST /api/registrations/:id/reject
Authorization: Bearer <owner-token>
\`\`\`

#### 5. Delete Registration

\`\`\`http
DELETE /api/registrations/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### User Management Routes (`/api/users`)

**Most routes require Owner authentication**

#### 1. Get All Staff (Owner Only)

\`\`\`http
GET /api/users/staff?search=john&role=staff&status=active
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `search`: Search by name, email, or phone
- `role`: Filter by role (owner, staff, sales)
- `status`: Filter by status (active, inactive, suspended)

#### 2. Get All Users (Owner Only)

\`\`\`http
GET /api/users?search=john
Authorization: Bearer <owner-token>
\`\`\`

#### 3. Get User by ID (Authenticated)

\`\`\`http
GET /api/users/:id
Authorization: Bearer <token>
\`\`\`

#### 4. Create User (Owner Only)

\`\`\`http
POST /api/users
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "Jane Doe",
"email": "jane@example.com",
"phone": "0987654321",
"address": "456 Oak St",
"role": "staff",
"status": "active"
}
\`\`\`

#### 5. Update User (Owner Only)

\`\`\`http
PUT /api/users/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "Jane Smith",
"role": "sales"
}
\`\`\`

#### 6. Delete User (Owner Only)

\`\`\`http
DELETE /api/users/:id
Authorization: Bearer <owner-token>
\`\`\`

#### 7. Activate User (Owner Only)

\`\`\`http
PATCH /api/users/:id/activate
Authorization: Bearer <owner-token>
\`\`\`

#### 8. Deactivate User (Owner Only)

\`\`\`http
PATCH /api/users/:id/deactivate
Authorization: Bearer <owner-token>
\`\`\`

#### 9. Suspend User (Owner Only)

\`\`\`http
PATCH /api/users/:id/suspend
Authorization: Bearer <owner-token>
\`\`\`

---

### Medication Management Routes (`/api/medications`)

**Read operations:** Requires authentication (Owner or Staff)  
**Create/Update/Delete operations:** Requires Owner authentication only

#### 1. Get All Medications

\`\`\`http
GET /api/medications?search=aspirin&status=active&page=1&limit=10
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**

- `search`: Search by name or description
- `status`: Filter by status (active, discontinued)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
\`\`\`json
{
"success": true,
"data": [
{
"id": "1",
"name": "Aspirin",
"description": "Pain reliever and fever reducer",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z",
"variants": [
{
"id": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
}
]
}
],
"pagination": {
"page": 1,
"limit": 10,
"total": 1,
"totalPages": 1
}
}
\`\`\`

#### 2. Get Medication by ID

\`\`\`http
GET /api/medications/:id
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {
"id": "1",
"name": "Aspirin",
"description": "Pain reliever and fever reducer",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z",
"variants": [
{
"id": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
}
]
}
}
\`\`\`

#### 3. Create Medication with Variants (Owner Only) ⭐ NEW

**This endpoint now supports creating medication and its variants in a single transaction!**

\`\`\`http
POST /api/medications
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "Aspirin",
"description": "Pain reliever and fever reducer",
"status": "active",
"variants": [
{
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
},
{
"dosage": "1000mg",
"form": "capsule",
"packaging": "blister",
"status": "active"
}
]
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Medication created successfully with 2 variants",
"data": {
"id": "1",
"name": "Aspirin",
"description": "Pain reliever and fever reducer",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z",
"variants": [
{
"id": "1",
"medicationId": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
},
{
"id": "2",
"medicationId": "1",
"dosage": "1000mg",
"form": "capsule",
"packaging": "blister",
"status": "active"
}
]
}
}
\`\`\`

#### 4. Update Medication with Variants (Owner Only) ⭐ UPDATED

**This endpoint now supports updating medication and adding/updating variants in a single transaction!**

\`\`\`http
PUT /api/medications/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "Aspirin Updated",
"description": "Updated description",
"status": "active",
"variants": [
{
"dosage": "250mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
}
]
}
\`\`\`

#### 5. Delete Medication (Owner Only)

\`\`\`http
DELETE /api/medications/:id
Authorization: Bearer <owner-token>
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Medication deleted successfully"
}
\`\`\`

---

### Medication Variant Management Routes (`/api/medication-variants`)

**Read operations:** Requires authentication (Owner or Staff)  
**Create/Update/Delete operations:** Requires Owner authentication only

#### 1. Get All Medication Variants

\`\`\`http
GET /api/medication-variants?medicationId=1&search=500mg&status=active&page=1&limit=10
Authorization: Bearer <token>
\`\`\`

**Query Parameters:**

- `medicationId`: Filter by medication ID
- `search`: Search by dosage, form, or packaging
- `status`: Filter by status (active, discontinued)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**Response:**
\`\`\`json
{
"success": true,
"data": [
{
"id": "1",
"medicationId": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z"
}
],
"pagination": {
"page": 1,
"limit": 10,
"total": 1,
"totalPages": 1
}
}
\`\`\`

#### 2. Get Medication Variant by ID

\`\`\`http
GET /api/medication-variants/:id
Authorization: Bearer <token>
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"data": {
"id": "1",
"medicationId": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z"
}
}
\`\`\`

#### 3. Create Medication Variant (Owner Only)

\`\`\`http
POST /api/medication-variants
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"medicationId": 1,
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Medication variant created successfully",
"data": {
"id": "1",
"medicationId": "1",
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active",
"createdAt": "2025-01-01T00:00:00.000Z",
"updatedAt": "2025-01-01T00:00:00.000Z"
}
}
\`\`\`

#### 4. Update Medication Variant (Owner Only)

\`\`\`http
PUT /api/medication-variants/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"dosage": "1000mg",
"form": "capsule",
"packaging": "blister",
"status": "active"
}
\`\`\`

#### 5. Delete Medication Variant (Owner Only)

\`\`\`http
DELETE /api/medication-variants/:id
Authorization: Bearer <owner-token>
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Medication variant deleted successfully"
}
\`\`\`

---

### Supplier Management Routes (`/api/suppliers`)

**All routes require Owner authentication only**

#### 1. Get All Suppliers

\`\`\`http
GET /api/suppliers?search=pharma&status=active&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `search`: Search by name, contact name, or email
- `status`: Filter by status (active, inactive, blacklisted)
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
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
"medicationVariantId": "1",
"supplierSku": "SKU-12345",
"leadTimeDays": 7,
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
]
\`\`\`

#### 2. Get Supplier by ID

\`\`\`http
GET /api/suppliers/:id
Authorization: Bearer <owner-token>
\`\`\`

**Response includes all medication variants for this supplier:**
\`\`\`json
{
"success": true,
"data": {
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
"medicationVariantId": "1",
"supplierSku": "SKU-12345",
"leadTimeDays": 7,
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
}
\`\`\`

#### 3. Create Supplier with Medication Variants ⭐ NEW

**This endpoint now supports creating supplier and its medication variants in a single transaction!**

\`\`\`http
POST /api/suppliers
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "PharmaCorp",
"contactName": "John Smith",
"email": "contact@pharmacorp.com",
"phone": "0123456789",
"address": "123 Supplier St",
"status": "active",
"medicationVariants": [
{
"medicationVariantId": 1,
"supplierSku": "SKU-12345",
"leadTimeDays": 7
},
{
"medicationVariantId": 2,
"supplierSku": "SKU-67890",
"leadTimeDays": 5
}
]
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Supplier created successfully with 2 medication variants",
"data": {
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
"supplierId": "1",
"medicationVariantId": "1",
"supplierSku": "SKU-12345",
"leadTimeDays": 7
},
{
"id": "2",
"supplierId": "1",
"medicationVariantId": "2",
"supplierSku": "SKU-67890",
"leadTimeDays": 5
}
]
}
}
\`\`\`

#### 4. Update Supplier with Medication Variants ⭐ UPDATED

**This endpoint now supports updating supplier and adding/updating medication variants in a single transaction!**

\`\`\`http
PUT /api/suppliers/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"name": "PharmaCorp Updated",
"status": "active",
"medicationVariants": [
{
"medicationVariantId": 3,
"supplierSku": "SKU-11111",
"leadTimeDays": 10
}
]
}
\`\`\`

#### 5. Delete Supplier

\`\`\`http
DELETE /api/suppliers/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### Supplier Medication Variant Routes (`/api/supplier-medication-variants`)

**All routes require Owner authentication only**

#### 1. Get All Supplier Medication Variants

\`\`\`http
GET /api/supplier-medication-variants?supplierId=1&medicationVariantId=2&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `supplierId`: Filter by supplier ID
- `medicationVariantId`: Filter by medication variant ID
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
[
{
"id": "1",
"supplierId": "1",
"medicationVariantId": "2",
"supplierSku": "SKU-12345",
"leadTimeDays": 7,
"supplierName": "PharmaCorp",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
\`\`\`

#### 2. Get Supplier Medication Variant by ID

\`\`\`http
GET /api/supplier-medication-variants/:id
Authorization: Bearer <owner-token>
\`\`\`

#### 3. Create Supplier Medication Variant

\`\`\`http
POST /api/supplier-medication-variants
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"supplierId": 1,
"medicationVariantId": 1,
"supplierSku": "SKU-12345",
"leadTimeDays": 7
}
\`\`\`

#### 4. Update Supplier Medication Variant

\`\`\`http
PUT /api/supplier-medication-variants/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"supplierSku": "SKU-54321",
"leadTimeDays": 5
}
\`\`\`

#### 5. Delete Supplier Medication Variant

\`\`\`http
DELETE /api/supplier-medication-variants/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### Purchase Order Routes (`/api/purchase-orders`)

**All routes require Owner authentication only**

#### 1. Get All Purchase Orders

\`\`\`http
GET /api/purchase-orders?supplierId=1&status=pending&startDate=2025-01-01&endDate=2025-12-31&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `supplierId`: Filter by supplier ID
- `status`: Filter by status (pending, ordered, received, cancelled)
- `startDate`: Filter by order date (start)
- `endDate`: Filter by order date (end)
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
[
{
"id": "1",
"supplierId": "1",
"orderDate": "2025-01-15T00:00:00.000Z",
"expectedDate": "2025-01-22T00:00:00.000Z",
"status": "pending",
"totalAmount": "1500.00",
"createdBy": "1",
"supplierName": "PharmaCorp",
"createdByName": "Owner User",
"items": [
{
"id": "1",
"supplierMedicationVariantId": "1",
"quantity": 100,
"unitPrice": "10.00",
"totalPrice": "1000.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
]
\`\`\`

#### 2. Get Purchase Order by ID

\`\`\`http
GET /api/purchase-orders/:id
Authorization: Bearer <owner-token>
\`\`\`

**Response includes all items for this purchase order:**
\`\`\`json
{
"success": true,
"data": {
"id": "1",
"supplierId": "1",
"orderDate": "2025-01-15T00:00:00.000Z",
"expectedDate": "2025-01-22T00:00:00.000Z",
"status": "pending",
"totalAmount": "1500.00",
"createdBy": "1",
"supplierName": "PharmaCorp",
"createdByName": "Owner User",
"items": [
{
"id": "1",
"supplierMedicationVariantId": "1",
"quantity": 100,
"unitPrice": "10.00",
"totalPrice": "1000.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
}
\`\`\`

#### 3. Create Purchase Order with Items ⭐ NEW

**This endpoint now supports creating purchase order and its items in a single transaction!**

\`\`\`http
POST /api/purchase-orders
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"supplierId": 1,
"expectedDate": "2025-01-22T00:00:00.000Z",
"status": "pending",
"totalAmount": 2500.00,
"createdBy": 1,
"items": [
{
"supplierMedicationVariantId": 1,
"quantity": 100,
"unitPrice": 10.00,
"totalPrice": 1000.00
},
{
"supplierMedicationVariantId": 2,
"quantity": 50,
"unitPrice": 30.00,
"totalPrice": 1500.00
}
]
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Purchase order created successfully with 2 items",
"data": {
"id": "1",
"supplierId": "1",
"orderDate": "2025-01-15T00:00:00.000Z",
"expectedDate": "2025-01-22T00:00:00.000Z",
"status": "pending",
"totalAmount": "2500.00",
"createdBy": "1",
"items": [
{
"id": "1",
"purchaseOrderId": "1",
"supplierMedicationVariantId": "1",
"quantity": 100,
"unitPrice": "10.00",
"totalPrice": "1000.00"
},
{
"id": "2",
"purchaseOrderId": "1",
"supplierMedicationVariantId": "2",
"quantity": 50,
"unitPrice": "30.00",
"totalPrice": "1500.00"
}
]
}
}
\`\`\`

#### 4. Update Purchase Order with Items ⭐ UPDATED

**This endpoint now supports updating purchase order and adding/updating items in a single transaction!**

\`\`\`http
PUT /api/purchase-orders/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"status": "ordered",
"totalAmount": 3000.00,
"items": [
{
"supplierMedicationVariantId": 3,
"quantity": 20,
"unitPrice": 25.00,
"totalPrice": 500.00
}
]
}
\`\`\`

#### 5. Delete Purchase Order

\`\`\`http
DELETE /api/purchase-orders/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### Purchase Order Item Routes (`/api/purchase-order-items`)

**All routes require Owner authentication only**

#### 1. Get All Purchase Order Items

\`\`\`http
GET /api/purchase-order-items?purchaseOrderId=1&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `purchaseOrderId`: Filter by purchase order ID
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
[
{
"id": "1",
"purchaseOrderId": "1",
"supplierMedicationVariantId": "1",
"quantity": 100,
"unitPrice": "10.00",
"totalPrice": "1000.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
\`\`\`

#### 2. Get Purchase Order Item by ID

\`\`\`http
GET /api/purchase-order-items/:id
Authorization: Bearer <owner-token>
\`\`\`

#### 3. Create Purchase Order Item

\`\`\`http
POST /api/purchase-order-items
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"purchaseOrderId": 1,
"supplierMedicationVariantId": 1,
"quantity": 100,
"unitPrice": 10.00,
"totalPrice": 1000.00
}
\`\`\`

#### 4. Update Purchase Order Item

\`\`\`http
PUT /api/purchase-order-items/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"quantity": 150,
"totalPrice": 1500.00
}
\`\`\`

#### 5. Delete Purchase Order Item

\`\`\`http
DELETE /api/purchase-order-items/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### Purchase Order Receipt Routes (`/api/purchase-order-receipts`)

**All routes require Owner authentication only**

#### 1. Get All Purchase Order Receipts

\`\`\`http
GET /api/purchase-order-receipts?purchaseOrderId=1&startDate=2025-01-01&endDate=2025-12-31&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `purchaseOrderId`: Filter by purchase order ID
- `startDate`: Filter by received date (start)
- `endDate`: Filter by received date (end)
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
[
{
"id": "1",
"purchaseOrderId": "1",
"receivedDate": "2025-01-20T00:00:00.000Z",
"receivedBy": "1",
"receivedByName": "Owner User",
"poOrderDate": "2025-01-15T00:00:00.000Z",
"poStatus": "received",
"supplierName": "PharmaCorp",
"items": [
{
"id": "1",
"purchaseOrderItemId": "1",
"quantity": 95,
"orderedQuantity": 100,
"unitPrice": "10.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
]
\`\`\`

#### 2. Get Purchase Order Receipt by ID

\`\`\`http
GET /api/purchase-order-receipts/:id
Authorization: Bearer <owner-token>
\`\`\`

**Response includes all items for this receipt:**
\`\`\`json
{
"success": true,
"data": {
"id": "1",
"purchaseOrderId": "1",
"receivedDate": "2025-01-20T00:00:00.000Z",
"receivedBy": "1",
"receivedByName": "Owner User",
"poOrderDate": "2025-01-15T00:00:00.000Z",
"poStatus": "received",
"supplierName": "PharmaCorp",
"items": [
{
"id": "1",
"purchaseOrderItemId": "1",
"quantity": 95,
"orderedQuantity": 100,
"unitPrice": "10.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
}
}
\`\`\`

#### 3. Create Purchase Order Receipt with Items ⭐ NEW

**This endpoint now supports creating purchase order receipt and its items in a single transaction!**

\`\`\`http
POST /api/purchase-order-receipts
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"purchaseOrderId": 1,
"receivedBy": 1,
"items": [
{
"purchaseOrderItemId": 1,
"quantity": 95
},
{
"purchaseOrderItemId": 2,
"quantity": 48
}
]
}
\`\`\`

**Response:**
\`\`\`json
{
"success": true,
"message": "Purchase order receipt created successfully with 2 items",
"data": {
"id": "1",
"purchaseOrderId": "1",
"receivedDate": "2025-01-20T00:00:00.000Z",
"receivedBy": "1",
"items": [
{
"id": "1",
"purchaseOrderReceiptId": "1",
"purchaseOrderItemId": "1",
"quantity": 95
},
{
"id": "2",
"purchaseOrderReceiptId": "1",
"purchaseOrderItemId": "2",
"quantity": 48
}
]
}
}
\`\`\`

#### 4. Update Purchase Order Receipt with Items ⭐ UPDATED

**This endpoint now supports updating purchase order receipt and adding/updating items in a single transaction!**

\`\`\`http
PUT /api/purchase-order-receipts/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"receivedDate": "2025-01-21T00:00:00.000Z",
"items": [
{
"purchaseOrderItemId": 3,
"quantity": 20
}
]
}
\`\`\`

#### 5. Delete Purchase Order Receipt

\`\`\`http
DELETE /api/purchase-order-receipts/:id
Authorization: Bearer <owner-token>
\`\`\`

---

### Purchase Order Receipt Item Routes (`/api/purchase-order-receipt-items`)

**All routes require Owner authentication only**

#### 1. Get All Purchase Order Receipt Items

\`\`\`http
GET /api/purchase-order-receipt-items?purchaseOrderReceiptId=1&limit=100&offset=0
Authorization: Bearer <owner-token>
\`\`\`

**Query Parameters:**

- `purchaseOrderReceiptId`: Filter by purchase order receipt ID
- `limit`: Items per page (default: 100)
- `offset`: Offset for pagination (default: 0)

**Response:**
\`\`\`json
[
{
"id": "1",
"purchaseOrderReceiptId": "1",
"purchaseOrderItemId": "1",
"quantity": 95,
"orderedQuantity": 100,
"unitPrice": "10.00",
"medicationName": "Aspirin",
"variantName": "500mg Tablet"
}
]
\`\`\`

#### 2. Get Purchase Order Receipt Item by ID

\`\`\`http
GET /api/purchase-order-receipt-items/:id
Authorization: Bearer <owner-token>
\`\`\`

#### 3. Create Purchase Order Receipt Item

\`\`\`http
POST /api/purchase-order-receipt-items
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"purchaseOrderReceiptId": 1,
"purchaseOrderItemId": 1,
"quantity": 95
}
\`\`\`

#### 4. Update Purchase Order Receipt Item

\`\`\`http
PUT /api/purchase-order-receipt-items/:id
Authorization: Bearer <owner-token>
Content-Type: application/json

{
"quantity": 100
}
\`\`\`

#### 5. Delete Purchase Order Receipt Item

\`\`\`http
DELETE /api/purchase-order-receipt-items/:id
Authorization: Bearer <owner-token>
\`\`\`

---

## 🔐 Authentication & Authorization

### JWT Token

All protected routes require a JWT token in the Authorization header:

\`\`\`
Authorization: Bearer <your-jwt-token>
\`\`\`

### User Roles

- **owner**: Full access to all features
- **staff**: Limited access (to be defined)
- **sales**: Limited access (to be defined)

### User Status

- **active**: Can login and use system
- **inactive**: Cannot login
- **suspended**: Cannot login (temporary)

---

## 📝 Database Schema

### Users Table

\`\`\`javascript
{
id: bigint (primary key),
name: varchar(100),
email: varchar(255) unique,
phone: varchar(10) unique,
address: text,
role: enum('owner', 'staff', 'sales'),
status: enum('active', 'inactive', 'suspended')
}
\`\`\`

### User Credentials Table

\`\`\`javascript
{
id: bigint (primary key),
userId: bigint (foreign key -> users.id),
provider: varchar(50), // 'local'
identifier: varchar(255), // email
secret: varchar(255) // hashed password
}
\`\`\`

### User Registrations Table

\`\`\`javascript
{
<<<<<<< HEAD:apps/api/API_DOCUMENTATION.md
id: bigint (primary key),
name: varchar(100),
email: varchar(255) unique,
phone: varchar(10) unique,
address: text,
status: enum('pending', 'approved', 'rejected')
=======
id: bigint (primary key),
name: varchar(100),
email: varchar(255) unique,
phone: varchar(10) unique,
address: text,
password: varchar(255), // hashed password
status: enum('pending', 'approved', 'rejected')

> > > > > > > next:apps/api/API_DOCUMENTATIO.USER-MANAGEMENT.md
> > > > > > > }
> > > > > > > \`\`\`

### Medications Table

\`\`\`javascript
{
id: bigint (primary key),
name: varchar(255),
description: text,
status: enum('active', 'discontinued'),
createdAt: timestamp,
updatedAt: timestamp
}
\`\`\`

### Medication Variants Table

\`\`\`javascript
{
id: bigint (primary key),
medicationId: bigint (foreign key -> medications.id),
dosage: varchar(50),
form: varchar(50),
packaging: varchar(100),
status: enum('active', 'discontinued'),
createdAt: timestamp,
updatedAt: timestamp
}
\`\`\`

### Suppliers Table

\`\`\`javascript
{
id: bigint (primary key),
name: varchar(100),
contactName: varchar(100),
email: varchar(255) unique,
phone: varchar(10) unique,
address: text,
status: enum('active', 'inactive', 'blacklisted')
}
\`\`\`

### Supplier Medication Variants Table

\`\`\`javascript
{
id: bigint (primary key),
supplierId: bigint (foreign key -> suppliers.id),
medicationVariantId: bigint (foreign key -> medicationVariants.id),
supplierSku: varchar(50),
leadTimeDays: integer
}
\`\`\`

### Purchase Orders Table

\`\`\`javascript
{
id: bigint (primary key),
supplierId: bigint (foreign key -> suppliers.id),
orderDate: timestamp,
expectedDate: timestamp,
status: enum('pending', 'ordered', 'received', 'cancelled'),
totalAmount: decimal(10, 2),
createdBy: bigint (foreign key -> users.id)
}
\`\`\`

### Purchase Order Items Table

\`\`\`javascript
{
id: bigint (primary key),
purchaseOrderId: bigint (foreign key -> purchaseOrders.id),
supplierMedicationVariantId: bigint (foreign key -> supplierMedicationVariants.id),
quantity: integer,
unitPrice: decimal(10, 2),
totalPrice: decimal(10, 2)
}
\`\`\`

### Purchase Order Receipts Table

\`\`\`javascript
{
id: bigint (primary key),
purchaseOrderId: bigint (foreign key -> purchaseOrders.id),
receivedDate: timestamp,
receivedBy: bigint (foreign key -> users.id)
}
\`\`\`

### Purchase Order Receipt Items Table

\`\`\`javascript
{
id: bigint (primary key),
purchaseOrderReceiptId: bigint (foreign key -> purchaseOrderReceipts.id),
purchaseOrderItemId: bigint (foreign key -> purchaseOrderItems.id),
quantity: integer
}
\`\`\`

---

## 🧪 Testing Workflow with Nested Creation

### Complete Workflow Example

#### 1. Register & Login as Owner

\`\`\`bash

# Register first user (becomes owner)

curl -X POST http://localhost:80/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{
"name": "Owner User",
"email": "owner@pharmaflow.com",
"phone": "0123456789",
"address": "123 Main St",
"password": "owner123"
}'

# Login

curl -X POST http://localhost:80/api/auth/login \
 -H "Content-Type: application/json" \
 -d '{
"email": "owner@pharmaflow.com",
"password": "owner123"
}'
\`\`\`

#### 2. Create Medication with Variants (Single API Call) ⭐

\`\`\`bash
curl -X POST http://localhost:80/api/medications \
 -H "Authorization: Bearer <owner-token>" \
 -H "Content-Type: application/json" \
 -d '{
"name": "Aspirin",
"description": "Pain reliever and fever reducer",
"status": "active",
"variants": [
{
"dosage": "500mg",
"form": "tablet",
"packaging": "bottle",
"status": "active"
},
{
"dosage": "1000mg",
"form": "capsule",
"packaging": "blister",
"status": "active"
}
]
}'
\`\`\`

#### 3. Create Supplier with Medication Variants (Single API Call) ⭐

<<<<<<< HEAD:apps/api/API_DOCUMENTATION.md
\`\`\`bash
curl -X POST \/api/suppliers \
 -H "Authorization: Bearer <owner-token>" \
 -H "Content-Type: application/json" \
 -d '{
"name": "PharmaCorp",
"contactName": "John Smith",
"email": "contact@pharmacorp.com",
"phone": "0123456789",
"address": "123 Supplier St",
"status": "active",
"medicationVariants": [
{
"medicationVariantId": 1,
"supplierSku": "SKU-12345",
"leadTimeDays": 7
},
{
"medicationVariantId": 2,
"supplierSku": "SKU-67890",
"leadTimeDays": 5
}
]
}'
\`\`\`

#### 4. Create Purchase Order with Items (Single API Call) ⭐

=======

```bash
curl -X POST http://localhost:80/api/registrations/2/approve \
  -H "Authorization: Bearer <owner-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "staff"
  }'
```

**Note:** The password from step 3 is stored securely and will be used automatically.

### 5. View All Staff

> > > > > > > next:apps/api/API_DOCUMENTATIO.USER-MANAGEMENT.md

\`\`\`bash
curl -X POST /api/purchase-orders \
 -H "Authorization: Bearer <owner-token>" \
 -H "Content-Type: application/json" \
 -d '
{
"supplierId": 1,
"orderDate": "2025-10-08",
"expectedDate": "2025-10-15",
"status": "pending",
"totalAmount": 2500.00,
"createdBy": 1,
"items": [
{
"supplierMedicationVariantId": 1,
"quantity": 100,
"unitPrice": 10.00,
"totalPrice": 1000.00
},
{
"supplierMedicationVariantId": 2,
"quantity": 50,
"unitPrice": 30.00,
"totalPrice": 1500.00
}
]
}'
\`\`\`

#### 5. Create Purchase Order Receipt with Items (Single API Call) ⭐

\`\`\`bash
curl -X POST api/purchase-order-receipts \
 -H "Authorization: Bearer <owner-token>" \
 -H "Content-Type: application/json" \
 -d '{
"purchaseOrderId": 1,
"receivedBy": 1,
"items": [
{
"purchaseOrderItemId": 1,
"quantity": 95
},
{
"purchaseOrderItemId": 2,
"quantity": 48
}
]
}'
\`\`\`

#### 6. Get Complete Data with Nested Relations

\`\`\`bash

# Get medication with all variants

curl -X GET http://localhost:80/api/medications/1 \
 -H "Authorization: Bearer <owner-token>"

# Get supplier with all medication variants

curl -X GET http://localhost:80/api/suppliers/1 \
 -H "Authorization: Bearer <owner-token>"

# Get purchase order with all items

curl -X GET http://localhost:80/api/purchase-orders/1 \
 -H "Authorization: Bearer <owner-token>"

# Get purchase order receipt with all items

curl -X GET http://localhost:80/api/purchase-order-receipts/1 \
 -H "Authorization: Bearer <owner-token>"
\`\`\`

---

## 🎯 Key Features

### ✨ Nested Creation Support

All major entities now support creating related records in a single API call:

1. **Medications**: Create medication + variants together
2. **Suppliers**: Create supplier + medication variants together
3. **Purchase Orders**: Create PO + items together
4. **Purchase Order Receipts**: Create receipt + items together

### 🔒 Transaction Safety

All nested creations are wrapped in database transactions, ensuring:

- **Atomicity**: All records are created or none are created
- **Data Integrity**: No orphaned records if creation fails
- **Rollback**: Automatic rollback on any error

### 📊 Complete Data Retrieval

GET endpoints return complete data with nested relations:

- Medications include their variants
- Suppliers include their medication variants
- Purchase orders include their items
- Purchase order receipts include their items

---

## 📦 Dependencies

\`\`\`json
{
"bcryptjs": "^2.4.3",
"jsonwebtoken": "^9.0.2",
"drizzle-orm": "^0.44.6",
"express": "^5.1.0"
}
\`\`\`

---

## 🎯 Next Steps

1. Add email notifications for registration approval/rejection
2. Implement refresh token mechanism
3. Add password strength validation
4. Add rate limiting for login attempts
5. Implement session management
6. Add audit logs for user actions
7. Add inventory management integration
8. Implement automatic inventory updates on PO receipt
9. Add reporting and analytics endpoints
10. Implement bulk operations for efficiency

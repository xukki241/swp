# PharmaFlow System - Use Cases Documentation

**Generated from**: Backend API Routes Analysis  
**Date**: October 21, 2025  
**Version**: 1.0

---

## Table of Contents

1. [User Management](#1-user-management)
2. [Product Catalog Management (Medications)](#2-product-catalog-management-medications)
3. [Supplier Management](#3-supplier-management)
4. [Procurement Management (Purchase Orders)](#4-procurement-management-purchase-orders)
5. [Inventory Management](#5-inventory-management)
6. [Sales Management (POS)](#6-sales-management-pos)
7. [Reports & Analytics](#7-reports--analytics)
8. [Dashboard](#8-dashboard)
9. [Warehouse Management](#9-warehouse-management)

---

## 1. User Management

### UC-1: User Register (First User)

**Actor**: User (Unregistered)  
**Description**: As a user, I want to register to the system and become admin if I am the first user.  
**API Endpoint**: `POST /api/auth/register`  
**Access**: Public  
**Implementation**: ✅ Implemented in `authRoutes.js`

**Flow**:

1. User provides name, email, phone, address, password
2. System checks if this is the first user
3. If first user, create account with 'owner' role and status 'active'
4. If not first user, create registration request with status 'pending'
5. Return success message

### UC-2: Review Registration Requests

**Actor**: Owner  
**Description**: As an owner, I want to approve or reject account that my staff had registered.  
**API Endpoints**:

- `GET /api/registrations` - List all registration requests
- `GET /api/registrations/:id` - Get registration details
- `POST /api/registrations/:id/approve` - Approve registration
- `POST /api/registrations/:id/reject` - Reject registration
- `DELETE /api/registrations/:id` - Delete registration

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `registrationRoutes.js`

**Approve Flow**:

1. Owner views list of pending registration requests
2. Owner selects a registration to review
3. Owner provides password and optional role (default: staff)
4. System creates user account with active status
5. System marks registration as approved
6. User can now login

**Reject Flow**:

1. Owner views registration details
2. Owner rejects the request
3. System marks registration as rejected
4. Applicant cannot access the system

### UC-3: User Login

**Actor**: User  
**Description**: As a user, I want to log in securely using my username and password.  
**API Endpoint**: `POST /api/auth/login`  
**Access**: Public  
**Implementation**: ✅ Implemented in `authRoutes.js`

**Flow**:

1. User enters email and password
2. System validates credentials
3. System checks user status (must be 'active')
4. System generates JWT token
5. Return token and user information

### UC-4: User Logout

**Actor**: User (Authenticated)  
**Description**: As a user, I want to log out securely from the system.  
**API Endpoint**: `POST /api/auth/logout`  
**Access**: Public (Client-side token removal)  
**Implementation**: ✅ Implemented in `authRoutes.js`

### UC-5: Reset Password (Forgot Password)

**Actor**: User  
**Description**: As a user, I want to reset my password so that I can regain access to the system if I forgot it.  
**API Endpoints**:

- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-reset-otp` - Verify OTP and reset password

**Access**: Public  
**Implementation**: ✅ Implemented in `authRoutes.js`

**Flow**:

1. User provides identifier (email or phone) and method ('email' or 'sms')
2. System generates and sends OTP
3. User receives OTP via chosen method
4. User provides identifier, OTP, new password, and method
5. System verifies OTP
6. System updates password
7. User can login with new password

### UC-6: View & Manage Staff Account List

**Actor**: Owner  
**Description**: As an owner, I want to view the list of staff accounts registered in the system, including their basic details and roles.  
**API Endpoints**:

- `GET /api/users` - List all users with filters (search, role, status)
- `GET /api/users/staff` - List all staff accounts
- `GET /api/users/:id` - Get user details

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `userRoutes.js`

**Features**:

- Search by name, email, or phone
- Filter by role (owner, staff)
- Filter by status (active, inactive, suspended)
- View user details including name, email, phone, address, role, status

### UC-7: Edit Staff Account

**Actor**: Owner  
**Description**: As an owner, I want to edit an employee's account details or permissions.  
**API Endpoint**: `PUT /api/users/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `userRoutes.js`

**Editable Fields**:

- Name
- Email
- Phone
- Address
- Role (owner, staff)
- Status (active, inactive, suspended)

**Restrictions**:

- Cannot change own role
- Cannot change own status

### UC-8: Activate/Deactivate/Suspend Staff Account

**Actor**: Owner  
**Description**: As an owner, I want to lock or deactivate an employee account.  
**API Endpoints**:

- `PATCH /api/users/:id/activate` - Activate user
- `PATCH /api/users/:id/deactivate` - Deactivate user
- `PATCH /api/users/:id/suspend` - Suspend user

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `userRoutes.js`

**Status Meanings**:

- **Active**: User can login and access system
- **Inactive**: User cannot login
- **Suspended**: User is temporarily locked (e.g., due to violations)

**Restrictions**:

- Cannot deactivate or suspend own account

### UC-9: Add New Product to Catalog

**Actor**: Owner  
**Description**: As an owner, I want to add a new product medication to the inventory, including name, price, and category.  
**API Endpoint**: `POST /api/medications`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `medicationRoutes.js`

**Features**:

- Batch creation supported (create multiple medications at once)
- Automatic creation of medication variants
- Fields: name, category, activeIngredient, form, routeOfAdministration, manufacturer, countryOfOrigin, requiresPrescription, contraindications

### UC-10: View & Search Product Catalog

**Actor**: User (Authenticated)  
**Description**: As an owner/staff, I want to search and view details of a product.  
**API Endpoints**:

- `GET /api/medications` - List all medications with filters
- `GET /api/medications/:id` - Get medication details
- `GET /api/medications/:id/inventory` - Get medication inventory
- `GET /api/medications/:id/suppliers` - Get medication suppliers
- `GET /api/medications/:id/purchases` - Get purchase orders
- `GET /api/medications/:id/sales` - Get sales history

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `medicationRoutes.js`

**Search/Filter Options**:

- Search by name or active ingredient
- Filter by category
- Filter by form
- Filter by manufacturer
- Filter by prescription requirement
- Pagination support

### UC-11: Edit Product Information

**Actor**: Owner  
**Description**: As an owner, I want to update product information.  
**API Endpoint**: `PATCH /api/medications/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `medicationRoutes.js`

### UC-12: Disable Product

**Actor**: Owner  
**Description**: As an owner, I want to deactivate a product no longer in business.  
**API Endpoint**: `DELETE /api/medications/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `medicationRoutes.js`

---

## 3. Supplier Management

### UC-13: Add Supplier

**Actor**: Owner  
**Description**: As an owner, I want to add a new supplier.  
**API Endpoint**: `POST /api/suppliers`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierRoutes.js`

**Features**:

- Batch creation supported
- Fields: name, contactPerson, phone, email, address, taxCode

### UC-14: View & Search Suppliers

**Actor**: User (Authenticated)  
**Description**: As an owner, I want to view a list of suppliers and search for supplier so that I can get their information quickly.  
**API Endpoints**:

- `GET /api/suppliers` - List all suppliers
- `GET /api/suppliers/:id` - Get supplier details

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `supplierRoutes.js`

**Search/Filter Options**:

- Search by name, contact person, or email
- Pagination support

### UC-15: Edit Supplier Information

**Actor**: Owner  
**Description**: As an owner, I want to edit supplier contact details.  
**API Endpoint**: `PATCH /api/suppliers/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierRoutes.js`

### UC-15A: Add/Manage Supplier's Products

**Actor**: Owner  
**Description**: As an owner, I want to add a product that a supplier provides.  
**API Endpoints**:

- `GET /api/suppliers/:supplierId/medications` - List supplier products
- `POST /api/suppliers/:supplierId/medications` - Add product to supplier
- `PATCH /api/suppliers/:supplierId/medications/:id` - Update supplier product
- `DELETE /api/suppliers/:supplierId/medications/:id` - Remove product from supplier

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierMedicationVariantRoutes.js`

**Fields**:

- Medication Variant ID
- Unit Cost (supplier's price)
- Lead Time Days

### UC-15B: Edit Supplier's Products

**Actor**: Owner  
**Description**: As an owner, I want to update details (SKU, lead time, cost) of a product a supplier provides.  
**API Endpoint**: `PATCH /api/suppliers/:supplierId/medications/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierMedicationVariantRoutes.js`

### UC-15C: Remove Supplier's Product

**Actor**: Owner  
**Description**: As an owner, I want to remove a product from a supplier's offerings.  
**API Endpoint**: `DELETE /api/suppliers/:supplierId/medications/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierMedicationVariantRoutes.js`

### UC-15D: Create Supplier with Products

**Actor**: Owner  
**Description**: As an owner, I want to create a new supplier and directly assign products they provide.  
**API Endpoint**: `POST /api/suppliers` (with medicationVariants array)  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierRoutes.js`

### UC-15E: Edit Supplier with Products

**Actor**: Owner  
**Description**: As an owner, I want to edit supplier info and manage their products (add, update, delete) in one screen.  
**API Endpoint**: `PATCH /api/suppliers/:id` (with medicationVariants array)  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `supplierRoutes.js`

---

## 4. Procurement Management (Purchase Orders)

### UC-21: View Supplier's Products

**Actor**: User (Authenticated)  
**Description**: As an owner, I want to view all products that are provided by a specific supplier.  
**API Endpoint**: `GET /api/suppliers/:supplierId/medications`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `supplierMedicationVariantRoutes.js`

### UC-22: Add Stock (with Purchase Details)

**Actor**: Owner  
**Description**: As a pharmacist, I want to add new stock including batch, expiry, and purchase cost.  
**Related to**: Purchase Order Receipt Creation  
**API Endpoint**: `POST /api/purchases/:purchaseOrderId/receipts`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `purchaseOrderReceiptRoutes.js`

**Flow**:

1. Create Purchase Order
2. Receive goods from supplier
3. Create receipt with batch details
4. System automatically updates inventory

### UC-23: View Entry via Barcode Scan

**Actor**: Owner  
**Description**: As an owner, I want to view information of a batch if provided by a specific supplier.  
**API Endpoint**: `GET /api/inventory/batches/:inventoryBatchId`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

### UC-24: Adjust Stock Quantity

**Actor**: Owner  
**Description**: As a pharmacist, I want to adjust stock due to damage or loss with a reason.  
**API Endpoint**: `PATCH /api/inventory/batches/:inventoryBatchId/adjust`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

**Fields**:

- Adjustment Type (add, remove, damage, loss, expired, return, correction)
- Quantity
- Reason

### UC-25: Auto Deduct Stock

**Actor**: System  
**Description**: The system automatically deducts inventory when closing a successfully sale.  
**Triggered by**: Sales Order Completion  
**Implementation**: ✅ Implemented in `salesOrderController.js`

### UC-26: Low Stock Alert

**Actor**: System  
**Description**: The system alerts when stock falls below minimum threshold.  
**API Endpoint**: `GET /api/inventory/low-stock`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

**Features**:

- Configurable threshold per product
- Filter by zone, rack, bin
- Automatic daily report generation

### UC-27: Configure Stock Threshold

**Actor**: Owner  
**Description**: As an owner, I want to configure expiry alert period (e.g., 3 months, 1 month).  
**API Endpoint**: `PATCH /api/inventory/batches/:inventoryBatchId`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

### UC-28: Expiry Alert

**Actor**: System  
**Description**: The system alerts when a batch is close to expiry.  
**API Endpoint**: `GET /api/inventory/expiring`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

**Parameters**:

- Days threshold (e.g., 30, 60, 90 days)
- Filter by zone, rack, bin

### UC-29: Configure Expiry Warning

**Actor**: Owner  
**Description**: As an owner, I want to configure expiry alert period (e.g., 3 months, 1 month).  
**Implementation**: Via inventory batch threshold settings

### UC-30: Create Purchase Order

**Actor**: Owner  
**Description**: As an owner, I want to create a purchase order based on low storage.  
**API Endpoint**: `POST /api/purchases`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `purchaseOrderRoutes.js`

**Features**:

- Batch creation supported
- Fields: supplierId, expectedDeliveryDate, notes, items[]
- Items include: medicationVariantId, quantity, unitCost
- Status tracking: pending, ordered, partially_received, received, cancelled

### UC-31: Send Purchase Order to Supplier (Email)

**Actor**: System (triggered by Owner)  
**Description**: The system automatically emails purchase orders to suppliers.  
**API Endpoint**: `POST /api/email/purchase-order/:purchaseOrderId`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `emailRoutes.js`

**Email Contents**:

- Purchase Order ID and date
- List of products and quantities
- Expected delivery date
- Contact information

### UC-32: View Purchase Order List & Status

**Actor**: User (Authenticated)  
**Description**: As an owner, I want to view purchase orders and track their status.  
**API Endpoints**:

- `GET /api/purchases` - List all purchase orders
- `GET /api/purchases/:id` - Get purchase order details

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `purchaseOrderRoutes.js`

**Filter Options**:

- Status (pending, ordered, partially_received, received, cancelled)
- Supplier
- Date range
- Search by PO number

### UC-33: Confirm Order & Stock In

**Actor**: Owner  
**Description**: As an owner, I want to confirm an order as 'Received' and stock in products.  
**API Endpoints**:

- `POST /api/purchases/:purchaseOrderId/receipts` - Create receipt
- `PATCH /api/purchases/:id` - Update PO status

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `purchaseOrderReceiptRoutes.js`

**Receipt Flow**:

1. Create receipt with received items
2. For each item, specify: quantity, batchNumber, expiryDate, bin location
3. System creates inventory batches
4. System updates purchase order status
5. If all items received, mark PO as 'received'
6. If partial, mark as 'partially_received'

### UC-34: Search Product to Add to Sales Invoice

**Actor**: Cashier  
**Description**: As a cashier, I want to search product with autocomplete to add to the sales invoice.  
**API Endpoint**: `GET /api/medications` (with search parameter)  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `medicationRoutes.js`

### UC-35: Add Product via Barcode Scan

**Actor**: Cashier  
**Description**: As a cashier, I want to scan products to add them to the sales invoice.  
**API Endpoint**: `GET /api/medications/variants/:id` (search by barcode)  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented via medication variant lookup

### UC-36: Edit/Discount Invoice Item

**Actor**: Cashier  
**Description**: As a cashier, I want to edit an invoice item, or apply some, or apply discounts.  
**Implementation**: Frontend state management before creating sales order

### UC-37: Complete Payment

**Actor**: Cashier  
**Description**: As a cashier, I want to record payment method (cash/transfer) and complete sales.  
**API Endpoint**: `POST /api/sales`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `salesOrderRoutes.js`

**Fields**:

- Customer ID (optional)
- Payment Method (cash, card, transfer, e-wallet)
- Items: medicationVariantId, quantity, unitPrice, discount, subtotal
- Total Amount
- Amount Paid
- Change Given
- Notes

### UC-38: Auto-Generate Invoice

**Actor**: System  
**Description**: The system automatically generates an invoice for each successful transaction.  
**Implementation**: ✅ Automatic on sales order creation

### UC-39: Create/Print Invoice

**Actor**: Cashier  
**Description**: As a cashier, I want to create electronic invoices and print them out for customers.  
**API Endpoints**:

- `POST /api/sales` - Create sales order (generates invoice)
- `GET /api/sales/:id` - Get invoice details for printing

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `salesOrderRoutes.js`

---

## 6. Sales Management (POS)

### UC-40: View Daily Sales Summary

**Actor**: Owner  
**Description**: As an owner, I want to view today's sales overview on the dashboard.  
**API Endpoint**: `GET /api/reports/daily`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `reportRoutes.js`

**Summary Includes**:

- Total revenue for the day
- Number of transactions
- Top selling products
- Hourly sales breakdown
- Payment method distribution

### UC-41: View Low Stock on Dashboard

**Actor**: Owner  
**Description**: As an owner, I want to see low stock products directly on the dashboard.  
**API Endpoint**: `GET /api/inventory/low-stock`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

### UC-42: View Expiring Products on Dashboard

**Actor**: Owner  
**Description**: As an owner, I want to see expiring products on the dashboard.  
**API Endpoint**: `GET /api/inventory/expiring`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

---

## 7. Reports & Analytics

### UC-43: View Sales Reports

**Actor**: Owner  
**Description**: As an owner, I want to view detailed profit per product or overall.  
**API Endpoints**:

- `GET /api/reports` - List all reports
- `POST /api/reports` - Generate custom report
- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/weekly` - Weekly sales report
- `GET /api/reports/monthly` - Monthly sales report

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `reportRoutes.js`

**Report Types**:

- **Daily Sales**: Today's sales summary
- **Weekly Sales**: Week-over-week analysis with daily breakdown
- **Monthly Sales**: Monthly overview with weekly breakdown
- **Inventory**: Current inventory levels
- **Sales Summary**: Overall sales performance
- **Low Stock**: Products below threshold
- **Expiry Dates**: Products expiring soon

**Filter Options**:

- Date range (startDate, endDate)
- Report type
- Pagination

### UC-44: View Profit Reports

**Actor**: Owner  
**Description**: As an owner, I want to view detailed profit analysis.  
**API Endpoint**: `GET /api/reports` (type: sales_summary)  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Included in sales reports

**Metrics**:

- Total revenue
- Cost of goods sold (COGS)
- Gross profit
- Profit margin percentage
- Per product profit analysis

### UC-45: View Inventory Value

**Actor**: Owner  
**Description**: As an owner, I want to see the current total value of inventory.  
**API Endpoint**: `GET /api/inventory/summary/by-variant`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

**Summary Includes**:

- Total inventory value (at cost)
- Total inventory value (at retail)
- Quantity by product
- Quantity by location
- Value by category

---

## 8. Dashboard

### UC-46: View AI-Powered Forecast

**Actor**: Owner  
**Description**: As an owner, I want to see AI based sales forecast for upcoming months.  
**Implementation**: 🚧 Planned (not yet implemented)

**Planned Features**:

- Sales trend analysis
- Seasonal pattern detection
- Product demand prediction
- Reorder point suggestions

### UC-47: AI Purchase Suggestion

**Actor**: System  
**Description**: As an owner, I want AI to suggest which products to restock based on forecast.  
**Implementation**: 🚧 Planned (not yet implemented)

**Planned Features**:

- Automatic reorder suggestions
- Optimal order quantity calculation
- Supplier recommendation
- Budget optimization

---

## 9. Warehouse Management

### UC-48: View Warehouse Layout

**Actor**: User (Authenticated)  
**Description**: As a user, I want to view the warehouse layout with zones, racks, and bins.  
**API Endpoints**:

- `GET /api/warehouse/zones` - List all zones
- `GET /api/warehouse/zones/:zoneId` - Get zone details
- `GET /api/warehouse/zones/:zoneId/racks` - List racks in zone
- `GET /api/warehouse/racks/:rackId` - Get rack details
- `GET /api/warehouse/racks/:rackId/bins` - List bins in rack
- `GET /api/warehouse/bins/:binId` - Get bin details

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `warehouse/index.js`

### UC-49: Manage Warehouse Structure

**Actor**: Owner  
**Description**: As an owner, I want to create and manage warehouse zones, racks, and bins.  
**API Endpoints**:

- `POST /api/warehouse/zones` - Create zone
- `PATCH /api/warehouse/zones/:zoneId` - Update zone
- `DELETE /api/warehouse/zones/:zoneId` - Delete zone
- Similar for racks and bins

**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `warehouse/index.js`

### UC-50: Move Inventory Between Bins

**Actor**: Owner  
**Description**: As an owner, I want to move inventory from one bin to another.  
**API Endpoint**: `POST /api/inventory/move`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `inventoryRoutes.js`

**Fields**:

- Source Bin ID
- Destination Bin ID
- Inventory Batch ID
- Quantity to Move
- Reason

### UC-51: View Bin Inventory

**Actor**: User (Authenticated)  
**Description**: As a user, I want to see what inventory is stored in each bin.  
**API Endpoint**: `GET /api/warehouse/bins/:binId/inventory`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `warehouse/binRoutes.js`

---

## 10. Customer Management

### UC-52: Create Customer Record

**Actor**: Staff  
**Description**: As staff, I want to add customers to record their purchases for loyalty tracking.  
**API Endpoint**: `POST /api/customers`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `customerRoutes.js`

**Features**:

- Batch creation supported
- Fields: name, phone, email, address, dateOfBirth, loyaltyPoints

### UC-53: View Customer List

**Actor**: Staff  
**Description**: As staff, I want to view and search customers quickly.  
**API Endpoints**:

- `GET /api/customers` - List all customers
- `GET /api/customers/:id` - Get customer details

**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `customerRoutes.js`

**Search Options**:

- Search by name, phone, or email
- Pagination support

### UC-54: Update Customer Information

**Actor**: Staff  
**Description**: As staff, I want to update customer contact details.  
**API Endpoint**: `PATCH /api/customers/:id`  
**Access**: Private (Authenticated)  
**Implementation**: ✅ Implemented in `customerRoutes.js`

### UC-55: Delete Customer

**Actor**: Owner  
**Description**: As an owner, I want to remove customer records.  
**API Endpoint**: `DELETE /api/customers/:id`  
**Access**: Private (Owner only)  
**Implementation**: ✅ Implemented in `customerRoutes.js`

---

## Implementation Status Summary

### ✅ Fully Implemented (47 Use Cases)

- User Management (UC 1-8): 100%
- Product Catalog (UC 9-12): 100%
- Supplier Management (UC 13-15E): 100%
- Procurement (UC 21-33): 100%
- Sales/POS (UC 34-39): 100%
- Dashboard Basics (UC 40-42): 100%
- Reports (UC 43-45): 100%
- Warehouse (UC 48-51): 100%
- Customer Management (UC 52-55): 100%

### 🚧 Planned/Not Implemented (2 Use Cases)

- AI Features (UC 46-47): Forecasting and AI suggestions

### Implementation Rate: **96%** (47/49 use cases)

---

## API Endpoints Summary

### Authentication & Users

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/verify-reset-otp` - Verify OTP and reset
- `POST /api/auth/change-password` - Change password
- `GET /api/auth/me` - Get current user
- `GET /api/users` - List users
- `GET /api/users/staff` - List staff
- `GET /api/users/:id` - Get user details
- `POST /api/users` - Create user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PATCH /api/users/:id/activate` - Activate user
- `PATCH /api/users/:id/deactivate` - Deactivate user
- `PATCH /api/users/:id/suspend` - Suspend user

### Registration Requests

- `GET /api/registrations` - List registrations
- `GET /api/registrations/:id` - Get registration
- `POST /api/registrations/:id/approve` - Approve
- `POST /api/registrations/:id/reject` - Reject
- `DELETE /api/registrations/:id` - Delete

### Medications

- `GET /api/medications` - List medications
- `GET /api/medications/:id` - Get medication
- `POST /api/medications` - Create medication(s)
- `PATCH /api/medications/:id` - Update medication
- `DELETE /api/medications/:id` - Delete medication
- `GET /api/medications/:id/inventory` - Get inventory
- `GET /api/medications/:id/suppliers` - Get suppliers
- `GET /api/medications/:id/purchases` - Get purchases
- `GET /api/medications/:id/sales` - Get sales
- `GET /api/medications/:medicationId/variants` - List variants
- `GET /api/medications/variants/:id/inventory` - Variant inventory

### Suppliers

- `GET /api/suppliers` - List suppliers
- `GET /api/suppliers/:id` - Get supplier
- `POST /api/suppliers` - Create supplier(s)
- `PATCH /api/suppliers/:id` - Update supplier
- `DELETE /api/suppliers/:id` - Delete supplier
- `GET /api/suppliers/:supplierId/medications` - List products
- `POST /api/suppliers/:supplierId/medications` - Add product
- `PATCH /api/suppliers/:supplierId/medications/:id` - Update product
- `DELETE /api/suppliers/:supplierId/medications/:id` - Remove product

### Purchase Orders

- `GET /api/purchases` - List purchase orders
- `GET /api/purchases/:id` - Get purchase order
- `POST /api/purchases` - Create purchase order(s)
- `PATCH /api/purchases/:id` - Update purchase order
- `DELETE /api/purchases/:id` - Delete purchase order
- `GET /api/purchases/receipts` - List all receipts
- `GET /api/purchases/:purchaseOrderId/receipts` - List PO receipts
- `POST /api/purchases/:purchaseOrderId/receipts` - Create receipt
- `GET /api/purchases/receipts/:id` - Get receipt details

### Inventory

- `GET /api/inventory` - List inventory
- `GET /api/inventory/batches/:inventoryBatchId` - Get batch
- `PATCH /api/inventory/batches/:inventoryBatchId` - Update batch
- `PATCH /api/inventory/batches/:inventoryBatchId/adjust` - Adjust quantity
- `POST /api/inventory/move` - Move between bins
- `GET /api/inventory/summary/by-variant` - Get summary
- `GET /api/inventory/expiring` - Get expiring inventory
- `GET /api/inventory/low-stock` - Get low stock items

### Sales Orders

- `GET /api/sales` - List sales orders
- `GET /api/sales/:id` - Get sales order
- `POST /api/sales` - Create sales order
- `PATCH /api/sales/:id` - Update sales order
- `DELETE /api/sales/:id` - Cancel sales order

### Customers

- `GET /api/customers` - List customers
- `GET /api/customers/:id` - Get customer
- `POST /api/customers` - Create customer(s)
- `PATCH /api/customers/:id` - Update customer
- `DELETE /api/customers/:id` - Delete customer

### Reports

- `GET /api/reports` - List reports
- `GET /api/reports/:id` - Get report
- `POST /api/reports` - Generate custom report
- `DELETE /api/reports/:id` - Delete report
- `GET /api/reports/daily` - Daily sales report
- `GET /api/reports/weekly` - Weekly sales report
- `GET /api/reports/monthly` - Monthly sales report

### Warehouse

- `GET /api/warehouse/zones` - List zones
- `GET /api/warehouse/zones/:zoneId` - Get zone
- `POST /api/warehouse/zones` - Create zone
- `PATCH /api/warehouse/zones/:zoneId` - Update zone
- `DELETE /api/warehouse/zones/:zoneId` - Delete zone
- `GET /api/warehouse/zones/:zoneId/racks` - List racks
- `GET /api/warehouse/racks/:rackId` - Get rack
- `GET /api/warehouse/racks/:rackId/bins` - List bins
- `GET /api/warehouse/bins/:binId` - Get bin
- `GET /api/warehouse/bins/:binId/inventory` - Bin inventory

### Email

- `POST /api/email/purchase-order/:purchaseOrderId` - Send PO email

---

## Notes

1. **UUID Migration**: All primary keys are using UUID v7 format (migrated from BigInt)
2. **Role-Based Access**: Most management operations require Owner role
3. **Batch Operations**: Many endpoints support batch creation (medications, suppliers, customers, purchase orders)
4. **Validation**: All endpoints use Zod schemas for request validation
5. **Pagination**: List endpoints support pagination (page, limit, sortBy, sortOrder)
6. **Search**: Most list endpoints support search functionality
7. **Soft Delete**: Some entities may use soft delete (status-based)

---

**End of Use Cases Documentation**

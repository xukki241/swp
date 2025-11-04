# Use Cases Mapping - Requirement vs Implementation

**Date**: October 21, 2025  
**Purpose**: Map original requirement document to actual implementation

---

## Group 1: User Management

| UC# | Feature Name                      | Requirement Description                                                                                                  | Implementation Status | API Endpoint                                                                                              | Notes                                                            |
| --- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| 1   | User Register                     | As a user, I want to register to the system and become admin if I am the first user                                      | ✅ Implemented        | `POST /api/auth/register`                                                                                 | First user gets 'owner' role, others create registration request |
| 2   | Review Registration Requests      | As an owner, I want to approve or reject account that my staff had registered                                            | ✅ Implemented        | `GET /api/registrations`<br>`POST /api/registrations/:id/approve`<br>`POST /api/registrations/:id/reject` | Owner can approve with password, role assignment                 |
| 3   | User Login                        | As a user, I want to log in securely using my username and password                                                      | ✅ Implemented        | `POST /api/auth/login`                                                                                    | JWT-based authentication                                         |
| 4   | User Logout                       | As a user, I want to log out securely from the system                                                                    | ✅ Implemented        | `POST /api/auth/logout`                                                                                   | Client-side token removal                                        |
| 5   | Reset Password                    | As a user, I want to reset my password so that I can regain access to the system if I forgot it                          | ✅ Implemented        | `POST /api/auth/forgot-password`<br>`POST /api/auth/verify-reset-otp`                                     | OTP via email or SMS                                             |
| 6   | View & Manage Staff Account       | As an owner, I want to view the list of staff accounts registered in the system, including their basic details and roles | ✅ Implemented        | `GET /api/users`<br>`GET /api/users/staff`                                                                | Supports search, role filter, status filter                      |
| 7   | Edit Staff Account                | As an owner, I want to edit an employee's account details or permissions                                                 | ✅ Implemented        | `PUT /api/users/:id`                                                                                      | Cannot change own role/status                                    |
| 8   | Activate/Deactivate Staff Account | As an owner, I want to lock or deactivate an employee account                                                            | ✅ Implemented        | `PATCH /api/users/:id/activate`<br>`PATCH /api/users/:id/deactivate`<br>`PATCH /api/users/:id/suspend`    | Three status levels: active, inactive, suspended                 |

**Group 1 Implementation**: ✅ **100% Complete (8/8)**

---

## Group 2: Product Catalog Management

| UC# | Feature Name             | Requirement Description                                                                                   | Implementation Status | API Endpoint                                         | Notes                                               |
| --- | ------------------------ | --------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------- | --------------------------------------------------- |
| 9   | Add Product to Catalog   | As an owner, I want to add a new product medication to the inventory, including name, price, and category | ✅ Implemented        | `POST /api/medications`                              | Supports batch creation with variants               |
| 10  | View & Search Product    | As an owner/staff, I want to search and view details of a product                                         | ✅ Implemented        | `GET /api/medications`<br>`GET /api/medications/:id` | Full search, filter by category, form, manufacturer |
| 11  | Edit Product Information | As an owner, I want to update product information                                                         | ✅ Implemented        | `PATCH /api/medications/:id`                         | Owner only                                          |
| 12  | Disable Product          | As an owner, I want to deactivate a product no longer in business                                         | ✅ Implemented        | `DELETE /api/medications/:id`                        | Owner only, soft delete                             |

**Group 2 Implementation**: ✅ **100% Complete (4/4)**

---

## Group 3: Supplier Management

| UC# | Feature Name                  | Requirement Description                                                                                             | Implementation Status | API Endpoint                                         | Notes                                                |
| --- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------- | --------------------- | ---------------------------------------------------- | ---------------------------------------------------- |
| 13  | Add Supplier                  | As an owner, I want to add a new supplier                                                                           | ✅ Implemented        | `POST /api/suppliers`                                | Supports batch creation                              |
| 14  | View & Search Suppliers       | As an owner, I want to view a list of suppliers and search for supplier so that I can get their information quickly | ✅ Implemented        | `GET /api/suppliers`<br>`GET /api/suppliers/:id`     | Search by name, contact, email                       |
| 15  | Edit Supplier Information     | As an owner, I want to edit supplier contact details                                                                | ✅ Implemented        | `PATCH /api/suppliers/:id`                           | Owner only                                           |
| 15A | Add Supplier's Product        | As an owner, I want to add a product that a supplier provides                                                       | ✅ Implemented        | `POST /api/suppliers/:supplierId/medications`        | Links medication variants to supplier with unit cost |
| 15B | Edit Supplier's Product       | As an owner, I want to update details (SKU, lead time, cost) of a product a supplier provides                       | ✅ Implemented        | `PATCH /api/suppliers/:supplierId/medications/:id`   | Update unit cost, lead time                          |
| 15C | Remove Supplier's Product     | As an owner, I want to remove a product from a supplier's offerings                                                 | ✅ Implemented        | `DELETE /api/suppliers/:supplierId/medications/:id`  | Owner only                                           |
| 15D | Create Supplier with Products | As an owner, I want to create a new supplier and directly assign products they provide                              | ✅ Implemented        | `POST /api/suppliers` (with medicationVariants)      | Single transaction                                   |
| 15E | Edit Supplier with Products   | As an owner, I want to edit supplier info and manage their products (add, update, delete) in one screen             | ✅ Implemented        | `PATCH /api/suppliers/:id` (with medicationVariants) | Bulk update in one call                              |

**Group 3 Implementation**: ✅ **100% Complete (8/8)**

---

## Group 4: Inventory Management

| UC# | Feature Name                | Requirement Description                                                               | Implementation Status | API Endpoint                                            | Notes                                                                    |
| --- | --------------------------- | ------------------------------------------------------------------------------------- | --------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------ |
| 21  | View Supplier's Products    | As an owner, I want to view all products that are provided by a specific supplier     | ✅ Implemented        | `GET /api/suppliers/:supplierId/medications`            | Lists all medication variants from supplier                              |
| 22  | Add Stock (with details)    | As a pharmacist, I want to add new stock including batch, expiry, and purchase cost   | ✅ Implemented        | `POST /api/purchases/:purchaseOrderId/receipts`         | Via purchase order receipt                                               |
| 23  | View Entry via Barcode Scan | As an owner, I want to view information of a batch if provided by a specific supplier | ✅ Implemented        | `GET /api/inventory/batches/:inventoryBatchId`          | Batch lookup by ID/barcode                                               |
| 24  | Adjust Stock Quantity       | As a pharmacist, I want to adjust stock due to damage or loss with a reason           | ✅ Implemented        | `PATCH /api/inventory/batches/:inventoryBatchId/adjust` | Adjustment types: add, remove, damage, loss, expired, return, correction |
| 25  | Auto Deduct Stock           | The system automatically deducts inventory when closing a successfully sale           | ✅ Implemented        | Triggered by sales order completion                     | Automatic FIFO/FEFO deduction                                            |
| 26  | Low Stock Alert             | The system alerts when stock falls below minimum threshold                            | ✅ Implemented        | `GET /api/inventory/low-stock`                          | Configurable threshold per product                                       |
| 27  | Configure Stock Threshold   | As an owner, I want to configure expiry alert period (e.g., 3 months, 1 month)        | ✅ Implemented        | `PATCH /api/inventory/batches/:inventoryBatchId`        | Per batch threshold settings                                             |
| 28  | Expiry Alert                | The system alerts when a batch is close to expiry                                     | ✅ Implemented        | `GET /api/inventory/expiring`                           | Filter by days threshold (30, 60, 90)                                    |
| 29  | Configure Expiry Warning    | As an owner, I want to configure expiry alert period (e.g., 3 months, 1 month)        | ✅ Implemented        | Via inventory settings                                  | Configurable warning periods                                             |

**Group 4 Implementation**: ✅ **100% Complete (9/9)**

---

## Group 5: Procurement Management

| UC# | Feature Name                    | Requirement Description                                                     | Implementation Status | API Endpoint                                                                  | Notes                                        |
| --- | ------------------------------- | --------------------------------------------------------------------------- | --------------------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| 30  | Create Purchase Order           | As an owner, I want to create a purchase order based on low storage         | ✅ Implemented        | `POST /api/purchases`                                                         | Supports batch creation, status tracking     |
| 31  | Send Purchase Order to Supplier | The system automatically emails purchase orders to suppliers                | ✅ Implemented        | `POST /api/email/purchase-order/:purchaseOrderId`                             | Email with PO details                        |
| 32  | View Order List & Status        | As an owner, I want to view purchase orders and track their status          | ✅ Implemented        | `GET /api/purchases`<br>`GET /api/purchases/:id`                              | Filter by status, supplier, date range       |
| 33  | Confirm Order & Stock In        | As an owner, I want to confirm an order as 'Received' and stock in products | ✅ Implemented        | `POST /api/purchases/:purchaseOrderId/receipts`<br>`PATCH /api/purchases/:id` | Creates inventory batches, updates PO status |

**Group 5 Implementation**: ✅ **100% Complete (4/4)**

---

## Group 6: Sales (POS)

| UC# | Feature Name                     | Requirement Description                                                              | Implementation Status | API Endpoint                              | Notes                              |
| --- | -------------------------------- | ------------------------------------------------------------------------------------ | --------------------- | ----------------------------------------- | ---------------------------------- |
| 34  | Search Product to Add to Invoice | As a cashier, I want to search product with autocomplete to add to the sales invoice | ✅ Implemented        | `GET /api/medications` (with search)      | Autocomplete search                |
| 35  | Add Product via Barcode Scan     | As a cashier, I want to scan products to add them to the sales invoice               | ✅ Implemented        | `GET /api/medications/variants/:id`       | Variant lookup by barcode          |
| 36  | Edit/Discount Invoice Item       | As a cashier, I want to edit an invoice item, or apply some, or apply discounts      | ✅ Implemented        | Frontend POS state                        | Before submitting sales order      |
| 37  | Complete Payment                 | As a cashier, I want to record payment method (cash/transfer) and complete sales     | ✅ Implemented        | `POST /api/sales`                         | Multiple payment methods supported |
| 38  | Auto-Generate Invoice            | The system automatically generates an invoice for each successful transaction        | ✅ Implemented        | Auto on sales creation                    | Automatic invoice generation       |
| 39  | Create/Print Invoice             | As a cashier, I want to create electronic invoices and print them out for customers  | ✅ Implemented        | `POST /api/sales`<br>`GET /api/sales/:id` | Get invoice for printing           |

**Group 6 Implementation**: ✅ **100% Complete (6/6)**

---

## Group 7: Dashboard

| UC# | Feature Name                        | Requirement Description                                                 | Implementation Status | API Endpoint                   | Notes                               |
| --- | ----------------------------------- | ----------------------------------------------------------------------- | --------------------- | ------------------------------ | ----------------------------------- |
| 40  | View Daily Sales Summary            | As an owner, I want to view today's sales overview on the dashboard     | ✅ Implemented        | `GET /api/reports/daily`       | Revenue, transactions, top products |
| 41  | View Low Stock on Dashboard         | As an owner, I want to see low stock products directly on the dashboard | ✅ Implemented        | `GET /api/inventory/low-stock` | Real-time low stock items           |
| 42  | View Expiring Products on Dashboard | As an owner, I want to see expiring products on the dashboard           | ✅ Implemented        | `GET /api/inventory/expiring`  | Products expiring soon              |

**Group 7 Implementation**: ✅ **100% Complete (3/3)**

---

## Group 8: Reporting

| UC# | Feature Name         | Requirement Description                                            | Implementation Status | API Endpoint                                                                                              | Notes                          |
| --- | -------------------- | ------------------------------------------------------------------ | --------------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------ |
| 43  | View Sales Reports   | As an owner, I want to view detailed profit per product or overall | ✅ Implemented        | `GET /api/reports`<br>`GET /api/reports/daily`<br>`GET /api/reports/weekly`<br>`GET /api/reports/monthly` | Multiple report types          |
| 44  | View Profit Reports  | As an owner, I want to view detailed profit analysis               | ✅ Implemented        | `GET /api/reports` (type: sales_summary)                                                                  | Revenue, COGS, profit margin   |
| 45  | View Inventory Value | As an owner, I want to see the current total value of inventory    | ✅ Implemented        | `GET /api/inventory/summary/by-variant`                                                                   | Total value at cost and retail |

**Group 8 Implementation**: ✅ **100% Complete (3/3)**

---

## Group 9: Forecasting & AI

| UC# | Feature Name             | Requirement Description                                                       | Implementation Status | API Endpoint        | Notes                              |
| --- | ------------------------ | ----------------------------------------------------------------------------- | --------------------- | ------------------- | ---------------------------------- |
| 46  | View AI-Powered Forecast | As an owner, I want to see AI based sales forecast for upcoming months        | 🚧 Planned            | Not yet implemented | Future feature - ML model required |
| 47  | AI Purchase Suggestion   | As an owner, I want AI to suggest which products to restock based on forecast | 🚧 Planned            | Not yet implemented | Future feature - ML model required |

**Group 9 Implementation**: 🚧 **0% Complete (0/2)** - Planned for future release

---

## Additional Implemented Features (Not in Original Requirements)

### Customer Management (New)

| Feature         | API Endpoint                | Status         |
| --------------- | --------------------------- | -------------- |
| Create Customer | `POST /api/customers`       | ✅ Implemented |
| List Customers  | `GET /api/customers`        | ✅ Implemented |
| Get Customer    | `GET /api/customers/:id`    | ✅ Implemented |
| Update Customer | `PATCH /api/customers/:id`  | ✅ Implemented |
| Delete Customer | `DELETE /api/customers/:id` | ✅ Implemented |

### Warehouse Management (New)

| Feature            | API Endpoint                               | Status         |
| ------------------ | ------------------------------------------ | -------------- |
| List Zones         | `GET /api/warehouse/zones`                 | ✅ Implemented |
| Manage Racks       | `GET /api/warehouse/racks/:rackId`         | ✅ Implemented |
| Manage Bins        | `GET /api/warehouse/bins/:binId`           | ✅ Implemented |
| Move Inventory     | `POST /api/inventory/move`                 | ✅ Implemented |
| View Bin Inventory | `GET /api/warehouse/bins/:binId/inventory` | ✅ Implemented |

### Medication Variants (New)

| Feature                  | API Endpoint                                  | Status         |
| ------------------------ | --------------------------------------------- | -------------- |
| List All Variants        | `GET /api/medications/variants/all`           | ✅ Implemented |
| List Medication Variants | `GET /api/medications/:medicationId/variants` | ✅ Implemented |
| Get Variant Inventory    | `GET /api/medications/variants/:id/inventory` | ✅ Implemented |

### Purchase Order Receipts (Enhanced)

| Feature             | API Endpoint                                   | Status         |
| ------------------- | ---------------------------------------------- | -------------- |
| List All Receipts   | `GET /api/purchases/receipts`                  | ✅ Implemented |
| Get Receipt Details | `GET /api/purchases/receipts/:id`              | ✅ Implemented |
| List PO Receipts    | `GET /api/purchases/:purchaseOrderId/receipts` | ✅ Implemented |

---

## Summary Statistics

### By Feature Group

| Group                   | Total Use Cases | Implemented | Planned | Implementation Rate |
| ----------------------- | --------------- | ----------- | ------- | ------------------- |
| 1. User Management      | 8               | 8           | 0       | 100%                |
| 2. Product Catalog      | 4               | 4           | 0       | 100%                |
| 3. Supplier Management  | 8               | 8           | 0       | 100%                |
| 4. Inventory Management | 9               | 9           | 0       | 100%                |
| 5. Procurement          | 4               | 4           | 0       | 100%                |
| 6. Sales (POS)          | 6               | 6           | 0       | 100%                |
| 7. Dashboard            | 3               | 3           | 0       | 100%                |
| 8. Reporting            | 3               | 3           | 0       | 100%                |
| 9. AI/Forecasting       | 2               | 0           | 2       | 0%                  |
| **TOTAL**               | **47**          | **45**      | **2**   | **96%**             |

### Additional Features Implemented

- **Customer Management**: 5 additional features
- **Warehouse Management**: 5 additional features
- **Medication Variants**: 3 additional features
- **Enhanced Purchase Receipts**: 3 additional features

### Overall System Status

- **Core Requirements**: 45/47 use cases implemented (96%)
- **Extended Features**: 16 additional features beyond requirements
- **Total API Endpoints**: 80+ endpoints implemented
- **System Completeness**: Production-ready for core features

---

## Technology Stack

### Backend

- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT-based with bcrypt
- **Validation**: Zod schemas
- **ID Generation**: UUID v7
- **Email**: Nodemailer
- **Scheduling**: node-cron (for automated reports)

### Frontend

- **Framework**: React 18+
- **State Management**: TanStack Query v5
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS)
- **Routing**: React Router v6
- **Forms**: React Hook Form
- **Build Tool**: Vite

### Architecture

- **Monorepo**: Turborepo workspace
- **Package Management**: pnpm
- **Code Quality**: ESLint, Prettier
- **API Documentation**: OpenAPI 3.0 specification

---

## Key Differences from Original Requirements

### Enhancements Made:

1. **Batch Operations**: Most create/update operations support batch processing
2. **UUID Migration**: All IDs use UUID v7 instead of BigInt for better scalability
3. **Medication Variants**: Added variant system for different dosages, packaging
4. **Warehouse Management**: Full 3-tier system (zones, racks, bins)
5. **Customer Management**: Complete customer CRUD not in original requirements
6. **Advanced Filtering**: Most list endpoints support comprehensive filters
7. **Automated Reports**: Scheduled daily, weekly, monthly reports
8. **Email Notifications**: Purchase order emails to suppliers

### Pending Features:

1. **AI Forecasting** (UC 46): Requires machine learning model implementation
2. **AI Purchase Suggestions** (UC 47): Requires historical data analysis and ML

---

## Next Steps for 100% Completion

### Priority 1: AI Features

- [ ] Implement sales forecasting algorithm
- [ ] Train ML model on historical sales data
- [ ] Create reorder point prediction system
- [ ] Build purchase suggestion engine

### Priority 2: Frontend Pages (Currently in Progress)

- [ ] Sales Orders List page (`/sales/orders`)
- [ ] Customers List page (`/sales/customers`)
- [ ] Reports Dashboard page (`/reports`)
- [ ] Settings page (`/settings`)

### Priority 3: Testing & Documentation

- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] End-to-end tests for critical flows
- [ ] User documentation/manual

---

**End of Mapping Document**

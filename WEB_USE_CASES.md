# Web Application Use Cases Documentation

## PharmaFlow - Pharmacy Management System

> **Generated from:** Frontend Web Application Analysis  
> **Date:** October 28, 2025  
> **Tech Stack:** React, React Router, Radix UI, TailwindCSS, React Hook Form, TanStack Query

---

## Table of Contents

1. [Authentication & User Management](#1-authentication--user-management)
2. [Dashboard & Analytics](#2-dashboard--analytics)
3. [Medication Management](#3-medication-management)
4. [Supplier Management](#4-supplier-management)
5. [Purchase Order Management](#5-purchase-order-management)
6. [Inventory Management](#6-inventory-management)
7. [Sales Management](#7-sales-management)
8. [Shift Management](#8-shift-management)
9. [Customer Management](#9-customer-management)

---

## 1. Authentication & User Management

### UC-AUTH-001: User Login

**Actor:** Staff, Manager, Admin  
**Preconditions:** User has valid credentials  
**Main Flow:**

1. User navigates to login page (`/login`)
2. System displays login form with email and password fields
3. User enters email and password
4. User optionally checks "Remember me"
5. User clicks "Login" button
6. System validates credentials via API
7. System stores JWT token
8. System redirects to dashboard (`/dashboard`)

**UI Components:**

- Email input with validation (RFC 5322 pattern)
- Password input (minimum 6 characters)
- Remember me checkbox
- Login button with loading state
- Error toast notifications

**Alternative Flow:**

- Invalid credentials: Show error toast
- Account not approved: Show "pending approval" message
- Link to "Forgot Password" page

---

### UC-AUTH-002: User Registration

**Actor:** New User  
**Preconditions:** User has valid information  
**Main Flow:**

1. User navigates to registration page (`/register`)
2. System displays registration form
3. User fills in:
   - Full name (min 2 characters)
   - Email (validated format)
   - Phone number (10 digits)
   - Address (min 5 characters)
   - Password (min 6 characters)
   - Confirm password (must match)
4. User accepts Privacy Policy & Terms
5. User clicks "Register" button
6. System creates registration request with status "pending"
7. System shows success message
8. User waits for admin approval

**UI Components:**

- Multi-field form with validation
- Real-time password match validation
- Policy acceptance checkbox (required)
- Success notification
- Link to login page

**Validation Rules:**

- Name: Min 2 characters
- Email: RFC 5322 pattern
- Phone: 10 digits, numeric only
- Address: Min 5 characters
- Password confirmation must match

---

### UC-AUTH-003: Forgot Password

**Actor:** User  
**Main Flow:**

1. User clicks "Forgot Password" link on login page
2. System navigates to `/forgot-password`
3. User enters email address
4. User clicks "Reset Password" button
5. System sends password reset email
6. System shows confirmation message

**UI Features:**

- Email validation
- Loading state during submission
- Success/error notifications
- Back to login link

---

### UC-AUTH-004: Reset Password

**Actor:** User with reset token  
**Main Flow:**

1. User clicks reset link from email
2. System navigates to `/reset-password` with token
3. User enters new password
4. User confirms new password
5. User clicks "Reset Password" button
6. System validates and updates password
7. System redirects to login page

---

### UC-AUTH-005: View User Profile

**Actor:** Authenticated User  
**Main Flow:**

1. User navigates to `/user-profile`
2. System displays user information:
   - Name
   - Email
   - Phone
   - Address
   - Role
   - Status
3. User can initiate password change

**UI Components:**

- Avatar display with initials
- Read-only user information
- "Change Password" button
- Card-based layout

---

### UC-AUTH-006: Change Password

**Actor:** Authenticated User  
**Main Flow:**

1. User clicks "Change Password" on profile page
2. System opens password change dialog
3. User enters:
   - Current password
   - New password (min 6 characters)
   - Confirm new password
4. System validates current password
5. System validates new password match
6. User clicks "Change Password"
7. System updates password
8. System shows success notification

**Validation:**

- Current password must be correct
- New password minimum 6 characters
- Confirmation must match new password

---

### UC-AUTH-007: Manage User List (Admin)

**Actor:** Admin  
**Preconditions:** User has admin role  
**Main Flow:**

1. Admin navigates to `/users/list`
2. System displays user list with filters
3. Admin can:
   - Search by name/email
   - Filter by status (active/inactive/suspended)
   - Filter by role (admin/manager/staff)
   - Edit user details
   - Change user status (activate/deactivate/suspend)

**UI Features:**

- Search input with submit button
- Status filter dropdown
- Role filter dropdown
- User table with actions
- Edit dialog
- Status change confirmations

**User Actions:**

- **Edit:** Opens dialog with name, email, phone, address, role
- **Activate:** Sets user status to active
- **Deactivate:** Sets user status to inactive
- **Suspend:** Sets user status to suspended

---

### UC-AUTH-008: Review Registration Requests (Admin)

**Actor:** Admin  
**Main Flow:**

1. Admin navigates to `/users/registrations`
2. System displays pending registration requests
3. Admin can:
   - Search requests by name/email
   - View request details
   - Approve request (auto-assign as "staff")
   - Reject request

**UI Components:**

- Search functionality
- Table with registration details
- Approve/Reject buttons
- Confirmation dialogs

**Actions:**

- **Approve:** Creates user with "staff" role, sends welcome email
- **Reject:** Removes registration request permanently

---

## 2. Dashboard & Analytics

### UC-DASH-001: View Dashboard

**Actor:** Authenticated User  
**Main Flow:**

1. User navigates to `/dashboard`
2. System displays:
   - Welcome message with user's name
   - Current date
   - Monthly statistics:
     - Total orders (with trend %)
     - Total revenue (VND format)
     - Average order value
     - Top products count
   - Top 5 selling medications (current month)
   - Sales breakdown by status
   - Quick action buttons

**Metrics Displayed:**

- **Total Orders:** Count with percentage trend
- **Total Revenue:** Vietnamese Dong currency format
- **Average Order:** Revenue ÷ Orders
- **Top Products:** Number of best sellers

**Top Medications Table:**

- Rank number (#1-5)
- Medication name and variant
- Total revenue (VND)
- Units sold

**Sales by Status:**

- Completed (green badge)
- Pending (yellow badge)
- Cancelled (red badge)
- Processing (blue badge)
- Order count and total amount per status

**Quick Actions:**

- New Sale → Navigate to POS
- Inventory → View stock
- Reports → Analytics
- Alerts → View warnings

**Data Source:** Uses `useMonthlySalesReport` hook with current year/month

---

## 3. Medication Management

### UC-MED-001: View Medication List

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/medications`
2. System displays medication list
3. User can:
   - Search by name or brand
   - View medication cards with:
     - Image (with placeholder fallback)
     - Name
     - Brand
     - Status badge (Active/Inactive)

**UI Features:**

- Search input with debounce (350ms)
- Reset search button
- Medication cards with hover effects
- Image zoom on click (lightbox)
- Action buttons per medication

**Actions Available:**

- **View:** See full details
- **Edit:** Modify medication
- **Variants:** Manage product variants
- **Delete:** Remove medication

---

### UC-MED-002: Add New Medication

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "Add" button
2. System opens medication form dialog
3. User fills in:
   - Name (required)
   - Brand
   - Description
   - Image upload (optional)
   - Prescription required (checkbox)
   - Controlled substance (checkbox)
   - Status (active/inactive)
4. User clicks "Add Medication"
5. System saves medication
6. System stores image in local storage
7. System refreshes list

**Form Fields:**

- **Name:** Text, required
- **Brand:** Text, optional
- **Description:** Text area, optional
- **Image:** File upload (image/* types)
- **Prescription Required:** Boolean checkbox
- **Controlled Substance:** Boolean checkbox
- **Status:** Dropdown (active/inactive)

**Image Handling:**

- Preview shown before upload
- Stored in localStorage with medication ID
- Fallback to pill placeholder icon
- Click image for zoom/lightbox view

---

### UC-MED-003: Edit Medication

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "Edit" on medication card
2. System opens edit dialog pre-filled with current data
3. User modifies fields
4. User can:
   - Upload new image
   - Check "Remove image" to delete current image
   - Update any field
5. User clicks "Save Changes"
6. System updates medication
7. System updates image cache

**Features:**

- Form pre-populated with existing data
- Current image displayed
- Option to upload new image or remove
- Image version cache busting

---

### UC-MED-004: Delete Medication

**Actor:** Manager  
**Main Flow:**

1. User clicks "Delete" button
2. System shows browser confirmation
3. User confirms deletion
4. System deletes medication
5. System clears associated image
6. System refreshes list

---

### UC-MED-005: View Medication Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "View" button
2. System opens detail modal showing:
   - Medication image (with zoom capability)
   - Name and brand
   - Status
   - Description
   - Prescription requirements
   - Controlled substance flag
   - Variant list (if requested)

**Modal Features:**

- Full medication information
- Optional variant display
- Close button
- Responsive layout

---

### UC-MED-006: Manage Medication Variants

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "Variants" button on medication
2. System opens variants management dialog
3. System displays:
   - Parent medication info
   - Existing variants table
   - Add/Edit variant form

**Variant Table Columns:**

- SKU
- Name
- Unit
- Unit Factor
- Barcode
- Sell Price
- Active status
- For Sale status
- Edit/Delete actions

**Add/Edit Variant:**

1. User fills form:
   - SKU (required)
   - Name (required)
   - Unit (required)
   - Unit Factor (default 1.00)
   - Barcode (unique validation)
   - Sell Price (required, numeric)
   - Is Active (checkbox)
   - Is For Sale (checkbox)
2. System validates barcode uniqueness
3. User clicks "Add Variant" or "Save Variant"
4. System saves variant
5. System refreshes variant list

**Validation Rules:**

- SKU, Name, Unit, Sell Price are required for new variants
- Barcode must be unique across all variants
- Sell Price must be numeric
- Unit Factor defaults to 1.00

**Variant Actions:**

- **Edit:** Load variant data into form
- **Delete:** Confirm and remove variant
- **Reset:** Clear form fields

---

### UC-MED-007: Search Medications by Barcode

**Actor:** Staff (POS System)  
**Flow:**

1. System receives barcode scan
2. System calls `findVariantsByBarcode(barcode)`
3. System returns matching variant(s)
4. System adds to cart or displays selection

**Used In:** Sales POS, Inventory tracking

---

## 4. Supplier Management

### UC-SUP-001: View Supplier List

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/suppliers`
2. System displays supplier list with:
   - Search functionality
   - Status filter
   - Supplier table

**Filters:**

- Search by name, email, or phone
- Status: All / Active / Inactive / Blacklisted

**Table Columns:**

- Name
- Email
- Phone
- Status (badge with icon)
- Actions (View, Delete)

**Status Badges:**

- **Active:** Green with CheckCircle icon
- **Inactive:** Gray with XCircle icon
- **Blacklisted:** Red with Ban icon

---

### UC-SUP-002: Create New Supplier

**Actor:** Manager  
**Main Flow:**

1. User clicks "Add New Supplier" button
2. System navigates to `/suppliers/create`
3. User fills supplier form:
   - Company name (required)
   - Contact person
   - Email
   - Phone (required)
   - Address
   - Tax ID
   - Status (active/inactive/blacklisted)
   - Notes
4. User clicks "Create Supplier"
5. System validates and saves
6. System navigates to supplier detail page

---

### UC-SUP-003: View Supplier Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "View" on supplier row
2. System navigates to `/suppliers/:id`
3. System displays:
   - Supplier information
   - Contact details
   - Status
   - Associated purchase orders
   - Edit button (if permitted)

---

### UC-SUP-004: Edit Supplier

**Actor:** Manager  
**Main Flow:**

1. User clicks "Edit" on supplier detail page
2. System navigates to `/suppliers/:id/edit`
3. System pre-fills form with current data
4. User modifies fields
5. User clicks "Update Supplier"
6. System saves changes
7. System returns to detail page

---

### UC-SUP-005: Delete Supplier

**Actor:** Manager  
**Main Flow:**

1. User clicks "Delete" button
2. System shows confirmation dialog
3. User confirms deletion
4. System deletes supplier
5. System shows success toast
6. System refreshes supplier list

**Validation:**

- Cannot delete supplier with active purchase orders

---

## 5. Purchase Order Management

### UC-PO-001: View Purchase Order List

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/procurement/purchase-orders`
2. System displays order list with:
   - Search functionality
   - Status filter
   - Date sort (newest/oldest first)
   - Order table

**Filters:**

- Search by supplier name or status
- Status: All / Pending / Ordered / Received / Cancelled
- Sort by date: Newest First / Oldest First

**Table Columns:**

- Supplier name
- Status (badge)
- Order date
- Expected delivery date
- Total amount (VND)
- Actions (View, Edit Status, Delete)

**Status Display:**

- Pending: Yellow badge
- Received: Green badge
- Cancelled: Red badge
- Ordered: Blue badge

---

### UC-PO-002: Create Purchase Order

**Actor:** Manager  
**Main Flow:**

1. User clicks "New Order" button
2. System navigates to `/purchase-orders/create`
3. User fills order form:
   - Select supplier (required)
   - Order date (default: today)
   - Expected delivery date
   - Add order items:
     - Select medication variant
     - Enter quantity
     - Unit price
   - Notes
4. System calculates total amount
5. User clicks "Create Order"
6. System saves purchase order
7. System navigates to order detail

**Order Item Fields:**

- Medication variant (searchable dropdown)
- Quantity (numeric, min 1)
- Unit price (auto-fill from variant or manual)
- Subtotal (calculated)

**Calculations:**

- Item subtotal = quantity × unit price
- Order total = sum of all item subtotals

---

### UC-PO-003: View Purchase Order Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "View" on order row
2. System navigates to `/purchase-orders/:id`
3. System displays:
   - Order header (PO number, dates, supplier, status)
   - Order items table
   - Total amount
   - Receipts associated with this PO
   - "Create Receipt" button (if status allows)

**Order Header Info:**

- Purchase Order Number
- Supplier name and details
- Order date
- Expected delivery date
- Current status
- Total amount

**Items Table:**

- Medication name
- Variant
- Quantity ordered
- Unit price
- Subtotal

**Receipt Section:**

- List of receipts created from this PO
- Link to create new receipt

---

### UC-PO-004: Update Purchase Order Status

**Actor:** Manager  
**Main Flow:**

1. User clicks "Edit Status" on order
2. System opens status update dialog
3. User selects new status:
   - Pending
   - Ordered
   - Received
   - Cancelled
4. User clicks "Update"
5. System saves new status
6. System shows success notification

**Status Workflow:**

- Pending → Ordered (when sent to supplier)
- Ordered → Received (when fully received)
- Any → Cancelled (cancellation)

---

### UC-PO-005: Delete Purchase Order

**Actor:** Manager  
**Main Flow:**

1. User clicks "Delete" button
2. System shows confirmation dialog
3. User confirms
4. System deletes purchase order
5. System refreshes list

**Validation:**

- Cannot delete if receipts exist
- Warning if status is "received"

---

### UC-PO-006: Create Purchase Receipt

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to PO detail page
2. User clicks "Create Receipt"
3. System navigates to `/purchase-orders/:purchaseOrderId/receipts/create`
4. System pre-fills PO items
5. User enters received quantities for each item
6. User enters actual received date
7. User adds notes (optional)
8. User clicks "Create Receipt"
9. System creates receipt record
10. System updates inventory stock
11. System navigates to receipt detail

**Receipt Fields:**

- Purchase Order reference (auto-filled)
- Received date (default: today)
- Items with received quantities
- Notes
- Received by (auto: current user)

---

### UC-PO-007: View Purchase Receipt List

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/procurement/receipts`
2. System displays receipt list:
   - Receipt ID
   - Purchase Order reference
   - Supplier
   - Received date
   - Total items
   - Received by
   - Actions (View)

---

### UC-PO-008: View Purchase Receipt Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks receipt row
2. System navigates to `/procurement/receipts/:id`
3. System displays:
   - Receipt information
   - Related PO details
   - Items received
   - Discrepancies (if any)
   - Received by user

---

## 6. Inventory Management

### UC-INV-001: View Stock Overview

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/inventory/stock`
2. System displays stock overview:
   - Search medications
   - Medication cards with:
     - Image
     - Name
     - Current stock quantity
     - Price
     - View/Adjust buttons

**Features:**

- Search by medication name
- View detailed stock information
- Adjust stock quantities
- Add new stock

---

### UC-INV-002: Add Stock

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "Add Stock" button
2. System opens add stock dialog
3. User fills form:
   - Medication (searchable)
   - Batch number (required)
   - Manufacture date (required)
   - Expiry date (required, must be after manufacture date)
   - Quantity (required, > 0)
   - Quantity reserved
   - Price (required)
   - Zone (required)
   - Column number
   - Row number
4. User clicks "Submit"
5. System validates form
6. System creates stock entry
7. System updates inventory
8. System shows success notification

**Validation Rules:**

- All required fields must be filled
- Quantity > 0
- Expiry date > Manufacture date
- Zone must be specified

---

### UC-INV-003: View Stock Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks "View" on medication card
2. System opens detail dialog displaying:
   - Medication image (zoomable)
   - Name and SKU
   - Expiry status badge
   - Selling price
   - Current quantity and unit
   - Prescription type
   - Storage location (area, shelf position)
   - Expiration date
   - Days remaining
   - Batch number

**Expiry Badges:**

- **Expires Soon:** < 30 days (red)
- **Expiring:** < 90 days (orange)
- **Good:** ≥ 90 days (green)

---

### UC-INV-004: Adjust Stock Quantity

**Actor:** Manager  
**Main Flow:**

1. User clicks "Adjust" on medication
2. System opens adjustment dialog
3. System displays:
   - Current stock
   - Adjustment controls (+/- buttons)
   - New quantity input
   - Change calculation
4. User sets new quantity
5. User clicks "Submit"
6. System updates stock
7. System logs adjustment

**Features:**

- Increment/decrement buttons (±10)
- Direct numeric input
- Change preview (green for increase, red for decrease)
- Minimum quantity: 0

---

### UC-INV-005: View Warehouse Layout

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/inventory/warehouse`
2. System displays warehouse visual layout:
   - Zones (A, B, C, etc.)
   - Racks/shelves
   - Bin locations
   - Stock items in each location

**Features:**

- Visual grid representation
- Color coding by stock level
- Click to view location details
- Search specific locations

---

### UC-INV-006: View Inventory Tracking

**Actor:** Manager  
**Main Flow:**

1. User navigates to `/inventory/tracking`
2. System displays inventory movement log:
   - Transaction type (in/out/adjustment)
   - Medication
   - Quantity change
   - Date/time
   - Performed by
   - Reference (PO, Sale, etc.)

**Filter Options:**

- Date range
- Transaction type
- Medication
- User

---

## 7. Sales Management

### UC-SALE-001: Create Sales Order (POS)

**Actor:** Staff  
**Main Flow:**

1. User navigates to `/sales`
2. System displays POS interface with multi-order support
3. User can manage multiple orders simultaneously:
   - Create new order tab
   - Switch between order tabs
   - Duplicate existing order
   - Delete order (minimum 1 required)

**Order Tab Features:**

- Order number display
- Item count badge
- Active order highlighting
- Quick duplicate/delete actions

**Per Order - Main Flow:**

1. **Select Customer:**
   - Search existing customer
   - Select from dropdown
   - OR create new customer inline
2. **Add Products:**
   - Search medications by name/barcode
   - View available quantity
   - Click to add to cart
   - Auto-increment if already in cart
3. **Manage Cart:**
   - Adjust quantities
   - Remove items
   - View subtotals
4. **Select Payment Method:**
   - Cash
   - Card
   - Mobile Payment (VietQR)
5. **For Cash Payment:**
   - Enter cash received (in thousands VND)
   - System calculates change
   - Validation: Must not be negative
6. **Complete Order:**
   - Click "Complete Order"
   - If VietQR: Show QR code dialog
   - If Cash/Card: Process immediately
7. System creates sales order
8. System reduces inventory
9. System shows success modal with order details
10. System removes completed order tab

**POS Interface Sections:**

**Left Panel - Product Search & Cart:**

- Medication search with live results
- Available quantity display
- Cart items list with:
  - Medication name and variant
  - Unit price
  - Quantity adjuster
  - Remove button
- Payment method selector
- Cash received input (for cash payments)
- Complete order button

**Right Panel - Customer & Summary:**

- Customer selector/creator
- Order summary:
  - Total items
  - Subtotal
  - Total amount (VND)
  - Payment method
  - Customer info

---

### UC-SALE-002: Multi-Order Management

**Actor:** Staff  
**Main Flow:**

1. Staff creates new order (default: Order #1)
2. Staff can create additional orders (Order #2, #3, etc.)
3. Staff switches between order tabs
4. Each order maintains separate:
   - Customer
   - Cart items
   - Payment method
   - Cash received
5. Staff can duplicate order (copies cart and settings)
6. Staff can delete order (except last one)

**Order Tab Display:**

- Sequential numbering: Order #1, #2, #3...
- Item count badge: "Empty" or "X items"
- Active order highlighting
- Duplicate and Delete buttons

---

### UC-SALE-003: Add New Customer (Inline)

**Actor:** Staff  
**Main Flow:**

1. Staff clicks "New Customer" button
2. System shows inline customer form
3. Staff enters:
   - Customer name (required)
   - Email (optional)
   - Phone (optional, 10 digits if provided)
4. Staff clicks "Create"
5. System validates and creates customer
6. System auto-selects new customer
7. System shows success notification

**Validation:**

- Name: Required
- Phone: 10 digits if provided
- Email: Valid format if provided

---

### UC-SALE-004: Search Medications for Sale

**Actor:** Staff  
**Main Flow:**

1. Staff types in medication search
2. System searches by name/variant
3. System filters results:
   - Only in-stock items (availableQuantity > 0)
   - Active status
4. System displays results with:
   - Medication name
   - Variant name
   - Available quantity
   - Sell price
5. Staff clicks medication to add to cart

**Search Features:**

- Real-time search
- Loading indicator
- "Out of stock" message if found but unavailable
- Clear results on selection

---

### UC-SALE-005: Process Cash Payment

**Actor:** Staff  
**Main Flow:**

1. Staff selects "Cash" as payment method
2. System displays cash payment section
3. Staff enters cash received in thousands (e.g., "100" = 100,000 VND)
4. System shows:
   - Total amount
   - Received amount (× 1,000)
   - Change amount (color coded)
5. System validates:
   - Must have cash received value
   - Change must not be negative
6. Staff clicks "Complete Order"
7. System processes payment
8. System shows success with change amount

**Cash Input Format:**

- Input in thousands (100 = 100,000 VND)
- Multiplier displayed: "× 1,000"
- Example text: "Enter 100 for 100,000 VND"

**Change Calculation:**

- Change = (Cash Received × 1,000) - Total Amount
- Green text if positive
- Red text if negative (blocks submission)

---

### UC-SALE-006: Process VietQR Payment

**Actor:** Staff, Customer  
**Main Flow:**

1. Staff selects "Mobile Payment" as payment method
2. Staff clicks "Complete Order"
3. System generates VietQR data:
   - Merchant account number
   - Amount
   - Order ID
   - Description
4. System displays QR code dialog
5. Customer scans QR code
6. Customer completes payment in banking app
7. Staff confirms payment received
8. Staff clicks "Confirm Payment"
9. System creates order
10. System shows success modal

**QR Dialog Features:**

- Large QR code display
- Order ID
- Amount
- Payment instructions
- "Confirm Payment" button
- Cancel button

---

### UC-SALE-007: View Order Success Details

**Actor:** Staff  
**Main Flow:**

1. After order completion, system shows success modal
2. Modal displays:
   - Order ID
   - Customer name
   - Date/time
   - Items list with quantities and prices
   - Total amount
   - Payment method
   - Payment status
3. Staff can:
   - Close modal
   - Print receipt (future)
   - Email receipt (future)

**Auto-Close:** Modal dismisses, completed order tab removed

---

### UC-SALE-008: View Sales Order List

**Actor:** Staff, Manager  
**Main Flow:**

1. User navigates to `/sales/orders`
2. System displays order list with:
   - Search functionality
   - Status filter
   - Date filter
   - Order table

**Table Columns:**

- Order ID
- Customer name
- Date/time
- Total amount
- Payment method
- Status
- Actions (View)

**Filters:**

- Search by order ID or customer
- Status: All / Completed / Pending / Cancelled
- Date range

---

### UC-SALE-009: View Sales Order Details

**Actor:** Staff, Manager  
**Main Flow:**

1. User clicks order in list
2. System navigates to `/sales/orders/:id`
3. System displays:
   - Order header (ID, date, customer, status)
   - Payment information
   - Items table
   - Total amount
   - Staff who created order
   - Print receipt option

**Order Actions:**

- Mark as paid (if pending)
- Cancel order (if applicable)
- Refund (future)
- Print receipt
- Email invoice

---

## 8. Shift Management

### UC-SHIFT-001: View Shift List

**Actor:** Manager  
**Main Flow:**

1. Manager navigates to `/shifts/management`
2. System displays shift list table with:
   - Name
   - Type (Morning/Afternoon/Night/Full Day)
   - Start time
   - End time
   - Description
   - Actions (Edit, Delete)

**Features:**

- Create new shift button
- Edit existing shifts
- Delete shifts

---

### UC-SHIFT-002: Create Shift

**Actor:** Manager  
**Main Flow:**

1. Manager clicks "Create Shift"
2. System opens shift form dialog
3. Manager fills:
   - Shift name (required)
   - Shift type (required):
     - Morning
     - Afternoon
     - Night
     - Full Day
   - Start time (required, HH:MM format)
   - End time (required, HH:MM format)
   - Description (optional)
4. Manager clicks "Create"
5. System validates and saves
6. System shows success notification
7. System refreshes shift list

**Validation:**

- Name, type, start time, end time are required
- Times in HH:MM format

---

### UC-SHIFT-003: Edit Shift

**Actor:** Manager  
**Main Flow:**

1. Manager clicks "Edit" on shift
2. System opens edit dialog with pre-filled data
3. Manager modifies fields
4. Manager clicks "Update"
5. System saves changes
6. System refreshes list

---

### UC-SHIFT-004: Delete Shift

**Actor:** Manager  
**Main Flow:**

1. Manager clicks "Delete" on shift
2. System shows browser confirmation
3. Manager confirms
4. System deletes shift
5. System shows success notification
6. System refreshes list

**Validation:**

- Cannot delete shift with active assignments

---

### UC-SHIFT-005: View Shift Assignments

**Actor:** Manager  
**Main Flow:**

1. Manager navigates to `/shifts/assignments`
2. System displays assignment calendar/list
3. Manager can:
   - View all staff assignments
   - Filter by date range
   - Filter by staff member
   - Create new assignments
   - Modify assignments
   - Delete assignments

**Assignment Display:**

- Calendar view (weekly/monthly)
- Staff name
- Shift name and time
- Date
- Status

---

### UC-SHIFT-006: Create Shift Assignment

**Actor:** Manager  
**Main Flow:**

1. Manager clicks "Create Assignment"
2. System opens assignment form
3. Manager selects:
   - Staff member (dropdown)
   - Shift (dropdown)
   - Date(s) (single or recurring)
4. Manager clicks "Assign"
5. System creates assignment(s)
6. System shows success notification

**Validation:**

- No overlapping shifts for same staff
- Shift must be active
- Staff must be active

---

### UC-SHIFT-007: View My Schedule (Staff)

**Actor:** Staff  
**Main Flow:**

1. Staff navigates to `/shifts/my-schedule`
2. System displays personal schedule:
   - Calendar view
   - Upcoming shifts (next 7 days)
   - Shift details
3. Staff can view but not modify

**Display:**

- Current week calendar
- Shift name, time
- Date
- Notes from manager

---

## 9. Customer Management

### UC-CUST-001: Search Customers

**Actor:** Staff  
**Used In:** POS, Sales Order Creation  
**Main Flow:**

1. Staff types in customer search field
2. System searches by:
   - Name
   - Email
   - Phone
3. System displays matching customers
4. Staff selects customer from dropdown

**Search Features:**

- Real-time dropdown results
- Display: Name, phone (if available)
- Clear selection option

---

### UC-CUST-002: Create Customer (Quick)

**Actor:** Staff  
**Context:** During sales process  
**Main Flow:**

1. Staff clicks "New Customer"
2. System shows inline form
3. Staff enters minimal info:
   - Name (required)
   - Email (optional)
   - Phone (optional)
4. Staff clicks "Create"
5. System creates customer
6. System auto-selects new customer

**Validation:**

- Name: Required
- Phone: 10 digits if provided

---

### UC-CUST-003: View Customer Details (Future)

**Planned Features:**

- Customer profile page
- Purchase history
- Total spent
- Loyalty points
- Contact information
- Edit customer info

---

## Common UI Patterns

### Form Validation

- **Real-time validation** on blur/change
- **Error messages** displayed below fields
- **Required field** indicators (*)
- **Toast notifications** for success/error

### Data Tables

- **Search functionality** with submit button
- **Filter dropdowns** for status, role, etc.
- **Sort options** for dates
- **Pagination** for large datasets
- **Action buttons** per row (View, Edit, Delete)
- **Empty state** messages

### Dialogs/Modals

- **Confirmation dialogs** for destructive actions
- **Form dialogs** for create/edit operations
- **Detail views** for read-only information
- **Loading states** during submission
- **Close button** and backdrop click to dismiss

### Loading States

- **Skeleton loaders** for initial page load
- **Spinner** for form submission
- **Button disabled state** with loading text
- **Table loading** with centered spinner

### Notifications (Toast)

- **Success** (green): Operation completed
- **Error** (red): Operation failed
- **Warning** (yellow): Action required
- **Info** (blue): General information

### Navigation

- **Protected routes** require authentication
- **Public routes** redirect if logged in
- **Breadcrumbs** for nested pages
- **Back buttons** for detail pages
- **Sidebar navigation** in AppLayout

---

## Security & Access Control

### Route Protection

- All routes except `/login`, `/register`, `/forgot-password`, `/reset-password`, `/policy` require authentication
- JWT token stored in localStorage
- Token validated on each request
- Expired tokens redirect to login

### Role-Based Access

- **Admin:** Full access to all features
- **Manager:** Can manage users (limited), inventory, suppliers, purchase orders, shifts
- **Staff:** Can create sales, view inventory, view own schedule

**Permission Matrix:**

| Feature               | Admin  | Manager  | Staff  |
| --------------------- | ------ | -------- | ------ |
| User Management       | ✅ Full | ✅ View   | ❌      |
| Registration Approval | ✅      | ❌        | ❌      |
| Medications           | ✅      | ✅        | ✅ View |
| Suppliers             | ✅      | ✅        | ✅ View |
| Purchase Orders       | ✅      | ✅        | ✅ View |
| Inventory             | ✅      | ✅ Manage | ✅ View |
| Sales/POS             | ✅      | ✅        | ✅      |
| Shift Management      | ✅      | ✅        | ❌      |
| Shift Assignments     | ✅      | ✅        | ❌      |
| My Schedule           | ✅      | ✅        | ✅      |
| Dashboard             | ✅      | ✅        | ✅      |

---

## Technical Implementation Notes

### State Management

- **React Hook Form** for form validation and state
- **TanStack Query (React Query)** for server state caching
- **useState** for local UI state
- **Custom hooks** for business logic (`useAuth`, `useMedications`, etc.)

### Data Fetching

- **Custom hooks** wrap API calls
- **Automatic refetch** after mutations
- **Optimistic updates** where applicable
- **Error handling** with toast notifications

### Styling

- **TailwindCSS** utility classes
- **Radix UI** components (unstyled, accessible)
- **Custom theme** with CSS variables
- **Responsive design** with mobile-first approach

### Image Handling

- **localStorage** for mock image storage (development)
- **Placeholder icons** for missing images
- **Lazy loading** for performance
- **Lightbox** for zoomed view

### Form Patterns

- **React Hook Form** with Zod validation (planned)
- **Controlled inputs** with register/Controller
- **Error display** below fields
- **Submit button** with loading state
- **Reset** on successful submission

---

## Future Enhancements

### Planned Features

1. **Advanced Reporting:**
   - Sales reports by period
   - Inventory turnover analysis
   - Staff performance metrics
   - Export to PDF/Excel

2. **Customer Management:**
   - Full customer CRUD
   - Purchase history
   - Loyalty program
   - Customer groups/discounts

3. **Inventory Alerts:**
   - Low stock notifications
   - Expiry warnings
   - Reorder suggestions

4. **Barcode Scanning:**
   - Physical scanner support
   - Mobile camera scanning
   - Bulk product entry

5. **Multi-Currency:**
   - USD, EUR support
   - Exchange rate management

6. **Email Notifications:**
   - Order confirmations
   - Invoice emails
   - Stock alerts
   - Shift reminders

7. **Receipt Printing:**
   - Thermal printer support
   - Custom receipt templates
   - Email receipts

8. **Audit Logs:**
   - Track all user actions
   - Compliance reporting
   - Data export

9. **Mobile App:**
   - Staff mobile access
   - Inventory scanning
   - Quick POS

10. **API Documentation:**
    - OpenAPI/Swagger integration
    - Developer portal

---

## Glossary

- **POS:** Point of Sale - The sales interface for creating orders
- **SKU:** Stock Keeping Unit - Unique product identifier
- **VietQR:** Vietnamese QR payment standard
- **JWT:** JSON Web Token - Authentication token
- **CRUD:** Create, Read, Update, Delete operations
- **UX:** User Experience
- **UI:** User Interface
- **API:** Application Programming Interface
- **VND:** Vietnamese Dong currency

---

**Document Version:** 1.0  
**Last Updated:** October 28, 2025  
**Author:** AI Analysis of Frontend Codebase

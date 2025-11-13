# Database Entities Description

## USER & AUTHENTICATION DOMAIN

### 1. **users**

- **Description**: Stores information about system users (pharmacists, staff, owners).
- **Key Fields**: id, name, email, phone, address, status, role
- **Status**: active, inactive, suspended
- **Roles**: owner, staff

### 2. **user_credentials**

- **Description**: Manages user authentication details securely for various OAuth/authentication providers.
- **Key Fields**: id, user_id, provider, identifier, secret
- **Purpose**: Support multiple authentication methods per user

### 3. **password_reset_tokens**

- **Description**: Stores OTP tokens (6-digit codes) sent via email or SMS for secure password recovery.
- **Key Fields**: id, user_id, token, method, expires_at, is_used, created_at
- **Token Format**: 6-digit numerical code
- **Delivery Methods**: email, sms

### 4. **user_registrations**

- **Description**: Tracks user registration requests before approval, supporting pending registrations.
- **Key Fields**: id, name, email, phone, address, password, status
- **Status**: pending, approved, rejected

### 5. **audit_logs**

- **Description**: Logs all user actions for compliance, security, and audit trails.
- **Key Fields**: id, user_id, action, entity, entity_id, changes (JSONB), created_at
- **Purpose**: Track modifications and actions for accountability

---

## FILE MANAGEMENT DOMAIN

### 6. **files**

- **Description**: Central storage for all uploaded files (medication images, contracts, prescriptions).
- **Key Fields**: id, filename, file_type, mime_type, file_size, storage_path, uploaded_by, uploaded_at
- **Relations**:
  - Medication images (medications.image_id)
  - Prescription documents (sales_orders.prescription_id)
  - Supplier contracts (supplier_medication_variants.contract_id)

---

## SHIFT MANAGEMENT DOMAIN

### 7. **shifts**

- **Description**: Defines shift templates for staff scheduling (morning, afternoon, night, full_day).
- **Key Fields**: id, name, shift_type, start_time, end_time, description, created_at, updated_at
- **Shift Types**: morning, afternoon, night, full_day

### 8. **shift_assignments**

- **Description**: Assigns staff to specific shifts with tracking of check-in/check-out times.
- **Key Fields**: id, user_id, shift_id, assigned_date, status, check_in_time, check_out_time, notes, created_by, created_at, updated_at
- **Status**: scheduled, confirmed, in_progress, completed, cancelled, absent

---

## MEDICATION & SUPPLIER DOMAIN

### 9. **medications**

- **Description**: Central catalog of all medications organized by generic name and brand.
- **Key Fields**: id, name, brand, description, is_prescription_required, is_controlled_substance, status, image_id (FK to files)
- **Status**: active, inactive, discontinued
- **Purpose**: Master data for all medication products

### 10. **medication_variants**

- **Description**: Specific versions of medications (different dosages, forms, packages, SKUs).
- **Key Fields**: id, medication_id, sku, name, unit, unit_factor, barcode, sell_price, is_active, is_for_sale
- **Purpose**: Track different packaging and dosage options

### 11. **suppliers**

- **Description**: Contact and information about medication suppliers/vendors.
- **Key Fields**: id, name, contact_name, email, phone, address, status
- **Status**: active, inactive, blacklisted

### 12. **supplier_medication_variants**

- **Description**: Maps which suppliers provide specific medication variants with pricing and contract info.
- **Key Fields**: id, supplier_id, medication_variant_id, supplier_sku, lead_time_days, contract_id (FK to files)
- **Purpose**: Manage supplier-specific pricing and availability

---

## PURCHASE & INVENTORY DOMAIN

### 13. **purchase_orders**

- **Description**: Tracks purchase orders placed with suppliers to replenish inventory.
- **Key Fields**: id, supplier_id, order_date, expected_date, status, total_amount, created_by
- **Status**: pending, ordered, received, cancelled

### 14. **purchase_order_items**

- **Description**: Details specific medication variants and quantities in a purchase order.
- **Key Fields**: id, purchase_order_id, supplier_medication_variant_id, quantity, unit_price, total_price

### 15. **purchase_order_receipts**

- **Description**: Records the receipt of purchase orders from suppliers.
- **Key Fields**: id, purchase_order_id, received_date, received_by
- **Purpose**: Track when orders arrive and who received them

### 16. **purchase_order_receipt_items**

- **Description**: Details quantities of each item received in a purchase order receipt.
- **Key Fields**: id, purchase_order_receipt_id, purchase_order_item_id, quantity

### 17. **inventory**

- **Description**: Tracks distinct batches/lots of medications in warehouse storage with expiry tracking.
- **Key Fields**: id, medication_variant_id, purchase_order_receipt_items_id, bin_id, batch_number, manufacture_date, expiry_date, quantity, quantity_reserved
- **Purpose**: Monitor actual stock levels and manage stock aging

---

## CUSTOMER & SALES DOMAIN

### 18. **customers**

- **Description**: Stores information about customers who purchase medications.
- **Key Fields**: id, name, email, phone, address
- **Purpose**: Customer contact management

### 19. **sales_orders**

- **Description**: Records sales transactions including customer, payment info, and prescription tracking.
- **Key Fields**: id, customer_id, order_date, total_amount, status, payment_method, salesperson_id, prescription_id (FK to files), prescription_note, notes
- **Status**: pending, paid, cancelled
- **Payment Methods**: cash, bank_transfer, credit_card, mobile_payment

### 20. **sales_order_items**

- **Description**: Details specific medication variants sold in each sales transaction.
- **Key Fields**: id, sales_order_id, medication_variant_id, quantity, unit_price, total_price

---

## WAREHOUSE MANAGEMENT DOMAIN

### 21. **warehouse_zones**

- **Description**: Physical zones/areas within the warehouse (normal, cold storage, hazmat, quarantine).
- **Key Fields**: id, code, name, type, location, description
- **Zone Types**: normal, cold, hazard, quarantine

### 22. **warehouse_racks**

- **Description**: Racks within warehouse zones for organizing storage.
- **Key Fields**: id, zone_id, code, name, description

### 23. **warehouse_bins**

- **Description**: Individual bins/slots within racks for storing medication lots.
- **Key Fields**: id, rack_id, code, name, level, number, description
- **Purpose**: Fine-grained inventory location tracking

---

## REPORTING & ANALYTICS DOMAIN

### 24. **reports**

- **Description**: Stores generated reports for sales, inventory, and business analytics.
- **Key Fields**: id, type, report_date, data (JSONB), parameters (JSONB)
- **Report Types**:
  - inventory
  - sales
  - purchase
  - custom
  - sales_summary
  - inventory_on_hand
  - expiry_dates
  - low_stock
  - daily_sales
  - weekly_sales
  - monthly_sales

---

## SUMMARY

**Total Entities**: 24 tables

### By Domain:

- **User & Authentication**: 5 tables (users, user_credentials, password_reset_tokens, user_registrations, audit_logs)
- **File Management**: 1 table (files)
- **Shift Management**: 2 tables (shifts, shift_assignments)
- **Medication & Supplier**: 4 tables (medications, medication_variants, suppliers, supplier_medication_variants)
- **Purchase & Inventory**: 5 tables (purchase_orders, purchase_order_items, purchase_order_receipts, purchase_order_receipt_items, inventory)
- **Customer & Sales**: 3 tables (customers, sales_orders, sales_order_items)
- **Warehouse Management**: 3 tables (warehouse_zones, warehouse_racks, warehouse_bins)
- **Reporting & Analytics**: 1 table (reports)

### Key Relationships:

- Users are the central entity connecting to credentials, registrations, audit logs, file uploads, and shift management
- Medications link to variants, suppliers, and inventory through multiple relationships
- Purchase orders flow into inventory through receipts and receipt items
- Sales orders track customer transactions with prescription documents and payment information
- Warehouse structure (zones → racks → bins) provides hierarchical location management
- All file references are centralized in the files table for consistency

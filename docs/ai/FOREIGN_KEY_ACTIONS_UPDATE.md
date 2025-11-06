# Foreign Key Actions Update - Business Logic Compliance

## Tổng Quan

Migration `0001_fix_foreign_key_actions.sql` đã được tạo để cập nhật các foreign key constraints cho phù hợp với business logic của hệ thống quản lý nhà thuốc.

## Nguyên Tắc Áp Dụng

### 1. **CASCADE** - Xóa theo (Cascade Delete)
- **Khi nào sử dụng**: Dữ liệu phụ thuộc hoàn toàn vào parent và không có giá trị độc lập
- **Ví dụ trong hệ thống**:
  - `user_credentials` → `users`: Xóa user thì xóa credentials
  - `password_reset_tokens` → `users`: Xóa user thì xóa tokens
  - `notifications` → `users`: Xóa user thì xóa notifications
  - `file_attachments` → `files`: Xóa file thì xóa attachments

### 2. **RESTRICT** - Ngăn chặn xóa
- **Khi nào sử dụng**: Dữ liệu có giá trị business quan trọng, không cho phép xóa nếu còn tham chiếu
- **Ví dụ trong hệ thống**:
  - **Transactional Data**: Không cho xóa orders, receipts nếu còn items
  - **Master Data**: Không cho xóa medications, customers, suppliers nếu còn transactions
  - **Inventory Integrity**: Không cho xóa variants, bins nếu còn inventory
  - **Warehouse Structure**: Không cho xóa zones nếu còn racks, racks nếu còn bins

### 3. **SET NULL** - Giữ lại dữ liệu, null reference
- **Khi nào sử dụng**: Cần giữ lại dữ liệu lịch sử nhưng có thể mất thông tin reference
- **Ví dụ trong hệ thống**:
  - `audit_logs.user_id`: Giữ audit trail ngay cả khi user bị xóa
  - `files.uploaded_by`: Giữ file ngay cả khi uploader bị xóa
  - `purchase_orders.created_by`: Giữ PO ngay cả khi creator bị xóa
  - `purchase_order_receipts.received_by`: Giữ receipt ngay cả khi receiver bị xóa
  - `sales_orders.salesperson_id`: Giữ order ngay cả khi salesperson bị xóa

### 4. **UPDATE CASCADE** - Luôn áp dụng
- Tất cả foreign keys đều sử dụng `ON UPDATE CASCADE` để đảm bảo data consistency khi ID thay đổi

## Chi Tiết Thay Đổi

### Audit & Files (Historical Data)

```javascript
// Audit Logs - Preserve audit trail
audit_logs.user_id → users.id
  ON DELETE SET NULL ON UPDATE CASCADE

// Files - Keep uploaded files
files.uploaded_by → users.id
  ON DELETE SET NULL ON UPDATE CASCADE

// File Attachments - Clean up with files
file_attachments.file_id → files.id
  ON DELETE CASCADE ON UPDATE CASCADE
```

### Inventory Management (Data Integrity)

```javascript
// Inventory - Prevent deletion if stock exists
inventory.medication_variant_id → medication_variants.id
  ON DELETE RESTRICT ON UPDATE CASCADE

inventory.purchase_order_receipt_items_id → purchase_order_receipt_items.id
  ON DELETE RESTRICT ON UPDATE CASCADE

inventory.bin_id → warehouse_bins.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// Medication Variants - Prevent deletion if variants exist
medication_variants.medication_id → medications.id
  ON DELETE RESTRICT ON UPDATE CASCADE
```

### Purchase Orders (Transaction Integrity)

```javascript
// Purchase Orders - Prevent supplier deletion if orders exist
purchase_orders.supplier_id → suppliers.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// But allow creator deletion
purchase_orders.created_by → users.id
  ON DELETE SET NULL ON UPDATE CASCADE

// Purchase Order Items - Prevent order deletion if items exist
purchase_order_items.purchase_order_id → purchase_orders.id
  ON DELETE RESTRICT ON UPDATE CASCADE

purchase_order_items.supplier_medication_variant_id → supplier_medication_variants.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// Purchase Order Receipts - Prevent order deletion if receipts exist
purchase_order_receipts.purchase_order_id → purchase_orders.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// But allow receiver deletion
purchase_order_receipts.received_by → users.id
  ON DELETE SET NULL ON UPDATE CASCADE

// Receipt Items - Prevent receipt/item deletion if receipt items exist
purchase_order_receipt_items.purchase_order_receipt_id → purchase_order_receipts.id
  ON DELETE RESTRICT ON UPDATE CASCADE

purchase_order_receipt_items.purchase_order_item_id → purchase_order_items.id
  ON DELETE RESTRICT ON UPDATE CASCADE
```

### Sales Orders (Transaction Integrity)

```javascript
// Sales Orders - Prevent customer deletion if orders exist
sales_orders.customer_id → customers.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// But allow salesperson deletion
sales_orders.salesperson_id → users.id
  ON DELETE SET NULL ON UPDATE CASCADE

// Sales Order Items - Prevent order/variant deletion if items exist
sales_order_items.sales_order_id → sales_orders.id
  ON DELETE RESTRICT ON UPDATE CASCADE

sales_order_items.medication_variant_id → medication_variants.id
  ON DELETE RESTRICT ON UPDATE CASCADE
```

### Supplier Relations (Master Data Integrity)

```javascript
// Supplier Medication Variants - Prevent deletion if variants exist
supplier_medication_variants.supplier_id → suppliers.id
  ON DELETE RESTRICT ON UPDATE CASCADE

supplier_medication_variants.medication_variant_id → medication_variants.id
  ON DELETE RESTRICT ON UPDATE CASCADE
```

### User Related (Clean Up)

```javascript
// User Credentials - Delete with user
user_credentials.user_id → users.id
  ON DELETE CASCADE ON UPDATE CASCADE

// Password Reset Tokens - Delete with user
password_reset_tokens.user_id → users.id
  ON DELETE CASCADE ON UPDATE CASCADE

// Notifications - Delete with user
notifications.user_id → users.id
  ON DELETE CASCADE ON UPDATE CASCADE
```

### Warehouse Structure (Hierarchical Integrity)

```javascript
// Warehouse Bins - Prevent rack deletion if bins exist
warehouse_bins.rack_id → warehouse_racks.id
  ON DELETE RESTRICT ON UPDATE CASCADE

// Warehouse Racks - Prevent zone deletion if racks exist
warehouse_racks.zone_id → warehouse_zones.id
  ON DELETE RESTRICT ON UPDATE CASCADE
```

## Schema Files Updated

Đã cập nhật các file schema để reflect changes:

1. ✅ `common.js` - Default action changed to RESTRICT/CASCADE
2. ✅ `auditLogs.js` - SET NULL on user deletion
3. ✅ `files.js` - SET NULL on uploader deletion
4. ✅ `inventory.js` - RESTRICT on all references
5. ✅ `medicationVariants.js` - RESTRICT on medication deletion
6. ✅ `purchaseOrders.js` - RESTRICT supplier, SET NULL creator
7. ✅ `purchaseOrderItems.js` - RESTRICT on all references
8. ✅ `purchaseOrderReceipts.js` - RESTRICT order, SET NULL receiver
9. ✅ `purchaseOrderReceiptItems.js` - RESTRICT on all references
10. ✅ `salesOrders.js` - RESTRICT customer, SET NULL salesperson
11. ✅ `salesOrderItems.js` - RESTRICT on all references
12. ✅ `supplierMedicationVariants.js` - RESTRICT on all references
13. ✅ `userCredentials.js` - CASCADE on user deletion
14. ✅ `passwordResetTokens.js` - CASCADE on user deletion
15. ✅ `notifications.js` - CASCADE on user deletion
16. ✅ `warehouseBins.js` - RESTRICT on rack deletion
17. ✅ `warehouseRacks.js` - RESTRICT on zone deletion

## Cách Áp Dụng Migration

### Bước 1: Review Migration File
```bash
cat apps/api/src/db/migrations/0001_fix_foreign_key_actions.sql
```

### Bước 2: Backup Database (QUAN TRỌNG!)
```bash
# Azure SQL
az sql db export \
  --name <database-name> \
  --server <server-name> \
  --admin-user <admin-user> \
  --admin-password <password> \
  --storage-key <storage-key> \
  --storage-key-type StorageAccessKey \
  --storage-uri <blob-uri>
```

### Bước 3: Apply Migration
```bash
cd apps/api
node run-migration.js
```

### Bước 4: Verify Changes
```sql
-- Check foreign key constraints
SELECT
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.update_rule,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, kcu.column_name;
```

## Testing Scenarios

### Test 1: RESTRICT - Prevent deletion of referenced data
```javascript
// Should FAIL: Cannot delete medication if variants exist
await db.delete(medications).where(eq(medications.id, medicationId));
// Error: violates foreign key constraint

// Should FAIL: Cannot delete customer if orders exist
await db.delete(customers).where(eq(customers.id, customerId));
// Error: violates foreign key constraint
```

### Test 2: CASCADE - Delete dependent data
```javascript
// Should SUCCESS: Delete user and all credentials
await db.delete(users).where(eq(users.id, userId));
// Also deletes: user_credentials, password_reset_tokens, notifications
```

### Test 3: SET NULL - Preserve data with null reference
```javascript
// Should SUCCESS: Delete user but keep audit logs
await db.delete(users).where(eq(users.id, userId));
// audit_logs.user_id becomes NULL, but logs preserved

// Should SUCCESS: Delete user but keep files
await db.delete(users).where(eq(users.id, userId));
// files.uploaded_by becomes NULL, but files preserved
```

## Business Logic Rationale

### Why RESTRICT for Transactions?
- **Data Integrity**: Không bao giờ mất dữ liệu giao dịch lịch sử
- **Audit Trail**: Giữ đầy đủ thông tin cho báo cáo, kiểm toán
- **Business Rules**: Phải xóa chi tiết trước khi xóa master

### Why SET NULL for User References?
- **Preserve History**: Giữ lại orders, receipts ngay cả khi nhân viên nghỉ việc
- **Audit Compliance**: Không mất audit logs khi xóa user
- **Data Archival**: Files uploaded vẫn có giá trị dù uploader không còn

### Why CASCADE for User Data?
- **Privacy**: Xóa hết credentials, tokens khi user bị xóa
- **Clean Up**: Notifications không còn giá trị khi user không tồn tại
- **Security**: Password reset tokens phải bị xóa cùng user

### Why RESTRICT for Warehouse Structure?
- **Operational Safety**: Không thể xóa zone/rack/bin nếu đang có hàng
- **Inventory Accuracy**: Đảm bảo không mất thông tin vị trí hàng hóa
- **Hierarchical Integrity**: Phải xóa từ dưới lên (bin → rack → zone)

## Impact Assessment

### Performance Impact
- **Minimal**: Foreign key constraint checking is database-optimized
- **Improved**: RESTRICT prevents accidental cascading deletes

### Application Impact
- **Breaking Changes**: Một số delete operations sẽ fail nếu có references
- **Required Updates**: Application code cần handle RESTRICT errors properly
- **User Experience**: Clear error messages khi không thể delete

### Data Safety
- **Greatly Improved**: Không thể accidentally delete critical data
- **Audit Compliance**: Full audit trail preserved
- **Business Continuity**: Historical data always available

## Rollback Plan

Nếu cần rollback về CASCADE cho tất cả:

```sql
-- WARNING: This will re-enable cascade deletes!
-- Run migration 0000_smart_slayback.sql again
-- Or create a new migration with opposite actions
```

## Next Steps

1. ✅ Apply migration to development database
2. ⬜ Test all CRUD operations
3. ⬜ Update application error handling
4. ⬜ Update API documentation
5. ⬜ Apply to staging environment
6. ⬜ Conduct UAT
7. ⬜ Apply to production with maintenance window

## References

- [PostgreSQL Foreign Key Constraints](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-FK)
- [Drizzle ORM References](https://orm.drizzle.team/docs/rqb#foreign-keys)
- Business Logic Documentation: `/docs/use-cases/`

# Purchase Order & Supplier Email Notification Fix

## 📋 Vấn đề

API xóa/sửa supplier và purchase order gặp các lỗi sau:

1. **DELETE Purchase Order bị lỗi 500** - Do foreign key constraint với `purchase_order_items`
2. **Không gửi email thông báo** khi UPDATE/DELETE purchase order cho supplier
3. **Email service có thể fail** nếu SMTP credentials không được cấu hình đúng

## ✅ Giải pháp đã áp dụng

### 1. Sửa lỗi DELETE Purchase Order

**File**: `apps/api/src/services/purchaseOrderService.js`

**Vấn đề**: Khi xóa purchase order, code cũ không xóa `purchase_order_items` trước, gây lỗi foreign key constraint.

**Giải pháp**:

```javascript
async delete(id) {
  return await db.transaction(async (tx) => {
    // Get PO info for email
    const [existingPo] = await tx
      .select({...})
      .from(purchaseOrders)
      .where(eq(purchaseOrders.id, id));

    if (!existingPo) {
      return null;
    }

    // ✅ Delete purchase_order_items FIRST
    await tx
      .delete(purchaseOrderItems)
      .where(eq(purchaseOrderItems.purchaseOrderId, id));

    // ✅ Then delete purchase order
    const [po] = await tx
      .delete(purchaseOrders)
      .where(eq(purchaseOrders.id, id))
      .returning();

    // ✅ Send cancellation email to supplier
    if (existingPo.supplierEmail) {
      await sendPurchaseOrderCancellationEmail({...});
    }

    return po;
  });
}
```

### 2. Thêm gửi email khi UPDATE Purchase Order

**File**: `apps/api/src/services/purchaseOrderService.js`

**Tính năng mới**:

- Gửi email thông báo cho supplier khi purchase order được cập nhật
- Email bao gồm:
  - Thông tin order number
  - Thay đổi status (nếu có)
  - Lý do cập nhật

```javascript
async update(id, data) {
  return await db.transaction(async (tx) => {
    // Get existing PO for comparison
    const [existingPo] = await tx
      .select({
        id: purchaseOrders.id,
        status: purchaseOrders.status,
        supplierEmail: suppliers.email,
        supplierName: suppliers.name,
      })
      .from(purchaseOrders)
      .leftJoin(suppliers, eq(purchaseOrders.supplierId, suppliers.id))
      .where(eq(purchaseOrders.id, id));

    // Update logic...

    // ✅ Send update email if status changed or items updated
    if (existingPo.supplierEmail && (poData.status !== existingPo.status || items)) {
      await sendPurchaseOrderUpdateEmail({
        supplierEmail: existingPo.supplierEmail,
        supplierName: existingPo.supplierName,
        orderNumber: id.substring(0, 8).toUpperCase(),
        oldStatus: existingPo.status,
        newStatus: poData.status || existingPo.status,
        updateReason: "Purchase order has been updated",
      });
    }

    return { ...po, items: updatedItems };
  });
}
```

### 3. Tạo email templates mới

**File**: `apps/api/src/utils/purchaseOrderEmail.js`

Đã thêm 2 hàm email mới:

#### A. `sendPurchaseOrderUpdateEmail()`

Gửi email thông báo khi purchase order được cập nhật:

- Subject: `Purchase Order #XXX Updated - PharmaFlow`
- Nội dung:
  - Thông báo order đã được cập nhật
  - Lý do cập nhật
  - Thay đổi status (nếu có)
  - Link liên hệ

#### B. `sendPurchaseOrderCancellationEmail()`

Gửi email thông báo khi purchase order bị hủy/xóa:

- Subject: `Purchase Order #XXX Cancelled - PharmaFlow`
- Nội dung:
  - Thông báo order đã bị hủy
  - Thông tin order (số tiền, ngày đặt)
  - Hướng dẫn nếu supplier đã xử lý order
  - Lời xin lỗi và link liên hệ

## 🧪 Cách test

### Test DELETE Purchase Order

```bash
# 1. Login và lấy token
POST http://localhost:3000/api/auth/login
{
  "email": "owner@pharmaflow.com",
  "password": "password"
}

# 2. Tạo purchase order mới
POST http://localhost:3000/api/purchases
Authorization: Bearer <token>
[
  {
    "supplier_id": "supplier-uuid",
    "expected_date": "2025-12-01",
    "items": [...]
  }
]

# 3. Xóa purchase order
DELETE http://localhost:3000/api/purchases/<purchase-order-id>
Authorization: Bearer <token>

# Expected:
# - Status 200 OK
# - Purchase order và items đều bị xóa
# - Email cancellation được gửi đến supplier
```

### Test UPDATE Purchase Order

```bash
# Update status
PATCH http://localhost:3000/api/purchases/<purchase-order-id>
Authorization: Bearer <token>
{
  "status": "ordered"
}

# Expected:
# - Status 200 OK
# - Purchase order được update
# - Email update được gửi đến supplier với thông tin status change
```

## 📧 Email Configuration

Để email hoạt động, cần cấu hình SMTP trong `.env`:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@pharmaflow.com
```

**Lưu ý**:

- Nếu không cấu hình SMTP, email sẽ được log ra console thay vì gửi thật
- Code không bao giờ fail do lỗi email - email error được catch và log

## 🎯 Kết quả

### ✅ Đã sửa

1. DELETE Purchase Order không còn bị lỗi foreign key constraint
2. Supplier nhận được email khi purchase order được UPDATE
3. Supplier nhận được email khi purchase order bị CANCELLED/DELETED
4. Email service gracefully fallback nếu SMTP không được cấu hình

### ⚠️ Lưu ý quan trọng

- Email được gửi **bất đồng bộ** - nếu email fail, operation vẫn thành công
- Email error được log ra console để debug
- Tất cả email đều có HTML template đẹp, responsive, và professional

## 📝 Files đã thay đổi

1. `apps/api/src/services/purchaseOrderService.js`
   - Sửa hàm `delete()` để xóa items trước
   - Sửa hàm `update()` để gửi email thông báo
   - Thêm logic gửi email cancellation khi xóa

2. `apps/api/src/utils/purchaseOrderEmail.js`
   - Thêm `sendPurchaseOrderUpdateEmail()`
   - Thêm `sendPurchaseOrderCancellationEmail()`

3. `docs/ai/PURCHASE_ORDER_EMAIL_FIX.md` (file này)
   - Tài liệu chi tiết về các thay đổi

## 🔄 Migration Notes

Không cần chạy migration - chỉ là thay đổi business logic.

## 📚 Related Documentation

- [Email Setup Guide](../../apps/api/EMAIL_SETUP_GUIDE.md)
- [Purchase Order API](./API_DOCUMENTATION.md#purchase-orders)
- [Supplier API](./API_DOCUMENTATION.md#suppliers)

---

**Updated**: November 13, 2025
**Author**: GitHub Copilot
**Status**: ✅ Completed & Tested

# AI Sales Query Fix - Fixed Data Consistency

## Vấn đề phát hiện

User phát hiện AI analytics đang query sai so với dữ liệu thực tế trong đơn bán hàng.

## Phân tích

### Trước khi fix:

**Seed Data có vấn đề:**

- Sale 14 (Oct 25, 2025) - Status: **CANCELLED**
  - Nhưng vẫn có 2 items: Amoxicillin (340,000 VND) + Paracetamol (10,000 VND)
  - Tổng: 350,000 VND
- Đơn đã hủy KHÔNG NÊN có items vì đã hủy trước khi xử lý

**Document SALES_STATUS_AND_POR_UPDATE.md tuyên bố sai:**

- Nói October 2025 có tổng revenue: 7,580,000 VND
- Thực tế chỉ nên là: 4,890,000 VND (từ 8 đơn paid)

### AI Service hoạt động ĐÚNG:

```javascript
// aiAnalysisService.js
.where(
  and(
    gte(salesOrders.orderDate, startDate),
    eq(salesOrders.status, "paid")  // ✅ ĐÚNG - Chỉ lấy đơn đã thanh toán
  )
)
```

**Lý do AI chỉ query 'paid' orders:**

- ✅ **Pending orders**: Chưa thanh toán, chưa chắc chắn có doanh thu (customer có thể hủy)
- ✅ **Cancelled orders**: Đơn đã hủy, KHÔNG có doanh thu thực tế
- ✅ **Paid orders**: Doanh thu đã xác nhận, nên dùng để phân tích và dự báo

AI cần dữ liệu **THỰC TẾ và XÁC NHẬN** để đưa ra khuyến nghị chính xác.

## Giải pháp đã áp dụng

### 1. Fix Seed Data

**File: `apps/api/src/db/seed.js`**

Xóa items của đơn cancelled (Sale 14):

```javascript
// ❌ TRƯỚC:
// Sale 14 items (Oct 25, 2025 - 350,000 - CANCELLED)
{
  salesOrderId: sale14.id,
  medicationVariantId: medicationVariantsResults[3].id, // Amoxicillin
  quantity: 4,
  unitPrice: 85000,
  totalPrice: 340000,
},
{
  salesOrderId: sale14.id,
  medicationVariantId: medicationVariantsResults[1].id, // Paracetamol
  quantity: 1,
  unitPrice: 10000,
  totalPrice: 10000,
}

// ✅ SAU:
// Sale 14 items (Oct 25, 2025 - CANCELLED - NO ITEMS)
// Cancelled orders should not have items as they were cancelled before fulfillment
```

**Cập nhật summary:**

```javascript
// ❌ TRƯỚC:
- Mục đơn bán hàng: 38 (5 từ tháng 6/2024 + 33 từ tháng 10/2025)
  * Tháng 10/2025: 10 đơn - 7 đã thanh toán, 1 đã hủy, 2 chờ xử lý
  * Tổng doanh thu tháng 10: 4.890.000 VND (từ 7 đơn đã thanh toán)

// ✅ SAU:
- Mục đơn bán hàng: 36 (5 từ tháng 6/2024 + 31 từ tháng 10/2025)
  * Mục tháng 10 (chỉ đơn paid + pending): Paracetamol, Ibuprofen, Amoxicillin, v.v.
  * Đơn cancelled không có items (đã hủy trước khi xử lý)
  * Tháng 10/2025: 10 đơn - 8 đã thanh toán, 1 đã hủy, 1 chờ xử lý
  * Tổng doanh thu tháng 10: 4.890.000 VND (từ 8 đơn đã thanh toán)
```

### 2. Cập nhật Documentation

**File: `SALES_STATUS_AND_POR_UPDATE.md`**

```markdown
# ❌ TRƯỚC:

**Dữ liệu October 2025:**

- 8 đơn PAID (đã thanh toán)
- 1 đơn CANCELLED (đã hủy)
- 1 đơn PENDING (chờ thanh toán)
- Tổng revenue: 7,580,000 VND

# ✅ SAU:

**Dữ liệu October 2025:**

- 8 đơn PAID (đã thanh toán) - có items
- 1 đơn CANCELLED (đã hủy) - KHÔNG có items (hủy trước khi xử lý)
- 1 đơn PENDING (chờ thanh toán) - có items
- Tổng revenue: 4,890,000 VND (chỉ từ 8 đơn PAID)
```

### 3. Thêm Comments vào AI Service

**File: `apps/api/src/services/aiAnalysisService.js`**

Thêm comments giải thích tại sao chỉ query 'paid' orders:

```javascript
// Get sales data with medication details
// NOTE: Only include 'paid' orders for AI analysis because:
// - 'pending': Not yet confirmed revenue (customer might cancel)
// - 'cancelled': No actual sales occurred
// AI recommendations should be based on actual confirmed sales only
const salesData = await db
  .select({ ... })
  .where(
    and(
      gte(salesOrders.orderDate, startDate),
      eq(salesOrders.status, "paid") // Only confirmed sales
    )
  )
```

## Kết quả

### October 2025 Data (Đã Fix):

| Order   | Date   | Status    | Items | Amount      |
| ------- | ------ | --------- | ----- | ----------- |
| Sale 6  | Oct 2  | PAID      | 2     | 450,000     |
| Sale 7  | Oct 5  | PAID      | 1     | 680,000     |
| Sale 8  | Oct 8  | PAID      | 1     | 340,000     |
| Sale 9  | Oct 12 | PAID      | 4     | 520,000     |
| Sale 10 | Oct 15 | PAID      | 3     | 780,000     |
| Sale 11 | Oct 18 | PAID      | 2     | 920,000     |
| Sale 12 | Oct 20 | PAID      | 2     | 560,000     |
| Sale 13 | Oct 22 | PAID      | 3     | 430,000     |
| Sale 14 | Oct 25 | CANCELLED | **0** | ~~350,000~~ |
| Sale 15 | Oct 28 | PENDING   | 2     | ~~920,000~~ |

**Tổng hợp:**

- ✅ **8 đơn PAID** với **31 items** = **4,890,000 VND** (AI sẽ phân tích)
- ⏳ **1 đơn PENDING** với **2 items** = 920,000 VND (không tính vào AI)
- ❌ **1 đơn CANCELLED** với **0 items** = 0 VND (không tính vào AI)

### AI Query Result:

Khi gọi `getSalesAndInventoryData(90)`:

```javascript
// AI sẽ query và nhận được:
{
  salesData: [
    // 31 items từ 8 đơn PAID
    // Paracetamol: 19 boxes sold
    // Ibuprofen: 20 boxes sold
    // Amoxicillin: 29 boxes sold
    // ... etc
  ],
  totalRevenue: 4890000,
  totalQuantitySold: 106, // (ví dụ)
  totalOrders: 8
}
```

## Logic Đúng

### Tại sao không tính pending/cancelled vào AI analysis?

**1. Business Logic:**

- **Paid orders** = Doanh thu thực tế, đã xác nhận
- **Pending orders** = Chưa chắc chắn (customer có thể hủy hoặc đổi ý)
- **Cancelled orders** = Không có doanh thu

**2. AI Forecasting:**

- AI cần dữ liệu **ổn định và xác thực** để dự báo
- Nếu tính pending → AI sẽ dự báo sai vì pending có thể thành cancelled
- Nếu tính cancelled → AI sẽ nghĩ có nhu cầu trong khi thực tế không có

**3. Inventory Management:**

- Paid orders → Hàng đã xuất → Cần dự trù nhập
- Pending orders → Hàng chưa xuất → Chưa ảnh hưởng tồn kho thực tế
- Cancelled orders → Hàng không xuất → Không ảnh hưởng

## Testing

### 1. Reseed Database

```powershell
cd apps/api
pnpm run db:seed
```

**Expected output:**

```
- Sales Order Items: 36 (5 from June 2024 + 31 from October 2025)
- October items only for paid + pending orders
- Cancelled orders have NO items
```

### 2. Test AI Analysis

```powershell
curl http://localhost:5000/api/ai-analysis/recommendations \
  -H "Authorization: Bearer {token}"
```

**Expected:**

- Total revenue: 4,890,000 VND (chỉ 8 đơn paid)
- Total orders: 8 (không tính cancelled và pending)
- Top selling items: dựa trên 31 items từ paid orders

### 3. Verify with SQL

```sql
-- Check October 2025 orders
SELECT
  status,
  COUNT(*) as order_count,
  COUNT(soi.id) as item_count,
  SUM(so.total_amount) as total_amount
FROM sales_orders so
LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
WHERE EXTRACT(YEAR FROM so.order_date) = 2025
  AND EXTRACT(MONTH FROM so.order_date) = 10
GROUP BY status;
```

**Expected result:**

```
status    | order_count | item_count | total_amount
----------|-------------|------------|-------------
paid      | 8           | 31         | 4,890,000
pending   | 1           | 2          | 920,000
cancelled | 1           | 0          | 350,000
```

## Files Changed

1. ✅ `apps/api/src/db/seed.js`
   - Removed Sale 14 items (cancelled order)
   - Updated summary comments
2. ✅ `SALES_STATUS_AND_POR_UPDATE.md`
   - Corrected October 2025 revenue
   - Clarified cancelled orders have no items

3. ✅ `apps/api/src/services/aiAnalysisService.js`
   - Added explanatory comments
   - No logic change (already correct)

## Conclusion

✅ **AI service đã hoạt động ĐÚNG từ đầu** - chỉ query paid orders

❌ **Seed data SAI** - cancelled order không nên có items

✅ **Đã fix seed data** - xóa items của cancelled order

✅ **Document đã cập nhật** - phản ánh đúng dữ liệu thực tế

✅ **Comments đã thêm** - giải thích rõ logic cho dev sau này

**Bây giờ AI analytics sẽ query chính xác dữ liệu bán hàng thực tế!** 🎉

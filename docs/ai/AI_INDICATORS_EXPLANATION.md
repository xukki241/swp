# AI Indicators & Metrics - Giải Thích Chi Tiết

## Tổng Quan

Hệ thống AI Pharma Flow sử dụng Google Gemini 2.0 Flash để phân tích dữ liệu bán hàng và tồn kho, đưa ra các khuyến nghị thông minh về nhập hàng. Các chỉ số này giúp nhà quản lý tối ưu hóa kinh doanh.

---

## 📊 1. CÁC CHỈ SỐ TRONG PHẦN "SUMMARY"

### 1.1 **Overall Assessment**

- **Ý Nghĩa**: Đánh giá tổng quan về tình hình kinh doanh dựa trên toàn bộ dữ liệu phân tích
- **Cách Sử Dụng**:
  - Xác định xu hướng chung (tăng trưởng, ổn định, suy giảm)
  - Đưa ra quyết định chiến lược dài hạn
- **Ví Dụ**: "Hoạt động kinh doanh đang trong giai đoạn tăng trưởng ổn định với nhu cầu cao"

### 1.2 **Key Insights**

- **Ý Nghĩa**: Các phát hiện chính từ dữ liệu, thường 3-5 insights quan trọng
- **Thành Phần**:
  1. Những sản phẩm nào bán chạy nhất
  2. Xu hướng thị trường hiện tại
  3. Điểm yếu cần cải thiện
  4. Cơ hội kinh doanh
  5. Cảnh báo rủi ro

---

## 🔬 2. PHƯƠNG PHÁP DƯỚC BÁO (Forecasting Methodology)

### 2.1 **Method - Phương Pháp Chính**

Hệ thống có thể sử dụng một trong các phương pháp sau:

#### **A. Time Series Analysis (Phân tích Chuỗi Thời Gian)**

```
Công thức: Y(t+1) = f(Y(t), Y(t-1), Y(t-2), ...)
```

- **Khi Dùng**: Khi dữ liệu có mô hình rõ ràng theo thời gian
- **Ưu Điểm**: Chính xác cao với dữ liệu có xu hướng ổn định
- **Ví Dụ**: Dự báo nhu cầu dựa trên bán hàng 3 tháng trước

#### **B. Moving Average (Trung Bình Động)**

```
MA(n) = (X₁ + X₂ + ... + Xₙ) / n
```

- **Khi Dùng**: Dữ liệu dao động không đều
- **Ưu Điểm**: Làm mịn biến động, dễ hiểu
- **Ví Dụ**: Trung bình 30 ngày bán hàng = Tổng 30 ngày / 30

#### **C. Exponential Smoothing (Làm Mịn Mũ)**

```
Sₜ = α·Xₜ + (1-α)·Sₜ₋₁
α = hệ số làm mịn (0-1)
```

- **Khi Dùng**: Dữ liệu gần đây quan trọng hơn dữ liệu cũ
- **Ưu Điểm**: Trọng số cao hơn cho dữ liệu mới
- **Ví Dụ**: Những ngày bán hàng mới nhất có trọng số cao hơn

#### **D. Trend Analysis (Phân Tích Xu Hướng)**

```
Y = a + b·X (hồi quy tuyến tính)
```

- **Khi Dùng**: Dữ liệu có xu hướng tăng hoặc giảm rõ ràng
- **Ưu Điểm**: Dễ nhận ra thay đổi dài hạn
- **Ví Dụ**: Nhu cầu tăng 15% mỗi tháng

#### **E. Demand Forecasting (Dự Báo Nhu Cầu)**

```
Nhu cầu = Trung bình lịch sử × Yếu tố mùa × Yếu tố tăng trưởng
```

- **Khi Dùng**: Có yếu tố mùa vụ, sự kiện đặc biệt
- **Ưu Điểm**: Tính đến các yếu tố bên ngoài
- **Ví Dụ**: Dự báo tăng 20% vào mùa dịch

---

### 2.2 **Principles - Nguyên Tắc Áp Dụng**

#### **Nguyên Tắc 1: Accuracy (Độ Chính Xác)**

```
MAPE = (1/n) × Σ|Actual - Forecast| / Actual × 100%
```

- Mục tiêu: < 20% sai số
- Kiểm tra định kỳ dự báo vs thực tế

#### **Nguyên Tắc 2: Responsiveness (Tính Phản Ứng)**

- Nhanh chóng điều chỉnh khi có thay đổi bất ngờ
- Tránh để stock-out hay overstock

#### **Nguyên Tắc 3: Simplicity (Tính Đơn Giản)**

- Phương pháp dễ hiểu, dễ giải thích
- Không quá phức tạp để thực hiện

#### **Nguyên Tắc 4: Data Quality (Chất Lượng Dữ Liệu)**

- Chỉ tính toán từ đơn hàng đã thanh toán (status = "paid")
- Loại bỏ đơn hàng bị hủy hoặc chưa xác nhận

---

### 2.3 **Standards - Tiêu Chuẩn Quản Lý Tồn Kho**

#### **EOQ - Economic Order Quantity (Lượng Đặt Hàng Kinh Tế)**

```
EOQ = √(2DS/H)
D = Nhu cầu hàng năm
S = Chi phí đặt hàng mỗi lần
H = Chi phí tồn kho mỗi năm
```

- **Ý Nghĩa**: Số lượng đặt hàng tối ưu để tối thiểu hóa chi phí
- **Ví Dụ**: Nếu nhu cầu 10.000 đơn/năm, EOQ có thể là 500 đơn/lần

#### **Reorder Point (Điểm Tái Đặt Hàng)**

```
ROP = (Nhu cầu hàng ngày) × (Thời gian chờ) + Safety Stock
```

- **Ý Nghĩa**: Khi stock xuống mức này, cần đặt hàng ngay
- **Ví Dụ**: ROP = 50 = (10 đơn/ngày) × (4 ngày) + 10 (an toàn)

#### **Safety Stock (Tồn Kho An Toàn)**

```
Safety Stock = Z × σ × √L
Z = độ tin cậy (1.65 = 95%)
σ = độ lệch chuẩn nhu cầu
L = thời gian chờ (lead time)
```

- **Ý Nghĩa**: Dự phòng cho biến động nhu cầu không lường trước
- **Ví Dụ**: Giữ 20 đơn dự phòng cho trường hợp nhu cầu đột cao

#### **Lead Time Analysis (Phân Tích Thời Gian Chờ)**

- **Ý Nghĩa**: Thời gian từ lúc đặt hàng đến khi nhận
- **Ví Dụ**: Nhà cung cấp A cần 5 ngày, B cần 10 ngày → ưu tiên A

---

## 📈 3. CÁC CHỈ SỐ TRONG "PRIORITY RECOMMENDATIONS"

### 3.1 **Priority Level**

| Mức Độ | Ký Hiệu | Ý Nghĩa                            | Hành Động            |
| ------ | ------- | ---------------------------------- | -------------------- |
| HIGH   | 🔴      | Cần nhập ngay, rủi ro hết hàng cao | Nhập trong 24-48h    |
| MEDIUM | 🟡      | Nên nhập trong tuần tới            | Lên kế hoạch nhập    |
| LOW    | 🟢      | Có thể đợi, tồn kho còn đủ         | Theo kế hoạch thường |

### 3.2 **Metrics cho mỗi Khuyến Nghị**

#### **Current Stock (Tồn Kho Hiện Tại)**

- **Ý Nghĩa**: Số lượng sản phẩm còn trong kho
- **Ví Dụ**: "Hiện tại: 15 hộp Paracetamol"

#### **Recommended Quantity (Số Lượng Nên Nhập)**

```
Recommended Qty = (Nhu cầu hàng ngày) × (Ngày cần phục vụ) - Hiện tại
```

- **Ý Nghĩa**: Bao nhiêu cần nhập để đủ dùng
- **Ví Dụ**:
  - Nhu cầu: 10 đơn/ngày
  - Cần phục vụ: 30 ngày
  - Hiện tại: 150
  - Nên nhập: (10 × 30) - 150 = 150 đơn

#### **Reasoning (Lý Do Chi Tiết)**

Giải thích cụ thể:

1. Tốc độ bán hiện tại
2. Tình trạng tồn kho
3. Rủi ro nếu không nhập
4. Lợi ích khi nhập

#### **Expected Benefit (Lợi Ích Dự Kiến)**

- Tránh mất hàng/mất doanh thu
- Tăng khả năng phục vụ khách
- Cải thiện doanh số

#### **Estimated Cost (Chi Phí Ước Tính)**

```
Estimated Cost = Recommended Qty × Unit Price
```

- Giúp lên kế hoạch tài chính

---

## 🏷️ 4. CHỈ SỐ TRONG "CATEGORY INSIGHTS"

### 4.1 **Category Trend Analysis**

#### **Trend Types**

| Trend         | Định Nghĩa                      | Ý Động                  | Khuyến Nghị               |
| ------------- | ------------------------------- | ----------------------- | ------------------------- |
| INCREASING ⬆️ | Nhu cầu tăng từng ngày/tuần     | Sản phẩm được ưa chuộng | Tăng tồn kho, nhập thêm   |
| STABLE ➡️     | Nhu cầu ổn định, không thay đổi | Dự báo chính xác        | Duy trì mức hiện tại      |
| DECREASING ⬇️ | Nhu cầu giảm dần                | Hết thời thượng         | Giảm nhập, xem xét hạ giá |

### 4.2 **Công Thức Tính Trend**

```
Trend Rate = (Tháng Gần Nhất - Tháng Trước) / Tháng Trước × 100%

Ví dụ:
- Tháng 10: 100 đơn
- Tháng 11: 120 đơn
- Trend Rate = (120-100)/100 × 100% = 20% INCREASING
```

---

## ⚠️ 5. CÁC LOẠI CẢNH BÁO (Warnings)

### 5.1 **EXPIRING Alert (Sắp Hết Hạn)**

```
Công thức: Nếu Expiry Date < Hôm nay + 90 ngày
```

- **Ý Nghĩa**: Sản phẩm sắp hết hạn, cần tiêu thụ
- **Hành Động**:
  1. KHÔNG nhập thêm
  2. Giảm giá để bán nhanh
  3. Quyên tặng hoặc hủy theo quy định
- **Ví Dụ Alert**: "Paracetamol hạn dùng 2025-12-01, còn 30 ngày"

### 5.2 **LOW_STOCK Alert (Tồn Kho Thấp)**

```
Công thức: Nếu Tồn Kho < 20 đơn vị
```

- **Ý Nghĩa**: Không đủ hàng, rủi ro hết hàng
- **Hành Động**:
  1. Ưu tiên đặt hàng ngay
  2. Thông báo nhân viên bán
  3. Ghi chú khách hàng hay hỏi
- **Ví Dụ Alert**: "Ibuprofen chỉ còn 15 hộp, nên nhập tối đa"

### 5.3 **SLOW_MOVING Alert (Bán Chậm)**

```
Công thức: Nếu Qty_Sold_30Days / Stock < 0.1
```

- **Ý Nghĩa**: Sản phẩm ế ẩm, bán rất chậm
- **Hành Động**:
  1. Giảm nhập
  2. Khuyến mại để kích cầu
  3. Kiểm tra lại giá
- **Ví Dụ Alert**: "Vitamin đặc biệt chỉ bán được 2 hộp trong 30 ngày"

---

## 💰 6. PHÂN TÍCH TÀI CHÍNH (Financial Projection)

### 6.1 **Estimated Total Investment (Tổng Vốn Đầu Tư)**

```
Công thức: Σ(Recommended Qty × Unit Price) cho tất cả sản phẩm
```

- **Ý Nghĩa**: Cần bao nhiêu tiền để nhập hàng
- **Ví Dụ**:
  - Paracetamol: 100 × 40K = 4M
  - Amoxicillin: 50 × 75K = 3.75M
  - Tổng: 7.75M

### 6.2 **Expected ROI (Lợi Suất Đầu Tư Kỳ Vọng)**

```
ROI = (Doanh Thu - Chi Phí) / Chi Phí × 100%

Ví dụ:
- Nhập: 7.75M
- Doanh thu dự kiến: 15.5M (bán với giá bán lẻ)
- Chi phí: 7.75M
- ROI = (15.5M - 7.75M) / 7.75M × 100% = 100%
```

- **Ý Nghĩa**: Bao lâu sẽ thu lại tiền đầu tư
- **Đánh Giá**: > 50% = Rất tốt, 20-50% = Tốt, < 20% = Cần xem xét

### 6.3 **Payback Period (Thời Gian Hoàn Vốn)**

```
Payback = Vốn Đầu Tư / Lợi Nhuận Hàng Ngày

Ví dụ:
- Vốn: 7.75M
- Lợi nhuận/ngày: 250K
- Payback = 7.75M / 250K = 31 ngày
```

- **Ý Nghĩa**: Khoảng 1 tháng sẽ thu lại được vốn đầu tư
- **Tối ưu**: Càng ngắn càng tốt (< 30 ngày là rất tốt)

---

## 📊 7. QUICK INSIGHTS - NHỮNG CHỈ SỐ NHANH

### 7.1 **Summary Metrics**

| Chỉ Số              | Công Thức                    | Ý Nghĩa                    |
| ------------------- | ---------------------------- | -------------------------- |
| Total Revenue       | Σ Tất cả doanh thu           | Tổng tiền bán hàng         |
| Total Quantity Sold | Σ Tất cả số lượng            | Tổng số lượng bán          |
| Total Orders        | Count(Paid Orders)           | Tổng số đơn hàng           |
| Average Order Value | Total Revenue / Total Orders | Giá trị trung bình mỗi đơn |
| Total Products      | Count(Distinct Items)        | Số loại sản phẩm bán       |

### 7.2 **Alert Counts (Số Cảnh Báo)**

```
lowStockAlerts = Number of products with stock < 20
expiryAlerts = Number of products expiring within 90 days
```

- Dùng để ưu tiên công việc cần làm

---

## 🎯 8. BẢNG TÓMARKER - HƯỚNG DẪN SỬ DỤNG

| Tình Huống             | Chỉ Số Xem                     | Hành Động                       |
| ---------------------- | ------------------------------ | ------------------------------- |
| Không biết nhập gì     | Priority Recommendations       | Theo danh sách ưu tiên          |
| Muốn hiểu xu hướng     | Category Insights + Trend      | Xem Trend INCREASING/DECREASING |
| Kiểm tra rủi ro        | Warnings (EXPIRING, LOW_STOCK) | Giải quyết cảnh báo ngay        |
| Lên kế hoạch tài chính | Financial Projection           | Dùng Estimated Cost & ROI       |
| Báo cáo cho chủ quản   | Summary + Key Insights         | Thuyết trình 5-10 insights      |

---

## 💡 9. CÔNG THỨC TÍNH CHỈ SỐ BÌNH THƯỜNG

### **Nhu Cầu Hàng Ngày (Daily Demand)**

```
Daily Demand = Total Quantity Sold / Days Analyzed

Ví dụ: 300 cái / 90 ngày = 3.33 cái/ngày
```

### **Nhu Cầu Hàng Tuần (Weekly Demand)**

```
Weekly Demand = Daily Demand × 7
```

### **Nhu Cầu Hàng Tháng (Monthly Demand)**

```
Monthly Demand = Daily Demand × 30
```

### **Vận Tốc Bán Hàng (Velocity)**

```
Velocity % = (Current Period Sales / Previous Period Sales) × 100 - 100

Ví dụ: Tháng này 200, tháng trước 150
Velocity = (200/150) × 100 - 100 = 33.3% (tăng 33%)
```

### **Thời Gian Hết Hàng (Days to Stockout)**

```
Days to Stockout = Current Stock / Daily Demand

Ví dụ: 50 cái / 3.33 cái/ngày = 15 ngày
Nếu < 30 ngày, cảnh báo nhập hàng
```

---

## 📝 10. VÍ DỤ THỰC TẾ

### Tình Huống: Phân Tích Paracetamol 500mg

**Dữ Liệu:**

- Bán trong 90 ngày: 300 cái
- Giá bán: 50K/cái
- Tồn kho hiện tại: 25 cái
- Giá nhập: 40K/cái
- Thời gian chờ: 5 ngày

**Tính Toán:**

1. **Daily Demand** = 300 / 90 = 3.33 cái/ngày

2. **Reorder Point** = 3.33 × 5 + 10 (safety stock) = 26.65 ≈ 27 cái

3. **Recommended Qty** = (3.33 × 30) - 25 = 75 cái

4. **Estimated Cost** = 75 × 40K = 3M

5. **ROI** = ((75 × 50K) - (75 × 40K)) / (75 × 40K) × 100 = 25%

6. **Days to Stockout** = 25 / 3.33 = 7.5 ngày → ⚠️ CẢNH BÁO!

**Khuyến Nghị:**

- Priority: **HIGH** ⚠️ (chỉ còn 7.5 ngày)
- Nên nhập: 75 cái
- Chi phí: 3M
- Lợi nhuận dự kiến: 750K

---

## 📚 Tài Liệu Tham Khảo

- **EOQ Model**: Classic inventory optimization
- **Moving Average**: Smoothing historical data
- **Exponential Smoothing**: Alpha smoothing (0.3 typically)
- **Demand Forecasting**: Considering seasonality and trends
- **Safety Stock Formula**: Based on service level desired

---

## ✅ Kết Luận

Hệ thống AI Pharma Flow cung cấp:

- ✅ Dự báo nhu cầu chính xác
- ✅ Khuyến nghị nhập hàng tối ưu
- ✅ Cảnh báo rủi ro (hết hàng, hết hạn)
- ✅ Phân tích tài chính chi tiết
- ✅ Hỗ trợ quyết định chiến lược

**Sử dụng đúng các chỉ số này sẽ giúp tối ưu hóa lợi nhuận và giảm rủi ro kinh doanh.**

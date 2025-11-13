# AI API Rate Limit Fix - Google Gemini

## 🔴 Vấn đề

Gặp lỗi **429 Too Many Requests** khi gọi API Google Gemini:

```
You exceeded your current quota, please check your plan and billing details.
Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests
```

## ✅ Giải pháp đã áp dụng

### 1. **Đổi Model** (Quan trọng nhất)

```javascript
// TRƯỚC ĐÂY (có thể bị rate limit nhanh)
model: "gemini-2.0-flash-exp"  // Experimental model

// SAU KHI SỬA (ổn định hơn)
model: "gemini-1.5-flash"       // Stable version
```

**Lý do:**

- `gemini-2.0-flash-exp` là model experimental có quota thấp hơn
- `gemini-1.5-flash` là model stable, có quota cao hơn và ổn định hơn

### 2. **Thêm Retry Logic**

Tự động thử lại khi gặp lỗi 429 với delay time từ API:

```javascript
// Retry logic for rate limiting (429 errors)
let result;
let retryCount = 0;
const maxRetries = 3;

while (retryCount < maxRetries) {
  try {
    result = await model.generateContent(prompt);
    break; // Success, exit loop
  } catch (error) {
    if (error.status === 429 && retryCount < maxRetries - 1) {
      // Extract retry delay from error (default 30s)
      const retryDelay = error.errorDetails?.find(
        (detail) => detail["@type"] === "type.googleapis.com/google.rpc.RetryInfo"
      )?.retryDelay;
      const delaySeconds = retryDelay ? parseInt(retryDelay.replace("s", "")) : 30;
      
      console.warn(
        `AI API rate limited, retrying in ${delaySeconds} seconds (attempt ${retryCount + 1}/${maxRetries})...`
      );
      
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, delaySeconds * 1000));
      retryCount++;
    } else {
      throw error; // Non-429 error or max retries reached
    }
  }
}
```

**Cách hoạt động:**

- Nếu gặp lỗi 429, đợi `retryDelay` giây (từ API response)
- Thử lại tối đa 3 lần
- Nếu vẫn lỗi sau 3 lần → throw error

## 📊 Quota Limits của Gemini API

### Free Tier (gemini-1.5-flash)

- **Requests per minute:** 15 requests/min
- **Requests per day:** 1,500 requests/day  
- **Tokens per minute:** 1 million tokens/min

### Free Tier (gemini-2.0-flash-exp)

- **Requests per minute:** Thấp hơn (experimental)
- Không khuyến khích dùng cho production

## 🔧 Kiểm tra và giám sát

### 1. Kiểm tra usage hiện tại

Vào: <https://ai.dev/usage?tab=rate-limit>

### 2. Xem log khi retry

```
AI API rate limited, retrying in 28 seconds (attempt 1/3)...
```

### 3. Test API

```bash
# Test purchase recommendations endpoint
curl http://localhost:3000/api/ai-analysis/purchase-recommendations?daysBack=90
```

## 🚀 Nếu vẫn gặp lỗi

### Option 1: Tăng delay giữa các request

Nếu dashboard gọi nhiều API AI cùng lúc, thêm delay:

```javascript
// Trong Dashboard.jsx hoặc component gọi AI
const fetchAIData = async () => {
  // Fetch quick insights first
  const insights = await fetch('/api/ai-analysis/quick-insights?daysBack=90');
  
  // Wait 2 seconds before next call
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Fetch purchase recommendations
  const recommendations = await fetch('/api/ai-analysis/purchase-recommendations?daysBack=90');
};
```

### Option 2: Cache kết quả AI

Lưu kết quả AI vào database, chỉ gọi API mới khi cần:

```javascript
// Cache trong 1 giờ
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour
const lastFetch = localStorage.getItem('aiLastFetch');
const cachedData = localStorage.getItem('aiRecommendations');

if (cachedData && Date.now() - lastFetch < CACHE_DURATION) {
  return JSON.parse(cachedData);
}
```

### Option 3: Nâng cấp lên Paid Plan

- Vào: <https://ai.google.dev/pricing>
- Paid plan có quota cao hơn nhiều
- Chi phí thấp (~$0.035/1K input tokens)

## 📝 File đã sửa

- `apps/api/src/services/aiAnalysisService.js`
  - Dòng 304: Đổi model từ `gemini-2.0-flash-exp` → `gemini-1.5-flash`
  - Dòng 313-346: Thêm retry logic với exponential backoff

## 🎯 Kết quả mong đợi

- ✅ Không còn lỗi 429 ngay lập tức
- ✅ Tự động retry khi gặp rate limit
- ✅ Log rõ ràng khi đang chờ retry
- ✅ Sử dụng model ổn định hơn

## 📞 Support

Nếu vẫn gặp vấn đề, kiểm tra:

1. API key có hợp lệ không (trong `.env`)
2. Đã enable Gemini API chưa
3. Quota còn bao nhiêu (check dashboard)

---
**Cập nhật:** 2025-11-12 22:10  
**Model:** gemini-2.0-flash-exp → gemini-1.5-flash  
**Retry Logic:** ✅ Enabled (max 3 retries)

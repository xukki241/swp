# AI Analytics Feature Setup Guide

## Overview
This feature provides AI-powered purchase recommendations and business insights using Google's Gemini 1.5 Flash model. The system analyzes sales data, inventory levels, and trends to recommend which products to restock.

## Features
- **AI Purchase Recommendations**: Get intelligent recommendations on which medications to restock based on sales velocity, inventory levels, and market trends
- **Quick Insights**: View key metrics including revenue, products sold, and critical actions needed
- **Financial Projections**: See estimated ROI, payback period, and investment requirements
- **Category Insights**: Analyze sales trends by medication categories
- **Warnings & Alerts**: Get notified about expiring stock, low inventory, and slow-moving items
- **Date Range Analysis**: Analyze data for 30, 60, 90, or 180 days

## Architecture

### Backend Components
1. **Service**: `apps/api/src/services/aiAnalysisService.js`
   - `getSalesAndInventoryData(daysBack)`: Aggregates sales and inventory data
   - `generatePurchaseRecommendations(daysBack)`: Calls Google Gemini API for AI analysis
   - `getQuickInsights(daysBack)`: Returns basic metrics without AI processing

2. **Controller**: `apps/api/src/controllers/aiAnalysisController.js`
   - API request handlers for AI endpoints
   - Error handling and logging

3. **Routes**: `apps/api/src/routes/aiAnalysisRoutes.js`
   - `GET /api/ai-analysis/purchase-recommendations?daysBack=90`
   - `GET /api/ai-analysis/quick-insights?daysBack=30`
   - `GET /api/ai-analysis/data?daysBack=90`

### Frontend Components
1. **Service**: `apps/web/src/services/aiAnalysisService.js`
   - API client for calling AI endpoints

2. **Component**: `apps/web/src/components/AIAnalyticsDialog.jsx`
   - Dialog with 4 tabs: Overview, Recommendations, Insights, Warnings
   - Date range selector and refresh functionality
   - Color-coded priorities and warnings

3. **Integration**: `apps/web/src/pages/Dashboard.jsx`
   - AI Analytics accessible from Dashboard "Analytics" quick action

## Setup Instructions

### 1. Install Dependencies
The required package `@google/generative-ai` is already added to the backend package.json. If needed, install it manually:

```bash
cd apps/api
pnpm install @google/generative-ai
```

### 2. Get Google AI API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key" or "Get API Key"
4. Copy the generated API key

### 3. Configure Environment Variables
Add the API key to your `.env` file in `apps/api/.env`:

```bash
# Google AI Configuration (Gemini API)
GOOGLE_AI_API_KEY=your-actual-api-key-here
```

**Important**: Keep your API key secure and never commit it to version control!

### 4. Start the Application
```bash
# From root directory
pnpm install
pnpm dev
```

### 5. Access the Feature
1. Navigate to the Dashboard
2. Click on the "Analytics" quick action (with sparkles icon)
3. The AI Analytics dialog will open
4. Click "Generate AI Recommendations" to get AI-powered insights

## API Usage

### Generate Purchase Recommendations
```bash
GET /api/ai-analysis/purchase-recommendations?daysBack=90
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "medicationId": "uuid",
        "medicationName": "Thuốc A",
        "variantName": "100mg x 10 viên",
        "reason": "Bán chạy với 150 đơn vị/tháng, tồn kho chỉ còn 50 đơn vị",
        "priority": "HIGH",
        "suggestedQuantity": 200,
        "estimatedCost": 5000000,
        "currentStock": 50,
        "averageMonthlySales": 150,
        "trend": "INCREASING"
      }
    ],
    "warnings": [
      {
        "type": "LOW_STOCK",
        "severity": "HIGH",
        "message": "5 sản phẩm sắp hết hàng",
        "affectedItems": ["Thuốc A", "Thuốc B"]
      }
    ],
    "insights": {
      "totalRecommendations": 10,
      "totalEstimatedInvestment": 50000000,
      "topCategories": ["Giảm đau", "Kháng sinh"],
      "estimatedROI": 35,
      "paybackPeriod": 45
    },
    "aiAssessment": "Dựa trên dữ liệu 90 ngày, nhà thuốc cần chú ý..."
  }
}
```

### Get Quick Insights
```bash
GET /api/ai-analysis/quick-insights?daysBack=30
Authorization: Bearer <your-jwt-token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 150000000,
    "totalProductsSold": 1250,
    "topSellingProduct": "Thuốc A",
    "criticalActions": 3,
    "daysAnalyzed": 30
  }
}
```

### Get Raw Sales & Inventory Data
```bash
GET /api/ai-analysis/data?daysBack=90
Authorization: Bearer <your-jwt-token>
```

## AI Prompt Structure

The AI receives a detailed Vietnamese prompt with:
1. **Role**: Expert pharmacy inventory manager
2. **Context**: Sales data, inventory levels, trends
3. **Task**: Analyze and recommend products to restock
4. **Output Format**: Structured JSON with priorities, financial projections, warnings

The AI considers:
- Sales velocity (units sold per period)
- Inventory turnover rate
- Stock levels and reorder points
- Expiration dates (FEFO - First Expired First Out)
- Seasonal trends
- Category performance
- Financial metrics (ROI, payback period)

## Response Format

### Priority Levels
- **HIGH** (Red): Critical action needed, immediate restocking required
- **MEDIUM** (Yellow): Moderate priority, should restock soon
- **LOW** (Blue): Optional, can wait but good opportunity

### Warning Types
- **EXPIRING**: Stock approaching expiration date
- **LOW_STOCK**: Inventory below reorder point
- **SLOW_MOVING**: Products with low sales velocity

## UI Components

### AIAnalyticsDialog Tabs

#### 1. Overview Tab
- Quick metrics cards (revenue, products sold, critical actions)
- AI assessment summary
- Generate/Refresh button
- Date range selector

#### 2. Recommendations Tab
- List of recommended products to restock
- Priority badges (HIGH/MEDIUM/LOW)
- Suggested quantities and costs
- Current stock levels
- Sales trends

#### 3. Insights Tab
- Financial projections (investment, ROI, payback period)
- Top product categories
- Category-wise sales trends
- Market insights

#### 4. Warnings Tab
- Expiring stock alerts
- Low inventory warnings
- Slow-moving items
- Color-coded by severity

## Error Handling

### Common Issues

1. **Missing API Key**
   ```
   Error: GOOGLE_AI_API_KEY not configured
   Solution: Add the API key to .env file
   ```

2. **API Key Invalid**
   ```
   Error: Invalid API key
   Solution: Generate a new API key from Google AI Studio
   ```

3. **Rate Limiting**
   ```
   Error: API rate limit exceeded
   Solution: Wait a few minutes before retrying, or upgrade your API plan
   ```

4. **No Sales Data**
   ```
   Error: Insufficient data for analysis
   Solution: System needs at least some sales data to generate recommendations
   ```

## Security Considerations

1. **Authentication**: All AI endpoints require JWT authentication
2. **API Key**: Keep the GOOGLE_AI_API_KEY secure in environment variables
3. **Rate Limiting**: Consider implementing rate limiting to prevent API abuse
4. **Data Privacy**: Sales data is sent to Google AI - ensure compliance with privacy policies

## Monitoring & Logging

The system logs:
- AI analysis requests
- API call durations
- Errors and warnings
- User interactions with AI features

Check logs in `apps/api/logs/` for detailed information.

## Performance

- **Quick Insights**: ~100-200ms (no AI call)
- **AI Recommendations**: ~2-5 seconds (includes Google AI API call)
- **Data Retrieval**: ~50-100ms (database query)

## Cost Considerations

Google Gemini 1.5 Flash pricing (as of 2024):
- Free tier: 15 requests per minute
- Pay-as-you-go: Very low cost per request
- Monitor usage in [Google Cloud Console](https://console.cloud.google.com/)

## Troubleshooting

### AI Not Generating Recommendations
1. Check if GOOGLE_AI_API_KEY is set in .env
2. Verify API key is valid in Google AI Studio
3. Check backend logs for errors
4. Ensure sales data exists in database

### Dialog Not Opening
1. Check browser console for errors
2. Verify AIAnalyticsDialog component is imported
3. Check if isAIDialogOpen state is properly set
4. Ensure QuickActionCard onClick handler is working

### Slow Response Times
1. Check database query performance
2. Verify network connectivity to Google AI API
3. Consider caching results for frequently accessed date ranges
4. Monitor API quotas and rate limits

## Future Enhancements

- [ ] Add caching for AI recommendations (cache for 1 hour)
- [ ] Implement retry logic for failed API calls
- [ ] Add export functionality (PDF/Excel reports)
- [ ] Email notifications for critical warnings
- [ ] Historical trend comparison
- [ ] Multi-language support (currently Vietnamese only)
- [ ] Custom AI models for pharmacy-specific insights
- [ ] Integration with supplier APIs for automatic ordering

## Support

For issues or questions:
1. Check the logs in `apps/api/logs/`
2. Review error messages in browser console
3. Consult Google AI Studio documentation
4. Check this guide for common solutions

## References

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Google Generative AI Node.js SDK](https://www.npmjs.com/package/@google/generative-ai)

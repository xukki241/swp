# AI Analytics Use Cases

## Overview

Module AI Analytics sử dụng Machine Learning và AI để cung cấp insights, predictions và recommendations cho việc quản lý nhà thuốc.

---

## UC-AI-001: Generate AI Insights

**Mô tả:** Sử dụng AI để phân tích dữ liệu kinh doanh và tạo ra các insights tự động về xu hướng bán hàng, dự đoán tồn kho, recommendations cho purchase orders và phát hiện anomalies.

### Actors

- Manager
- Admin

### Preconditions

- Người dùng đã đăng nhập với role `manager` hoặc `admin`
- Hệ thống đã có đủ dữ liệu lịch sử (tối thiểu 30 ngày)
- AI models đã được train

### Main Flow

1. Người dùng truy cập `/dashboard/ai-insights`
2. Hệ thống hiển thị AI Insights Dashboard với các tabs:

#### **Tab 1: Sales Predictions**

- **Dự đoán doanh thu 7 ngày tới**:
  - Chart hiển thị predicted revenue by day
  - Confidence interval (upper/lower bounds)
  - Actual vs Predicted comparison (cho past days)
  
- **Top Growing Products**:
  - List products có trend tăng trưởng
  - % growth rate
  - Recommendation: "Tăng stock cho sản phẩm này"

- **Declining Products**:
  - List products có trend giảm
  - % decline rate
  - Recommendation: "Giảm order quantity"

#### **Tab 2: Inventory Optimization**

- **Reorder Recommendations**:
  - List medications cần order
  - Suggested quantity (based on prediction)
  - Optimal reorder timing
  - Expected stockout date
  
- **Overstock Alerts**:
  - Products có stock quá cao
  - Recommended action: Promotion/Discount
  - Est. holding cost

- **ABC Analysis**:
  - Category A (high value, low quantity)
  - Category B (moderate)
  - Category C (low value, high quantity)
  - Visual distribution chart

#### **Tab 3: Customer Insights**

- **Customer Segmentation**:
  - High-value customers
  - Frequent buyers
  - At-risk customers (haven't purchased recently)
  - New customers
  
- **Purchase Patterns**:
  - Common product combinations
  - Seasonal trends
  - Time-of-day patterns
  - Recommendations for cross-selling

#### **Tab 4: Anomaly Detection**

- **Sales Anomalies**:
  - Unusual spikes or drops
  - Date & time
  - Possible causes
  - Action needed
  
- **Inventory Anomalies**:
  - Unexpected stock changes
  - Discrepancies
  - Potential theft/damage

- **Pricing Anomalies**:
  - Products sold below cost
  - Unusual discounts
  - Margin violations

#### **Tab 5: Smart Recommendations**

- **Purchase Order Suggestions**:
  - Auto-generated PO drafts
  - Optimized supplier selection
  - Bulk discount opportunities
  
- **Pricing Optimization**:
  - Suggested price adjustments
  - Competitor price comparison
  - Demand elasticity insights

- **Promotions Planning**:
  - Best products for promotions
  - Optimal discount %
  - Expected revenue impact

### Features

#### **AI Models Used**

1. **Time Series Forecasting**:
   - Algorithm: ARIMA, Prophet, LSTM
   - Input: Historical sales data
   - Output: Revenue predictions
   - Accuracy: Display MAE, RMSE

2. **Classification**:
   - Algorithm: Random Forest, XGBoost
   - Input: Product features, sales history
   - Output: Product categories (ABC analysis)

3. **Clustering**:
   - Algorithm: K-Means, DBSCAN
   - Input: Customer purchase history
   - Output: Customer segments

4. **Anomaly Detection**:
   - Algorithm: Isolation Forest, Autoencoders
   - Input: Transaction data
   - Output: Anomaly scores

#### **Filters & Controls**

- Time range selector
- Product category filter
- Confidence threshold slider
- Refresh insights button
- Export insights report (PDF)

#### **Interactive Elements**

- Click on prediction → view details
- Click on product → view full analytics
- Click on customer segment → view member list
- Hover on chart → tooltip with details

### Alternative Flows

**A1: Insufficient Data**

- Hiển thị warning: "Cần thêm dữ liệu để tạo insights chính xác"
- Show minimum data requirements
- Display partial insights if possible

**A2: Model Training in Progress**

- Show loading state: "AI đang phân tích dữ liệu..."
- Progress bar
- Estimated time remaining

**A3: Model Error**

- Fallback to basic analytics
- Show error: "AI insights tạm thời không khả dụng"
- Display last successful insights (cached)

**A4: Low Confidence**

- Display warning icon next to predictions
- Tooltip: "Độ tin cậy thấp. Kết quả có thể không chính xác."
- Show confidence score %

### Postconditions

- AI insights được cache (refresh mỗi 6 giờ)
- User interactions được log cho model improvement
- Recommendations được track (accepted/rejected)

### API Endpoints

```http
# Get sales predictions
GET /api/ai/sales-predictions?days=7

Response:
{
  "predictions": [
    {
      "date": "2024-01-16",
      "predicted_revenue": 850000,
      "lower_bound": 800000,
      "upper_bound": 900000,
      "confidence": 0.85
    }
  ],
  "model": {
    "name": "ARIMA(2,1,2)",
    "accuracy": { "mae": 45000, "rmse": 62000 }
  }
}

# Get inventory recommendations
GET /api/ai/inventory-recommendations

Response:
{
  "reorder": [
    {
      "medication_id": "uuid",
      "name": "Paracetamol 500mg",
      "current_stock": 15,
      "recommended_quantity": 100,
      "urgency": "high",
      "predicted_stockout_date": "2024-01-20",
      "confidence": 0.92
    }
  ],
  "overstock": [
    {
      "medication_id": "uuid",
      "name": "Vitamin C 1000mg",
      "current_stock": 500,
      "recommended_action": "promotion",
      "holding_cost": 250000
    }
  ]
}

# Get customer segments
GET /api/ai/customer-segments

Response:
{
  "segments": [
    {
      "name": "High-Value Customers",
      "count": 45,
      "avg_purchase": 850000,
      "characteristics": ["Frequent buyer", "High AOV"],
      "customer_ids": ["uuid1", "uuid2"]
    }
  ]
}

# Get anomalies
GET /api/ai/anomalies?from=2024-01-01&to=2024-01-31

Response:
{
  "anomalies": [
    {
      "type": "sales_spike",
      "date": "2024-01-15",
      "description": "Doanh thu tăng 350% so với trung bình",
      "score": 0.95,
      "possible_causes": ["Holiday", "Promotion"],
      "action": "Investigate and stock up"
    }
  ]
}

# Accept/reject recommendation
POST /api/ai/recommendations/:id/feedback

Body:
{
  "action": "accepted" | "rejected",
  "reason": "string (optional)"
}
```

### AI Model Training

#### **Training Pipeline**

1. **Data Collection**:
   - Sales transactions (last 365 days)
   - Inventory movements
   - Customer profiles
   - External data (weather, holidays, etc.)

2. **Data Preprocessing**:
   - Clean missing values
   - Normalize features
   - Feature engineering:
     - Day of week
     - Month
     - Season
     - Is holiday
     - Lag features
     - Rolling averages

3. **Model Training**:
   - Split data: 80% train, 20% test
   - Cross-validation (5-fold)
   - Hyperparameter tuning
   - Model evaluation

4. **Model Deployment**:
   - Save trained model
   - Version control
   - A/B testing
   - Gradual rollout

5. **Model Monitoring**:
   - Track prediction accuracy
   - Detect model drift
   - Auto-retrain schedule (monthly)

#### **Model Performance Metrics**

**For Forecasting:**

- MAE (Mean Absolute Error)
- RMSE (Root Mean Square Error)
- MAPE (Mean Absolute Percentage Error)
- R² Score

**For Classification:**

- Accuracy
- Precision
- Recall
- F1 Score

**For Clustering:**

- Silhouette Score
- Davies-Bouldin Index

**For Anomaly Detection:**

- Precision at K
- False Positive Rate

### Business Rules

1. **Confidence Thresholds**:
   - High confidence: >= 85%
   - Medium confidence: 70-84%
   - Low confidence: < 70%
   - Don't show predictions < 60% confidence

2. **Recommendation Priority**:
   - Critical: Stockout predicted < 7 days
   - High: Stockout predicted 7-14 days
   - Medium: Stockout predicted 14-30 days
   - Low: Optimization opportunities

3. **Anomaly Severity**:
   - Critical: Score >= 0.9 (immediate action)
   - High: Score 0.7-0.89 (investigate)
   - Medium: Score 0.5-0.69 (monitor)
   - Low: Score < 0.5 (informational)

4. **Model Refresh**:
   - Predictions: Update every 6 hours
   - Recommendations: Update daily at 2 AM
   - Customer segments: Update weekly
   - Anomalies: Real-time detection

### UI Components

#### Main Components

- `AIInsightsDashboard` - Main container
- `SalesPredictionChart` - Forecast visualization
- `InventoryRecommendations` - Reorder suggestions
- `CustomerSegmentCards` - Segment overview
- `AnomalyTimeline` - Anomaly list
- `SmartRecommendations` - Action items

#### Sub Components

- `PredictionCard` - Individual prediction
- `ConfidenceIndicator` - Visual confidence meter
- `RecommendationItem` - Action card
- `TrendChart` - Mini trend sparkline
- `SegmentBadge` - Customer tag
- `AccuracyMetric` - Model performance display

### Database Schema

```sql
-- AI predictions table
CREATE TABLE ai_predictions (
  id UUID PRIMARY KEY,
  type VARCHAR(50), -- 'sales', 'inventory', 'demand'
  target_date DATE,
  predicted_value DECIMAL(12,2),
  confidence DECIMAL(3,2),
  model_version VARCHAR(50),
  created_at TIMESTAMP,
  INDEX idx_type_date (type, target_date)
);

-- AI recommendations table
CREATE TABLE ai_recommendations (
  id UUID PRIMARY KEY,
  type VARCHAR(50), -- 'reorder', 'promotion', 'pricing'
  entity_id UUID, -- medication_id, customer_id, etc.
  recommendation TEXT,
  confidence DECIMAL(3,2),
  status VARCHAR(20), -- 'pending', 'accepted', 'rejected'
  feedback TEXT,
  created_at TIMESTAMP,
  reviewed_at TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_entity (entity_id)
);

-- Customer segments table
CREATE TABLE customer_segments (
  id UUID PRIMARY KEY,
  customer_id UUID REFERENCES customers(id),
  segment_name VARCHAR(100),
  characteristics JSONB,
  segment_date DATE,
  INDEX idx_customer (customer_id),
  INDEX idx_segment (segment_name)
);

-- Anomalies table
CREATE TABLE anomalies (
  id UUID PRIMARY KEY,
  type VARCHAR(50),
  date DATE,
  description TEXT,
  score DECIMAL(3,2),
  severity VARCHAR(20),
  status VARCHAR(20), -- 'new', 'investigating', 'resolved'
  created_at TIMESTAMP,
  INDEX idx_date_severity (date, severity)
);
```

### Integration with Other Systems

1. **Dashboard Integration**:
   - Embed AI insights cards in main dashboard
   - Show top 3 recommendations
   - Alert badges for critical insights

2. **Purchase Order Integration**:
   - Pre-fill PO with AI recommendations
   - "Accept AI Suggestion" button
   - Show confidence score

3. **Inventory Integration**:
   - Highlight items with AI alerts
   - Show predicted stockout date
   - Display recommended actions

4. **Sales Integration**:
   - Suggest cross-sell products (AI-powered)
   - Dynamic pricing hints
   - Customer segment badges

### Error Handling

| Error Code | Message | Action |
|------------|---------|--------|
| AI_001 | Model not available | Use fallback analytics |
| AI_002 | Insufficient data | Show data requirements |
| AI_003 | Prediction failed | Retry or show cached |
| AI_004 | Low confidence | Display with warning |
| AI_005 | Training in progress | Show ETA |

### Testing Checklist

- [ ] Sales predictions load với đúng date range
- [ ] Prediction chart hiển thị confidence intervals
- [ ] Inventory recommendations sorted by urgency
- [ ] Customer segments calculated correctly
- [ ] Anomalies detected và displayed
- [ ] Confidence indicators work properly
- [ ] Export PDF report thành công
- [ ] Feedback mechanism (accept/reject) works
- [ ] Model accuracy metrics displayed
- [ ] Low confidence warnings show
- [ ] Insufficient data warning works
- [ ] Real-time anomaly detection works
- [ ] Integration with PO creation works
- [ ] Cross-sell suggestions appear in Sales
- [ ] ABC analysis chart renders
- [ ] Customer segment filters work
- [ ] Responsive on mobile/tablet
- [ ] Loading states for model training

### Performance Considerations

- **Model Inference Time**: < 2 seconds
- **Dashboard Load**: < 3 seconds
- **Cache Duration**: 6 hours for predictions
- **Background Jobs**: Model training during off-peak hours
- **Database Optimization**: Index on prediction dates

### Security & Privacy

1. **Data Access**:
   - Only aggregate data for AI training
   - No PII in model inputs
   - Encrypt sensitive features

2. **Model Security**:
   - Version control for models
   - Audit trail for predictions
   - Access logs for insights

3. **Compliance**:
   - GDPR compliance for customer data
   - Data retention policies
   - Right to explanation

### Future Enhancements

1. **Advanced Models**:
   - Deep Learning for complex patterns
   - Reinforcement Learning for pricing
   - NLP for customer feedback analysis

2. **External Data**:
   - Weather integration
   - Economic indicators
   - Competitor pricing

3. **Automation**:
   - Auto-create POs from recommendations
   - Auto-adjust pricing
   - Auto-send promotions

4. **Explainability**:
   - SHAP values for feature importance
   - Decision trees visualization
   - "Why this prediction?" explanations

---

## Related Use Cases

- UC-DASH-001: View Dashboard (displays AI insights)
- UC-PO-001: Create Purchase Order (uses AI recommendations)
- UC-INV-003: Stock Alert (integrates anomaly detection)
- UC-SALE-001: Create Sale (uses cross-sell suggestions)

---

## Dependencies

### Technologies

- Python (ML backend)
- scikit-learn, TensorFlow/PyTorch
- pandas, numpy
- FastAPI (ML API)
- Celery (background tasks)
- Redis (caching)

### Data Sources

- Sales database
- Inventory database
- Customer database
- External APIs (optional)

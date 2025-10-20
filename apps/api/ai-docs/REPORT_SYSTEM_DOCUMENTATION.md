# Report System Implementation - PharmaFlow API

## Overview

This document describes the implementation of the comprehensive reporting system and automated scheduler for the PharmaFlow API. The system provides detailed analytics and automated report generation for sales, inventory, and other business metrics.

## Features Implemented

### 1. Report Types

The system supports the following report types:

#### Sales Reports

- **sales_summary**: Comprehensive sales analysis including totals, status breakdown, top medications, and payment methods
- **daily_sales**: Daily sales performance with detailed metrics
- **weekly_sales**: Weekly sales analysis with daily breakdown for the entire week
- **monthly_sales**: Monthly sales overview with weekly breakdown

#### Inventory Reports

- **inventory_on_hand**: Current stock levels across all medication variants
- **low_stock**: Items below minimum stock threshold or custom threshold
- **expiry_dates**: Medications nearing expiry within a specified timeframe (default 90 days)

### 2. API Endpoints

All endpoints are authenticated and available under `/api/reports`:

#### Create Report

```
POST /api/reports
```

**Body:**

```json
{
  "type": "sales_summary",
  "parameters": {
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.000Z"
  }
}
```

#### List Reports

```
GET /api/reports?type=daily_sales&limit=50&offset=0
```

#### Get Report by ID

```
GET /api/reports/:id
```

#### Delete Report

```
DELETE /api/reports/:id
```

_Requires owner role_

#### Quick Report Generation

```
GET /api/reports/daily?date=2025-10-13
GET /api/reports/weekly?weekStart=2025-10-07
GET /api/reports/monthly?year=2025&month=10
```

### 3. Scheduled Jobs

The system automatically generates reports at scheduled times:

| Report Type       | Schedule     | Time (Vietnam) | Description               |
| ----------------- | ------------ | -------------- | ------------------------- |
| Daily Sales       | Every day    | 00:01 AM       | Previous day's sales      |
| Weekly Sales      | Every Monday | 00:05 AM       | Previous week's sales     |
| Monthly Sales     | 1st of month | 00:10 AM       | Previous month's sales    |
| Low Stock         | Every day    | 02:00 AM       | Items below threshold     |
| Expiry Dates      | Every day    | 03:00 AM       | Items expiring in 90 days |
| Inventory On Hand | Every day    | 04:00 AM       | Current stock levels      |

### 4. Report Data Structure

#### Sales Summary Report

```json
{
  "period": {
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.000Z"
  },
  "summary": {
    "totalOrders": 150,
    "totalRevenue": 45000000
  },
  "salesByStatus": [
    {
      "status": "paid",
      "count": 120,
      "totalAmount": 36000000
    }
  ],
  "topSellingMedications": [
    {
      "medicationId": 1,
      "medicationName": "Paracetamol",
      "variantName": "500mg",
      "totalQuantity": 500,
      "totalRevenue": 5000000
    }
  ],
  "salesByPaymentMethod": [
    {
      "paymentMethod": "cash",
      "count": 90,
      "totalAmount": 27000000
    }
  ]
}
```

#### Inventory On Hand Report

```json
{
  "totalItems": 150,
  "inventoryDetails": [...],
  "stockSummary": [
    {
      "variantId": 1,
      "variantName": "Paracetamol 500mg",
      "sku": "PARA-500",
      "totalQuantity": 1000,
      "totalReserved": 100,
      "totalAvailable": 900
    }
  ],
  "lowStockItems": [...],
  "lowStockThreshold": 10
}
```

#### Expiry Dates Report

```json
{
  "reportDate": "2025-10-13T00:00:00.000Z",
  "daysAhead": 90,
  "summary": {
    "totalExpiringItems": 45,
    "expired": 2,
    "expiringWithin7Days": 5,
    "expiringWithin30Days": 18,
    "expiringWithin90Days": 20
  },
  "expired": [...],
  "expiringWithin7Days": [...],
  "expiringWithin30Days": [...],
  "expiringWithin90Days": [...]
}
```

## Files Created/Modified

### New Files

1. **src/services/reportService.js**
   - Core report generation logic
   - Database queries for all report types
   - 579 lines of comprehensive report generation

2. **src/controllers/reportController.js**
   - API endpoint handlers
   - Request validation
   - Response formatting

3. **src/routes/reportRoutes.js**
   - Route definitions
   - Middleware integration
   - Authentication and authorization

4. **src/utils/scheduler.js**
   - Cron job configuration
   - Automated report generation
   - Manual trigger functions for testing

5. **tests/unit/services/reportService.test.js**
   - Comprehensive unit tests
   - Mock database interactions
   - 530+ lines of test coverage

### Modified Files

1. **src/db/schema/enums.js**
   - Added new report types to reportType enum

2. **src/routes/index.js**
   - Integrated report routes

3. **src/server.js**
   - Initialized scheduler on server start

4. **packages/dto/src/core/common/enums.js**
   - Updated reportTypeEnum in DTOs

5. **apps/api/package.json**
   - Added node-cron dependency (v4.2.1)

## Database Migration

A new migration was generated to update the `report_type` enum:

```
src/db/migrations/0001_gifted_owl.sql
```

To apply the migration:

```bash
cd apps/api
pnpm db:migrate
# or
pnpm db:push
```

## Usage Examples

### Generate a Custom Sales Report

```javascript
// POST /api/reports
{
  "type": "sales_summary",
  "parameters": {
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T23:59:59.000Z"
  }
}
```

### Get Low Stock Items

```javascript
// POST /api/reports
{
  "type": "low_stock",
  "parameters": {
    "threshold": 20
  }
}
```

### Check Expiring Medications

```javascript
// POST /api/reports
{
  "type": "expiry_dates",
  "parameters": {
    "daysAhead": 60
  }
}
```

### Quick Daily Report

```javascript
// GET /api/reports/daily
// Generates report for yesterday

// GET /api/reports/daily?date=2025-10-12
// Generates report for specific date
```

## Manual Scheduler Testing

The scheduler exports test functions that can be used to manually trigger reports:

```javascript
import { schedulerTasks } from "./utils/scheduler.js";

// Manually trigger reports
await schedulerTasks.runDailyReport();
await schedulerTasks.runWeeklyReport();
await schedulerTasks.runMonthlyReport();
await schedulerTasks.runLowStockReport();
await schedulerTasks.runExpiryDatesReport();
await schedulerTasks.runInventoryOnHandReport();
```

## Testing

Run the unit tests:

```bash
cd apps/api
pnpm test
```

Run with coverage:

```bash
pnpm test:coverage
```

Run specific test file:

```bash
pnpm test tests/unit/services/reportService.test.js
```

## Configuration

### Timezone

All scheduled jobs use Vietnam timezone (Asia/Ho_Chi_Minh). This can be modified in `src/utils/scheduler.js`.

### Schedule Customization

To modify the schedule, edit the cron expressions in `src/utils/scheduler.js`:

```javascript
// Format: "minute hour day-of-month month day-of-week"
cron.schedule("1 0 * * *", async () => { ... }); // 00:01 AM daily
cron.schedule("5 0 * * 1", async () => { ... }); // 00:05 AM Monday
cron.schedule("10 0 1 * *", async () => { ... }); // 00:10 AM 1st of month
```

### Default Parameters

Default parameters can be modified in the respective generate methods:

```javascript
// In reportService.js
async generateLowStock(parameters = {}) {
  const { threshold = 10 } = parameters; // Change default threshold
  // ...
}

async generateExpiryDates(parameters = {}) {
  const { daysAhead = 90 } = parameters; // Change default days ahead
  // ...
}
```

## Performance Considerations

1. **Large Datasets**: For warehouses with large inventory, consider:
   - Adding pagination to inventory reports
   - Implementing report caching
   - Running scheduled jobs during off-peak hours

2. **Report Storage**: Old reports can be archived or deleted:
   - Implement a cleanup job to remove reports older than X days
   - Export important reports before deletion
   - Consider separate archival storage

3. **Database Indexing**: Ensure proper indexes on:
   - `sales_orders.created_at`
   - `inventory.expiry_date`
   - `reports.type` and `reports.report_date`

## Security

1. **Authentication**: All endpoints require valid JWT token
2. **Authorization**: Delete operations require owner role
3. **Data Access**: Reports show data based on user's permissions
4. **Rate Limiting**: Consider implementing rate limiting for report generation endpoints

## Future Enhancements

Potential improvements:

1. **Export Functionality**: Export reports to PDF, Excel, CSV
2. **Email Distribution**: Automatically email reports to stakeholders
3. **Custom Report Builder**: Allow users to create custom reports with filters
4. **Dashboard Integration**: Real-time dashboard with key metrics
5. **Report Comparison**: Compare reports across different periods
6. **Predictive Analytics**: Forecast sales and inventory needs
7. **Alert System**: Send alerts for critical low stock or expiring items

## Troubleshooting

### Scheduler Not Running

- Check server logs for initialization messages
- Verify timezone configuration
- Ensure database connection is established before scheduler starts

### Reports Not Generating

- Check database permissions
- Verify enum values match between database and code
- Review error logs in logs/ directory

### Test Failures

- Ensure database mocks are properly configured
- Clear mock cache between tests
- Verify test data matches expected schema

## Support

For issues or questions:

1. Check server logs in `apps/api/logs/`
2. Review test output for detailed error messages
3. Verify database migrations are up to date
4. Check environment variables and configuration

## Changelog

### Version 1.0.0 (2025-10-13)

- Initial implementation of report system
- Added 7 report types
- Implemented automated scheduler
- Created comprehensive unit tests
- Added API documentation
- Integrated with existing authentication system

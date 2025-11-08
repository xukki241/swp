# Reports OpenAPI Specification - Implementation Summary

## Overview

Completed OpenAPI specification for all report endpoints based on:

- DTO schemas from `packages/dto/src/core/reports/report.js`
- Database schema from `apps/api/src/db/schema/reports.js`
- Route definitions from `apps/api/src/routes/reportRoutes.js`

## Files Created

### Component Schemas

- **`components/reports/report-schemas.yaml`**
  - Report (main schema)
  - CreateReportRequest (generate report)
  - ReportListResponse (paginated list)
  - DailySalesReport (daily sales summary)
  - WeeklySalesReport (weekly sales summary)
  - MonthlySalesReport (monthly sales summary)

### Path Definitions (5 files, 7 operations)

1. **`paths/reports/reports.yaml`**
   - `GET /reports` - List all generated reports with filtering
     - Query params: page, limit, sortBy, sortOrder, type, reportDateFrom, reportDateTo
   - `POST /reports` - Generate a new report
     - Request body: type, parameters (optional: startDate, endDate)

2. **`paths/reports/reports-reportId.yaml`**
   - `GET /reports/{reportId}` - Get report by ID
   - `DELETE /reports/{reportId}` - Delete report (Owner only)

3. **`paths/reports/reports-daily.yaml`**
   - `GET /reports/daily` - Generate daily sales report
     - Query param: date (defaults to today)

4. **`paths/reports/reports-weekly.yaml`**
   - `GET /reports/weekly` - Generate weekly sales report
     - Query params: startDate, endDate (defaults to current week)

5. **`paths/reports/reports-monthly.yaml`**
   - `GET /reports/monthly` - Generate monthly sales report
     - Query param: month in YYYY-MM format (defaults to current month)

### Main OpenAPI File

- **`openapi.yaml`** - Updated to reference all 5 report endpoint paths

## Schema Details

### Report Object

```yaml
id: UUID (required)
type: enum (required) - Report type
reportDate: DateTime (required) - When report was generated
data: JSON object (required) - Report data
parameters: JSON object (nullable, optional) - Generation parameters
```

### CreateReportRequest

```yaml
type: enum (required) - Report type to generate
parameters: object (optional)
  startDate: DateTime (optional)
  endDate: DateTime (optional)
```

## Report Types

As defined in `ReportType` enum:

- **inventory** - Inventory status report
- **sales** - Sales report
- **purchase** - Purchase report
- **custom** - Custom report
- **sales_summary** - Sales summary report
- **inventory_on_hand** - Current inventory levels
- **expiry_dates** - Expiring medications report
- **low_stock** - Low stock items report
- **daily_sales** - Daily sales summary
- **weekly_sales** - Weekly sales summary
- **monthly_sales** - Monthly sales summary

## Security

- **Authentication**: All endpoints require Bearer token (`bearerAuth`)
- **Authorization**:
  - DELETE operation requires Owner role
  - All other operations accessible to authenticated users

## Special Features

### Flexible Report Generation

The `POST /reports` endpoint accepts:

- **Report type**: Determines what data to generate
- **Optional parameters**: startDate, endDate for time-based reports
- Returns generated report with data immediately

### Pre-defined Sales Reports

Three convenience endpoints for common sales reports:

- **/reports/daily** - Quick daily sales summary
- **/reports/weekly** - Weekly sales with daily breakdown
- **/reports/monthly** - Monthly sales with weekly breakdown

Each provides structured, formatted output specific to the time period.

### Report Storage

- Generated reports are stored in the database
- Can be retrieved later by ID
- Can list historical reports with filtering
- Reports include generation timestamp and parameters used

### JSON Data Format

Report data is stored as JSON, allowing flexible schema per report type:

- Different report types can have different data structures
- Easy to extend with new report types
- Frontend can parse and display dynamically

## Route Alignment

All OpenAPI endpoints align with the actual API routes in `reportRoutes.js`:

- ✅ GET /reports
- ✅ POST /reports
- ✅ GET /reports/daily
- ✅ GET /reports/weekly
- ✅ GET /reports/monthly
- ✅ GET /reports/:id
- ✅ DELETE /reports/:id

## Response References

All error responses use the "Error" suffix convention:

- `BadRequestError`
- `UnauthorizedError`
- `ForbiddenError`
- `NotFoundError`
- `InternalServerError`

## Consistency with Existing Patterns

The implementation follows the same patterns as:

- Sales module (filtering and date ranges)
- Inventory module (list and get operations)
- Common components (schemas, parameters, responses, enums)

## Example Requests

### Generate Custom Report

```json
POST /reports
{
  "type": "sales_summary",
  "parameters": {
    "startDate": "2025-10-01T00:00:00Z",
    "endDate": "2025-10-16T23:59:59Z"
  }
}
```

### Generate Inventory Report

```json
POST /reports
{
  "type": "inventory"
}
```

### Get Daily Sales Report

```
GET /reports/daily?date=2025-10-16
```

### Get Weekly Sales Report

```
GET /reports/weekly?startDate=2025-10-13&endDate=2025-10-19
```

### Get Monthly Sales Report

```
GET /reports/monthly?month=2025-10
```

### List Reports

```
GET /reports?type=sales_summary&page=1&limit=10
```

## Report Data Examples

### Daily Sales Report Structure

```json
{
  "date": "2025-10-16",
  "totalSales": 15000.0,
  "orderCount": 25,
  "topProducts": [
    {
      "medicationName": "Paracetamol 500mg",
      "quantitySold": 150,
      "revenue": 3000.0
    }
  ]
}
```

### Weekly Sales Report Structure

```json
{
  "weekStartDate": "2025-10-13",
  "weekEndDate": "2025-10-19",
  "totalSales": 95000.0,
  "orderCount": 180,
  "dailyBreakdown": [
    {
      "date": "2025-10-13",
      "sales": 12000.0,
      "orders": 22
    }
  ]
}
```

## Use Cases

1. **Business Intelligence**: Generate reports for business analysis
2. **Sales Tracking**: Monitor daily, weekly, and monthly sales performance
3. **Inventory Management**: Track inventory levels and expiry dates
4. **Historical Analysis**: Store and retrieve historical reports
5. **Custom Reports**: Generate custom reports with specific parameters
6. **Automated Reporting**: Schedule report generation at regular intervals
7. **Audit Trail**: Maintain history of generated reports with parameters

## Next Steps

1. ✅ Reports module OpenAPI specs complete
2. Consider adding export formats (PDF, Excel, CSV)
3. Consider adding scheduled report generation
4. Consider adding report sharing/distribution features
5. Validate OpenAPI spec using Swagger Editor
6. Generate API documentation from the OpenAPI spec

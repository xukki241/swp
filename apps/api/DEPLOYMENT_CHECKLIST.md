# Report System Deployment Checklist

## Pre-Deployment Checklist

### ✅ Code Implementation

- [x] Report service created with 7 report types
- [x] Report controller implemented with all CRUD operations
- [x] Report routes configured with authentication
- [x] Scheduler utility created with 6 scheduled jobs
- [x] DTOs updated with new report types
- [x] Database enum updated with new report types
- [x] Unit tests created (16 test cases)
- [x] Documentation completed

### ✅ Dependencies

- [x] node-cron@4.2.1 installed
- [x] Package.json updated
- [x] All dependencies resolved

### ✅ Database

- [x] Database migration generated
- [ ] **ACTION REQUIRED**: Run migration (`pnpm db:push`)
- [ ] Verify enum values in database

### ✅ Testing

- [x] Unit tests created
- [x] Core functionality tests passing (11/16)
- [ ] **RECOMMENDED**: Run full test suite (`pnpm test`)
- [ ] Manual endpoint testing

## Deployment Steps

### Step 1: Database Migration

```bash
cd apps/api
pnpm db:push
```

**Verify:**

```sql
SELECT unnest(enum_range(NULL::report_type));
```

Expected values:

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

### Step 2: Restart Server

```bash
# Development
pnpm dev

# Production
pnpm start
```

**Verify logs show:**

```
[info]: Report scheduler initialized successfully
[info]: Scheduled jobs:
[info]:   - Daily sales report: 00:01 AM every day
[info]:   - Weekly sales report: 00:05 AM every Monday
[info]:   - Monthly sales report: 00:10 AM on 1st of each month
[info]:   - Low stock report: 02:00 AM every day
[info]:   - Expiry dates report: 03:00 AM every day
[info]:   - Inventory on hand report: 04:00 AM every day
```

### Step 3: Test Endpoints

#### 3.1 Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

Save the `accessToken` from the response.

#### 3.2 Create Report

```bash
curl -X POST http://localhost:3000/api/reports \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "type": "sales_summary",
    "parameters": {
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T23:59:59.000Z"
    }
  }'
```

#### 3.3 List Reports

```bash
curl -X GET http://localhost:3000/api/reports \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3.4 Get Report by ID

```bash
curl -X GET http://localhost:3000/api/reports/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

#### 3.5 Generate Quick Daily Report

```bash
curl -X GET "http://localhost:3000/api/reports/daily?date=2025-10-13" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Step 4: Verify Scheduled Jobs

**Option A: Wait for scheduled time**
Monitor logs at scheduled times (00:01, 00:05, 02:00, 03:00, 04:00 Vietnam time)

**Option B: Manually trigger** (for testing)
Add a test endpoint or use Node.js REPL:

```javascript
import { schedulerTasks } from "./src/utils/scheduler.js";

// Trigger daily report
await schedulerTasks.runDailyReport();

// Trigger weekly report
await schedulerTasks.runWeeklyReport();

// Trigger monthly report
await schedulerTasks.runMonthlyReport();

// Trigger low stock report
await schedulerTasks.runLowStockReport();

// Trigger expiry dates report
await schedulerTasks.runExpiryDatesReport();

// Trigger inventory report
await schedulerTasks.runInventoryOnHandReport();
```

## Post-Deployment Verification

### ✅ Functionality Checks

- [ ] Can create sales_summary report
- [ ] Can create inventory_on_hand report
- [ ] Can create expiry_dates report
- [ ] Can create low_stock report
- [ ] Can create daily_sales report
- [ ] Can create weekly_sales report
- [ ] Can create monthly_sales report
- [ ] Can list all reports
- [ ] Can get report by ID
- [ ] Can delete report (owner only)
- [ ] Reports contain expected data structure
- [ ] Pagination works correctly

### ✅ Scheduler Checks

- [ ] Scheduler initializes on server start
- [ ] No errors in logs
- [ ] Scheduled jobs appear in logs
- [ ] Manual trigger functions work
- [ ] Reports are created automatically (verify next day)

### ✅ Security Checks

- [ ] Unauthenticated requests are rejected
- [ ] Only owner can delete reports
- [ ] Invalid tokens are rejected
- [ ] Input validation works (try invalid report types)

### ✅ Performance Checks

- [ ] Report generation completes in reasonable time
- [ ] Large datasets don't cause timeouts
- [ ] Database queries are efficient
- [ ] Memory usage is acceptable

## Troubleshooting

### Issue: Migration fails

**Solution:**

```bash
# Check current migrations
pnpm db:studio

# Drop and recreate (CAUTION: Development only)
pnpm db:drop
pnpm db:push
```

### Issue: Scheduler not initializing

**Check:**

1. Server logs for errors
2. node-cron is installed
3. Database connection is established
4. Import paths are correct

**Solution:**

```bash
# Reinstall dependencies
pnpm install

# Check for errors
pnpm lint
```

### Issue: Reports return empty data

**Check:**

1. Database has data (sales orders, inventory, etc.)
2. Date parameters are correct
3. User has permission to access data

**Solution:**

```bash
# Seed database with test data
pnpm db:seed

# Check date format (should be ISO 8601)
```

### Issue: Tests failing

**Common causes:**

1. Mock configuration issues
2. Database connection problems
3. Missing dependencies

**Solution:**

```bash
# Run tests with verbose output
pnpm test --reporter=verbose

# Run specific test file
pnpm test tests/unit/services/reportService.test.js

# Check test setup
cat tests/setup.js
```

## Monitoring

### What to Monitor

1. **Logs**
   - Check `apps/api/logs/` directory
   - Look for report generation messages
   - Watch for errors or warnings

2. **Database**
   - Monitor `reports` table size
   - Check for orphaned reports
   - Verify enum values

3. **Performance**
   - Report generation time
   - Database query performance
   - Memory usage during report generation

4. **Scheduled Jobs**
   - Verify jobs run at scheduled times
   - Check completion status
   - Monitor for failures

### Recommended Monitoring Queries

```sql
-- Check recent reports
SELECT type, report_date, parameters
FROM reports
ORDER BY report_date DESC
LIMIT 10;

-- Count reports by type
SELECT type, COUNT(*)
FROM reports
GROUP BY type;

-- Check for failed scheduled reports
-- (Reports should be created daily, weekly, monthly)
SELECT type, MAX(report_date) as last_report
FROM reports
WHERE type IN ('daily_sales', 'weekly_sales', 'monthly_sales')
GROUP BY type;

-- Find large reports
SELECT id, type, report_date, pg_column_size(data) as size_bytes
FROM reports
ORDER BY pg_column_size(data) DESC
LIMIT 10;
```

## Maintenance

### Regular Tasks

#### Daily

- [ ] Check logs for errors
- [ ] Verify scheduled reports are generated

#### Weekly

- [ ] Review report generation times
- [ ] Check database size
- [ ] Verify all report types are working

#### Monthly

- [ ] Clean up old reports (optional)
- [ ] Review and optimize slow queries
- [ ] Update documentation if needed

### Cleanup Old Reports

```sql
-- Delete reports older than 90 days (adjust as needed)
DELETE FROM reports
WHERE report_date < NOW() - INTERVAL '90 days';

-- Or archive them first
CREATE TABLE reports_archive AS
SELECT * FROM reports
WHERE report_date < NOW() - INTERVAL '90 days';

DELETE FROM reports
WHERE report_date < NOW() - INTERVAL '90 days';
```

## Rollback Plan

### If issues occur after deployment:

#### 1. Immediate Rollback

```bash
# Stop the server
# Revert code changes
git revert HEAD

# Restart server
pnpm start
```

#### 2. Database Rollback

```sql
-- Revert enum changes
ALTER TYPE report_type DROP VALUE IF EXISTS 'sales_summary';
ALTER TYPE report_type DROP VALUE IF EXISTS 'inventory_on_hand';
ALTER TYPE report_type DROP VALUE IF EXISTS 'expiry_dates';
ALTER TYPE report_type DROP VALUE IF EXISTS 'low_stock';
ALTER TYPE report_type DROP VALUE IF EXISTS 'daily_sales';
ALTER TYPE report_type DROP VALUE IF EXISTS 'weekly_sales';
ALTER TYPE report_type DROP VALUE IF EXISTS 'monthly_sales';
```

#### 3. Clean Up

```bash
# Remove node-cron if needed
pnpm remove node-cron

# Restore previous package.json
git checkout HEAD~1 -- apps/api/package.json
pnpm install
```

## Support Contacts

- **Developer**: [Your Name]
- **Documentation**: `REPORT_SYSTEM_DOCUMENTATION.md`
- **Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Repository**: g4-se1961-nj-swp391-fal25

## Sign-Off

- [ ] Code reviewed
- [ ] Tests passed
- [ ] Documentation complete
- [ ] Database migration successful
- [ ] Endpoints tested
- [ ] Scheduler verified
- [ ] Monitoring set up
- [ ] Rollback plan documented

**Deployed By**: **\*\***\_\_\_\_**\*\***  
**Date**: **\*\***\_\_\_\_**\*\***  
**Environment**: ☐ Development ☐ Staging ☐ Production  
**Version**: 1.0.0

---

**Status**: Ready for Deployment ✅

# Test AI Analytics vs Dashboard Revenue Comparison
$baseUrl = "http://localhost:3000/api"
$token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiIwMTkzYzA3YS03NmEyLTc4MjEtYjIzZS05NjlhOGYzOGFkN2UiLCJyb2xlIjoiT1dORVIiLCJpYXQiOjE3MzkyNzc5NzUsImV4cCI6MTczOTM2NDM3NX0.2RmpqH1-3rrqU7s9Wr7OyU2YVqVfOdm-aDSZnJwdgfo"

$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "AI ANALYTICS vs DASHBOARD COMPARISON" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test 1: Get AI Quick Insights (30 days)
Write-Host "1. Testing AI Quick Insights (30 days)..." -ForegroundColor Yellow
try {
    $aiResponse30 = Invoke-RestMethod -Uri "$baseUrl/ai-analysis/quick-insights?daysBack=30" -Method Get -Headers $headers
    Write-Host "[OK] AI Analytics (30 days):" -ForegroundColor Green
    Write-Host "  Total Revenue: " -NoNewline
    Write-Host "$($aiResponse30.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Total Orders: " -NoNewline
    Write-Host "$($aiResponse30.data.summary.totalOrders)" -ForegroundColor Cyan
    Write-Host "  Products Sold: " -NoNewline
    Write-Host "$($aiResponse30.data.summary.totalQuantitySold)" -ForegroundColor Cyan
    Write-Host "  Total Variants: " -NoNewline
    Write-Host "$($aiResponse30.data.summary.totalProducts)" -ForegroundColor Cyan
    Write-Host "  Avg Order Value: " -NoNewline
    Write-Host "$($aiResponse30.data.summary.averageOrderValue) VND" -ForegroundColor Cyan
} catch {
    Write-Host "[FAIL] Failed to get AI insights (30 days)" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Get AI Quick Insights (90 days)
Write-Host "2. Testing AI Quick Insights (90 days)..." -ForegroundColor Yellow
try {
    $aiResponse90 = Invoke-RestMethod -Uri "$baseUrl/ai-analysis/quick-insights?daysBack=90" -Method Get -Headers $headers
    Write-Host "[OK] AI Analytics (90 days):" -ForegroundColor Green
    Write-Host "  Total Revenue: " -NoNewline
    Write-Host "$($aiResponse90.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Total Orders: " -NoNewline
    Write-Host "$($aiResponse90.data.summary.totalOrders)" -ForegroundColor Cyan
    Write-Host "  Products Sold: " -NoNewline
    Write-Host "$($aiResponse90.data.summary.totalQuantitySold)" -ForegroundColor Cyan
    Write-Host "  Total Variants: " -NoNewline
    Write-Host "$($aiResponse90.data.summary.totalProducts)" -ForegroundColor Cyan
    Write-Host "  Avg Order Value: " -NoNewline
    Write-Host "$($aiResponse90.data.summary.averageOrderValue) VND" -ForegroundColor Cyan
} catch {
    Write-Host "[FAIL] Failed to get AI insights (90 days)" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Get AI Quick Insights (180 days)
Write-Host "3. Testing AI Quick Insights (180 days)..." -ForegroundColor Yellow
try {
    $aiResponse180 = Invoke-RestMethod -Uri "$baseUrl/ai-analysis/quick-insights?daysBack=180" -Method Get -Headers $headers
    Write-Host "[OK] AI Analytics (180 days):" -ForegroundColor Green
    Write-Host "  Total Revenue: " -NoNewline
    Write-Host "$($aiResponse180.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Total Orders: " -NoNewline
    Write-Host "$($aiResponse180.data.summary.totalOrders)" -ForegroundColor Cyan
    Write-Host "  Products Sold: " -NoNewline
    Write-Host "$($aiResponse180.data.summary.totalQuantitySold)" -ForegroundColor Cyan
    Write-Host "  Total Variants: " -NoNewline
    Write-Host "$($aiResponse180.data.summary.totalProducts)" -ForegroundColor Cyan
    Write-Host "  Avg Order Value: " -NoNewline
    Write-Host "$($aiResponse180.data.summary.averageOrderValue) VND" -ForegroundColor Cyan
} catch {
    Write-Host "[FAIL] Failed to get AI insights (180 days)" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Get Dashboard Monthly Report
Write-Host "4. Testing Dashboard Monthly Report..." -ForegroundColor Yellow
try {
    $currentDate = Get-Date -Format "yyyy-MM-dd"
    $dashResponse = Invoke-RestMethod -Uri "$baseUrl/reports/monthly-sales?date=$currentDate" -Method Get -Headers $headers
    Write-Host "[OK] Dashboard (Current Month):" -ForegroundColor Green
    Write-Host "  Total Revenue: " -NoNewline
    Write-Host "$($dashResponse.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Total Orders: " -NoNewline
    Write-Host "$($dashResponse.data.summary.totalOrders)" -ForegroundColor Cyan
    Write-Host "  Average Order: " -NoNewline
    Write-Host "$($dashResponse.data.summary.averageOrderValue) VND" -ForegroundColor Cyan
    Write-Host "  Top Product: " -NoNewline
    Write-Host "$($dashResponse.data.topProducts[0].productName) ($($dashResponse.data.topProducts[0].totalQuantity) units)" -ForegroundColor Cyan
} catch {
    Write-Host "[FAIL] Failed to get dashboard report" -ForegroundColor Red
    Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "COMPARISON SUMMARY" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "AI vs Dashboard Revenue:" -ForegroundColor Yellow
if ($aiResponse30 -and $dashResponse) {
    $diff = $aiResponse30.data.summary.totalRevenue - $dashResponse.data.summary.totalRevenue
    $diffPercent = if ($dashResponse.data.summary.totalRevenue -ne 0) { 
        ($diff / $dashResponse.data.summary.totalRevenue * 100) 
    } else { 
        0 
    }
    
    Write-Host "  AI (30d):      " -NoNewline
    Write-Host "$($aiResponse30.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Dashboard:     " -NoNewline
    Write-Host "$($dashResponse.data.summary.totalRevenue) VND" -ForegroundColor Cyan
    Write-Host "  Difference:    " -NoNewline
    if ($diff -gt 0) {
        Write-Host "+$diff VND (+$diffPercent%)" -ForegroundColor Yellow
    } elseif ($diff -lt 0) {
        Write-Host "$diff VND ($diffPercent%)" -ForegroundColor Yellow
    } else {
        Write-Host "0 VND (Match!)" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Note: Dashboard shows current month only, while AI can show 30/90/180 days" -ForegroundColor Gray
Write-Host ""

# Test Dashboard API Fix
# Run this after seeding database to verify October 2025 data

Write-Host "🧪 Testing Dashboard API Fix..." -ForegroundColor Cyan
Write-Host ""

# Step 1: Login to get token
Write-Host "1️⃣ Logging in as owner..." -ForegroundColor Yellow
$loginBody = @{
    username = "owner1"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "✅ Login successful!" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Step 2: Test monthly report API
Write-Host "2️⃣ Fetching October 2025 monthly report..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $reportResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/reports/monthly?year=2025&month=10" -Method Get -Headers $headers
    
    Write-Host "✅ API call successful!" -ForegroundColor Green
    Write-Host ""
    
    # Extract data
    $data = $reportResponse.data.data
    $summary = $data.summary
    $topMeds = $data.topSellingMedications
    
    Write-Host "📊 OCTOBER 2025 SALES SUMMARY:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "Total Orders (Paid): $($summary.totalOrders)" -ForegroundColor White
    Write-Host "Total Revenue: $('{0:N0}' -f [decimal]$summary.totalRevenue) VND" -ForegroundColor Green
    Write-Host "Average Order: $('{0:N0}' -f ([decimal]$summary.totalRevenue / [decimal]$summary.totalOrders)) VND" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🏆 TOP SELLING MEDICATIONS:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    $topMeds | ForEach-Object -Begin { $i = 1 } -Process {
        Write-Host "$i. $($_.medicationName) - $($_.variantName)" -ForegroundColor White
        Write-Host "   Quantity: $($_.totalQuantity) | Revenue: $('{0:N0}' -f [decimal]$_.totalRevenue) VND" -ForegroundColor Gray
        $i++
    }
    Write-Host ""
    
    # Verification
    Write-Host "✅ VERIFICATION:" -ForegroundColor Cyan
    Write-Host "================================" -ForegroundColor Cyan
    
    $expectedOrders = 7
    $expectedRevenue = 4890000
    
    if ($summary.totalOrders -eq $expectedOrders) {
        Write-Host "✅ Total Orders: CORRECT ($expectedOrders)" -ForegroundColor Green
    } else {
        Write-Host "❌ Total Orders: INCORRECT (Expected: $expectedOrders, Got: $($summary.totalOrders))" -ForegroundColor Red
    }
    
    if ([decimal]$summary.totalRevenue -eq $expectedRevenue) {
        Write-Host "Total Revenue: CORRECT ($expectedRevenue" -ForegroundColor Green -NoNewline
        Write-Host " VND) ✅" -ForegroundColor Green
    } else {
        Write-Host "Total Revenue: INCORRECT (Expected: $expectedRevenue, Got: $($summary.totalRevenue)) ❌" -ForegroundColor Red
    }
    
    if ($topMeds.Count -gt 0) {
        $medCount = $topMeds.Count
        Write-Host "Top Selling Medications: FOUND ($medCount items) ✅" -ForegroundColor Green
    } else {
        Write-Host "Top Selling Medications: NOT FOUND ❌" -ForegroundColor Red
    }
    
    Write-Host ""
    Write-Host "🎉 All tests completed!" -ForegroundColor Cyan
    
} catch {
    Write-Host "❌ API call failed: $_" -ForegroundColor Red
    Write-Host $_.Exception.Response.StatusCode -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "💡 Next steps:" -ForegroundColor Yellow
Write-Host "1. Open Dashboard in browser: http://localhost:5173/dashboard" -ForegroundColor White
Write-Host "2. Check browser console for debug logs" -ForegroundColor White
Write-Host "3. Verify stats cards show correct numbers" -ForegroundColor White

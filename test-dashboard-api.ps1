# PowerShell script to test Dashboard API endpoint
# Run this to check if the monthly sales report API is working

# Configuration
$API_BASE_URL = "http://localhost:5000/api"
$CURRENT_YEAR = (Get-Date).Year
$CURRENT_MONTH = (Get-Date).Month

Write-Host "=== Testing Dashboard Monthly Sales Report API ===" -ForegroundColor Cyan
Write-Host "API URL: $API_BASE_URL" -ForegroundColor Yellow
Write-Host "Year: $CURRENT_YEAR" -ForegroundColor Yellow
Write-Host "Month: $CURRENT_MONTH" -ForegroundColor Yellow
Write-Host ""

# Note: You need to replace TOKEN with your actual JWT token
# You can get this from browser DevTools > Application > Local Storage
$TOKEN = "YOUR_JWT_TOKEN_HERE"

if ($TOKEN -eq "YOUR_JWT_TOKEN_HERE") {
    Write-Host "⚠️  WARNING: Please set your JWT token in the script" -ForegroundColor Yellow
    Write-Host "   1. Login to the web app" -ForegroundColor Gray
    Write-Host "   2. Open DevTools (F12)" -ForegroundColor Gray
    Write-Host "   3. Go to Application > Local Storage" -ForegroundColor Gray
    Write-Host "   4. Copy the token value" -ForegroundColor Gray
    Write-Host "   5. Replace TOKEN variable in this script" -ForegroundColor Gray
    Write-Host ""
}

# Test endpoint
$url = "$API_BASE_URL/reports/monthly?year=$CURRENT_YEAR&month=$CURRENT_MONTH"

Write-Host "Testing endpoint: $url" -ForegroundColor Green
Write-Host ""

try {
    $headers = @{
        "Authorization" = "Bearer $TOKEN"
        "Content-Type" = "application/json"
    }
    
    $response = Invoke-RestMethod -Uri $url -Method Get -Headers $headers -ErrorAction Stop
    
    Write-Host "✅ API Response received!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Response Structure:" -ForegroundColor Cyan
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host ""
    Write-Host "Summary Data:" -ForegroundColor Cyan
    if ($response.data.data.summary) {
        Write-Host "  Total Orders: $($response.data.data.summary.totalOrders)" -ForegroundColor White
        Write-Host "  Total Revenue: $($response.data.data.summary.totalRevenue)" -ForegroundColor White
    } else {
        Write-Host "  ⚠️  No summary data found" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Top Selling Medications:" -ForegroundColor Cyan
    if ($response.data.data.topSellingMedications) {
        Write-Host "  Count: $($response.data.data.topSellingMedications.Count)" -ForegroundColor White
        foreach ($med in $response.data.data.topSellingMedications | Select-Object -First 3) {
            Write-Host "  - $($med.medicationName): $($med.totalQuantity) units" -ForegroundColor White
        }
    } else {
        Write-Host "  ⚠️  No medication data found" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Sales by Status:" -ForegroundColor Cyan
    if ($response.data.data.salesByStatus) {
        Write-Host "  Count: $($response.data.data.salesByStatus.Count)" -ForegroundColor White
        foreach ($status in $response.data.data.salesByStatus) {
            Write-Host "  - $($status.status): $($status.count) orders" -ForegroundColor White
        }
    } else {
        Write-Host "  ⚠️  No status data found" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ API Request failed!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "Status Code: $statusCode" -ForegroundColor Yellow
        
        if ($statusCode -eq 401) {
            Write-Host "⚠️  Authentication failed - check your token" -ForegroundColor Yellow
        } elseif ($statusCode -eq 404) {
            Write-Host "⚠️  Endpoint not found - check API server is running" -ForegroundColor Yellow
        } elseif ($statusCode -eq 500) {
            Write-Host "⚠️  Server error - check API logs" -ForegroundColor Yellow
        }
    }
}

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan

# Test Medication Variants API
# Run this to verify variants are loading correctly

Write-Host "🧪 Testing Medication Variants API..." -ForegroundColor Cyan
Write-Host ""

# Login
Write-Host "1️⃣ Logging in..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "owner@pharmaflow.com"
        password = "admin123"
    } | ConvertTo-Json

    $login = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json" -ErrorAction Stop
    $token = $login.data.token
    Write-Host "Login successful!" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Login failed: $_" -ForegroundColor Red
    exit 1
}

# Get medications
Write-Host "2️⃣ Fetching medications..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    
    $meds = Invoke-RestMethod -Uri "http://localhost:3000/api/medications" -Headers $headers -ErrorAction Stop
    $totalMeds = $meds.data.Count
    Write-Host "Found $totalMeds medications" -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Failed to fetch medications: $_" -ForegroundColor Red
    exit 1
}

# Test first 3 medications for variants
Write-Host "3️⃣ Testing variants for first 3 medications..." -ForegroundColor Yellow
Write-Host ""

$meds.data | Select-Object -First 3 | ForEach-Object {
    $med = $_
    Write-Host "Testing: $($med.name)" -ForegroundColor Cyan
    Write-Host "  ID: $($med.id)" -ForegroundColor Gray
    
    try {
        $variants = Invoke-RestMethod -Uri "http://localhost:3000/api/medications/$($med.id)/variants" -Headers $headers -ErrorAction Stop
        $variantCount = $variants.data.Count
        
        if ($variantCount -gt 0) {
            Write-Host "  Variants: $variantCount" -ForegroundColor Green
            $variants.data | ForEach-Object {
                Write-Host "    - $($_.name)" -ForegroundColor White
            }
        } else {
            Write-Host "  Variants: 0 (No variants available)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ERROR: $_" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "Test completed!" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. If variants show correctly above, refresh your browser" -ForegroundColor White
Write-Host "2. Clear browser cache if needed (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "3. Check browser console for 'API Response data' logs" -ForegroundColor White

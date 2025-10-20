# Inventory API E2E Test Script
# This script tests all inventory endpoints

$baseUrl = "http://localhost:3000/api"
$contentType = "application/json"

Write-Host "===========================================" -ForegroundColor Cyan
Write-Host "  Inventory API E2E Tests" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""

# Function to make HTTP requests
function Invoke-ApiRequest {
    param(
        [string]$Method,
        [string]$Endpoint,
        [string]$Body = $null,
        [hashtable]$Headers = @{},
        [string]$Description
    )
    
    Write-Host "-------------------------------------------" -ForegroundColor Yellow
    Write-Host "TEST: $Description" -ForegroundColor Green
    Write-Host "METHOD: $Method | ENDPOINT: $Endpoint" -ForegroundColor Gray
    
    $uri = "$baseUrl$Endpoint"
    $headers = $Headers.Clone()
    $headers["Content-Type"] = $contentType
    
    try {
        if ($Body) {
            Write-Host "REQUEST BODY:" -ForegroundColor Gray
            Write-Host $Body -ForegroundColor White
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $Body -Headers $headers -ContentType $contentType
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        
        Write-Host "✓ SUCCESS" -ForegroundColor Green
        Write-Host "RESPONSE:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 10) -ForegroundColor White
        return $response
    } catch {
        Write-Host "✗ FAILED" -ForegroundColor Red
        Write-Host "ERROR: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "DETAILS: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        return $null
    }
    Write-Host ""
}

# Step 1: Login to get auth token
Write-Host "`n=== STEP 1: Authentication ===" -ForegroundColor Cyan
$loginBody = @{
    email = "owner@pharmaflow.com"
    password = "Owner123!"
} | ConvertTo-Json

$loginResponse = Invoke-ApiRequest -Method "POST" -Endpoint "/auth/login" -Body $loginBody -Description "Login as owner"

if (-not $loginResponse) {
    Write-Host "`nERROR: Failed to login. Please ensure:" -ForegroundColor Red
    Write-Host "  1. API server is running (npm run dev)" -ForegroundColor Yellow
    Write-Host "  2. Database is seeded with owner user" -ForegroundColor Yellow
    Write-Host "  3. Credentials are correct" -ForegroundColor Yellow
    exit 1
}

# Extract token from response (handle both nested and flat structure)
$token = if ($loginResponse.data.token) { $loginResponse.data.token } else { $loginResponse.token }

if (-not $token) {
    Write-Host "`nERROR: Failed to extract token from login response" -ForegroundColor Red
    Write-Host "RESPONSE: $($loginResponse | ConvertTo-Json -Depth 5)" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n✓ Successfully authenticated" -ForegroundColor Green
Write-Host "Token: $($token.Substring(0, 20))..." -ForegroundColor Gray

$authHeaders = @{
    "Authorization" = "Bearer $token"
}

Write-Host "`n=== STEP 2: Inventory API Tests ===" -ForegroundColor Cyan

# Test 1: Get all inventory
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory" -Headers $authHeaders -Description "Get all inventory items"

# Test 2: Get all inventory with pagination
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?page=1&amp;limit=10" -Headers $authHeaders -Description "Get inventory with pagination"

# Test 3: Get inventory filtered by medication variant
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?medicationVariantId=1" -Headers $authHeaders -Description "Get inventory filtered by medication variant"

# Test 4: Get inventory filtered by bin
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?binId=1" -Headers $authHeaders -Description "Get inventory filtered by bin ID"

# Test 5: Get inventory filtered by batch number
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?batchNumber=BATCH001" -Headers $authHeaders -Description "Get inventory filtered by batch number"

# Test 6: Get inventory summary by variant
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/summary/by-variant" -Headers $authHeaders -Description "Get inventory summary grouped by variant"

# Test 7: Get inventory summary by variant with pagination
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/summary/by-variant?page=1&amp;limit=5" -Headers $authHeaders -Description "Get inventory summary with pagination"

# Test 8: Get expiring inventory
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/expiring" -Headers $authHeaders -Description "Get expiring inventory (default 30 days)"

# Test 9: Get expiring inventory with custom days
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/expiring?daysUntilExpiry=60" -Headers $authHeaders -Description "Get inventory expiring in 60 days"

# Test 10: Get low stock inventory
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/low-stock" -Headers $authHeaders -Description "Get low stock inventory"

# Test 11: Get low stock with custom threshold
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/low-stock?threshold=50" -Headers $authHeaders -Description "Get inventory below 50 units"

# Test 12: Get specific inventory by ID
Write-Host "`nℹ Attempting to get inventory item by ID..." -ForegroundColor Cyan
$allInventory = Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?limit=1" -Headers $authHeaders -Description "Get first inventory item"

if ($allInventory -and $allInventory.data -and $allInventory.data.Count -gt 0) {
    $inventoryId = $allInventory.data[0].id
    Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/$inventoryId" -Headers $authHeaders -Description "Get inventory by ID: $inventoryId"
    
    # Test 13: Update inventory (Owner only)
    Write-Host "`nℹ Testing owner-only operations..." -ForegroundColor Cyan
    $updateBody = @{
        expirationDate = (Get-Date).AddMonths(6).ToString("yyyy-MM-dd")
    } | ConvertTo-Json
    
    Invoke-ApiRequest -Method "PATCH" -Endpoint "/inventory/$inventoryId" -Body $updateBody -Headers $authHeaders -Description "Update inventory expiration date"
    
    # Test 14: Adjust inventory quantity (Owner only)
    $adjustBody = @{
        quantityChange = -5
        reason = "Damaged items removed - E2E Test"
    } | ConvertTo-Json
    
    Invoke-ApiRequest -Method "PATCH" -Endpoint "/inventory/$inventoryId/adjust" -Body $adjustBody -Headers $authHeaders -Description "Adjust inventory quantity"
    
} else {
    Write-Host "⚠ Warning: No inventory items found. Skipping ID-based tests." -ForegroundColor Yellow
}

# Test 15: Move inventory between bins (Owner only)
Write-Host "`nℹ Testing inventory move operation..." -ForegroundColor Cyan
$moveBody = @{
    inventoryId = 1
    fromBinId = 1
    toBinId = 2
    quantity = 10
    reason = "Reorganization - E2E Test"
} | ConvertTo-Json

Invoke-ApiRequest -Method "POST" -Endpoint "/inventory/move" -Body $moveBody -Headers $authHeaders -Description "Move inventory between bins"

# Test 16: Invalid requests (Error handling)
Write-Host "`n=== STEP 3: Error Handling Tests ===" -ForegroundColor Cyan

# Test invalid ID
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory/99999" -Headers $authHeaders -Description "Get inventory with invalid ID (should return 404)"

# Test without authentication
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory" -Description "Get inventory without auth token (should return 401)"

# Test invalid pagination
Invoke-ApiRequest -Method "GET" -Endpoint "/inventory?page=0&amp;limit=-1" -Headers $authHeaders -Description "Get inventory with invalid pagination"

# Test invalid adjust body
$invalidAdjustBody = @{
    quantityChange = "invalid"
} | ConvertTo-Json

Invoke-ApiRequest -Method "PATCH" -Endpoint "/inventory/1/adjust" -Body $invalidAdjustBody -Headers $authHeaders -Description "Adjust inventory with invalid data (should return 400)"

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "  Test Execution Complete!" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Yellow
Write-Host "  - Check results above for any failures" -ForegroundColor White
Write-Host "  - Green checkmark indicates successful requests" -ForegroundColor White
Write-Host "  - Red X indicates failed requests" -ForegroundColor White
Write-Host ""

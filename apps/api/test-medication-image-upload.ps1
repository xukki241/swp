# Test Script for Medication Image Upload API
# PowerShell script to test medication image upload functionality

Write-Host "=== Medication Image Upload API Test ===" -ForegroundColor Cyan
Write-Host ""

# Configuration
$baseUrl = "http://localhost:5000/api"
$loginEmail = "owner@pharmaflow.com"
$loginPassword = "admin123"

# Step 1: Login to get token
Write-Host "Step 1: Logging in as owner..." -ForegroundColor Yellow
$loginBody = @{
    email = $loginEmail
    password = $loginPassword
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.data.token
    Write-Host "Success: Login successful! Token obtained." -ForegroundColor Green
    Write-Host ""
} catch {
    Write-Host "Error: Login failed - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Get medications list
Write-Host "Step 2: Fetching medications list..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $medicationsResponse = Invoke-RestMethod -Uri "$baseUrl/medications" -Method Get -Headers $headers
    $medications = $medicationsResponse.data
    Write-Host "Success: Found $($medications.Count) medications" -ForegroundColor Green
    Write-Host ""
    
    # Display medications with images
    Write-Host "Medications with images:" -ForegroundColor Cyan
    foreach ($med in $medications) {
        if ($med.imageId) {
            Write-Host "  - $($med.name) ($($med.brand)) [ID: $($med.id)]" -ForegroundColor White
            Write-Host "    Image ID: $($med.imageId)" -ForegroundColor Gray
        }
    }
    Write-Host ""
    
    # Select first medication for testing
    $testMedication = $medications[0]
    Write-Host "Selected medication for testing: $($testMedication.name)" -ForegroundColor Yellow
    Write-Host "Medication ID: $($testMedication.id)" -ForegroundColor Gray
    Write-Host ""
    
} catch {
    Write-Host "Error: Failed to fetch medications - $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Create a test image file
Write-Host "Step 3: Creating test image file..." -ForegroundColor Yellow
$tempImagePath = "$env:TEMP\test-medication-image.png"

# Create a minimal valid PNG (1x1 pixel, red)
$pngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
$pngBytes = [System.Convert]::FromBase64String($pngBase64)
[System.IO.File]::WriteAllBytes($tempImagePath, $pngBytes)

if (Test-Path $tempImagePath) {
    Write-Host "Success: Test image created at $tempImagePath" -ForegroundColor Green
    Write-Host ""
} else {
    Write-Host "Error: Failed to create test image" -ForegroundColor Red
    exit 1
}

# Step 4: Upload image to medication
Write-Host "Step 4: Uploading image to medication..." -ForegroundColor Yellow
$uploadUrl = "$baseUrl/medications/$($testMedication.id)/upload-image"

try {
    $form = @{
        image = Get-Item -Path $tempImagePath
    }
    
    $uploadResponse = Invoke-RestMethod -Uri $uploadUrl -Method Post -Headers $headers -Form $form
    Write-Host "Success: Image uploaded successfully!" -ForegroundColor Green
    Write-Host "  Medication: $($uploadResponse.data.medication.name)" -ForegroundColor White
    Write-Host "  Image ID: $($uploadResponse.data.image.id)" -ForegroundColor White
    Write-Host "  Image URL: $($uploadResponse.data.image.url)" -ForegroundColor White
    Write-Host ""
    
    $uploadedImageId = $uploadResponse.data.image.id
    
} catch {
    Write-Host "Error: Upload failed - $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails.Message) {
        $errorDetails = $_.ErrorDetails.Message | ConvertFrom-Json
        Write-Host "  Error details: $($errorDetails.message)" -ForegroundColor Red
    }
    Write-Host ""
}

# Step 5: Verify image was uploaded
Write-Host "Step 5: Verifying image upload..." -ForegroundColor Yellow
try {
    $verifyResponse = Invoke-RestMethod -Uri "$baseUrl/medications/$($testMedication.id)" -Method Get -Headers $headers
    if ($verifyResponse.data.imageId) {
        Write-Host "Success: Image verified in medication record" -ForegroundColor Green
        Write-Host "  Image ID: $($verifyResponse.data.imageId)" -ForegroundColor White
        Write-Host ""
    } else {
        Write-Host "Error: No image found in medication record" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host "Error: Verification failed - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Cleanup
Write-Host ""
Write-Host "Cleaning up temporary files..." -ForegroundColor Yellow
Remove-Item $tempImagePath -ErrorAction SilentlyContinue
Write-Host "Success: Cleanup complete" -ForegroundColor Green

Write-Host ""
Write-Host "=== Test Complete ===" -ForegroundColor Cyan


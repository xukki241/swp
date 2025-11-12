# Fetch-LongChauProducts.ps1
# Fetch paginated product data from Long Châu API and save to JSON file

$apiUrl = "https://api.nhathuoclongchau.com.vn/lccus/search-product-service/api/products/ecom/product/search/cate"
$outputFile = "longchau_products.json"

# Optional: Clear existing file
if (Test-Path $outputFile) {
    Remove-Item $outputFile
}
New-Item -Path $outputFile -ItemType File | Out-Null
@() | ConvertTo-Json | Set-Content $outputFile

# Config
$maxResultCount = 100
$skipCount = 5000
$totalCount = $null

Write-Host "Fetching products from Long Châu API..." -ForegroundColor Cyan

do {
    $body = @{
        skipCount     = $skipCount
        maxResultCount = $maxResultCount
    } | ConvertTo-Json

    try {
        $response = Invoke-RestMethod -Uri $apiUrl -Method POST -Body $body -ContentType "application/json"
    }
    catch {
        Write-Host "Request failed at skipCount=$skipCount. Error: $_" -ForegroundColor Red
        break
    }

    if (-not $totalCount) {
        $totalCount = $response.totalCount
        Write-Host "Total products to fetch: $totalCount" -ForegroundColor Yellow
    }

    $products = $response.products
    if (-not $products) {
        Write-Host "No more products found, stopping..." -ForegroundColor Yellow
        break
    }

    # Append to JSON file
    $existingData = @()
    if ((Get-Content $outputFile -Raw).Trim() -ne "") {
        $existingData = Get-Content $outputFile -Raw | ConvertFrom-Json
        if (-not $existingData) { $existingData = @() }
    }

    $mergedData = $existingData + $products
    $mergedData | ConvertTo-Json -Depth 10 | Set-Content $outputFile

    Write-Host "Fetched $($products.Count) items (skip=$skipCount)." -ForegroundColor Green

    $skipCount += $maxResultCount
    Start-Sleep -Seconds 1 # avoid rate limit
} while ($skipCount -lt $totalCount)

Write-Host "✅ Completed. Total fetched: $skipCount products saved to '$outputFile'" -ForegroundColor Cyan

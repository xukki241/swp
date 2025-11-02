# Contract Parser API Test

## Test the contract parser endpoint

# First, upload a contract file to get the file ID
# POST /api/files

# Then parse it
# POST /api/contracts/parse

# PowerShell test script:

# 1. Login first to get token
$loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"email":"admin@pharmaflow.com","password":"admin123"}'

$token = $loginResponse.data.token

# 2. Upload contract file
$contractFile = "D:\path\to\your\contract.pdf"
$boundary = [System.Guid]::NewGuid().ToString()
$fileBin = [System.IO.File]::ReadAllBytes($contractFile)
$fileEnc = [System.Text.Encoding]::GetEncoding('iso-8859-1').GetString($fileBin)

$bodyLines = (
  "--$boundary",
  "Content-Disposition: form-data; name=`"file`"; filename=`"contract.pdf`"",
  "Content-Type: application/pdf",
  "",
  $fileEnc,
  "--$boundary--"
) -join "`r`n"

$uploadResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/files" `
  -Method POST `
  -ContentType "multipart/form-data; boundary=$boundary" `
  -Headers @{Authorization="Bearer $token"} `
  -Body $bodyLines

$fileId = $uploadResponse.data.id

# 3. Parse contract
$parseResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/contracts/parse" `
  -Method POST `
  -ContentType "application/json" `
  -Headers @{Authorization="Bearer $token"} `
  -Body (@{fileId=$fileId} | ConvertTo-Json)

# 4. Display results
Write-Host "=== PARSED CONTRACT DATA ===" -ForegroundColor Green
Write-Host ""
Write-Host "Supplier:" -ForegroundColor Yellow
$parseResponse.data.supplier | Format-List
Write-Host ""
Write-Host "Medications:" -ForegroundColor Yellow
$parseResponse.data.medications | Format-Table -AutoSize
Write-Host ""
Write-Host "Contract Details:" -ForegroundColor Yellow
$parseResponse.data.contract | Format-List

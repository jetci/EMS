# Test Script: Driver Role Security & Integrity
# Tests for unauthorized access and data integrity for drivers

Write-Host "====================================="
Write-Host "Driver Role Security & Integrity Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Driver
Write-Host ""
Write-Host "Logging in as Driver..."
$loginBody = @{ email = "driver1@wecare.dev"; password = "password" } | ConvertTo-Json
$loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
$TOKEN = $loginResponse.token
$headers = @{ "Authorization" = "Bearer $TOKEN"; "Content-Type" = "application/json" }

# Step 2: Fetch My Rides
Write-Host ""
Write-Host "Fetching My Rides..."
try {
    $rides = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-rides" -Method GET -Headers $headers
    Write-Host "PASS: Successfully fetched $($rides.Count) rides."
}
catch {
    Write-Host "FAIL: Could not fetch rides. $($_.Exception.Message)"
}

# Step 3: Test Unauthorized Access (Community user accessing driver profile)
Write-Host ""
Write-Host "Test: Community user accessing /api/drivers/my-profile..."
try {
    $commLoginBody = @{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json
    $commLoginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $commLoginBody -ContentType "application/json"
    $COMM_TOKEN = $commLoginResponse.token
    
    $commHeaders = @{ "Authorization" = "Bearer $COMM_TOKEN" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/drivers/my-profile" -Method GET -Headers $commHeaders
    Write-Host "FAIL: Community user CAN access driver profile!"
}
catch {
    if ($_.Exception.Message -match "404" -or $_.Exception.Message -match "403") {
        Write-Host "PASS: Community user denied access to driver profile."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

# Step 4: Test Public Access to Drivers List
Write-Host ""
Write-Host "Test: Public access to /api/drivers..."
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/drivers" -Method GET
    Write-Host "FAIL: Public CAN access drivers list! (PRIVACY LEAK)"
}
catch {
    Write-Host "PASS: Public denied access to drivers list."
}

Write-Host ""
Write-Host "====================================="
Write-Host "Driver Security Audit Complete"
Write-Host "====================================="

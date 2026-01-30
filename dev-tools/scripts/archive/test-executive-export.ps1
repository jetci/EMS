# Test Script: Executive Report Export Integrity
# Tests that reports can be exported as CSV

Write-Host "====================================="
Write-Host "Executive Report Export Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Executive
Write-Host ""
Write-Host "Logging in as Executive..."
try {
    $loginBody = @{
        email    = "executive1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    Write-Host "Login Successful."
}
catch {
    Write-Host "FAIL: Login failed."
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
}

# Step 2: Test CSV Export for Detailed Rides
Write-Host ""
Write-Host "Testing CSV Export (Detailed Rides)..."
try {
    $exportUrl = "$BASE_URL/executive/reports/export?type=detailed_rides&format=csv"
    $response = Invoke-WebRequest -Uri $exportUrl -Method GET -Headers $headers
    
    if ($response.Headers["Content-Type"] -match "text/csv") {
        Write-Host "PASS: Content-Type is text/csv"
    }
    else {
        Write-Host "FAIL: Content-Type is $($response.Headers["Content-Type"])"
    }

    if ($response.Content.Length -gt 0) {
        Write-Host "PASS: CSV content is not empty ($($response.Content.Length) bytes)"
        # Check for headers
        if ($response.Content -match "id,patient_id,patient_name") {
            Write-Host "PASS: CSV contains expected headers."
        }
        else {
            Write-Host "FAIL: CSV headers missing or incorrect."
        }
    }
    else {
        Write-Host "FAIL: CSV content is empty."
    }
}
catch {
    Write-Host "FAIL: Export request failed: $($_.Exception.Message)"
}

# Step 3: Test RBAC (Community user should not be able to export)
Write-Host ""
Write-Host "Testing RBAC (Community user)..."
try {
    $commLoginBody = @{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json
    $commToken = (Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $commLoginBody -ContentType "application/json").token
    $commHeaders = @{ "Authorization" = "Bearer $commToken" }
    
    Invoke-WebRequest -Uri "$BASE_URL/executive/reports/export?type=summary&format=csv" -Method GET -Headers $commHeaders | Out-Null
    Write-Host "FAIL: Community user could access executive export."
}
catch {
    if ($_.Exception.Message -match "403") {
        Write-Host "PASS: Community user denied access (403 Forbidden)."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "Executive Report Export Tests Complete"
Write-Host "====================================="

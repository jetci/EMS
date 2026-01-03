# Test Script: Radio Center Security Audit
# Tests for unauthorized access to sensitive data

Write-Host "====================================="
Write-Host "Radio Center Security Audit"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Test 1: Public access to rides (Should FAIL/DENY)
Write-Host ""
Write-Host "Test 1: Public access to /api/rides..."
try {
    $response = Invoke-RestMethod -Uri "$BASE_URL/rides" -Method GET
    Write-Host "FAIL: Public CAN access all rides data! (CRITICAL PRIVACY LEAK)"
}
catch {
    Write-Host "PASS: Public denied access to rides."
}

# Test 2: Community user accessing office dashboard (Should DENY)
Write-Host ""
Write-Host "Test 2: Community user accessing /api/office/dashboard..."
try {
    $loginBody = @{ email = "community1@wecare.dev"; password = "password" } | ConvertTo-Json
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    $headers = @{ "Authorization" = "Bearer $TOKEN" }
    $response = Invoke-RestMethod -Uri "$BASE_URL/office/dashboard" -Method GET -Headers $headers
    Write-Host "FAIL: Community user CAN access office dashboard!"
}
catch {
    if ($_.Exception.Message -match "403") {
        Write-Host "PASS: Community user denied access to office dashboard (403)."
    }
    else {
        Write-Host "FAIL: Unexpected error: $($_.Exception.Message)"
    }
}

Write-Host ""
Write-Host "====================================="
Write-Host "Security Audit Complete"
Write-Host "====================================="

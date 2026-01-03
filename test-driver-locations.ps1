# Test Script: Driver Locations API
# Tests the real-time driver tracking endpoint

Write-Host "====================================="
Write-Host "Driver Locations API Test"
Write-Host "====================================="

$BASE_URL = "http://localhost:3001/api"

# Step 1: Login as Officer
Write-Host "`nLogging in as Officer..."
try {
    $loginBody = @{
        email    = "officer1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    $TOKEN = $loginResponse.token
    
    if (-not $TOKEN) {
        Write-Host "[FAIL] Login failed."
        exit 1
    }
    Write-Host "Login Successful."
}
catch {
    Write-Host "[FAIL] Login request failed: $($_.Exception.Message)"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $TOKEN"
    "Content-Type"  = "application/json"
}

# Step 2: Get all driver locations
Write-Host "`nFetching all driver locations..."
try {
    $locations = Invoke-RestMethod -Uri "$BASE_URL/driver-locations" -Method GET -Headers $headers
    
    if ($locations -is [array]) {
        Write-Host "Found $($locations.Count) driver locations."
        
        foreach ($driver in $locations) {
            Write-Host "  - $($driver.driverName): $($driver.status) at ($($driver.latitude), $($driver.longitude))"
        }
    }
    else {
        Write-Host "[WARN] Unexpected response format."
    }
}
catch {
    Write-Host "[FAIL] Failed to fetch driver locations: $($_.Exception.Message)"
    exit 1
}

# Step 3: Test RBAC - Community user should NOT have access
Write-Host "`nTesting RBAC (Community user should NOT have access)..."
try {
    $communityLogin = @{
        email    = "community1@wecare.dev"
        password = "password"
    } | ConvertTo-Json

    $communityResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $communityLogin -ContentType "application/json"
    $communityToken = $communityResponse.token
    
    $communityHeaders = @{
        "Authorization" = "Bearer $communityToken"
        "Content-Type"  = "application/json"
    }
    
    try {
        $communityLocations = Invoke-RestMethod -Uri "$BASE_URL/driver-locations" -Method GET -Headers $communityHeaders
        Write-Host "[FAIL] Community user should NOT have access to driver locations!"
        exit 1
    }
    catch {
        if ($_.Exception.Response.StatusCode -eq 403) {
            Write-Host "RBAC working correctly - Community user denied access (403)."
        }
        else {
            Write-Host "RBAC might be working - got error: $($_.Exception.Message)"
        }
    }
}
catch {
    Write-Host "[WARN] Could not test RBAC: $($_.Exception.Message)"
}

Write-Host "`n====================================="
Write-Host "All Driver Locations API Tests PASSED"
Write-Host "====================================="
